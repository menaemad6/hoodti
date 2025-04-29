import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getOrCreateUserRole } from "@/integrations/supabase/roles.service";
import { getOrCreateProfile } from "@/integrations/supabase/profiles.service";

export type UserRole = "user" | "admin" | "super_admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<void>;
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

  useEffect(() => {
    // Setup the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Clear role on signout
        if (event === "SIGNED_OUT") {
          setUserRole(null);
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

  const signUp = async (email: string, password: string, userData?: Record<string, any>) => {
    setIsLoading(true);
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      
      // Explicitly create profile after signup for reliability
      if (data?.user?.id) {
        try {
          // Small delay to ensure auth signup is completed
          setTimeout(async () => {
            console.log("Creating profile for new user:", data.user?.id);
            await getOrCreateProfile(data.user?.id);
            console.log("Creating role for new user:", data.user?.id);
            await getOrCreateUserRole(data.user?.id);
          }, 1000);
        } catch (profileError) {
          console.error("Error creating profile after signup:", profileError);
          // Continue - we don't want to fail signup if this fails
        }
      }

      // We don't need to manually create a profile here as:
      // 1. Database trigger will create it automatically
      // 2. getOrCreateProfile will ensure it exists when accessing the profile
      // 3. We now also try to create it explicitly as a failsafe

      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
      
      navigate("/auth/signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
      
      // Redirect based on role
      redirectBasedOnRole(data.user?.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message,
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = async (userId?: string) => {
    if (!userId) return navigate("/");
    
    try {
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
