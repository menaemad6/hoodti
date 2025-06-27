import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";
import { getSEOConfig } from "@/lib/seo-config";
import ProductGrid from "@/components/shop/ProductGrid";
import GlassCard from "@/components/ui/glass-card";
import { getDiscountedProducts } from "@/integrations/supabase/products.service";
import { Product } from "@/integrations/supabase/types.service";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { PercentIcon, Tag, ShoppingBag, BadgePercent } from "lucide-react";

const Deals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get SEO configuration for deals page
  const seoConfig = getSEOConfig('deals');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const discountedProducts = await getDiscountedProducts();
        setProducts(discountedProducts);
      } catch (error) {
        console.error('Error fetching discounted products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      <SEOHead {...seoConfig} />
      {/* Modern hero section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-500/10 via-background to-primary/10 pt-16 pb-20 mt-8 rounded-xl mx-4">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <AnimatedWrapper animation="fade-in" delay="100">
              <div className="space-y-6 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-red-200 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-sm font-medium text-foreground/80">Limited Time Offers</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-primary">Hot Deals</span>
                  <span className="block mt-1">& Discounts</span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-md">
                  Exclusive savings on premium products. Don't miss out on these special offers!
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="bg-red-100 text-red-800 px-4 py-1.5 rounded-full font-medium text-sm flex items-center">
                    <PercentIcon className="h-4 w-4 mr-1.5" />
                    Up to 50% Off
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-medium text-sm">
                    Limited Stock
                  </div>
                  <div className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full font-medium text-sm">
                    Bundle Deals
                  </div>
                </div>
              </div>
            </AnimatedWrapper>
            
            {/* Right: Visual elements */}
            <AnimatedWrapper animation="fade-in" delay="300" className="hidden lg:block">
              <div className="relative h-80">
                {/* Deal cards */}
                {products.slice(0, 3).map((product, index) => (
                  <GlassCard 
                    key={product.id}
                    className={`absolute shadow-lg transform transition-all duration-500 hover:shadow-xl hover:scale-[1.02] ${
                      index === 0 ? 'right-0 top-0 rotate-3 z-30 w-64' :
                      index === 1 ? 'right-20 top-28 -rotate-2 z-20 w-72' :
                      'left-0 bottom-0 rotate-6 z-10 w-60'
                    }`}
                    variant={index === 0 ? "elevated" : index === 1 ? "default" : "bordered"}
                    hoverEffect={true}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-md">
                        {product.discount}% OFF
                      </div>
                      
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "https://placehold.co/600x400/f5f5f5/cccccc?text=Product"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          {product.category?.name || 'Special Offer'}
                        </div>
                        
                        <h3 className="font-medium text-foreground line-clamp-1">
                          {product.name}
                        </h3>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-bold text-foreground">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              ${Number(product.price * (1 + product.discount / 100)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <BadgePercent className="mr-2 h-5 w-5 text-red-500" />
              Current Deals
            </h2>
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Deals;
