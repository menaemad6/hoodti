import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/integrations/supabase/types.service';
import GameProductCard from './GameProductCard';
import GamingSectionTitle from './GamingSectionTitle';
import clsx from 'clsx';

const GamingProductsSection: React.FC = () => {
  const { products, isLoading } = useProducts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter for featured products or use all products if no featured ones
  const getFeaturedProducts = useCallback((products: Product[]) => {
    const featured = products
      .filter(product => product.featured === true)
      .map(product => ({
        ...product,
        id: `featured-${product.id}`
      }))
      .slice(0, 8);
    
    // If no featured products, fall back to most expensive products
    if (featured.length === 0) {
      return products
        .sort((a, b) => b.price - a.price)
        .slice(0, 8)
        .map(product => ({
          ...product,
          id: `featured-${product.id}`
        }));
    }
    
    return featured;
  }, []);

  const featuredProducts = getFeaturedProducts(products);

  // Scroll carousel to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (index >= featuredProducts.length || index < 0) return;
    
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const itemWidth = 320; // Fixed width: 80 * 4 = 320px (w-80)
      const gap = 32; // 8rem gap in tailwind
      const scrollPosition = index * (itemWidth + gap);
      
      carousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setActiveIndex(index);
    }
  }, [featuredProducts.length]);

  // Scroll carousel left or right
  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    const totalItems = featuredProducts.length;
    
    if (totalItems === 0) return;
    
    let newIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
    
    // Loop back to the first/last item
    if (newIndex < 0) newIndex = totalItems - 1;
    if (newIndex >= totalItems) newIndex = 0;
    
    scrollToIndex(newIndex);
  }, [activeIndex, featuredProducts.length, scrollToIndex]);

  // Automatic scrolling for carousel
  useEffect(() => {
    if (isPaused || featuredProducts.length === 0) return;
    
    const interval = setInterval(() => {
      scrollCarousel('right');
    }, 4000);
    
    return () => clearInterval(interval);
  }, [scrollCarousel, isPaused, featuredProducts.length]);

  // Track carousel scrolling for indicators
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const itemWidth = 320; // Fixed width: 80 * 4 = 320px (w-80)
      const gap = 32; // 8rem in tailwind
      
      // Calculate which item is most visible
      const newIndex = Math.round(scrollLeft / (itemWidth + gap));
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < featuredProducts.length) {
        setActiveIndex(newIndex);
      }
    };
    
    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [activeIndex, featuredProducts.length]);

  if (isLoading) {
    return (
      <section className="bg-black py-32">
        <div className="container mx-auto px-3 md:px-10">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue_gaming-50"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black py-32">
      <div className="container mx-auto px-3 md:px-10">
                 {/* Section Header */}
         <div className="px-5 py-16">
           <GamingSectionTitle
             subtitle="premium gaming collection"
             title="featured <b>g</b>ames"
             containerClass="mb-8"
           />
          <p className="max-w-md font-circular-web text-lg text-blue_gaming-50 opacity-50 text-center mx-auto">
            Discover our handpicked selection of premium board games. 
            From strategy masterpieces to family favorites, find your next gaming adventure.
          </p>
        </div>

        {/* Products Carousel */}
        <div className="space-y-12">
          <div className="relative group/carousel">
            {/* Carousel Navigation Buttons */}
            <div className="absolute -left-2 md:-left-4 top-1/2 transform -translate-y-1/2 z-30 opacity-80 group-hover/carousel:opacity-100 transition-opacity">
              <button 
                className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-sm shadow-lg border border-blue_gaming-50/30 hover:bg-yellow_gaming-300 hover:text-black hover:border-yellow_gaming-300 transition-all hover:scale-110 active:scale-95 cursor-target"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                  scrollCarousel('left');
                }}
                aria-label="Previous product"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute -right-2 md:-right-4 top-1/2 transform -translate-y-1/2 z-30 opacity-80 group-hover/carousel:opacity-100 transition-opacity">
              <button 
                className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-sm shadow-lg border border-blue_gaming-50/30 hover:bg-yellow_gaming-300 hover:text-black hover:border-yellow_gaming-300 transition-all hover:scale-110 active:scale-95 cursor-target"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                  scrollCarousel('right');
                }}
                aria-label="Next product"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Carousel Progress Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
              {featuredProducts.length > 0 ? 
                featuredProducts.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-target ${
                    index === activeIndex ? 'bg-yellow_gaming-300 w-4' : 'bg-blue_gaming-50/50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPaused(true);
                    setTimeout(() => setIsPaused(false), 5000);
                    scrollToIndex(index);
                  }}
                  aria-label={`Go to product ${index + 1}`}
                />
              )) : 
                Array.from({ length: 0 }).map((_, index) => (
                  <button
                    key={index}
                    className="w-1.5 h-1.5 rounded-full bg-blue_gaming-50/50"
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))
              }
            </div>
            
            {/* Scrollable Carousel */}
            <div 
              ref={carouselRef}
              id="gaming-products-carousel" 
              className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-8 pb-8 px-4 pt-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={(e) => {
                // Prevent clicks on carousel container from bubbling to cards
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {(featuredProducts.length > 0 ? 
                featuredProducts : 
                Array(8).fill(null)).map((product, index) => (
                <div 
                  key={product?.id || index} 
                  className="snap-start flex-shrink-0 py-4"
                >
                  {product ? (
                    <GameProductCard 
                      product={product} 
                      index={index}
                      className="w-80"
                    />
                  ) : (
                    // Placeholder card
                    <div className="w-80 h-[440px] bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center">
                      <div className="text-blue_gaming-50 font-general text-sm">Loading...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* View All Button */}
          <div className="flex justify-center mt-12">
            <Link
              to="/shop"
              className="group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-yellow_gaming-300 px-7 py-3 text-black hover:bg-yellow_gaming-200 transition-colors duration-300 cursor-target"
            >
              <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
                <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
                  Explore All Games
                </div>
                <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  Explore All Games
                </div>
              </span>
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>
        {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        `}
      </style>
    </section>
  );
};

export default GamingProductsSection;
