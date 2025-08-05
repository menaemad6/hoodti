import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";
import { getSEOConfig } from "@/lib/seo-config";
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
import { useProductsService } from "@/integrations/supabase/products.service";
import { getCategories } from "@/integrations/supabase/categories.service";
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
  X,
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
import { useCurrentTenant } from "@/context/TenantContext";

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
  
  // Added state for clothing filters
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>("");
  
  // Dynamic arrays based on product data
  const [availableSizes, setAvailableSizes] = useState<string[]>(["XS", "S", "M", "L", "XL", "XXL"]);
  const [availableColors, setAvailableColors] = useState<string[]>(["Black", "White", "Red", "Blue", "Green", "Yellow", "Gray", "Brown", "Pink", "Purple", "Orange"]);
  const [availableGenders, setAvailableGenders] = useState<string[]>(["Men", "Female", "Unisex", "Kids"]);
  
  const toggleFilters = () => setShowFilters(!showFilters);

  const currentTenant = useCurrentTenant();

  // Get SEO configuration for shop page
  const seoConfig = getSEOConfig('shop');
  
  // Use the tenant-aware products service
  const productsService = useProductsService();

  // Helper functions to extract unique values from products
  const extractUniqueValues = (products: SupabaseProduct[], property: keyof SupabaseProduct): string[] => {
    const allValues = new Set<string>();
    
    products.forEach(product => {
      if (!product[property]) return;
      
      const value = product[property] as string;
      try {
        // Try to parse as JSON array
        if (value.startsWith('[') && value.endsWith(']')) {
          const parsedValues = JSON.parse(value);
          parsedValues.forEach((val: string) => allValues.add(val.trim()));
        } else {
          // Handle as comma-separated string
          value.split(',').forEach(val => allValues.add(val.trim()));
        }
      } catch (e) {
        // If parsing fails, add as a single value
        allValues.add(value.trim());
      }
    });
    
    return Array.from(allValues).filter(Boolean).sort();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsService.getProducts(),
          getCategories(currentTenant.id)
        ]);
        
        setProducts(productsData);
        // Fix image type
        setCategories(categoriesData.map(cat => ({ ...cat, image: Array.isArray(cat.image) ? cat.image[0] : cat.image })));
        
        if (productsData.length > 0) {
          const prices = productsData.map(p => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
          setMinPriceInput(minPrice.toString());
          setMaxPriceInput(maxPrice.toString());
          
          // Extract unique options from product data
          const sizes = extractUniqueValues(productsData, 'size');
          if (sizes.length > 0) setAvailableSizes(sizes);
          
          const colors = extractUniqueValues(productsData, 'color');
          if (colors.length > 0) setAvailableColors(colors);
          
          // Ensure we keep our default gender values
          const defaultGenders = ["Men", "Female", "Unisex", "Kids"];
          const extractedGenders = extractUniqueValues(productsData, 'gender');
          
          // Combine default and extracted genders, remove duplicates
          const combinedGenders = [...new Set([...defaultGenders, ...extractedGenders])];
          setAvailableGenders(combinedGenders);
          
          // Log to debug
          console.log("Gender values set:", combinedGenders);
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
    
    // Add debug logging for the first few products
    if (products.length > 0) {
      console.log("First product data:", {
        name: products[0].name,
        size: products[0].size,
        sizeType: typeof products[0].size,
        color: products[0].color,
        colorType: typeof products[0].color,
        gender: products[0].gender,
        genderType: typeof products[0].gender
      });
      
      // Log available filters
      console.log("Available filter options:", {
        sizes: availableSizes,
        colors: availableColors,
        genders: availableGenders
      });
      
      // Log selected filters
      console.log("Selected filters:", {
        sizes: selectedSizes,
        colors: selectedColors,
        gender: selectedGender
      });
      
      if (products.length > 1) {
        console.log("Second product data:", {
          name: products[1].name,
          size: products[1].size,
          sizeType: typeof products[1].size,
          color: products[1].color,
          colorType: typeof products[1].color,
          gender: products[1].gender,
          genderType: typeof products[1].gender
        });
      }
    }
    
    console.log(`Filtering ${products.length} products`);

    // Category filter
    if (selectedCategory) {
      result = result.filter(product => matchesCategory(product, selectedCategory));
    }
    
    // Price range filter
    result = result.filter(product => 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1]
    );
    
    // Size filter
    if (selectedSizes.length > 0) {
      const beforeFilter = result.length;
      result = result.filter(product => {
        // Check if the product's size matches any of the selected sizes
        if (!product.size) return false;
        
        let productSizes: string[] = [];
        
        // Handle if size is a JSON string array
        try {
          if (product.size.startsWith('[') && product.size.endsWith(']')) {
            productSizes = JSON.parse(product.size);
          } else {
            // Handle as comma-separated string
            productSizes = product.size.split(',').map(s => s.trim().toLowerCase());
          }
        } catch (e) {
          // If parsing fails, treat as a single string
          productSizes = [product.size.toLowerCase()];
        }
        
        const matches = selectedSizes.some(size => 
          productSizes.includes(size.toLowerCase()) || 
          productSizes.some(pSize => pSize.toLowerCase() === size.toLowerCase())
        );
        
        return matches;
      });
      console.log(`Size filter: ${beforeFilter} → ${result.length} products`);
    }
    
    // Color filter
    if (selectedColors.length > 0) {
      const beforeFilter = result.length;
      result = result.filter(product => {
        // Check if the product's color matches any of the selected colors
        if (!product.color) return false;
        
        let productColors: string[] = [];
        
        // Handle if color is a JSON string array
        try {
          if (product.color.startsWith('[') && product.color.endsWith(']')) {
            productColors = JSON.parse(product.color);
          } else {
            // Handle as comma-separated string
            productColors = product.color.split(',').map(c => c.trim().toLowerCase());
          }
        } catch (e) {
          // If parsing fails, treat as a single string
          productColors = [product.color.toLowerCase()];
        }
        
        const matches = selectedColors.some(color => 
          productColors.includes(color.toLowerCase()) || 
          productColors.some(pColor => pColor.toLowerCase() === color.toLowerCase())
        );
        
        return matches;
      });
      console.log(`Color filter: ${beforeFilter} → ${result.length} products`);
    }
    
    // Gender filter
    if (selectedGender) {
      const beforeFilter = result.length;
      result = result.filter(product => {
        if (!product.gender) return false;
        
        // Case-insensitive comparison for gender
        const matches = product.gender.toLowerCase() === selectedGender.toLowerCase();
        return matches;
      });
      console.log(`Gender filter: ${beforeFilter} → ${result.length} products`);
    }
    
    // Search query filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }

    // New products filter
    if (showNew) {
      result = result.filter(product => product.is_new);
    }

    // Discounted products filter
    if (showDiscounted) {
      result = result.filter(product => product.discount > 0);
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
        result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
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
  }, [products, selectedCategory, selectedSort, priceRange, debouncedSearchQuery, showNew, showDiscounted, searchParams, setSearchParams, selectedSizes, selectedColors, selectedGender]);

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
    setShowNew(false);
    setShowDiscounted(false);
    // Clear clothing filters
    setSelectedSizes([]);
    setSelectedColors([]);
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
      {/* Active Filter Badges */}
      {(selectedSizes.length > 0 || selectedColors.length > 0 || selectedGender) && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Active Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSizes.map(size => (
              <div 
                key={`badge-size-${size}`} 
                className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-2 py-1"
              >
                <span className="mr-1">Size: {size}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedSizes(selectedSizes.filter(s => s !== size))}
                />
              </div>
            ))}
            {selectedColors.map(color => (
              <div 
                key={`badge-color-${color}`} 
                className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-2 py-1"
              >
                <span className="mr-1">Color: {color}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))}
                />
              </div>
            ))}
            {selectedGender && (
              <div 
                className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-2 py-1"
              >
                <span className="mr-1">Gender: {selectedGender}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedGender("")}
                />
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="flex gap-4">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    value={minPriceInput}
                    onChange={(e) => handlePriceInputChange('min', e.target.value)}
                    placeholder="Min"
                    className="text-sm"
                    type="number"
                    min="0"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    value={maxPriceInput}
                    onChange={(e) => handlePriceInputChange('max', e.target.value)}
                    placeholder="Max"
                    className="text-sm"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Current range: ${priceRange[0]} - ${priceRange[1]}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const prices = products.map(p => p.price);
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    setPriceRange([minPrice, maxPrice]);
                    setMinPriceInput(minPrice.toString());
                    setMaxPriceInput(maxPrice.toString());
                  }}
                  className="h-7 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size Filter */}
        <AccordionItem value="sizes" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sizes</span>
              {selectedSizes.length > 0 && (
                <span className="ml-auto mr-2 text-xs bg-primary/10 text-primary rounded-full px-2">
                  {selectedSizes.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {availableSizes.map((size) => (
                <div 
                  key={size}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    selectedSizes.includes(size) ? "text-primary font-medium" : ""
                  }`}
                >
                  <Checkbox 
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSizes([...selectedSizes, size]);
                      } else {
                        setSelectedSizes(selectedSizes.filter(s => s !== size));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`size-${size}`} 
                    className="cursor-pointer w-full"
                    onClick={() => {
                      if (selectedSizes.includes(size)) {
                        setSelectedSizes(selectedSizes.filter(s => s !== size));
                      } else {
                        setSelectedSizes([...selectedSizes, size]);
                      }
                    }}
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="colors" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full" />
              <span>Colors</span>
              {selectedColors.length > 0 && (
                <span className="ml-auto mr-2 text-xs bg-primary/10 text-primary rounded-full px-2">
                  {selectedColors.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              {availableColors.map((color) => (
                <div 
                  key={color}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    selectedColors.includes(color) ? "text-primary font-medium" : ""
                  }`}
                >
                  <Checkbox 
                    id={`color-${color}`}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedColors([...selectedColors, color]);
                      } else {
                        setSelectedColors(selectedColors.filter(c => c !== color));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`color-${color}`} 
                    className="cursor-pointer w-full"
                    onClick={() => {
                      if (selectedColors.includes(color)) {
                        setSelectedColors(selectedColors.filter(c => c !== color));
                      } else {
                        setSelectedColors([...selectedColors, color]);
                      }
                    }}
                  >
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gender Filter */}
        <AccordionItem value="gender" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 flex items-center justify-center">
                <span className="text-xs">⚥</span>
              </div>
              <span>Gender</span>
              {selectedGender && (
                <span className="ml-auto mr-2 text-xs bg-primary/10 text-primary rounded-full px-2">
                  1
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div 
                className={`flex items-center space-x-2 cursor-pointer ${
                  selectedGender === "" ? "text-primary font-medium" : ""
                }`}
              >
                <Checkbox 
                  id="gender-all"
                  checked={selectedGender === ""}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedGender("");
                  }}
                />
                <Label 
                  htmlFor="gender-all" 
                  className="cursor-pointer w-full"
                  onClick={() => setSelectedGender("")}
                >
                  All
                </Label>
              </div>
              
              {/* Explicitly render each required gender */}
              {["Men", "Female", "Unisex", "Kids"].map((gender) => (
                <div 
                  key={gender}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    selectedGender === gender ? "text-primary font-medium" : ""
                  }`}
                >
                  <Checkbox 
                    id={`gender-${gender}`}
                    checked={selectedGender === gender}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedGender(gender);
                    }}
                  />
                  <Label 
                    htmlFor={`gender-${gender}`} 
                    className="cursor-pointer w-full"
                    onClick={() => setSelectedGender(gender)}
                  >
                    {gender}
                  </Label>
                </div>
              ))}
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
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        image={seoConfig.image}
      />
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
