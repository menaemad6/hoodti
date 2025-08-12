import React from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, SendHorizontal, ShieldQuestion } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
import Navbar from "@/components/layout/Navbar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { resetPassword, isLoading } = useAuth();
  const [submitted, setSubmitted] = React.useState(false);
  const seoConfig = useSEOConfig('forgotPassword');
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await resetPassword(values.email);
      setSubmitted(true);
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead {...seoConfig} />
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
                    <ShieldQuestion className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground/90 mb-4">
                  Password Recovery
                </h2>
                <p className="text-lg text-muted-foreground">
                  Don't worry! It happens to the best of us. We'll help you get back into your account.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full lg:w-1/2 lg:ml-auto px-4 sm:px-6 lg:px-12 py-8 pt-20 sm:pt-24 md:pt-28 lg:py-12">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center lg:text-left mb-8 mt-8 sm:mt-10">
                <div className="inline-block">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    <div className="h-1 w-3 rounded-full bg-primary/80 animate-pulse delay-100" />
                    <div className="h-1 w-5 rounded-full bg-primary/60 animate-pulse delay-200" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary">
                      Reset password
                    </span>
                  </h1>
                  <div className="mt-3 relative">
                    <p className="text-base sm:text-lg text-muted-foreground relative z-10">
                      We'll send you a link to{" "}
                      <span className="font-medium text-foreground">reset your password</span>
                    </p>
                    <div className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 -skew-x-6 transform" />
                  </div>
                </div>
              </div>
              
              <GlassCard className="backdrop-blur-xl bg-background/40 border border-border/50 p-6 sm:p-8 shadow-2xl rounded-2xl">
                {submitted ? (
                  <div className="text-center py-6">
                    <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <SendHorizontal className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground/90">Check your email</h3>
                    <p className="text-muted-foreground mb-6">
                      We've sent a password reset link to your email address.
                    </p>
                    <Button 
                      asChild 
                      className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/25"
                    >
                      <Link to="/signin">Back to sign in</Link>
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/90 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your.email@example.com"
                                className="h-11 px-4 bg-background/50 border-border/50 focus:border-primary focus:ring-primary transition-all rounded-xl"
                                {...field}
                              />
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
                            Sending...
                          </div>
                        ) : (
                          "Send reset link"
                        )}
                      </Button>
                      
                      <div className="text-center mt-4">
                        <Link
                          to="/signin"
                          className="text-primary font-medium hover:underline inline-flex items-center"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back to sign in
                        </Link>
                      </div>
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

export default ForgotPassword;
