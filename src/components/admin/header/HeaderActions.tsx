import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Settings, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ProfileData } from "@/components/admin/types";

interface HeaderActionsProps {
  profile: ProfileData | null;
  pendingOrders: number;
  onSignOut: () => Promise<void>;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ 
  profile, 
  pendingOrders, 
  onSignOut 
}) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => navigate('/')}
        title="Go to Home"
      >
        <Home className="h-5 w-5" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {pendingOrders > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                {pendingOrders > 9 ? '9+' : pendingOrders}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {pendingOrders > 0 ? (
            <DropdownMenuItem onClick={() => navigate('/admin/orders')}>
              <div className="flex flex-col">
                <span className="font-medium">New Orders</span>
                <span className="text-xs text-muted-foreground">You have {pendingOrders} pending orders to process</span>
              </div>
            </DropdownMenuItem>
          ) : (
            <div className="px-2 py-4 text-center text-muted-foreground">
              No new notifications
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Avatar className="h-8 w-8">
              {profile?.avatar ? (
                <AvatarImage src={profile.avatar} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(profile?.name || profile?.email)}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/account')}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HeaderActions;
