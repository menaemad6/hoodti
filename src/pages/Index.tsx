import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import HomeLayout from "@/components/layout/HomeLayout";
import { getProducts } from "@/integrations/supabase/products.service";
import { getCategories } from "@/integrations/supabase/categories.service";
import { Product, CategoryRow } from "@/integrations/supabase/types.service";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, ExternalLink, Tag, Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import StreetHero from "@/components/home/StreetHero";
import ModernCategoryCard from "@/components/home/ModernCategoryCard";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { addToCart } = useCart();

  // Function to handle adding item to cart
  const handleAddToCart = useCallback((product: Product | null, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    // Visual feedback
    const button = e.currentTarget;
    button.classList.add('bg-primary', 'text-primary-foreground');
    
    // Get the first color from the product colors array
    let selectedColor: string | undefined;
    if (product.color) {
      try {
        // First, try to parse as JSON array
        if (product.color.startsWith('[') && product.color.endsWith(']')) {
          const colorsArray = JSON.parse(product.color);
          selectedColor = Array.isArray(colorsArray) && colorsArray.length > 0 ? 
            colorsArray[0].toString().replace(/"/g, '') : undefined;
        } else {
          // Fall back to comma-separated string
          const colorsArray = product.color.split(',').map(c => c.trim());
          selectedColor = colorsArray.length > 0 ? colorsArray[0].replace(/"/g, '') : undefined;
        }
      } catch (error) {
        console.error('Error parsing color:', error);
        selectedColor = undefined;
      }
    }
    
    // Get the first size from the product sizes array
    let selectedSize: string | undefined;
    if (product.size) {
      try {
        // First, try to parse as JSON array
        if (product.size.startsWith('[') && product.size.endsWith(']')) {
          const sizesArray = JSON.parse(product.size);
          selectedSize = Array.isArray(sizesArray) && sizesArray.length > 0 ? 
            sizesArray[0].toString().replace(/"/g, '') : undefined;
        } else {
          // Fall back to comma-separated string
          const sizesArray = product.size.split(',').map(s => s.trim());
          selectedSize = sizesArray.length > 0 ? sizesArray[0].replace(/"/g, '') : undefined;
        }
      } catch (error) {
        console.error('Error parsing size:', error);
        selectedSize = undefined;
      }
    }
    
    console.log('Adding to cart with color:', selectedColor, 'and size:', selectedSize);
    
    // Use the CartContext to add the item with selected color and size
    addToCart(product, 1, selectedColor, selectedSize);
    
    // Reset button style after a delay
    setTimeout(() => {
      button.classList.remove('bg-primary', 'text-primary-foreground');
    }, 800);
  }, [addToCart]);

  // Scroll carousel to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const itemWidth = carousel.querySelector('.snap-start')?.clientWidth || 0;
      const gap = 24; // 6rem gap in tailwind
      carousel.scrollTo({
        left: index * (itemWidth + gap),
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  }, []);

  // Scroll carousel left or right
  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!products.length) return;
    
    const totalItems = products.length || 8;
    let newIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
    
    // Loop back to the first/last item
    if (newIndex < 0) newIndex = totalItems - 1;
    if (newIndex >= totalItems) newIndex = 0;
    
    scrollToIndex(newIndex);
  }, [activeIndex, products.length, scrollToIndex]);

  // Automatic scrolling for carousel
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      scrollCarousel('right');
    }, 5000);
    
    return () => clearInterval(interval);
  }, [scrollCarousel, isPaused]);

  // Track carousel scrolling for indicators
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const itemWidth = carousel.querySelector('.snap-start')?.clientWidth || 0;
      const gap = 24; // 6rem in tailwind
      
      if (itemWidth === 0) return;
      
      // Calculate which item is most visible
      const newIndex = Math.round(scrollLeft / (itemWidth + gap));
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };
    
    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <HomeLayout>
      {/* Modern Hero Section with GIF Backgrounds */}
      <StreetHero />

      {/* Category Section */}
      <section className="py-24 relative overflow-hidden border-t border-b border-border/10">
        {/* Enhanced glassy background shapes for categories section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Hexagon shape */}
          <div className="absolute -left-32 top-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-[4px] mix-blend-soft-light"
            style={{ 
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              transform: "rotate(15deg)"
            }}>
          </div>
          
          {/* Triangle */}
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-primary/15 to-transparent backdrop-blur-[3px] mix-blend-soft-light"
            style={{ 
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              transform: "rotate(-10deg)"
            }}>
          </div>
          
          {/* Circle with inner ring */}
          <div className="absolute bottom-0 right-0 flex items-center justify-center">
            <div className="w-80 h-80 rounded-full bg-gradient-to-t from-primary/10 to-transparent backdrop-blur-[2px] mix-blend-soft-light transform translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute w-40 h-40 rounded-full border-4 border-primary/20 backdrop-blur-[1px] mix-blend-overlay transform translate-y-1/4 translate-x-1/4"></div>
          </div>
          
          {/* Curved wave */}
          <div className="absolute left-1/3 bottom-10 w-full h-32 bg-gradient-to-r from-transparent via-primary/10 to-transparent backdrop-blur-[2px] mix-blend-soft-light"
            style={{ 
              clipPath: "path('M0,16 C120,-16 240,64 360,16 C480,-16 600,64 720,16 C840,-16 960,64 1080,16 L1080,64 L0,64 Z')"
            }}>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedWrapper animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium tracking-wider mb-3">
                EXCLUSIVE COLLECTIONS
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                CATEGORIES
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Premium streetwear collections for your unique style
              </p>
            </div>
          </AnimatedWrapper>

          {isCategoriesLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {(categories.length > 0 ? categories : Array(4).fill(null))
                .slice(0, 4)
                .map((category, index) => (
                  <AnimatedWrapper 
                    key={category?.id || `placeholder-${index}`} 
                    animation="fade-in" 
                    delay={`${index * 100}` as DelayType}
                  >
                    <Link 
                      to={`/shop?category=${category?.id || ''}`}
                      className="block rounded-xl overflow-hidden relative group h-56 sm:h-64 border border-border/40 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 opacity-90 group-hover:opacity-70 transition-opacity"></div>
                      <img 
                        src={category?.image || `https://images.unsplash.com/photo-${[
                          '1552346154-21d32810aba3',
                          '1614975059251-992f11792b9f',
                          '1627225924765-552d49cf47ad',
                          '1620799140408-edc6dcb6d633'
                        ][index]}?q=80&w=1887&auto=format&fit=crop`}
                        alt={category?.name || ["Sneakers", "Hoodies", "Tees", "Accessories"][index] || "Category"}
                        className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end p-5 z-20">
                        <div className="transform group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                            {category?.name || ["SNEAKERS", "HOODIES", "TEES", "ACCESSORIES"][index] || "Category"}
                          </h3>
                          <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs text-white/70 font-medium mr-1">Shop Now</span>
                            <span className="bg-primary rounded-full p-1">
                              <ArrowRight size={10} className="text-white" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 rotate-[-4deg] group-hover:scale-110 transition-transform duration-300">
                        <span className="inline-block px-2 py-0.5 bg-primary/80 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg" style={{ clipPath: "polygon(0 0, 100% 8%, 95% 94%, 4% 100%)" }}>
                          {["Street", "Urban", "Exclusive", "Limited", "Premium", "Essential"][index % 6]}
                        </span>
                      </div>
                    </Link>
                  </AnimatedWrapper>
                ))}
            </div>
          )}
          
          {/* Mobile View All button - visible only on mobile */}
          <div className="flex justify-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm uppercase transition-colors duration-300 rounded-full shadow-md hover:shadow-lg md:hidden"
            >
              View All Categories 
              <ArrowRight size={16} className="ml-1" />
            </Link>
            
            {/* Desktop View All button */}
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm uppercase transition-colors duration-300 rounded-full shadow-md hover:shadow-lg hidden md:inline-flex"
            >
              Explore All Categories 
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Drops Section */}
      <section className="py-24 relative overflow-hidden border-t border-b border-border/10">
        {/* Enhanced geometric shapes for new arrivals section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Diamond grid pattern */}
          <div className="absolute -top-20 -right-20 w-96 h-96" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)',
                 backgroundSize: '20px 20px',
                 transform: 'rotate(45deg)'
               }}>
          </div>
          
          {/* Overlapping circles */}
          <div className="absolute top-1/4 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/15 to-transparent backdrop-blur-[2px] mix-blend-soft-light"></div>
          <div className="absolute top-1/4 left-20 w-60 h-60 rounded-full bg-gradient-to-tr from-transparent via-primary/10 to-transparent backdrop-blur-[3px] mix-blend-soft-light"></div>
          
          {/* Abstract shape */}
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tl from-primary/15 to-transparent backdrop-blur-[2px] mix-blend-soft-light"
               style={{ 
                 clipPath: "path('M137.9,18.5c38.4-13.5,64.8,5.5,78.4,38.9c13.7,33.7,21.1,88.3-22.8,110.2c-43.9,21.9-97.9-46.5-111.5-80.2C68.3,54,99.5,32,137.9,18.5z')",
                 transform: 'scale(2)'
               }}>
          </div>
          
          {/* Dotted lines */}
          <div className="absolute left-0 top-1/2 w-full h-px">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" 
                 style={{ 
                   maskImage: 'linear-gradient(to right, transparent 0%, black 0%, black 100%, transparent 100%)',
                   maskSize: '10px 1px',
                   maskRepeat: 'repeat-x'
                 }}>
            </div>
          </div>
          
          {/* Vertical gradient bar */}
          <div className="absolute left-3/4 bottom-0 w-1 h-60 bg-gradient-to-t from-primary/20 to-transparent"></div>
          <div className="absolute left-[calc(75%+10px)] bottom-0 w-1 h-40 bg-gradient-to-t from-primary/15 to-transparent"></div>
          <div className="absolute left-[calc(75%-10px)] bottom-0 w-1 h-80 bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedWrapper animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium tracking-wider mb-3">
                JUST DROPPED
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                NEW ARRIVALS
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Fresh releases straight from the streets. Limited quantities available.
              </p>
            </div>
          </AnimatedWrapper>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Product Carousel - modern sliding carousel with auto-scroll */}
              <div className="relative group">
                {/* Carousel Navigation Buttons - enhanced styling */}
                <div className="absolute -left-2 md:-left-4 top-1/2 transform -translate-y-1/2 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm shadow-lg border border-border hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 active:scale-95"
                    onClick={() => {
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 10000);
                      scrollCarousel('left');
                    }}
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute -right-2 md:-right-4 top-1/2 transform -translate-y-1/2 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm shadow-lg border border-border hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 active:scale-95"
                    onClick={() => {
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 10000);
                      scrollCarousel('right');
                    }}
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Carousel Progress Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1.5 bg-background/50 backdrop-blur-sm rounded-full px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(products.length > 0 ? Array.from({ length: products.length }) : Array.from({ length: 8 })).map((_, index) => (
                    <button
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === activeIndex ? 'bg-primary w-4' : 'bg-border'
                      }`}
                      onClick={() => {
                        setIsPaused(true);
                        setTimeout(() => setIsPaused(false), 10000);
                        scrollToIndex(index);
                      }}
                      aria-label={`Go to product ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Scrollable Carousel */}
                <div 
                  ref={carouselRef}
                  id="product-carousel" 
                  className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-6 pb-8 px-1 pt-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {(products && products.length > 0 ? products : Array(8).fill(null)).map((product, index) => (
                    <AnimatedWrapper 
                      key={product?.id || index} 
                      animation="fade-in" 
                      delay={`${(index % 8) * 100}` as DelayType} 
                      className="group snap-start flex-shrink-0 w-[280px] sm:w-[320px] transition-all hover:-translate-y-2 duration-300"
                    >
                      <div className="block h-full relative overflow-hidden bg-card hover:bg-accent/10 transition-all duration-300 rounded-xl shadow-sm hover:shadow-xl border border-border/40">
                        <Link to={product ? `/product/${product.id}` : "#"} className="block">
                          {/* NEW badge - on left top corner with improved styling */}
                          <div className="absolute top-3 left-3 z-20">
                            <span className="inline-flex items-center px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md shadow-sm transform -rotate-2">
                              <span className="flex h-1.5 w-1.5 rounded-full bg-white mr-1"></span>
                              NEW
                            </span>
                          </div>
                          
                          {/* Discount badge - now on right corner with improved styling */}
                          {(product?.original_price || index % 3 === 0) && (
                            <div className="absolute top-3 right-3 z-20">
                              <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm transform rotate-2">
                                -{product?.original_price ? 
                                  Math.round(((product.original_price - product.price) / product.original_price) * 100) : 
                                  '25'}%
                                <span className="flex h-1.5 w-1.5 rounded-full bg-white ml-1"></span>
                              </span>
                            </div>
                          )}
                          
                          {/* Graffiti-style tag overlay */}
                          <div className="absolute top-0 right-0 z-10 rotate-12 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <img 
                              src="https://www.freepnglogos.com/uploads/graffiti-png/graffiti-tag-png-transparent-images-download-clip-17.png" 
                              alt="Graffiti tag" 
                              className="w-24 h-auto"
                            />
                          </div>

                          {/* Product Image */}
                          <div className="aspect-square overflow-hidden rounded-t-xl relative">
                            {/* Hover overlay with quick action */}
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
                              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-3">
                                <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
                                  Quick View
                                </Button>
                                
                                {/* Quick add to cart button */}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-background/80 hover:bg-primary border-border hover:border-primary text-foreground hover:text-primary-foreground rounded-full px-5 backdrop-blur-sm"
                                  onClick={(e) => handleAddToCart(product, e)}
                                >
                                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                            
                            <img
                              src={product?.image || `/collab-collection.jpg`}
                              alt={product?.name || "Product"}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/collab-collection.jpg";
                              }}
                            />
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-primary/80 font-medium uppercase">
                              {product?.category?.name || ['Streetwear', 'Hoodies', 'Tees', 'Sneakers', 'Caps', 'Accessories', 'Urban', 'Limited'][index % 8]}
                            </span>
                            
                            {/* Product color dots - fixed with proper colors */}
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                // Define default color array based on index for placeholders
                                const defaultColors = [
                                  ['black', 'blue', 'red'],
                                  ['black', 'green', 'purple'],
                                  ['black', 'orange', 'gray'],
                                  ['blue', 'red', 'orange'],
                                  ['green', 'black', 'red'],
                                  ['purple', 'blue', 'black'],
                                  ['gray', 'orange', 'green'], 
                                  ['white', 'black', 'red']
                                ][index % 8];
                                
                                // Parse product colors or use defaults
                                let colors: string[] = defaultColors;
                                
                                if (product?.color) {
                                  try {
                                    // Try to parse as JSON array first
                                    if (product.color.startsWith('[') && product.color.endsWith(']')) {
                                      const parsedColors = JSON.parse(product.color);
                                      if (Array.isArray(parsedColors)) {
                                        colors = parsedColors.map(c => c.toString().replace(/"/g, '').trim());
                                      }
                                    } else {
                                      // Fall back to comma-separated string
                                      colors = product.color.split(',').map(c => c.replace(/"/g, '').trim());
                                    }
                                  } catch (error) {
                                    console.error('Error parsing product colors:', error);
                                    // Keep using default colors if parsing fails
                                  }
                                }
                                  
                                // Create a mapping of color names to hex values
                                const colorMap: Record<string, string> = {
                                  'black': '#000000',
                                  'blue': '#3b82f6',
                                  'red': '#ef4444',
                                  'green': '#84cc16',
                                  'orange': '#f97316',
                                  'purple': '#a855f7',
                                  'white': '#ffffff',
                                  'gray': '#6b7280',
                                  'yellow': '#fbbf24',
                                  'pink': '#ec4899',
                                  'brown': '#a16207',
                                  'navy': '#1e3a8a',
                                  'teal': '#0d9488',
                                  'indigo': '#6366f1',
                                  'lime': '#bef264',
                                  'cyan': '#22d3ee',
                                  'amber': '#fbbf24',
                                  'emerald': '#10b981',
                                  'violet': '#8b5cf6',
                                  'fuchsia': '#d946ef',
                                  'rose': '#f43f5e',
                                  'slate': '#64748b'
                                };
                                
                                return colors.map((color, i) => {
                                  // Parse the color and get the hex value
                                  const lowerColor = color.toLowerCase().trim();
                                  const bgColor = lowerColor.startsWith('#') ? 
                                    lowerColor : 
                                    colorMap[lowerColor] || '#000000';
                                    
                                  return (
                                    <span 
                                      key={i} 
                                      className={`w-3 h-3 rounded-full border shadow-sm cursor-pointer transition-transform hover:scale-110 ${bgColor === '#ffffff' ? 'border-gray-300' : 'border-transparent'}`}
                                      style={{ backgroundColor: bgColor }}
                                      title={color}
                                    ></span>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                          <Link to={product ? `/product/${product.id}` : "#"}>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors truncate">
                              {product?.name || ["Street Style Product", "Urban Hoodie", "Graffiti Tee", "Vintage Sneakers", "Classic Cap", "Chain Necklace", "Baggy Jeans", "Limited Edition Jacket"][index % 8]}
                            </h3>
                          </Link>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-xl font-black">${product ? Number(product.price).toFixed(2) : (49.99 + index * 10).toFixed(2)}</span>
                              {product?.original_price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ${Number(product.original_price).toFixed(2)}
                                </span>
                              )}
                              {!product?.original_price && index % 3 === 0 && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ${((49.99 + index * 10) * 1.25).toFixed(2)}
                                </span>
                              )}
                            </div>
                            {/* Add to cart button - fixed functionality */}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="p-0 h-8 w-8 rounded-full border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110 active:scale-95"
                              onClick={(e) => handleAddToCart(product, e)}
                              aria-label="Add to cart"
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AnimatedWrapper>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-12">
                <Link
                  to="/shop/new-arrivals"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm uppercase transition-colors duration-300 rounded-full shadow-md hover:shadow-lg"
                >
                  Shop All New Arrivals
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-24 relative overflow-hidden border-t border-b border-border/10">
        {/* Unique geometric shapes for featured section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large circular gradient */}
          <div className="absolute -left-40 top-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-[4px] mix-blend-soft-light"></div>
          
          {/* Multiple transparent squares */}
          <div className="absolute top-0 right-20 w-64 h-64 border-2 border-primary/10 transform rotate-12 backdrop-blur-[2px] mix-blend-soft-light"></div>
          <div className="absolute top-20 right-40 w-32 h-32 border border-primary/20 transform -rotate-6 backdrop-blur-[1px] mix-blend-soft-light"></div>
          
          {/* Diagonal line pattern */}
          <div className="absolute bottom-0 left-0 w-full h-32" 
               style={{ 
                 backgroundImage: 'repeating-linear-gradient(45deg, rgba(var(--primary-rgb), 0.05) 0px, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px, transparent 10px)',
               }}>
          </div>
          
          {/* Spiral pattern */}
          <div className="absolute top-1/3 right-1/3 w-60 h-60 opacity-30"
               style={{ 
                 backgroundImage: 'conic-gradient(from 0deg at 50% 50%, rgba(var(--primary-rgb), 0.15) 0deg, transparent 60deg, rgba(var(--primary-rgb), 0.15) 120deg, transparent 180deg, rgba(var(--primary-rgb), 0.15) 240deg, transparent 300deg, rgba(var(--primary-rgb), 0.15) 360deg)',
                 borderRadius: '50%'
               }}>
          </div>
          
          {/* Floating dots pattern */}
          <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)',
                 backgroundSize: '24px 24px',
                 backgroundPosition: '0 0'
               }}>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedWrapper animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium tracking-wider mb-3">
                STAFF PICKS
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                FEATURED ITEMS
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Our most popular products hand-selected for their quality and style.
              </p>
            </div>
          </AnimatedWrapper>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(products && products.length > 0 ? 
                  products.filter(product => product.featured).slice(0, 8) : 
                  Array(8).fill(null)).map((product, index) => (
                  <AnimatedWrapper 
                    key={product?.id || `featured-${index}`} 
                    animation="fade-in" 
                    delay={`${(index % 8) * 100}` as DelayType} 
                    className="group transition-all hover:-translate-y-2 duration-300"
                  >
                    <div className="block h-full relative overflow-hidden bg-card hover:bg-accent/10 transition-all duration-300 rounded-xl shadow-sm hover:shadow-xl border border-border/40">
                      <Link to={product ? `/product/${product.id}` : "#"} className="block">
                        {/* Featured badge - on left top corner with improved styling */}
                        <div className="absolute top-3 left-3 z-20">
                          <span className="inline-flex items-center px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-md shadow-sm transform -rotate-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-white mr-1"></span>
                            FEATURED
                          </span>
                        </div>
                        
                        {/* Discount badge - now on right corner with improved styling */}
                        {(product?.original_price || index % 3 === 0) && (
                          <div className="absolute top-3 right-3 z-20">
                            <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm transform rotate-2">
                              -{product?.original_price ? 
                                Math.round(((product.original_price - product.price) / product.original_price) * 100) : 
                                '25'}%
                              <span className="flex h-1.5 w-1.5 rounded-full bg-white ml-1"></span>
                            </span>
                          </div>
                        )}
                        
                        {/* Star icon overlay */}
                        <div className="absolute top-0 right-0 z-10 rotate-12 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-24 h-24 text-primary/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        </div>

                        {/* Product Image */}
                        <div className="aspect-square overflow-hidden rounded-t-xl relative">
                          {/* Hover overlay with quick action */}
                          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-3">
                              <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
                                Quick View
                              </Button>
                              
                              {/* Quick add to cart button */}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-background/80 hover:bg-primary border-border hover:border-primary text-foreground hover:text-primary-foreground rounded-full px-5 backdrop-blur-sm"
                                onClick={(e) => handleAddToCart(product, e)}
                              >
                                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                          
                          <img
                            src={product?.image || `/collab-collection.jpg`}
                            alt={product?.name || "Product"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/collab-collection.jpg";
                            }}
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-primary/80 font-medium uppercase">
                            {product?.category?.name || ['Premium', 'Signature', 'Limited', 'Collectors', 'Exclusive', 'Elite', 'Designer', 'Luxury'][index % 8]}
                          </span>
                          
                          {/* Product color dots - with proper colors */}
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              // Define default color array based on index for placeholders
                              const defaultColors = [
                                ['black', 'blue', 'red'],
                                ['black', 'green', 'purple'],
                                ['black', 'orange', 'gray'],
                                ['blue', 'red', 'orange'],
                                ['green', 'black', 'red'],
                                ['purple', 'blue', 'black'],
                                ['gray', 'orange', 'green'], 
                                ['white', 'black', 'red']
                              ][index % 8];
                              
                              // Parse product colors or use defaults
                              let colors: string[] = defaultColors;
                              
                              if (product?.color) {
                                try {
                                  // Try to parse as JSON array first
                                  if (product.color.startsWith('[') && product.color.endsWith(']')) {
                                    const parsedColors = JSON.parse(product.color);
                                    if (Array.isArray(parsedColors)) {
                                      colors = parsedColors.map(c => c.toString().replace(/"/g, '').trim());
                                    }
                                  } else {
                                    // Fall back to comma-separated string
                                    colors = product.color.split(',').map(c => c.replace(/"/g, '').trim());
                                  }
                                } catch (error) {
                                  console.error('Error parsing product colors:', error);
                                  // Keep using default colors if parsing fails
                                }
                              }
                                
                              // Create a mapping of color names to hex values
                              const colorMap: Record<string, string> = {
                                'black': '#000000',
                                'blue': '#3b82f6',
                                'red': '#ef4444',
                                'green': '#84cc16',
                                'orange': '#f97316',
                                'purple': '#a855f7',
                                'white': '#ffffff',
                                'gray': '#6b7280',
                                'yellow': '#fbbf24',
                                'pink': '#ec4899',
                                'brown': '#a16207',
                                'navy': '#1e3a8a',
                                'teal': '#0d9488',
                                'indigo': '#6366f1',
                                'lime': '#bef264',
                                'cyan': '#22d3ee',
                                'amber': '#fbbf24',
                                'emerald': '#10b981',
                                'violet': '#8b5cf6',
                                'fuchsia': '#d946ef',
                                'rose': '#f43f5e',
                                'slate': '#64748b'
                              };
                              
                              return colors.map((color, i) => {
                                // Parse the color and get the hex value
                                const lowerColor = color.toLowerCase().trim();
                                const bgColor = lowerColor.startsWith('#') ? 
                                  lowerColor : 
                                  colorMap[lowerColor] || '#000000';
                                  
                                return (
                                  <span 
                                    key={i} 
                                    className={`w-3 h-3 rounded-full border shadow-sm cursor-pointer transition-transform hover:scale-110 ${bgColor === '#ffffff' ? 'border-gray-300' : 'border-transparent'}`}
                                    style={{ backgroundColor: bgColor }}
                                    title={color}
                                  ></span>
                                );
                              });
                            })()}
                          </div>
                        </div>
                        <Link to={product ? `/product/${product.id}` : "#"}>
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors truncate">
                            {product?.name || ["Featured Street Style", "Premium Hoodie", "Limited Edition Tee", "Exclusive Sneakers", "Signature Cap", "Luxury Necklace", "Designer Jeans", "Collector's Jacket"][index % 8]}
                          </h3>
                        </Link>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xl font-black">${product ? Number(product.price).toFixed(2) : (69.99 + index * 10).toFixed(2)}</span>
                            {product?.original_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ${Number(product.original_price).toFixed(2)}
                              </span>
                            )}
                            {!product?.original_price && index % 3 === 0 && (
                              <span className="text-xs text-muted-foreground line-through">
                                ${((69.99 + index * 10) * 1.25).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {/* Add to cart button */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-0 h-8 w-8 rounded-full border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110 active:scale-95"
                            onClick={(e) => handleAddToCart(product, e)}
                            aria-label="Add to cart"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AnimatedWrapper>
                ))}
              </div>

              <div className="flex justify-center mt-12">
                <Link
                  to="/shop/featured"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm uppercase transition-colors duration-300 rounded-full shadow-md hover:shadow-lg"
                >
                  Shop All Featured Items
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Collaboration Section - Modernized */}
      <section className="py-32 relative overflow-hidden">
        {/* Immersive background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#090909] to-[#111] z-0"></div>
        
        {/* Animated particle background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                 backgroundSize: '30px 30px',
                 backgroundPosition: '0 0'
               }}>
          </div>
        </div>
        
        {/* Animated glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-primary/20 blur-[100px] animate-pulse" 
             style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-blue-500/20 blur-[80px] animate-pulse"
             style={{ animationDelay: '2s' }}></div>
        
        {/* Diagonal line decor */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -left-1/4 top-0 w-1/2 h-full border-r border-primary/30 transform rotate-[15deg]"></div>
          <div className="absolute -right-1/4 top-0 w-1/2 h-full border-l border-primary/30 transform -rotate-[15deg]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedWrapper animation="fade-in">
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center mb-3">
                <div className="h-px w-5 bg-primary"></div>
                <span className="mx-4 text-sm font-medium text-primary uppercase tracking-widest px-3 py-1 border border-primary/30 rounded-full">Limited Edition</span>
                <div className="h-px w-5 bg-primary"></div>
              </div>
              <h2 className="text-6xl sm:text-7xl font-black uppercase mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]">
                  FEATURED COLLAB
                </span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                Exclusive collaborations with world-class artists and designers pushing the boundaries of street fashion
              </p>
            </div>
          </AnimatedWrapper>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <AnimatedWrapper animation="fade-in" delay="100" className="lg:col-span-7">
              <div className="relative group">
                {/* Energetic abstract design elements */}
                <div className="absolute -right-6 -top-6 w-32 h-32 border-t-2 border-r-2 border-primary/50 group-hover:border-primary/80 transition-colors duration-500"></div>
                <div className="absolute -left-6 -bottom-6 w-32 h-32 border-b-2 border-l-2 border-primary/50 group-hover:border-primary/80 transition-colors duration-500"></div>
                
                {/* Animated spotlight effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-primary/10 to-transparent"></div>
                
                {/* Main image with enhanced treatment */}
                <div className="aspect-[4/5] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                  {/* Grain overlay */}
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none z-20"></div>
                  
                  {/* Image */}
                  <img 
                    src="/collab-collection.jpg" 
                    alt="Collaboration with Street Artist" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-90 group-hover:brightness-105"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 z-10"></div>
                  
                  {/* Artist credit */}
                  <div className="absolute top-8 left-8 text-white/90 flex items-center z-30">
                    <img 
                      src="https://randomuser.me/api/portraits/men/35.jpg" 
                      alt="Takashi Murakami" 
                      className="w-10 h-10 rounded-full border-2 border-primary/80 shadow-glow"
                    />
                    <div className="ml-3">
                      <p className="text-xs text-white/60 font-medium uppercase tracking-wide">Artist</p>
                      <p className="font-bold text-sm">Takashi Murakami</p>
                    </div>
                  </div>
                  
                  {/* Hover content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30">
                    <div className="flex flex-col items-start gap-5">
                      <div>
                        <p className="text-white/70 text-sm mb-2 font-medium uppercase tracking-wider">Spring/Summer 2023</p>
                        <h3 className="text-3xl font-black text-white bg-clip-text">
                          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Blossom </span>
                          Collection
                        </h3>
                      </div>
                      
                      <Button 
                        className="group/btn bg-white hover:bg-primary text-black hover:text-white font-semibold transition-all duration-300 rounded-none px-8 py-6 h-auto flex items-center"
                        asChild
                      >
                        <Link to="/collections/artist-collab">
                          SHOP THE COLLECTION
                          <div className="w-6 h-px bg-black group-hover/btn:bg-white ml-2 transition-all duration-300 group-hover/btn:w-8"></div>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedWrapper>

            <AnimatedWrapper animation="fade-in" delay="200" className="lg:col-span-5">
              <div className="py-6 lg:pl-8 relative">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full bg-primary/20 blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-primary/10 blur-xl"></div>
                
                <h3 className="text-5xl font-black mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent inline-block mb-2">URBAN</span>
                  <br />
                  <span className="text-white">LEGENDS</span>
                  <span className="block mt-3 text-xl font-medium text-white/70 tracking-wide">× TAKASHI MURAKAMI</span>
                </h3>

                <p className="text-lg text-white/80 mb-10 leading-relaxed">
                  Our exclusive collaboration with renowned artist Takashi Murakami brings his iconic 
                  flower motifs to streetwear. Each piece is a wearable art statement that blends 
                  street culture with high-end design.
                </p>

                <div className="space-y-5 mb-12">
                  <div className="flex items-center group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-5 
                                   bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Check className="text-primary w-5 h-5" />
                    </div>
                    <span className="text-white/90 group-hover:text-white transition-colors duration-300">Limited edition run of 500 pieces</span>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-5 
                                   bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Check className="text-primary w-5 h-5" />
                    </div>
                    <span className="text-white/90 group-hover:text-white transition-colors duration-300">Handcrafted details on each item</span>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-5 
                                   bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Check className="text-primary w-5 h-5" />
                    </div>
                    <span className="text-white/90 group-hover:text-white transition-colors duration-300">Includes numbered authenticity card</span>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-5 
                                   bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Check className="text-primary w-5 h-5" />
                    </div>
                    <span className="text-white/90 group-hover:text-white transition-colors duration-300">Premium packaging and custom box</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-white hover:bg-primary text-black hover:text-white transition-all duration-300 
                              rounded-full px-8 py-6 h-auto text-sm font-bold tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.2)]
                              hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                    asChild
                  >
                    <Link to="/shop">
                      EXPLORE ITEMS
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  
                  <Button 
                    className="bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white/60
                              transition-all duration-300 rounded-full px-8 py-6 h-auto text-sm font-bold tracking-wider"
                    asChild
                    variant="outline"
                  >
                    <Link to="/">
                      ABOUT THE ARTIST
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* Brand Story Section - Modernized with better light/dark mode support */}
      <section className="py-32 relative overflow-hidden border-t border-border/20">
        {/* Modern geometric background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dark gradient overlay that works in both light/dark modes */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background/80 z-10"></div>
          
          {/* Background image with proper opacity for both modes */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1522808342357-f868063222e8?q=80&w=2070&auto=format&fit=crop" 
              alt="" 
              className="w-full h-full object-cover opacity-10 dark:opacity-20"
            />
          </div>
          
          {/* Decorative geometric elements */}
          <div className="absolute -left-20 top-1/4 w-80 h-80 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl"></div>
          <div className="absolute right-10 bottom-10 w-60 h-60 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl"></div>
          
          {/* Animated subtle patterns */}
          <div 
            className="absolute bottom-0 left-0 w-full h-32 opacity-20 dark:opacity-30" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, transparent, currentColor, transparent)',
              backgroundSize: '200% 1px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center bottom',
              animation: 'gradient-wave 8s ease infinite'
            }}
          ></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto">
            <AnimatedWrapper animation="fade-in">
              <div className="flex flex-col items-center text-center mb-12">
                <div className="mb-4 flex items-center justify-center">
                  <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-primary/70"></div>
                  <span className="mx-4 text-sm font-medium text-primary uppercase tracking-widest">Our Philosophy</span>
                  <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-primary/70"></div>
                </div>
                
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6">
                  <span className="block mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/80">
                    BUILT FOR THE STREETS.
                  </span>
                  <span className="relative inline-block">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/90">
                      DESIGNED FOR EXPRESSION.
                    </span>
                    <svg className="absolute -bottom-4 left-0 w-full h-2 text-primary/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0,0 C25,8 75,8 100,0 L100,5 C75,13 25,13 0,5 Z" fill="currentColor" />
                    </svg>
                  </span>
                </h2>
              </div>
              
              <div className="relative bg-card/50 dark:bg-card/30 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-border/40 shadow-xl mb-12">
                <div className="absolute -top-5 -left-5">
                  <div className="text-4xl text-primary/80">"</div>
                </div>
                
                <p className="text-xl sm:text-2xl leading-relaxed text-foreground/90 dark:text-white/90 font-medium">
                  Born in the urban landscape, our brand celebrates individuality and authenticity. 
                  We create more than just clothing—we craft identity. Each piece tells a story 
                  of rebellion, creativity, and the raw energy of street culture.
                </p>
                
                <div className="absolute -bottom-5 -right-3">
                  <div className="text-4xl text-primary/80">"</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center flex-wrap gap-6">
                
                <Button 
                  className="rounded-lg bg-transparent border-2 border-border hover:border-primary hover:text-primary transition-all duration-300 px-8 py-6 h-auto text-lg font-semibold" 
                  variant="outline"
                  asChild
                >
                  <Link to="/shop">
                    SHOP COLLECTIONS
                  </Link>
                </Button>
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* CSS for hiding scrollbar, custom shapes, and animations */}
      <style>
        {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .clip-path-polygon {
          clip-path: polygon(0% 0%, 100% 25%, 100% 75%, 75% 100%, 0% 100%);
        }
        :root {
          --primary-rgb: 236, 72, 153;  /* Default pink color, adjust based on your primary color */
        }
        /* Carousel animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Background wave animation */
        @keyframes gradient-wave {
          0% { background-position: 0% bottom; }
          50% { background-position: 100% bottom; }
          100% { background-position: 0% bottom; }
        }
        /* Shadow glow for the artist image in featured collab */
        .shadow-glow {
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
        }
        `}
      </style>
    </HomeLayout>
  );
};

type DelayType = "none" | "0" | "100" | "150" | "200" | "300" | "400" | "500" | "600" | "700" | "1000";

export default Index;

