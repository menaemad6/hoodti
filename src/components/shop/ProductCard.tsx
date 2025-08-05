import React from "react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { mapSupabaseProductToAppProduct } from "@/types/supabase-types";
import { formatPrice } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product | any;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  // Convert product to App product if needed
  const normalizedProduct: Product = ('category' in product && typeof product.category !== 'object')
    ? product as Product 
    : mapSupabaseProductToAppProduct(product);
    
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(normalizedProduct, 1);
  };
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg border p-2 hover:shadow-md transition-all", 
      "dark:bg-gray-800/60 dark:border-gray-700/50 dark:hover:bg-gray-800/80",
      className
    )}>
      <div className="aspect-square overflow-hidden rounded-md bg-gray-100 dark:bg-gray-900/50 relative">
        <img
          src={Array.isArray(normalizedProduct.images) && normalizedProduct.images.length > 0 ? normalizedProduct.images[0] : "/placeholder.svg"}
          alt={normalizedProduct.name}
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        {normalizedProduct.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-md">
            {normalizedProduct.discount}% OFF
          </div>
        )}
      </div>
      
      <div className="pt-3 pb-2">
        <h3 className="text-sm font-medium text-foreground">{normalizedProduct.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <span className="text-primary font-bold">{formatPrice(normalizedProduct.price)}</span>
            {normalizedProduct.discount > 0 && (
              <span className="text-xs text-muted-foreground line-through ml-2">
                {formatPrice(normalizedProduct.price * (1 + normalizedProduct.discount / 100))}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{normalizedProduct.unit}</span>
        </div>
        <div className="mt-2">
          {normalizedProduct.stock === 0 ? (
            <Button 
              size="sm"
              className="w-full rounded-md bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              disabled
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Sold Out
            </Button>
          ) : (
            <Button 
              onClick={handleAddToCart}
              size="sm"
              className="w-full rounded-md"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
