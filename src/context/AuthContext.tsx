import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getOrCreateUserRole } from "@/integrations/supabase/roles.service";
import { ensureProfileExists } from "@/integrations/supabase/profiles.service";
import { useCurrentTenant } from "./TenantContext";
import { createTenantEmail, extractOriginalEmail } from "@/lib/tenant-utils";

export type UserRole = "user" | "admin" | "super_admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentTenant = useCurrentTenant();

  useEffect(() => {
    // Setup the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Clear role on signout
        if (event === "SIGNED_OUT") {
          setUserRole(null);
        }
        
        // Handle SIGNED_IN event - profile creation is now handled in callback
        if (event === "SIGNED_IN" && currentSession?.user) {
          // Profile creation is handled in the OAuth callback for better reliability
          console.log("User signed in:", currentSession.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // If user is authenticated, fetch their role
      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user role when user changes
  useEffect(() => {
    if (user) {
      fetchUserRole(user.id);
    }
  }, [user]);

  const fetchUserRole = async (userId: string) => {
    try {
      // First ensure profile exists for the current tenant
      const profile = await ensureProfileExists(userId, currentTenant.id);
      if (!profile) {
        console.error("Failed to ensure profile exists for user:", userId);
      }
      
      // Use getOrCreateUserRole to ensure a role exists
      const role = await getOrCreateUserRole(userId);
      
      if (role) {
        setUserRole(role);
      } else {
        // Fall back to the default role if creation failed
        console.error("Error fetching user role, using default");
        setUserRole("user");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("user"); // Default to user role if error
    }
  };

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      // Set tenant context in database BEFORE creating user
      // Note: removed RPC pre-context call to satisfy types and avoid runtime dependency
      
      // Create tenant-specific email for user management
      const tenantEmail = createTenantEmail(email, currentTenant.id);
      
      // Sign up the user with tenant-specific email
      const { data, error } = await supabase.auth.signUp({
        email: tenantEmail,
        password,
        options: {
          data: {
            ...userData,
            original_email: email, // Store the original email
            tenant_id: currentTenant.id,
          },
        },
      });

      if (error) throw error;
      
      // After sign up, only attempt profile/role creation if we have a session
      if (data?.user?.id && data?.session) {
        try {
          console.log("Creating profile for new user:", data.user?.id);
          await ensureProfileExists(data.user?.id, currentTenant.id);
          console.log("Creating role for new user:", data.user?.id);
          await getOrCreateUserRole(data.user?.id);
        } catch (profileError) {
          console.error("Error creating profile after signup:", profileError);
          // Continue - we don't want to fail signup if this fails
        }
      }

      toast({
        title: "Account created",
        description: "Happy Shopping :)",
      });
      
      navigate("/auth/signin");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Create tenant-specific email for sign in
      const tenantEmail = createTenantEmail(email, currentTenant.id);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: tenantEmail,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });

      // Prefer explicit next redirect if present (set by Signin or guards)
      try {
        const next = sessionStorage.getItem('postAuthRedirect');
        if (next) {
          if (next.includes('checkout')) {
          toast({
            title: "You're all set",
            description: "You're signed in. Let's complete your checkout.",
          });
        }
          sessionStorage.removeItem('postAuthRedirect');
          navigate(next, { replace: true });
          return;
        }
      } catch (e) { /* ignore */ }

      // Fallback: Redirect based on role
      redirectBasedOnRole(data.user?.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Set tenant context in database BEFORE OAuth redirect
      // Note: removed RPC pre-context call to satisfy types and avoid runtime dependency
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?tenant=${currentTenant.id}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: message,
      });
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: message,
      });
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Create tenant-specific email for password reset
      const tenantEmail = createTenantEmail(email, currentTenant.id);
      
      const { error } = await supabase.auth.resetPasswordForEmail(tenantEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = async (userId?: string) => {
    if (!userId) return navigate("/");
    
    try {
      // Safeguard: if any pending next target exists, honor it first
      try {
        const next = sessionStorage.getItem('postAuthRedirect');
        if (next) {
          sessionStorage.removeItem('postAuthRedirect');
          navigate(next, { replace: true });
          return;
        }
      } catch (e) { /* ignore */ }

      // Use getOrCreateUserRole to ensure a role exists
      const role = await getOrCreateUserRole(userId);
      
      if (!role) {
        throw new Error("Could not get or create role");
      }
      
      setUserRole(role);
      
      switch (role) {
        case "super_admin":
          navigate("/admin/users");
          break;
        case "admin":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Error redirecting:", error);
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
