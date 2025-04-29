
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="max-w-md w-full hidden md:flex">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search products, orders, customers..." 
          className="pl-10 bg-muted/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </form>
  );
};

export default HeaderSearch;
