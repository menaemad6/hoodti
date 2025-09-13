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
  LayoutDashboard,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SharedMobileSidebar from "./SharedMobileSidebar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrentTenant } from "@/context/TenantContext";
import { stripTenantFromEmail } from "@/lib/utils";
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
import { BRAND_NAME } from "@/lib/constants";

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

interface MobileNavbarProps {
  isVisible?: boolean;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ isVisible = true }) => {
  const location = useLocation();
  const { cartItemsCount } = useCart();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, signOut, user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleAccess();
  const currentTenant = useCurrentTenant();
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
        icon: Search,
        label: "Search Products",
        href: "/shop",
        iconBg: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        icon: TagIcon,
        label: "Categories",
        href: "/categories",
        iconBg: "bg-orange-100 dark:bg-orange-900/20",
        iconColor: "text-orange-600 dark:text-orange-400",
      },

    ];

    // Only add customize link if tenant has customization enabled
    if (currentTenant.customization?.enabled) {
      items.splice(1, 0, {
        icon: Palette,
        label: "Customize Product",
        href: "/customize",
        iconBg: "bg-red-100 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
      });
    }
    
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

  const visibilityClass = isVisible 
    ? "translate-y-0 opacity-100 pointer-events-auto" 
    : "translate-y-[-100%] opacity-0 pointer-events-none";
  
  const bottomVisibilityClass = isVisible 
    ? "translate-y-0 opacity-100 pointer-events-auto" 
    : "translate-y-[200%] opacity-0 pointer-events-none";

  return (
    <>
      {/* Top navbar - mobile: profile dropdown and cart */}
      <div className={`fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md md:hidden transition-all duration-300 ${visibilityClass}`}>
        <div className="flex h-16 items-center px-4">
          {/* Left: Profile dropdown */}
          <div className="flex-1 flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="p-1.5 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 relative bg-muted/60 border border-border/30">
                  <User className="h-5 w-5 text-primary/80" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>
                  {isAuthenticated && user?.email ? (
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{stripTenantFromEmail(user.email)}</p>
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
                {BRAND_NAME}
              </span>
            </Link>
          </div>
          
          {/* Right: Cart icon */}
          <div className="flex-1 flex justify-end">
            <Link to="/cart" className="p-1.5 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 relative bg-muted/60 border border-border/30">
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
      <div className={`fixed bottom-4 left-0 z-50 w-full px-4 md:hidden transition-all duration-300 ${bottomVisibilityClass}`}>
        <div className="rounded-full border border-border/40 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-2xl shadow-lg shadow-background/5 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 opacity-50"></div>
          
          <div className="grid h-16 grid-cols-4 relative">
            {bottomNavItems.map((item, index) => {
              const active = isActive(item.href);
              
              if (item.href === "#more") {
                return (
                  <SharedMobileSidebar
                    key={item.href}
                    variant="default"
                    isOpen={isMoreOpen}
                    onOpenChange={setIsMoreOpen}
                    trigger={
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
                            active ? "bg-primary rounded-lg" : "hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg"
                          )}>
                          <item.icon className="h-5 w-5 mb-0.5" />
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </div>
                      </button>
                    }
                  />
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
                    active ? "bg-primary rounded-lg" : "hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg"
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