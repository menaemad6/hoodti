import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sun, MoonStar, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { stripTenantFromEmail } from "@/lib/utils";
import { ProfileData } from "@/components/admin/types";

interface SidebarFooterProps {
  profile: ProfileData | null;
  onSignOut: () => Promise<void>;
  onThemeToggle: () => void;
  theme: string;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ 
  profile, 
  onSignOut, 
  onThemeToggle, 
  theme 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          {profile?.avatar ? (
            <AvatarImage src={profile.avatar} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
                            {profile?.name || stripTenantFromEmail(user?.email) || 'Admin User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 mr-2" />
          ) : (
            <MoonStar className="h-4 w-4 mr-2" />
          )}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-destructive hover:text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooter;
