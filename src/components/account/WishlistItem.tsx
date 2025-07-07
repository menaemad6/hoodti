import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, ExternalLink, Trash2, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import { ensureProductTypeCompatibility } from "@/types/supabase-types";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

interface WishlistItemProps {
  wishlistItem: any;
  product: any;
  onRemove: () => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ wishlistItem, product, onRemove }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Use the helper function to ensure type compatibility
  const normalizedProduct = ensureProductTypeCompatibility(product);

  const addToCartHandler = () => {
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
    
    addToCart(cartProduct, 1);
    
    toast({
      title: "Added to cart",
      description: `${normalizedProduct.name} has been added to your cart.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="relative h-full rounded-2xl overflow-hidden flex flex-col bg-background/60 backdrop-blur-xl border border-border/30 dark:border-border/20 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Image container */}
        <div className="relative overflow-hidden">
          {/* Discount badge */}
          {normalizedProduct.discount > 0 && (
            <Badge variant="destructive" className="absolute top-3 left-3 z-10 font-medium">
              {normalizedProduct.discount}% OFF
            </Badge>
          )}
          
          {/* Quick actions */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={onRemove}
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/95 border border-border/40 shadow-sm text-red-500 hover:text-red-600"
            >
              <Heart className="h-4 w-4 fill-current" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={addToCartHandler}
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/95 border border-border/40 shadow-sm hover:text-primary"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Product image */}
          <div className="aspect-square">
            <img
              src={Array.isArray(normalizedProduct.images) && normalizedProduct.images.length > 0 ? normalizedProduct.images[0] : "/placeholder.svg"}
              alt={normalizedProduct.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          {/* Overlay and view button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Link to={`/product/${normalizedProduct.id}`}>
              <Button 
                variant="default" 
                size="sm" 
                className="rounded-full font-medium px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-background/90 text-foreground hover:bg-background"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Product info */}
          <div>
            <h3 className="font-medium line-clamp-1 text-foreground/90 group-hover:text-foreground transition-colors">
              {normalizedProduct.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
              {normalizedProduct.description}
            </p>
          </div>
          
          {/* Price area */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                {formatPrice(normalizedProduct.price)}
              </span>
              {normalizedProduct.discount > 0 && normalizedProduct.original_price > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(normalizedProduct.original_price)}
                </span>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {normalizedProduct.unit}
              </span>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={addToCartHandler}
                className="w-full rounded-full font-medium bg-primary/90 hover:bg-primary text-primary-foreground transition-all duration-300"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={onRemove}
                className="rounded-full aspect-square p-0 border-border/50 hover:border-red-500 text-red-500 hover:text-red-600"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WishlistItem;
