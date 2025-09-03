import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building, CreditCard, Heart, LogOut, Package, User, AlertCircle, Settings, Shield, Bell, MapPin, RefreshCw, ChevronRight, Edit, LifeBuoy, Star, Gift } from "lucide-react";
import Layout from "@/components/layout/Layout";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ProfileRow } from "@/integrations/supabase/types.service";
import EditProfileModal from "@/components/account/EditProfileModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getOrCreateProfile } from "@/integrations/supabase/profiles.service";
import { repairUserAccount } from "@/integrations/supabase/repair.service";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";
import { stripTenantFromEmail } from "@/lib/utils";
import { useCurrentTenant } from "@/context/TenantContext";
import { usePoints } from "@/hooks/usePoints";
import PointsDisplay from "@/components/ui/points-display";

const Account = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const currentTenant = useCurrentTenant();
  const { points, redeemedPoints, loading: pointsLoading } = usePoints();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const repairProfile = async () => {
    if (!user) return;
    
    try {
      setIsRepairing(true);
      
      toast({
        title: "Repairing account...",
        description: "Please wait while we fix your profile",
      });
      
      const result = await repairUserAccount(user.id);
      
      if (result.profile) {
        setProfile(result.profile);
        
        // Update missing fields
        const missing: string[] = [];
        if (!result.profile.name) missing.push("name");
        if (!result.profile.phone_number) missing.push("phone number");
        
        setMissingFields(missing);
        setShowProfileAlert(missing.length > 0);
        
        // Calculate profile completion percentage
        let completedFields = 0;
        const totalFields = 2; // name and phone
        if (result.profile.name) completedFields++;
        if (result.profile.phone_number) completedFields++;
        
        setCompletionPercentage(Math.round((completedFields / totalFields) * 100));
        
        toast({
          title: "Repair complete",
          description: result.profileCreated 
            ? "Your profile has been created successfully" 
            : "Your profile was already set up correctly",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Repair failed",
          description: "We couldn't fix your profile. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error repairing profile:", error);
      toast({
        variant: "destructive",
        title: "Repair failed",
        description: "An error occurred while trying to fix your profile.",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Use getOrCreateProfile to ensure a profile exists
        const profileData = await getOrCreateProfile(user.id);
        
        if (!profileData) {
          throw new Error('Failed to fetch or create profile');
        }
        
        setProfile(profileData);
        
        // Check which fields are missing
        const missing: string[] = [];
        if (!profileData.name) missing.push("name");
        if (!profileData.phone_number) missing.push("phone number");
        
        setMissingFields(missing);
        setShowProfileAlert(missing.length > 0);

        // Calculate profile completion percentage
        let completedFields = 0;
        const totalFields = 2; // name and phone
        if (profileData.name) completedFields++;
        if (profileData.phone_number) completedFields++;
        
        setCompletionPercentage(Math.round((completedFields / totalFields) * 100));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const seoConfig = useSEOConfig('account');

  if (!user) {
    return (
      <Layout>
        <SEOHead {...seoConfig} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">You are not signed in</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your account
            </p>
            <Button asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEOHead {...seoConfig} />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 dark:from-primary/5 dark:via-background dark:to-secondary/5 mt-6">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar || undefined} alt={profile?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">{profile?.name || "Hello there!"}</h1>
                {!profile?.name && (
                  <Badge variant="outline" className="self-center md:self-auto border-amber-500 text-amber-600 dark:text-amber-400">
                    Complete your profile
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{stripTenantFromEmail(user.email)}</p>
              
              {/* Points Display in Header - Only show if enabled for this tenant */}
              {currentTenant?.pointsSystem && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      {points} Points
                    </span>
                  </div>
                  {redeemedPoints > 0 && (
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                      <Gift className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {redeemedPoints} Used
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {showProfileAlert && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Profile completion</span>
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={completionPercentage} className="flex-1 h-2" />
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 text-xs flex items-center gap-1"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <Edit className="h-3 w-3" />
                      Complete
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 md:self-start">
              <Button variant="outline" onClick={() => setIsEditProfileOpen(true)} size="sm" className="text-sm">
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </Button>
              
              {!profile && (
                <Button 
                  variant="outline" 
                  onClick={repairProfile} 
                  size="sm" 
                  className="text-sm text-yellow-600 border-yellow-200"
                  disabled={isRepairing}
                >
                  <LifeBuoy className="h-3.5 w-3.5 mr-1.5" />
                  {isRepairing ? "Repairing..." : "Repair Account"}
                </Button>
              )}
              
              <Button variant="outline" onClick={() => signOut()} className="text-destructive text-sm" size="sm">
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Orders Card */}
          <GlassCard className="flex flex-col h-full transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden rounded-xl">
            <Link to="/account/orders" className="flex flex-col h-full p-3 sm:p-5">
              <div className="mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1">Orders</h3>
              <p className="text-xs sm:text-sm text-muted-foreground flex-grow mb-2 sm:mb-3 line-clamp-2">
                Track and manage
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
                View
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
              </div>
            </Link>
          </GlassCard>
          
          {/* Addresses Card */}
          <GlassCard className="flex flex-col h-full transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden rounded-xl">
            <Link to="/account/addresses" className="flex flex-col h-full p-3 sm:p-5">
              <div className="mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1">Addresses</h3>
              <p className="text-xs sm:text-sm text-muted-foreground flex-grow mb-2 sm:mb-3 line-clamp-2">
                Shipping info
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">
                View
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
              </div>
            </Link>
          </GlassCard>
          
          {/* Wishlist Card */}
          <GlassCard className="flex flex-col h-full transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden rounded-xl">
            <Link to="/account/wishlist" className="flex flex-col h-full p-3 sm:p-5">
              <div className="mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1">Wishlist</h3>
              <p className="text-xs sm:text-sm text-muted-foreground flex-grow mb-2 sm:mb-3 line-clamp-2">
                Saved items
              </p>
              <div className="flex items-center text-pink-600 dark:text-pink-400 text-xs sm:text-sm font-medium">
                View
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
              </div>
            </Link>
          </GlassCard>
          
          {/* Account Settings Card */}
          <GlassCard className="flex flex-col h-full transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden rounded-xl">
            <button onClick={() => setIsEditProfileOpen(true)} className="flex flex-col h-full p-3 sm:p-5 text-left w-full">
              <div className="mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1">Settings</h3>
              <p className="text-xs sm:text-sm text-muted-foreground flex-grow mb-2 sm:mb-3 line-clamp-2">
                Update profile
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">
                Edit
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
              </div>
            </button>
          </GlassCard>
        </div>
        
        {/* Account Information */}
        <div className="mt-8">
          <GlassCard className="overflow-hidden border-none bg-gradient-to-br from-background/80 to-background/40 shadow-sm rounded-xl">
            <div className="p-5 border-b bg-muted/30">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="h-5 w-5 mr-2 text-primary/70" />
                Account Information
              </h2>
            </div>
            
            <div className="p-5 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <Edit className="h-3 w-3" />
                      <span className="sr-only">Edit name</span>
                    </Button>
                  </div>
                  {profile?.name ? (
                    <p className="font-medium truncate">{profile.name}</p>
                  ) : (
                    <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm space-x-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Not provided</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                  </div>
                                          <p className="font-medium truncate">{stripTenantFromEmail(user.email)}</p>
                </div>
                
                <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <Edit className="h-3 w-3" />
                      <span className="sr-only">Edit phone</span>
                    </Button>
                  </div>
                  {profile?.phone_number ? (
                    <p className="font-medium truncate">{profile.phone_number}</p>
                  ) : (
                    <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm space-x-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Not provided</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity and Quick Access */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-secondary/5 to-transparent p-4 rounded-lg flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100/50 dark:bg-blue-900/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-blue-600/70 dark:text-blue-400/70" />
                  </div>
                  <div>
                    <h3 className="font-medium">Recent Orders</h3>
                    <p className="text-sm text-muted-foreground">View your recent purchase history</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">Quick Access</h3>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" asChild className="w-full justify-start h-8 text-xs">
                      <Link to="/account/orders">
                        <Package className="h-3.5 w-3.5 mr-2" />
                        View Orders
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start h-8 text-xs">
                      <Link to="/account/addresses">
                        <MapPin className="h-3.5 w-3.5 mr-2" />
                        Manage Addresses
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start h-8 text-xs">
                      <Link to="/account/wishlist">
                        <Heart className="h-3.5 w-3.5 mr-2" />
                        View Wishlist
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Account Security */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 p-5 rounded-lg border border-border/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-5 w-5 text-primary/70" />
                    <h3 className="font-medium">Account Security</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-background/50 p-3 rounded flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email verified</p>
                          <p className="text-xs text-muted-foreground">{stripTenantFromEmail(user.email)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Loyalty Points Section - Only show if enabled for this tenant */}
        {currentTenant?.pointsSystem && (
          <div className="mt-8">
            <GlassCard className="overflow-hidden border-none bg-gradient-to-br from-background/80 to-background/40 shadow-sm rounded-xl">
              <div className="p-5 border-b bg-muted/30">
                <h2 className="text-xl font-semibold flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Loyalty Points
                </h2>
              </div>
              
              <div className="p-5">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Available Points */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-yellow-500/10 to-transparent p-4 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Available Points</h3>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="font-bold text-2xl text-yellow-600 dark:text-yellow-400">{points}</p>
                      <p className="text-xs text-muted-foreground">Points ready to use</p>
                    </div>
                  </div>
                  
                  {/* Redeemed Points */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-500/10 to-transparent p-4 rounded-lg border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Redeemed Points</h3>
                        <Gift className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="font-bold text-2xl text-green-600 dark:text-green-400">{redeemedPoints}</p>
                      <p className="text-xs text-muted-foreground">Points used for discounts</p>
                    </div>
                  </div>
                  
                  {/* Points Info */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <div className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 p-5 rounded-lg border border-border/30 h-full">
                      <div className="flex items-center space-x-3 mb-4">
                        <Gift className="h-5 w-5 text-primary/70" />
                        <h3 className="font-medium">How Points Work</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-muted-foreground">
                            Earn points for every product you purchase
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-muted-foreground">
                            Use points to get discounts at checkout
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-muted-foreground">
                            Points never expire and are automatically added
                          </p>
                        </div>
                      </div>
                      
                      {points > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/30">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Gift className="h-4 w-4" />
                            <span className="font-medium">You have {points} points available for discounts!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
      
      <EditProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        onProfileUpdated={repairProfile}
      />
    </Layout>
  );
};

export default Account;
