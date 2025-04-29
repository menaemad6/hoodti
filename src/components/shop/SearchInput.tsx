import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = React.memo(({ value, onChange }: SearchInputProps) => {
  return (
    <div>
      <Label htmlFor="search" className="text-sm font-medium mb-2 block">
        Search Products
      </Label>
      <div className="relative">
        <Input
          id="search"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
});

SearchInput.displayName = "SearchInput";

export default SearchInput; 