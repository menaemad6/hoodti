import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRoleAccess } from "@/hooks/use-role-access";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTenant } from "@/context/TenantContext";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  Menu, 
  X,
  Clock,
  Palette,
  Ungroup
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import SidebarFooter from "./sidebar/SidebarFooter";
import HeaderActions from "./header/HeaderActions";
import { MenuItem, ProfileData } from "./types";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentTenant = useCurrentTenant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const getProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    const getPendingOrders = async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("tenant_id", currentTenant.id);
      
      if (count !== null) {
        setPendingOrders(count);
      }
    };

    getProfile();
    getPendingOrders();
  }, [user, currentTenant]);

  if (!isAdmin && !isSuperAdmin) {
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of the admin panel"
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Could not sign out. Please try again."
      });
    }
  };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Products", icon: Package, path: "/admin/products" },
    { name: "Orders", icon: ShoppingBag, path: "/admin/orders", badge: pendingOrders > 0 ? pendingOrders : undefined },
    { name: "Customers", icon: Users, path: "/admin/customers" },
    { name: "Delivery Slots", icon: Clock, path: "/admin/delivery-slots" },
    { name: "Reports", icon: BarChart, path: "/admin/reports" },
    { name: "Categories", icon: Ungroup, path: "/admin/content" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  if (isSuperAdmin) {
    menuItems.push({ name: "User Management", icon: Users, path: "/admin/users" });
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/30 dark:from-background dark:to-muted/10 w-full overflow-x-hidden">
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background/90 backdrop-blur-sm shadow-md rounded-lg"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div 
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-background/80 dark:bg-background/40 backdrop-blur-xl shadow-lg z-40 transition-all duration-300 border-r border-border",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          <SidebarHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <SidebarNavigation menuItems={menuItems} />
          <SidebarFooter profile={profile} onSignOut={handleSignOut} onThemeToggle={handleThemeChange} theme={theme} />
        </div>
      </div>

      <div className={cn(
        "flex-1 transition-all duration-300 flex flex-col w-full",
        isSidebarOpen ? "lg:ml-72" : "lg:ml-0"
      )}>
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold"></h1>
          </div>
          
          <HeaderActions 
            profile={profile} 
            pendingOrders={pendingOrders} 
            onSignOut={handleSignOut} 
          />
        </header>
        
        <div className="p-6 md:p-8 flex-1 max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
