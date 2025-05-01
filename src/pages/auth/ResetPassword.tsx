import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import MobileNavbar from "@/components/layout/MobileNavbar";

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // Check if we have the hash in the URL
    const hash = window.location.hash.substring(1);
    if (!hash) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired."
      });
      navigate("/auth/signin");
    }
  }, [navigate, toast]);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });
      
      // Redirect to sign in after a delay
      setTimeout(() => {
        navigate("/auth/signin");
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating password",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky navbar container */}
      <div className="sticky top-0 z-50 w-full">
        {/* Desktop Navbar - hidden on mobile */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        
        {/* Mobile Navbar - visible only on mobile */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
      
      <div className="flex-1 relative pb-24 md:pb-6">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        {/* Content */}
        <div className="relative min-h-full flex flex-col lg:flex-row items-center">
          {/* Left side - Decorative (visible only on lg screens and up) */}
          <div className="hidden lg:block w-1/2 h-full fixed top-0 left-0">
            {/* Modern geometric pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />
                  </pattern>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="text-primary" style={{ stopColor: 'currentColor', stopOpacity: 0.2 }} />
                    <stop offset="100%" className="text-secondary" style={{ stopColor: 'currentColor', stopOpacity: 0.2 }} />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                <circle cx="50" cy="50" r="30" fill="url(#grad)" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
                <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="currentColor" strokeWidth="0.5" className="text-secondary/20" />
              </svg>
            </div>

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-3xl animate-float-${i + 1}`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 2}s`,
                    transform: `rotate(${i * 45}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-lg">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground/90 mb-4">
                  Create a New Password
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose a strong password to keep your account secure. Make sure it's unique and easy to remember.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full lg:w-1/2 lg:ml-auto px-4 sm:px-6 lg:px-12 py-8 pt-20 sm:pt-24 md:pt-28 lg:py-12">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center lg:text-left mb-8 mt-8 sm:mt-10">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 sm:mb-3">
                  Reset your password
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Create a new secure password for your account
                </p>
              </div>
              
              <GlassCard className="backdrop-blur-xl bg-background/40 border border-border/50 p-6 sm:p-8 shadow-2xl rounded-2xl">
                {success ? (
                  <div className="text-center py-6">
                    <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground/90">Password updated</h3>
                    <p className="text-muted-foreground mb-6">
                      Your password has been successfully reset. Redirecting...
                    </p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-medium">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="h-11 px-4 bg-background/50 border-border/50 focus:border-primary focus:ring-primary transition-all rounded-xl"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="sr-only">
                                    {showPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-medium">Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="h-11 px-4 bg-background/50 border-border/50 focus:border-primary focus:ring-primary transition-all rounded-xl"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="sr-only">
                                    {showConfirmPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/25"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
                            Updating password...
                          </div>
                        ) : (
                          "Reset password"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
