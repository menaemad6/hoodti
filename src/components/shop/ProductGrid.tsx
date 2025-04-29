
import React from "react";
import ModernProductCard from "./ModernProductCard";
import { Product } from "@/types";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import AnimatedWrapper from "@/components/ui/animated-wrapper";

// Define DelayType to match what's in AnimatedWrapper
type DelayType = "none" | "0" | "100" | "150" | "200" | "300" | "400" | "500" | "600" | "700" | "1000";

interface ProductGridProps {
  products: (Product | SupabaseProduct)[];
  className?: string;
  columns?: number;
  small?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  className, 
  columns = 4,
  small = false
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
      case 5: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case 6: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
      default: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }
  
  return (
    <div className={`grid ${getGridClass()} gap-6 ${className || ""}`}>
      {products.map((product, index) => (
        <AnimatedWrapper 
          key={product.id}
          animation="fade-in" 
          delay={`${((index % 5) + 1) * 100}` as DelayType}
        >
          <ModernProductCard 
            product={product}
            small={small}
          />
        </AnimatedWrapper>
      ))}
    </div>
  );
};

export default ProductGrid;
