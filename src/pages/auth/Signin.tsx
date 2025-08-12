import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, ShoppingBag } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { BRAND_NAME } from "@/lib/constants";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";

const signinSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SigninFormValues = z.infer<typeof signinSchema>;

const Signin = () => {
  const { signIn, signInWithGoogle, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = React.useState(false);
  const seoConfig = useSEOConfig('signin');
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: SigninFormValues) => {
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      console.error("Sign in error:", error);
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.07] dark:from-primary/[0.03] dark:to-secondary/[0.03]" />
        
        {/* Content */}
        <div className="relative min-h-full flex flex-col lg:flex-row items-center">
          {/* Left side - Decorative (visible only on lg screens and up) */}
          <div className="hidden lg:block w-1/2 h-full fixed top-0 left-0">
            {/* Modern geometric pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-secondary/[0.08] dark:from-primary/[0.04] dark:to-secondary/[0.04]" />
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/[0.08] dark:text-primary/[0.04]" />
                  </pattern>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="text-primary" style={{ stopColor: 'currentColor', stopOpacity: 0.08 }} />
                    <stop offset="100%" className="text-secondary" style={{ stopColor: 'currentColor', stopOpacity: 0.08 }} />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" className="dark:opacity-50" />
                <circle cx="50" cy="50" r="30" fill="url(#grad)" className="dark:opacity-50" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/[0.16] dark:text-primary/[0.08]" />
                <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="currentColor" strokeWidth="0.5" className="text-secondary/[0.16] dark:text-secondary/[0.08]" />
              </svg>
            </div>

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/[0.08] to-secondary/[0.08] dark:from-primary/[0.04] dark:to-secondary/[0.04] backdrop-blur-3xl animate-float-${i + 1}`}
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
                  <div className="w-16 h-16 rounded-full bg-primary/[0.08] dark:bg-primary/[0.04] flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-primary dark:text-primary/90" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back to {BRAND_NAME}
                  </h1>
                  <p className="text-lg text-muted-foreground dark:text-muted-foreground/90">
                    Sign in to your account and continue your exceptional shopping experience with us.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full lg:w-1/2 lg:ml-auto px-4 sm:px-6 lg:px-12 py-8 pt-20 sm:pt-24 md:pt-28 lg:py-12">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center lg:text-left mb-8 mt-8 sm:mt-10">
                <div className="inline-block">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-primary/90 dark:bg-primary/80 animate-pulse" />
                    <div className="h-1 w-3 rounded-full bg-primary/70 dark:bg-primary/60 animate-pulse delay-100" />
                    <div className="h-1 w-5 rounded-full bg-primary/50 dark:bg-primary/40 animate-pulse delay-200" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
                      Welcome back
                    </span>
                  </h1>
                  <div className="mt-3 relative">
                    <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground/90 relative z-10">
                      Sign in to continue to{" "}
                      <span className="font-medium text-foreground dark:text-foreground/90">{BRAND_NAME}</span>
                    </p>
                    <div className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/[0.08] dark:bg-primary/[0.04] -skew-x-6 transform" />
                  </div>
                </div>
              </div>
              
              <GlassCard className="backdrop-blur-xl bg-background/40 dark:bg-background/30 border border-border/50 dark:border-border/20 p-6 sm:p-8 shadow-2xl dark:shadow-xl rounded-2xl">
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
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                          <FormLabel className="text-foreground/90 font-medium">Password</FormLabel>
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
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline mt-1"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                      className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground font-medium transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/25 dark:shadow-primary/15"
                disabled={isLoading}
              >
                {isLoading ? (
                        <div className="flex items-center justify-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in
                  </div>
                )}
              </Button>
            </form>
          </Form>
          
          {/* Gogle Signin  */}
                {/* <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background/70 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                      className="w-full h-11 rounded-xl border-2 border-border/50 dark:border-border/20 bg-background/50 dark:bg-background/40 hover:bg-background/80 dark:hover:bg-background/30 font-medium transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                onClick={signInWithGoogle}
                disabled={isLoading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
            </div>
          </div> */}
          
                <div className="mt-6 sm:mt-8 text-center">
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link to="/signup" className="font-medium text-primary hover:underline">
                      Sign up
                    </Link>{" "}
                    for a <span className="font-medium text-foreground dark:text-foreground/90">{BRAND_NAME}</span> account today.
                  </div>
                </div>




        </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
