import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import { ensureProductTypeCompatibility, getCategoryName as getProductCategory } from "@/integrations/supabase/types.service";
import { formatPrice } from "../../lib/utils";

interface ModernProductCardProps {
  product: Product | SupabaseProduct;
  className?: string;
  small?: boolean;
}

const ModernProductCard: React.FC<ModernProductCardProps> = ({ 
  product, 
  className,
  small = false 
}) => {
  const { addToCart } = useCart();
  
  // Use the helper function to ensure type compatibility
  const normalizedProduct = ensureProductTypeCompatibility(product);
  
  // Calculate the original price if there's a discount
  const originalPrice = normalizedProduct.discount 
    ? (normalizedProduct.price * (1 + normalizedProduct.discount / 100)).toFixed(2)
    : null;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert to the expected Product type for the cart
    const cartProduct = {
      ...normalizedProduct,
      category: typeof normalizedProduct.category === 'string' 
        ? { 
            id: "",
            name: normalizedProduct.category,
            description: "",
            image: "",
            created_at: new Date().toISOString()
          }
        : normalizedProduct.category
    };
    
    // Helper to parse nested sizes
    let selectedType: string | undefined = undefined;
    let selectedSize: string | undefined = undefined;
    
    // Try to parse nested size structure
    if (normalizedProduct.size && typeof normalizedProduct.size === 'string') {
      try {
        const parsed = JSON.parse(normalizedProduct.size);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          // Nested object: { type: [sizes] }
          const types = Object.keys(parsed);
          if (types.length > 0) {
            selectedType = types[0];
            const sizes = parsed[selectedType];
            if (Array.isArray(sizes) && sizes.length > 0) {
              selectedSize = sizes[0];
            }
          }
        } else if (Array.isArray(parsed)) {
          // Flat array: use first size, try to get type from type field
          selectedSize = parsed[0];
          if (normalizedProduct.type) {
            let typeArr: string[] = [];
            if (typeof normalizedProduct.type === 'string' && normalizedProduct.type.startsWith('[')) {
              try { typeArr = JSON.parse(normalizedProduct.type); } catch {}
            } else if (Array.isArray(normalizedProduct.type)) {
              typeArr = normalizedProduct.type;
            }
            if (typeArr.length > 0) selectedType = typeArr[0];
          }
        }
      } catch {
        // fallback: treat as single value
        selectedSize = normalizedProduct.size;
        if (normalizedProduct.type) {
          let typeArr: string[] = [];
          if (typeof normalizedProduct.type === 'string' && normalizedProduct.type.startsWith('[')) {
            try { typeArr = JSON.parse(normalizedProduct.type); } catch {}
          } else if (Array.isArray(normalizedProduct.type)) {
            typeArr = normalizedProduct.type;
          }
          if (typeArr.length > 0) selectedType = typeArr[0];
        }
      }
    } else if (Array.isArray(normalizedProduct.size)) {
      selectedSize = normalizedProduct.size[0];
      if (normalizedProduct.type) {
        let typeArr: string[] = [];
        if (typeof normalizedProduct.type === 'string' && normalizedProduct.type.startsWith('[')) {
          try { typeArr = JSON.parse(normalizedProduct.type); } catch {}
        } else if (Array.isArray(normalizedProduct.type)) {
          typeArr = normalizedProduct.type;
        }
        if (typeArr.length > 0) selectedType = typeArr[0];
      }
    } else if (typeof normalizedProduct.size === 'string') {
      selectedSize = normalizedProduct.size;
      if (normalizedProduct.type) {
        let typeArr: string[] = [];
        if (typeof normalizedProduct.type === 'string' && normalizedProduct.type.startsWith('[')) {
          try { typeArr = JSON.parse(normalizedProduct.type); } catch {}
        } else if (Array.isArray(normalizedProduct.type)) {
          typeArr = normalizedProduct.type;
        }
        if (typeArr.length > 0) selectedType = typeArr[0];
      }
    }
    
    // Helper function to parse potential array values stored as strings
    const parseArrayValue = (value: string | string[] | null | undefined): string | undefined => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value[0];
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {}
      }
      return typeof value === 'string' ? value : undefined;
    };
    
    // Extract first color
    const firstColor = parseArrayValue(normalizedProduct.color);
    
    // Add to cart with the first size, type, and color
    addToCart(cartProduct, 1, firstColor, selectedSize, selectedType);
  };

  return (
    <Link 
      to={`/product/${normalizedProduct.id}`}
      className={cn(
        "group overflow-hidden rounded-lg bg-card text-card-foreground shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full",
        "dark:bg-gray-800/50 dark:backdrop-blur-sm dark:border dark:border-gray-700/50",
        className
      )}
    >
      <div className="relative overflow-hidden">
        {normalizedProduct.discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-md animate-scale-in">
            {normalizedProduct.discount}% OFF
          </div>
        )}
        
        {normalizedProduct.is_new && (
          <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs font-bold py-1 px-2 rounded-full shadow-md animate-scale-in">
            NEW
          </div>
        )}
        
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={Array.isArray(normalizedProduct.images) && normalizedProduct.images.length > 0 ? normalizedProduct.images[0] : "/placeholder.svg"}
            alt={normalizedProduct.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-black/30"></div>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="rounded-full shadow-lg"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col justify-between flex-grow p-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            {getProductCategory(normalizedProduct)}
          </div>
          
          <h3 className={cn(
            "font-medium text-foreground group-hover:text-primary transition-colors",
            small ? "text-sm" : "text-base"
          )}>
            {normalizedProduct.name}
          </h3>
          
          {/* Display clothing attributes */}
          {normalizedProduct.brand && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <span className="text-xs text-muted-foreground flex items-center">
                {normalizedProduct.brand}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <span className={cn(
              "font-bold text-foreground",
              small ? "text-base" : "text-lg"
            )}>
              {formatPrice(normalizedProduct.price)}
            </span>
            
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-2">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {normalizedProduct.gender && (
            <div className="text-xs text-muted-foreground capitalize">
              {normalizedProduct.gender}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ModernProductCard;
