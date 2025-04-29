
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  isSidebarOpen, 
  toggleSidebar 
}) => {
  return (
    <div className="p-5 border-b border-border flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">G</span>
        </div>
        {isSidebarOpen && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">(Brand)</span>
        )}
      </Link>
      <Button 
        variant="ghost" 
        size="sm" 
        className="lg:flex hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default SidebarHeader;
