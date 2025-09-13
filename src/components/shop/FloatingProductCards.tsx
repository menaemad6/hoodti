import React from "react";
import { ShoppingBag, Star } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { Product } from "@/types";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import { ensureProductTypeCompatibility } from "@/integrations/supabase/types.service";
import { formatPrice } from "@/lib/utils";

interface FloatingProductCardsProps {
  products: (Product | SupabaseProduct)[];
}

const FloatingProductCards: React.FC<FloatingProductCardsProps> = ({ products }) => {
  // Take first 3 products for the floating cards
  const displayProducts = products.slice(0, 3);
  
  // If we don't have enough products, we'll show fallback cards
  if (displayProducts.length === 0) {
    return (
      <AnimatedWrapper animation="fade-in" delay="300" className="hidden lg:block">
        <div className="relative h-96">
          {/* Fallback cards when no products */}
          <GlassCard 
            className="absolute right-0 top-0 w-64 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20"
            variant="elevated"
            hoverEffect={true}
          >
            <div className="flex items-center p-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Premium Selection</h3>
                <p className="text-xs text-muted-foreground">Quality at its finest</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard 
            className="absolute right-20 top-32 w-72 transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-10"
            variant="elevated"
            hoverEffect={true}
          >
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <img 
                src="/assets/hero-product.jpg" 
                alt="Featured product" 
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f5f5f5/cccccc?text=Premium+Product";
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Premium Product</p>
                    <p className="text-sm font-bold">$49.99</p>
                  </div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard 
            className="absolute left-8 bottom-0 w-60 transform rotate-6 hover:rotate-0 transition-transform duration-500"
            variant="bordered"
            hoverEffect={true}
          >
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">Today's Offer</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">25% OFF</span>
              </div>
              <p className="text-sm font-medium">Special discount on selected items</p>
            </div>
          </GlassCard>
        </div>
      </AnimatedWrapper>
    );
  }

  // Calculate positions and rotations for the cards
  const cardConfigs = [
    {
      className: "absolute right-0 top-0 w-64 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20",
      variant: "elevated" as const
    },
    {
      className: "absolute right-20 top-32 w-72 transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-10",
      variant: "elevated" as const
    },
    {
      className: "absolute left-8 bottom-0 w-60 transform rotate-6 hover:rotate-0 transition-transform duration-500",
      variant: "bordered" as const
    }
  ];

  return (
    <AnimatedWrapper animation="fade-in" delay="300" className="hidden lg:block">
      <div className="relative h-96">
        {displayProducts.map((product, index) => {
          const normalizedProduct = ensureProductTypeCompatibility(product);
          const config = cardConfigs[index];
          
          // Calculate discount percentage if applicable
          const discountPercentage = normalizedProduct.discount > 0 
            ? Math.round(normalizedProduct.discount) 
            : null;

          return (
            <GlassCard 
              key={normalizedProduct.id}
              className={config.className}
              variant={config.variant}
              hoverEffect={true}
            >
              {/* All cards use the same image layout design */}
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img 
                  src={Array.isArray(normalizedProduct.images) && normalizedProduct.images.length > 0 
                    ? normalizedProduct.images[0] 
                    : "https://placehold.co/600x400/f5f5f5/cccccc?text=Product"}
                  alt={normalizedProduct.name} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f5f5f5/cccccc?text=Product";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{normalizedProduct.name}</p>
                      <p className="text-sm font-bold">{formatPrice(normalizedProduct.price)}</p>
                    </div>
                    {/* Discount badge if applicable */}
                    {discountPercentage && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AnimatedWrapper>
  );
};

export default FloatingProductCards;
