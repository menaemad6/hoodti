import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Store, 
  TagIcon, 
  MoreHorizontal, 
  ShoppingCart, 
  User, 
  Search,
  Moon,
  Sun,
  Laptop,
  X,
  LogOut,
  Heart,
  Package,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoleAccess } from "@/hooks/use-role-access";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  iconBg?: string;
  iconColor?: string;
}

const MobileNavbar = () => {
  const location = useLocation();
  const { cartItemsCount } = useCart();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, signOut, user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleAccess();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const getBottomNavItems = (): NavItem[] => {
    if (isAdmin || isSuperAdmin) {
      return [
        {
          icon: Home,
          label: "Home",
          href: "/",
        },
        {
          icon: Store,
          label: "Shop",
          href: "/shop",
        },
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          href: "/admin",
        },
        {
          icon: MoreHorizontal,
          label: "More",
          href: "#more",
        },
      ];
    }
    
    return [
      {
        icon: Home,
        label: "Home",
        href: "/",
      },
      {
        icon: Store,
        label: "Shop",
        href: "/shop",
      },
      {
        icon: TagIcon,
        label: "Deals",
        href: "/deals",
      },
      {
        icon: MoreHorizontal,
        label: "More",
        href: "#more",
      },
    ];
  };

  const getSidebarItems = (): SidebarNavItem[] => {
    const items: SidebarNavItem[] = [
      {
        icon: TagIcon,
        label: "Categories",
        href: "/categories",
        iconBg: "bg-orange-100 dark:bg-orange-900/20",
        iconColor: "text-orange-600 dark:text-orange-400",
      },
      {
        icon: Search,
        label: "Search Products",
        href: "/shop",
        iconBg: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
    ];
    
    if (isAuthenticated) {
      items.push({
        icon: Package,
        label: "My Orders",
        href: "/account/orders",
        iconBg: "bg-purple-100 dark:bg-purple-900/20",
        iconColor: "text-purple-600 dark:text-purple-400",
      });
      
      items.push({
        icon: Heart,
        label: "Wishlist",
        href: "/account/wishlist",
        iconBg: "bg-pink-100 dark:bg-pink-900/20",
        iconColor: "text-pink-600 dark:text-pink-400",
      });
    }
    
    // Add Deals link for all users
    items.push({
      icon: TagIcon,
      label: "Special Deals",
      href: "/deals",
      iconBg: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    });
    
    if (isAdmin || isSuperAdmin) {
      items.push({
        icon: LayoutDashboard,
        label: "Admin Dashboard",
        href: "/admin",
        iconBg: "bg-green-100 dark:bg-green-900/20",
        iconColor: "text-green-600 dark:text-green-400",
      });
    }
    
    return items;
  };

  const bottomNavItems = getBottomNavItems();
  const sidebarItems = getSidebarItems();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    if (path === "#more") {
      return isMoreOpen;
    }
    return location.pathname.startsWith(path);
  };

  const closeMoreMenu = () => {
    setIsMoreOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(part => part[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <>
      {/* Top navbar - mobile: profile dropdown and cart */}
      <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center px-4">
          {/* Left: Profile dropdown */}
          <div className="flex-1 flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="p-1.5 rounded-full hover:bg-accent relative bg-muted/60 border border-border/30">
                  <User className="h-5 w-5 text-primary/80" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>
                  {isAuthenticated && user?.email ? (
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  ) : (
                    "Account"
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isAuthenticated ? (
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/orders" className="w-full cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/wishlist" className="w-full cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/signin" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Create Account</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}
                
                {(isAdmin || isSuperAdmin) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
                
                {isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
              (Brand)
              </span>
            </Link>
          </div>
          
          {/* Right: Cart icon */}
          <div className="flex-1 flex justify-end">
            <Link to="/cart" className="p-1.5 rounded-full hover:bg-accent relative bg-muted/60 border border-border/30">
              <ShoppingCart className="h-5 w-5 text-primary/80" />
              {cartItemsCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[8px]"
                  variant="default"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom navbar with More option - mobile only */}
      <div className="fixed bottom-4 left-0 z-50 w-full px-4 md:hidden">
        <div className="rounded-full border border-border/40 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-2xl shadow-lg shadow-background/5 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 opacity-50"></div>
          
          <div className="grid h-16 grid-cols-4 relative">
            {bottomNavItems.map((item, index) => {
              const active = isActive(item.href);
              
              if (item.href === "#more") {
                return (
                  <Sheet key={item.href} open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                    <SheetTrigger asChild>
                      <button
                        className={cn(
                          "flex flex-col items-center justify-center px-2 py-1 transition-colors w-full bg-transparent border-none",
                          active 
                            ? "text-primary-foreground" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "flex flex-col items-center justify-center w-full p-1.5",
                          active ? "bg-primary rounded-lg" : "hover:bg-accent/50"
                        )}>
                          <item.icon className="h-5 w-5 mb-0.5" />
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </div>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 p-0 bg-background/95 backdrop-blur-xl border-l border-border/40">
                      <div className="flex flex-col h-full">
                        {/* Modernized Header */}
                        <div className="p-4 flex items-center justify-between">
                          <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">More Options</h2>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-muted/50" 
                            onClick={closeMoreMenu}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Stylish Theme Selector */}
                        <div className="mx-4 p-3 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/40">
                          <div className="font-medium text-sm mb-2 text-muted-foreground">Choose Theme</div>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant={theme === 'light' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setTheme('light')}
                              className="h-9 rounded-lg"
                            >
                              <Sun className="h-4 w-4 mr-1.5" />
                              Light
                            </Button>
                            <Button
                              variant={theme === 'dark' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setTheme('dark')}
                              className="h-9 rounded-lg"
                            >
                              <Moon className="h-4 w-4 mr-1.5" />
                              Dark
                            </Button>
                            <Button
                              variant={theme === 'system' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setTheme('system')}
                              className="h-9 rounded-lg"
                            >
                              <Laptop className="h-4 w-4 mr-1.5" />
                              Auto
                            </Button>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto px-2">
                          <div className="py-4 space-y-1">
                            {sidebarItems.map((item) => (
                              <Link 
                                key={item.href}
                                to={item.href} 
                                className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors"
                                onClick={closeMoreMenu}
                              >
                                <div className="flex items-center">
                                  <span className={cn("p-2 rounded-lg mr-3", item.iconBg)}>
                                    <item.icon className={cn("h-5 w-5", item.iconColor)} />
                                  </span>
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        {/* Profile Card - for both authenticated and non-authenticated users */}
                        <div className="p-4">
                          {isAuthenticated ? (
                            <Link 
                              to="/account" 
                              className="flex items-center space-x-3 p-3 bg-muted/60 hover:bg-accent/60 rounded-xl transition-colors border border-border/40"
                              onClick={closeMoreMenu}
                            >
                              <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(user?.name || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                                <p className="text-xs text-primary mt-0.5">View Profile</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          ) : (
                            <div className="p-3 bg-muted/60 rounded-xl border border-border/40">
                              <div className="flex items-center mb-3">
                                <Avatar className="h-10 w-10 mr-3 border border-border/40">
                                  <AvatarFallback className="bg-muted/80">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">Not signed in</p>
                                  <p className="text-xs text-muted-foreground">Sign in to view your profile</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  asChild
                                  className="w-full"
                                  onClick={closeMoreMenu}
                                >
                                  <Link to="/signin">Sign In</Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="w-full"
                                  onClick={closeMoreMenu}
                                >
                                  <Link to="/signup">Sign Up</Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Sign Out Button - show only if authenticated */}
                        {isAuthenticated && (
                          <div className="p-4 pt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                signOut();
                                closeMoreMenu();
                              }}
                              className="w-full flex items-center justify-center h-10 rounded-lg border-dashed"
                            >
                              <LogOut className="h-4 w-4 mr-2 text-destructive" />
                              <span className="text-destructive">Sign Out</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center px-2 py-1 transition-colors",
                    active 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex flex-col items-center justify-center w-full p-1.5",
                    active ? "bg-primary rounded-lg" : "hover:bg-accent/50"
                  )}>
                    <item.icon className="h-5 w-5 mb-0.5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar; 