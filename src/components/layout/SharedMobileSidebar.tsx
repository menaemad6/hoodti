import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  LayoutDashboard, 
  X,
  Heart,
  Package,
  Search,
  TagIcon,
  Palette,
  ChevronRight,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useCurrentTenant } from '@/context/TenantContext';
import { useTheme } from '@/context/ThemeContext';
import { stripTenantFromEmail } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SidebarNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  iconBg?: string;
  iconColor?: string;
}

interface SharedMobileSidebarProps {
  trigger: React.ReactNode;
  variant?: 'default' | 'gaming';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SharedMobileSidebar: React.FC<SharedMobileSidebarProps> = ({ 
  trigger, 
  variant = 'default',
  isOpen,
  onOpenChange 
}) => {
  const { isAuthenticated, signOut, user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleAccess();
  const currentTenant = useCurrentTenant();
  const { theme, setTheme } = useTheme();
  
  // Internal state for when external state is not provided
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const sidebarOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setSidebarOpen = onOpenChange || setInternalOpen;

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

  const sidebarItems = getSidebarItems();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(part => part[0]).join("").toUpperCase().substring(0, 2);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Use default styling for both variants
  const isGaming = variant === 'gaming';
  
  const sheetContentClass = "w-80 p-0 bg-background/95 backdrop-blur-xl border-l border-border/40";
  const headerClass = "p-4 flex items-center justify-between";
  const logoClass = "text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70";
  const navClass = "flex-1 overflow-y-auto px-2";
  const navItemClass = "flex items-center justify-between p-3 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors";
  const footerClass = "p-4";

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side={isGaming ? "left" : "right"} className={sheetContentClass}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={headerClass}>
            <h2 className={logoClass}>More Options</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-muted/50" 
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className={navClass}>
            {/* Theme Selector */}
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
            
            <div className="py-4 space-y-1">
              {sidebarItems.map((item) => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className={navItemClass}
                  onClick={closeSidebar}
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
          </nav>

          <Separator className="my-2" />

          {/* Footer */}
          <div className={footerClass}>
            {/* Profile Card */}
            {isAuthenticated ? (
              <Link 
                to="/account" 
                className="flex items-center space-x-3 p-3 bg-muted/60 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-colors border border-border/40"
                onClick={closeSidebar}
              >
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={user?.user_metadata?.avatar} alt={user?.user_metadata?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user?.user_metadata?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.user_metadata?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{stripTenantFromEmail(user?.email) || "user@example.com"}</p>
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
                    onClick={closeSidebar}
                  >
                    <Link to="/signin">Sign In</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                    onClick={closeSidebar}
                  >
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            )}
            
            {/* Sign Out Button */}
            {isAuthenticated && (
              <div className="pt-0 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut();
                    closeSidebar();
                  }}
                  className="w-full flex items-center justify-center h-10 rounded-lg border-dashed"
                >
                  <User className="h-4 w-4 mr-2 text-destructive" />
                  <span className="text-destructive">Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SharedMobileSidebar;
