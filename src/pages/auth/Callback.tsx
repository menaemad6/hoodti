import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const Callback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle OAuth callback and navigate based on result
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If user is authenticated, send them to home
        navigate("/", { replace: true });
      } else {
        // If auth failed, send back to sign in
        navigate("/signin", { replace: true });
      }
    });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
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
