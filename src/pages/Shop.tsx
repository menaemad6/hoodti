import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/shop/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getProducts, getCategories } from "@/integrations/supabase/products.service";
import { Product as SupabaseProduct, Category, getCategoryId } from "@/integrations/supabase/types.service";
import { Product as AppProduct } from "@/types";
import { mapSupabaseProductToAppProduct } from "@/types/supabase-types";
import { 
  Filter, 
  SlidersHorizontal, 
  Star, 
  Tag, 
  Percent,
  Package,
  ArrowUpDown,
  Search,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SearchInput from "@/components/shop/SearchInput";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import GlassCard from "@/components/ui/glass-card";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SupabaseProduct[]>([]);
  const [appProducts, setAppProducts] = useState<AppProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [selectedSort, setSelectedSort] = useState("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("categories");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Add clothing-specific filters
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  
  const toggleFilters = () => setShowFilters(!showFilters);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        
        if (productsData.length > 0) {
          const prices = productsData.map(p => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
          setMinPriceInput(minPrice.toString());
          setMaxPriceInput(maxPrice.toString());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const matchesCategory = (product: SupabaseProduct, categoryId: string): boolean => {
    if (!categoryId) return true;
    const productCategoryId = getCategoryId(product);
    return productCategoryId === categoryId;
  };

  useEffect(() => {
    let result = [...products];
    
    // Category filter
    if (selectedCategory) {
      result = result.filter(product => matchesCategory(product, selectedCategory));
    }
    
    // Price range filter
    result = result.filter(product => 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1]
    );
    
    // Search query filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }

    // Featured filter
    if (showFeatured) {
      result = result.filter(product => product.featured);
    }

    // New products filter
    if (showNew) {
      result = result.filter(product => product.is_new);
    }

    // Discounted products filter
    if (showDiscounted) {
      result = result.filter(product => product.discount > 0);
    }

    // Size filter
    if (selectedSize) {
      result = result.filter(product => product.size === selectedSize);
    }

    // Color filter
    if (selectedColor) {
      result = result.filter(product => product.color === selectedColor);
    }

    // Gender filter
    if (selectedGender) {
      result = result.filter(product => product.gender === selectedGender);
    }
    
    // Sorting
    switch (selectedSort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    setFilteredProducts(result);
    const mappedProducts = result.map(product => mapSupabaseProductToAppProduct(product));
    setAppProducts(mappedProducts);
    
    if (selectedCategory) {
      searchParams.set("category", selectedCategory);
    } else {
      searchParams.delete("category");
    }
    setSearchParams(searchParams);
  }, [products, selectedCategory, selectedSort, priceRange, debouncedSearchQuery, showFeatured, showNew, showDiscounted, searchParams, setSearchParams, selectedSize, selectedColor, selectedGender]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSort("default");
    const prices = products.map(p => p.price);
    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));
    setPriceRange([minPrice, maxPrice]);
    setMinPriceInput(minPrice.toString());
    setMaxPriceInput(maxPrice.toString());
    setInputValue("");
    setDebouncedSearchQuery("");
    setShowFeatured(false);
    setShowNew(false);
    setShowDiscounted(false);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedGender("");
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (type === 'min') {
      setMinPriceInput(value);
      if (value && !isNaN(numValue)) {
        setPriceRange([numValue, priceRange[1]]);
      }
    } else {
      setMaxPriceInput(value);
      if (value && !isNaN(numValue)) {
        setPriceRange([priceRange[0], numValue]);
      }
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setMinPriceInput(values[0].toString());
    setMaxPriceInput(values[1].toString());
  };

  const formatPrice = (value: number) => `$${value}`;

  const handleSearchChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const FilterSection = () => (
    <div className="space-y-6">
      <Accordion 
        type="single" 
        value={openAccordion} 
        onValueChange={setOpenAccordion} 
        collapsible
      >
        <AccordionItem value="categories" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Categories</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div 
                className={`flex items-center space-x-2 cursor-pointer ${
                  selectedCategory === "" ? "text-primary font-medium" : ""
                }`}
                onClick={() => setSelectedCategory("")}
              >
                <Checkbox checked={selectedCategory === ""} />
                <Label className="cursor-pointer">All Categories</Label>
              </div>
              
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    selectedCategory === category.id ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Checkbox checked={selectedCategory === category.id} />
                  <Label className="cursor-pointer">{category.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Price Range</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={Math.min(...products.map(p => p.price))}
                max={Math.max(...products.map(p => p.price))}
                step={1}
                onValueChange={handlePriceRangeChange}
                formatLabel={formatPrice}
              />
              <div className="flex gap-2">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="minPrice">Min</Label>
                  <Input
                    id="minPrice"
                    value={minPriceInput}
                    onChange={(e) => handlePriceInputChange('min', e.target.value)}
                    placeholder="Min"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="maxPrice">Max</Label>
                  <Input
                    id="maxPrice"
                    value={maxPriceInput}
                    onChange={(e) => handlePriceInputChange('max', e.target.value)}
                    placeholder="Max"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="clothing" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Clothing Options</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Size filter */}
              <div className="space-y-1.5">
                <Label>Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sizes</SelectItem>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Color filter */}
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Colors</SelectItem>
                    <SelectItem value="Black">Black</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Blue">Blue</SelectItem>
                    <SelectItem value="Green">Green</SelectItem>
                    <SelectItem value="Yellow">Yellow</SelectItem>
                    <SelectItem value="Purple">Purple</SelectItem>
                    <SelectItem value="Pink">Pink</SelectItem>
                    <SelectItem value="Brown">Brown</SelectItem>
                    <SelectItem value="Gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Gender filter */}
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genders</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="status" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Status</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={showFeatured}
                  onCheckedChange={(checked) => setShowFeatured(checked as boolean)}
                />
                <Label className="cursor-pointer">Featured Products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={showNew}
                  onCheckedChange={(checked) => setShowNew(checked as boolean)}
                />
                <Label className="cursor-pointer">New Arrivals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={showDiscounted}
                  onCheckedChange={(checked) => setShowDiscounted(checked as boolean)}
                />
                <Label className="cursor-pointer">On Sale</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <Layout>
      {/* Ultra-modern hero section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/10 pt-16 pb-20 mt-8 rounded-xl mx-4">
        {/* Remove all background elements */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <AnimatedWrapper animation="fade-in" delay="100">
              <div className="space-y-6 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-muted mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-sm font-medium text-foreground/80">Explore our latest collection</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">Discover</span>
                  <span className="block mt-1">Premium Products</span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-md">
                  Browse our exceptional selection of high-quality items curated for your lifestyle
                </p>
                
                {/* Improved search bar with responsive button */}
                <div className="relative max-w-md mt-6">
                  <div className="flex w-full">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={inputValue} 
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full h-12 pr-4 pl-10 rounded-l-lg focus-visible:ring-primary"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button className="h-12 rounded-l-none px-5">
                      Search
                    </Button>
                  </div>
                </div>
                
                {/* Removed search filters */}
              </div>
            </AnimatedWrapper>
            
            {/* Right: Visual elements */}
            <AnimatedWrapper animation="fade-in" delay="300" className="hidden lg:block">
              <div className="relative h-96">
                {/* 3D-like floating cards */}
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
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters ({filteredProducts.length} products)
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[540px]">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search with our filtering options.
                  </SheetDescription>
                </SheetHeader>
                <div className="mb-6">
                  <SearchInput value={inputValue} onChange={handleSearchChange} />
                </div>
                <FilterSection />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                  Clear All
                </Button>
              </div>
              <div className="mb-6">
                <SearchInput value={inputValue} onChange={handleSearchChange} />
              </div>
              <FilterSection />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-muted-foreground">
                {filteredProducts.length} products found
              </p>
              
              <Select
                value={selectedSort}
                onValueChange={setSelectedSort}
              >
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : appProducts.length > 0 ? (
              <ProductGrid 
                products={appProducts}
              />
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
