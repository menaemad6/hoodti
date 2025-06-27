import React, { useMemo } from "react";
import ModernProductCard from "./ModernProductCard";
import { Product } from "@/integrations/supabase/types.service";
import { Product as AppProduct } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowLeft, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { cn } from "@/lib/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Define DelayType to match what's in AnimatedWrapper
type DelayType = "none" | "0" | "100" | "150" | "200" | "300" | "400" | "500" | "600" | "700" | "1000";

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  const featuredProducts = useMemo(() => {
    return products.filter(product => product.featured === true).slice(0, 8);
  }, [products]);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-[size:32px] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background -z-10" />
      
      <div className="container mx-auto px-4">
        <AnimatedWrapper animation="fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Featured Collection</span>
              </div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                Featured Products
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Discover our handpicked selection of premium products
              </p>
            </div>
            <Link 
              to="/shop?featured=true" 
              className={cn(
                "group flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-primary/10 hover:bg-primary/20 transition-colors duration-300",
                "text-primary font-medium"
              )}
            >
              Browse All Featured 
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimatedWrapper>

        <div className="relative -mx-4 px-4">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1.2}
              centeredSlides={false}
              loop={true}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                768: { slidesPerView: 3.2 },
                1024: { slidesPerView: 4.2 },
                1280: { slidesPerView: 5.2 },
              }}
              navigation={{
                nextEl: '.featured-swiper-next',
                prevEl: '.featured-swiper-prev',
              }}
              pagination={{
                clickable: true,
                el: '.featured-swiper-pagination',
                bulletClass: 'inline-block w-2 h-2 rounded-full bg-primary/20 mx-1 transition-all duration-300 cursor-pointer hover:bg-primary/40',
                bulletActiveClass: '!bg-primary !w-4',
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              className="!overflow-visible !pb-12"
            >
              {featuredProducts.map((product, index) => (
                <SwiperSlide key={product.id} className="h-full">
                  <AnimatedWrapper 
                    animation="fade-in" 
                    delay={`${((index % 4) + 1) * 100}` as DelayType}
                  >
                    <div className="h-full p-1">
                      <img
                        src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </AnimatedWrapper>
                </SwiperSlide>
              ))}
            </Swiper>

            <Button 
              size="icon" 
              variant="secondary" 
              className={cn(
                "featured-swiper-prev absolute left-4 top-1/2 z-20 -translate-y-[calc(50%+24px)]",
                "rounded-full opacity-90 hover:opacity-100 shadow-lg",
                "bg-background/80 backdrop-blur-sm",
                "border border-border hover:border-border/80",
                "dark:bg-gray-950/80 dark:border-gray-800",
                "w-10 h-10 hidden md:flex"
              )}
            >
              <ArrowLeft size={16} />
            </Button>
            
            <Button 
              size="icon" 
              variant="secondary" 
              className={cn(
                "featured-swiper-next absolute right-4 top-1/2 z-20 -translate-y-[calc(50%+24px)]",
                "rounded-full opacity-90 hover:opacity-100 shadow-lg",
                "bg-background/80 backdrop-blur-sm",
                "border border-border hover:border-border/80",
                "dark:bg-gray-950/80 dark:border-gray-800",
                "w-10 h-10 hidden md:flex"
              )}
            >
              <ArrowRight size={16} />
            </Button>
            
            <div className="featured-swiper-pagination absolute bottom-0 left-0 right-0 flex justify-center z-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
