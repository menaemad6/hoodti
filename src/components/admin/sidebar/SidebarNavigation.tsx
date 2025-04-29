
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/components/admin/types";

interface SidebarNavigationProps {
  menuItems: MenuItem[];
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ menuItems }) => {
  const location = useLocation();
  
  return (
    <nav className="flex-1 py-6 px-3 overflow-y-auto">
      <ul className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
          
          return (
            <li key={item.name}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-muted-foreground",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;
