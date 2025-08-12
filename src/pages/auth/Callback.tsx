import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { ensureProfileExists, debugUserProfiles, checkDatabaseSchema, forceCreateProfile } from "@/integrations/supabase/profiles.service";
import { getOrCreateUserRole } from "@/integrations/supabase/roles.service";
import { createTenantEmail } from "@/lib/tenant-utils";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";

const Callback = () => {
  const navigate = useNavigate();
  const seoConfig = useSEOConfig('signin');
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          
          // Get tenant ID from URL params or use default
          const urlParams = new URLSearchParams(window.location.search);
          const tenantId = urlParams.get('tenant') || 'hoodti';
          
          // Check if this is a Google sign-in
          const isGoogleSignIn = user.app_metadata?.provider === 'google';
          
          if (isGoogleSignIn) {
            console.log("Processing Google OAuth callback for user:", user.id);
            console.log("Tenant ID:", tenantId);
            
            // Debug: Check database schema first
            await checkDatabaseSchema();
            
            // Debug: Check existing profiles
            await debugUserProfiles(user.id);
            
            try {
              // Update user metadata with tenant information
              const originalEmail = user.email || '';
              const tenantEmail = createTenantEmail(originalEmail, tenantId);
              
              await supabase.auth.updateUser({
                data: {
                  original_email: originalEmail,
                  tenant_id: tenantId
                }
              });
              
              // Use the Google OAuth specific fix function
              console.log("Using Google OAuth specific profile fix...");
              try {
                const { data: fixResult, error: fixError } = await supabase
                  .rpc('fix_google_oauth_profile', {
                    p_user_id: user.id,
                    p_correct_tenant_id: tenantId
                  });
                
                if (fixError) {
                  console.warn("Failed to fix Google OAuth profile:", fixError);
                } else {
                  console.log("Google OAuth profile fix result:", fixResult);
                }
              } catch (fixException) {
                console.warn("Exception in Google OAuth profile fix:", fixException);
              }
              
              // Set tenant context in the database before creating profile
              try {
                await supabase.rpc('set_tenant_context_for_profile', { tenant_id: tenantId });
                console.log("Set tenant context in database:", tenantId);
              } catch (contextError) {
                console.warn("Failed to set tenant context:", contextError);
              }
              
              // Ensure profile exists with proper tenant_id
              console.log("Ensuring profile exists for user:", user.id, "with tenant:", tenantId);
              let profile = await ensureProfileExists(user.id, tenantId);
              
              if (profile) {
                console.log("Profile ensured successfully:", profile.id);
              } else {
                console.error("Failed to ensure profile exists, trying force create...");
                // Try force create as fallback
                profile = await forceCreateProfile(user.id, tenantId);
                if (profile) {
                  console.log("Profile created successfully with force create:", profile.id);
                } else {
                  console.error("Force create also failed!");
                }
              }
              
              // Create or get user role
              console.log("Creating/getting role for user:", user.id);
              await getOrCreateUserRole(user.id);
              
              // Debug: Check profiles after creation
              console.log("Checking profiles after creation:");
              await debugUserProfiles(user.id);
              
            } catch (error) {
              console.error("Error processing Google OAuth callback:", error);
              // Continue anyway - don't block the user
            }
          }
          
          // Navigate to home page
          navigate("/", { replace: true });
        } else {
          // If auth failed, send back to sign in
          navigate("/auth/signin", { replace: true });
        }
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        navigate("/auth/signin", { replace: true });
      }
    };
    
    handleOAuthCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead {...seoConfig} />
      <Navbar />
      <div className="flex-1 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        {/* Content */}
        <div className="relative min-h-full flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground/90 mb-2">
              Finalizing your authentication
            </h2>
            <p className="text-muted-foreground text-lg">
              Please wait while we complete the process...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
