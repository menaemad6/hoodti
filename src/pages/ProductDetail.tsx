import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";
import { getProductSEO } from "@/lib/seo-config";
import ModernCard from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Minus, Plus, ShoppingCart, ChevronLeft, Truck, Shield, 
  Star, Package, Check, ArrowRight, Share2, Leaf, 
  ChevronRight, Camera, Globe, X
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductGrid from "@/components/shop/ProductGrid";
import { getProduct, getProductsByCategory } from "@/integrations/supabase/products.service";
import { Product } from "@/integrations/supabase/types.service";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatPrice } from "@/lib/utils";
import WishlistButton from "@/components/product/WishlistButton";
import { BRAND_NAME, PRODUCT_TYPE_OPTIONS, SIZING_OPTIONS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("description");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add state for selected color and size
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Add zoom effect state
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastAddedTimestamp, setLastAddedTimestamp] = useState(0);
  
  // Add state for image modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  // Add state for selected type
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Get SEO configuration for product page
  const seoConfig = product ? getProductSEO({
    id: product.id,
    name: product.name,
    description: product.description,
    image: Array.isArray(product.image) ? product.image[0] : product.image,
    price: product.price,
    category_name: typeof product.category === 'object' ? product.category.name : undefined
  }) : getProductSEO(null);
  
  // Add utility function to parse array fields (handle either JSON strings or actual arrays)
  const parseArrayField = (field: string | string[] | null | undefined): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      // If it's a JSON string, parse it
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch (e) {
      // If it can't be parsed as JSON, treat it as a single value
      return [field];
    }
  };

  // Parse available colors and sizes
  const availableColors = product ? parseArrayField(product.color) : [];
  
  // Parse available sizes for the selected type from nested size object
  const parseNestedSizes = (sizeField: any, selectedType: string | null): string[] => {
    if (!sizeField || !selectedType) return [];
    if (typeof sizeField === 'string') {
      try {
        const parsed = JSON.parse(sizeField);
        if (parsed && typeof parsed === 'object' && parsed[selectedType]) {
          return parsed[selectedType];
        }
        // fallback: if it's a flat array
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback: treat as comma-separated or single value
        return [sizeField];
      }
    }
    if (typeof sizeField === 'object' && sizeField[selectedType]) {
      return sizeField[selectedType];
    }
    return [];
  };
  
  // Custom fallback: get first available size from product if fallback is needed
  const getFallbackSizes = () => {
    if (product && product.size) {
      // Try to parse all sizes from product.size
      if (typeof product.size === 'string') {
        try {
          const parsed = JSON.parse(product.size);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === 'object') {
            // Flatten all values
            return Object.values(parsed).flat();
          }
        } catch {
          return [product.size];
        }
      }
      if (Array.isArray(product.size)) return product.size;
      if (typeof product.size === 'object') {
        return Object.values(product.size).flat();
      }
    }
    // fallback to static SIZING_OPTIONS if product.size is not available
    const otherSizing = SIZING_OPTIONS.find(opt => opt.type === 'Other');
    return otherSizing ? otherSizing.sizes.map(s => s.size) : [];
  };
  
  const availableSizes = product ? (parseNestedSizes(product.size, selectedType).length > 0
    ? parseNestedSizes(product.size, selectedType)
    : getFallbackSizes()) : [];
  
  // Parse available types
  const availableTypes = product ? parseArrayField(product.type) : [];
  
  // Utility to get images array from product
  const getGalleryImages = (product: Product | null): string[] => {
    if (!product) return [];
    // Prefer images array if available and non-empty
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    // If images is a string (bad data), try to parse as JSON
    if (typeof (product as any).images === 'string') {
      try {
        const parsed = JSON.parse((product as any).images);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
    }
    // Fallback to single image string
    if (typeof product.image === 'string' && product.image) {
      return [product.image];
    }
    // Fallback to placeholder
    return ["/placeholder.svg"];
  };

  const galleryImages = getGalleryImages(product);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const productData = await getProduct(id);
        
        if (!productData) {
          setIsLoading(false);
          return;
        }
        
        setProduct(productData);
        // Set the first image as active by default
        const imgs = getGalleryImages(productData);
        setActiveImage(imgs[0] || "/placeholder.svg");
        
        const related = await getProductsByCategory(productData.category_id);
        setRelatedProducts(related.filter(p => p.id !== id).slice(0, 4));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, toast]);
  
  // Set initial selected color, size, and type when product loads
  useEffect(() => {
    if (product) {
      if (availableTypes.length > 0 && !selectedType) {
        setSelectedType(availableTypes[0]);
      }
      if (availableColors.length > 0 && !selectedColor) {
        setSelectedColor(availableColors[0]);
      }
      if (availableSizes.length > 0 && !selectedSize) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [product, availableTypes, availableColors, availableSizes, selectedColor, selectedSize]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse w-full max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-24 mb-8 rounded-full"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="bg-gray-200 dark:bg-gray-700 h-[500px] rounded-2xl"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 dark:bg-gray-700 w-20 h-20 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <ModernCard className="max-w-md mx-auto text-center p-8">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/[0.08] dark:bg-primary/[0.04] flex items-center justify-center">
                <Package className="w-8 h-8 text-primary dark:text-primary/90" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-3 text-foreground/90 dark:text-foreground/80">
              Product Not Found
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground/90 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              asChild 
              className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/10"
            >
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </ModernCard>
        </div>
      </Layout>
    );
  }
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    // Include selected color, size, and type in the cart item if available
    const productToAdd = {
      ...product,
      selectedColor: selectedColor || undefined,
      selectedSize: selectedSize || undefined,
      selected_type: selectedType || undefined,
    };
    
    addToCart(productToAdd, quantity, selectedColor || undefined, selectedSize || undefined, selectedType || undefined);
    setLastAddedTimestamp(Date.now());
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` in ${selectedColor}` : ''}${selectedType ? `, Type: ${selectedType}` : ''} added to your cart`,
      action: (
        <Button size="sm" variant="outline" onClick={() => navigate('/cart')} 
          className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10">
          View Cart
        </Button>
      ),
    });
  };
  
  const getCategoryName = () => {
    if (!product?.category) return "Uncategorized";
    
    if (typeof product.category === 'string') {
      return product.category;
    }
    
    return product.category.name || "Uncategorized";
  };
  
  const features = [
    {
      icon: <Check className="w-5 h-5" />,
      title: "Premium Quality",
      description: "Hand-crafted with premium materials"
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: "Fast Shipping",
      description: "Expedited delivery within 24-48 hours"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Payment",
      description: "Multiple secure payment options available"
    },
    {
      icon: <Leaf className="w-5 h-5" />,
      title: "Eco-Friendly",
      description: "Sustainable production practices"
    }
  ];
  
  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ${BRAND_NAME}`,
        url: window.location.href
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Product link has been shared"
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        // Fallback to copy to clipboard
        copyToClipboard();
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with friends"
      });
    });
  };
  
  return (
    <Layout>
      <SEOHead {...seoConfig} />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-black/[0.02] -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Breadcrumb navigation with refined styling */}
          <nav className="flex flex-wrap items-center gap-2 mb-8 sm:mb-12 text-sm">
            <Button 
              variant="ghost" 
              className="h-9 rounded-full px-4 hover:bg-background/80 dark:hover:bg-background/40"
              asChild
            >
              <Link to="/shop" className="inline-flex items-center">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Shop
              </Link>
            </Button>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <Link 
              to={`/categories/${product.category_id}`}
              className="text-muted-foreground hover:text-primary transition-colors rounded-full px-3 py-1 hover:bg-background/80 dark:hover:bg-background/40"
            >
              {getCategoryName()}
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-foreground/80 bg-muted/50 rounded-full px-3 py-1">{product.name}</span>
          </nav>
            
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-10 xl:gap-20 mb-16">
            {/* Product Images - Enhanced */}
            <div className="space-y-6">
              <div 
                className={cn(
                  "overflow-hidden backdrop-blur-xl rounded-3xl cursor-zoom-in relative",
                  "bg-gradient-to-br from-background/90 via-background/80 to-background/60",
                  "border border-border/40 dark:border-border/20",
                  "shadow-xl shadow-primary/5 dark:shadow-primary/3",
                  "transition-all duration-300",
                  isZoomed ? "scale-[1.02]" : ""
                )}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setImageModalOpen(true)}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-square group"
                >
                  <img 
                    src={activeImage || (galleryImages[0] || "/placeholder.svg")} 
                    alt={product.name} 
                    className={cn(
                      "w-full h-full object-contain p-4 sm:p-6",
                      "transition-all duration-300",
                      isZoomed ? "scale-110" : "scale-100"
                    )}
                  />
                  
                  {id && (
                    <div className="absolute top-4 right-4 z-10">
                      <WishlistButton productId={id} variant="icon" />
                    </div>
                  )}
                  
                  {/* Image zoom indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-background/80 dark:bg-background/60 backdrop-blur-md rounded-full p-3 shadow-lg">
                      <Camera className="h-5 w-5 text-foreground/70" />
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      className={cn(
                        "relative rounded-xl overflow-hidden aspect-square",
                        "bg-background/40 dark:bg-background/30",
                        "border-2 transition-all duration-200",
                        "hover:shadow-lg shadow-primary/10",
                        activeImage === img 
                          ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10" 
                          : "border-border/50 dark:border-border/20"
                      )}
                      onClick={() => setActiveImage(img)}
                    >
                      <div className="aspect-square">
                        <img 
                          src={img} 
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Image Modal */}
              <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogContent className="w-[90%] sm:w-[80%] h-[70vh] p-0 bg-background border-border/30 dark:border-border/10">
                  <div className="flex items-center justify-center h-full w-full">
                    <img 
                      src={activeImage || (galleryImages[0] || "/placeholder.svg")} 
                      alt={product.name} 
                      className="max-h-[95%] max-w-[95%] object-contain"
                    />
                  </div>
                  <DialogClose className="absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border/30 hover:bg-background hover:border-primary/40 shadow-sm transition-all duration-200 z-50">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
              
            {/* Product Info - Enhanced */}
            <div className="space-y-8">
              {/* Product Header Section */}
              <div>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge 
                      variant="outline" 
                      className="rounded-full px-3 py-0.5 text-xs font-medium bg-primary/5 border-primary/20 text-primary/90"
                    >
                      {getCategoryName()}
                    </Badge>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-background/80 dark:hover:bg-background/40"
                      onClick={handleShareProduct}
                    >
                      <Share2 className="h-5 w-5 text-muted-foreground" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                
                  <h1 className="text-3xl sm:text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                          )}
                        />
                      ))}
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="inline-flex items-center">
                      <span className={cn(
                        "w-2 h-2 rounded-full mr-1.5",
                        product.stock > 0 ? "bg-green-500" : "bg-red-500"
                      )}></span>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
                  
                <div className="flex items-baseline gap-4 mt-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {product.original_price && product.original_price > product.price ? (
                        <>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                                {formatPrice(product.price)}
                              </span>
                              <div className="flex items-center">
                                <Badge 
                                  className="rounded-full bg-red-500 text-white text-xs px-2 py-0.5 shadow-sm"
                                >
                                  -{Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-base text-muted-foreground line-through decoration-1">
                                {formatPrice(product.original_price)}
                              </span>
                              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Save {formatPrice(Number(product.original_price) - Number(product.price))}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    {product.original_price && product.original_price > product.price && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-2 flex items-center text-green-700 dark:text-green-400">
                        <Check className="h-4 w-4 mr-2" />
                        <span className="text-sm">Limited time offer! Original price: {formatPrice(product.original_price)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                
              {/* Small description or tagline - New section */}
              {product.description && (
                <div className="bg-muted/30 dark:bg-muted/20 rounded-2xl p-4 text-muted-foreground dark:text-muted-foreground/90">
                  <p className="line-clamp-2 text-sm">
                    {product.description.split('.')[0] + '.'}
                  </p>
                </div>
              )}
                
              {/* Product variants section - Available Colors and Sizes */}
              <div className="space-y-5">
                
                {/* Material Type */}
                {product.material && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Material</h3>
                    <div className="flex items-center">
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs bg-background/60 backdrop-blur-sm border-border/40 dark:border-border/20 shadow-sm">
                        <span className="font-medium">{product.material}</span>
                      </Badge>
                    </div>
                  </div>
                )}
                
                {/* Available Colors - Now with selection */}
                {availableColors.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Color: <span className="text-foreground">{selectedColor}</span></h3>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color, index) => (
                        <button 
                          key={index}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "group rounded-full p-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1",
                            selectedColor === color ? "ring-2 ring-primary" : "ring-1 ring-border/40 hover:ring-primary/60"
                          )}
                        >
                          <div 
                            className={cn(
                              "w-8 h-8 rounded-full border border-border/30 relative",
                              selectedColor === color ? "ring-1 ring-white/80 dark:ring-black/20" : ""
                            )}
                            style={{ 
                              backgroundColor: 
                                ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                  .includes(color.toLowerCase()) 
                                  ? color.toLowerCase()
                                  : '#888' 
                            }}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check 
                                  className={cn(
                                    "w-4 h-4", 
                                    ['white', 'yellow'].includes(color.toLowerCase())
                                      ? "text-black/70" 
                                      : "text-white/90"
                                  )} 
                                />
                              </div>
                            )}
                          </div>
                          <span className="sr-only">{color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Type Selector */}
                {availableTypes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Fit</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(type)}
                          className={cn(
                            "h-9 min-w-[2.5rem] rounded-full px-3 py-1.5 text-sm transition-all duration-200",
                            "border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1",
                            selectedType === type
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background/80 border-border/40 dark:border-border/20 hover:border-primary/60 text-foreground"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Available Sizes - Now with selection */}
                {availableSizes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Size: <span className="text-foreground">{selectedSize}</span></h3>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "h-9 min-w-[2.5rem] rounded-full px-3 py-1.5 text-sm transition-all duration-200",
                            "border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1",
                            selectedSize === size 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-background/80 border-border/40 dark:border-border/20 hover:border-primary/60 text-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    
                    {/* Sizing Table for selectedType */}
                    {selectedType && (
                      (() => {
                        const sizing = SIZING_OPTIONS.find(opt => opt.type === selectedType) || SIZING_OPTIONS.find(opt => opt.type === 'Other');
                        if (!sizing) {
                          return <div className="text-xs text-muted-foreground mt-2">No sizing chart available for this type.</div>;
                        }
                        // Only show sizes that are in availableSizes
                        const filteredSizes = sizing.sizes.filter(s => availableSizes.includes(s.size));
                        if (filteredSizes.length === 0) {
                          return <div className="text-xs text-muted-foreground mt-2">No matching sizes for this product.</div>;
                        }
                        return (
                          <div className="mt-5 rounded-xl overflow-hidden border border-border/30 dark:border-border/20 bg-background/60 backdrop-blur-sm shadow-sm">
                            <div className="p-3 bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 border-b border-border/30 dark:border-border/10">
                              <h4 className="font-medium text-sm flex items-center">
                                <span className="inline-block w-4 h-4 mr-2 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary text-xs">i</span>
                                </span>
                                {selectedType} Size Chart
                              </h4>
                            </div>
                            <div className="p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[100px]">Size</TableHead>
                                    {Object.keys(filteredSizes[0]).filter(k => k !== 'size').map((k) => (
                                      <TableHead key={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredSizes.map((row) => (
                                    <TableRow key={row.size}
                                      className={cn(
                                        'cursor-pointer transition-all group',
                                        selectedSize === row.size
                                          ? 'bg-primary/10 border-l-4 border-primary/70 ring-2 ring-primary/30 shadow-sm'
                                          : 'hover:bg-muted/30'
                                      )}
                                      onClick={() => setSelectedSize(row.size)}
                                    >
                                      <TableCell className={cn('font-medium', selectedSize === row.size ? 'text-primary font-extrabold text-lg' : '')}>{row.size}</TableCell>
                                      {Object.keys(row).filter(k => k !== 'size').map((k) => (
                                        <TableCell key={k}>{row[k]}</TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <p className="mt-3 text-xs text-muted-foreground">
                                All measurements are in centimeters. Please allow a 1-2 cm difference due to manual measurement.
                              </p>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
                
              {/* Features section - Premium Redesign */}
              <div className="space-y-3 my-6">
                <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Product Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md border border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-sm hover:shadow-primary/5 dark:hover:shadow-primary/3 overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/15 dark:to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/5 z-10 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-primary dark:text-primary/90">
                          {feature.icon}
                        </div>
                      </div>
                      
                      <div className="z-10">
                        <h3 className="font-medium text-sm text-foreground/90 dark:text-foreground/80 group-hover:text-primary/90 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
                  
              {/* Add to cart section - Premium Redesign */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center rounded-full border border-border/50 dark:border-border/20 bg-background/60 backdrop-blur-sm shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-l-full hover:bg-gradient-to-br hover:from-background/90 hover:to-background/60 dark:hover:from-background/40 dark:hover:to-background/20 transition-all duration-300"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center font-medium">{quantity}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-r-full hover:bg-gradient-to-br hover:from-background/90 hover:to-background/60 dark:hover:from-background/40 dark:hover:to-background/20 transition-all duration-300"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                      
                  <motion.div
                    className="w-full"
                    initial={false}
                    animate={
                      lastAddedTimestamp && Date.now() - lastAddedTimestamp < 1000
                        ? { scale: [1, 1.03, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium rounded-full shadow-lg shadow-primary/20 dark:shadow-primary/10 border border-primary/20 transition-all duration-300 hover:shadow-xl"
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </motion.div>
                </div>
                    
                {id && (
                  <WishlistButton 
                    productId={id} 
                    variant="button" 
                    className="w-full rounded-full border-border/30 dark:border-border/10 hover:bg-gradient-to-br hover:from-background/80 hover:to-background/60 dark:hover:from-background/40 dark:hover:to-background/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
                  />
                )}
              </div>
                
              {/* Product information tabs - Premium Redesign */}
              <div className="mt-10">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full justify-start rounded-2xl border border-border/30 dark:border-border/10 bg-background/60 backdrop-blur-sm p-1 shadow-sm">
                    {["description", "details"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className={cn(
                          "rounded-xl px-4 py-2 capitalize text-sm transition-all duration-300",
                          "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                        )}
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                    
                  <TabsContent value="description" className="pt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-muted-foreground dark:text-muted-foreground/90 text-sm sm:text-base leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </TabsContent>
                    
                  <TabsContent value="details" className="pt-6">
                    <div className="bg-muted/30 dark:bg-muted/20 rounded-2xl overflow-hidden border border-border/20 dark:border-border/10 shadow-sm">
                      <div className="grid grid-cols-1 text-sm">
                        {/* Display size as a list if it's an array */}
                        {availableSizes.length > 0 && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Sizes
                            </div>
                            <div className="p-4 flex flex-wrap gap-1">
                              {availableSizes.map((size, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="rounded-full px-2 py-0.5 text-xs border-border/30 dark:border-border/20"
                                >
                                  {size}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display single size if not an array */}
                        {product.size && availableSizes.length <= 1 && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Size
                            </div>
                            <div className="p-4">{product.size}</div>
                          </div>
                        )}
                        
                        {/* Display colors as a list if it's an array */}
                        {availableColors.length > 0 && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Colors
                            </div>
                            <div className="p-4 flex flex-wrap gap-1">
                              {availableColors.map((color, index) => (
                                <div key={index} className="flex items-center mr-2 mb-1">
                                  <span 
                                    className="inline-block w-3 h-3 rounded-full mr-1 border border-border/30" 
                                    style={{ 
                                      backgroundColor: 
                                        ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                            .includes(color.toLowerCase()) 
                                            ? color.toLowerCase()
                                            : '#888' 
                                    }}
                                  ></span>
                                  <span className="text-xs">{color}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display single color if not an array */}
                        {product.color && availableColors.length <= 1 && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Color
                            </div>
                            <div className="p-4 flex items-center">
                              <span 
                                className="inline-block w-4 h-4 rounded-full mr-2 border border-border/30" 
                                style={{ 
                                  backgroundColor: 
                                    ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                        .includes(product.color.toLowerCase()) 
                                        ? product.color.toLowerCase()
                                        : '#888' 
                                }}
                              ></span>
                              {product.color}
                            </div>
                          </div>
                        )}
                        
                        {product.material && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Material
                            </div>
                            <div className="p-4">{product.material}</div>
                          </div>
                        )}
                        
                        {product.brand && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Brand
                            </div>
                            <div className="p-4">{product.brand}</div>
                          </div>
                        )}
                        
                        {product.gender && (
                          <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                            <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                              Gender
                            </div>
                            <div className="p-4 capitalize">{product.gender}</div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 items-center border-b border-border/20 dark:border-border/10">
                          <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                            Unit
                          </div>
                          <div className="p-4">{(product as unknown as { unit?: string }).unit || "Item"}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 items-center">
                          <div className="p-4 font-medium bg-gradient-to-r from-muted/70 to-muted/40 dark:from-muted/40 dark:to-muted/20 text-muted-foreground dark:text-muted-foreground/90">
                            SKU
                          </div>
                          <div className="p-4">{product.id.slice(0, 8).toUpperCase() || "Not specified"}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Trust badges - Premium Redesign */}
              <div className="flex flex-wrap justify-center gap-3 mt-8 pt-6 border-t border-border/30 dark:border-border/10">
                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs bg-background/60 backdrop-blur-sm border-border/40 dark:border-border/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <Leaf className="w-3 h-3 mr-1.5 text-primary/80" />
                  <span className="font-medium">Ethically Made</span>
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs bg-background/60 backdrop-blur-sm border-border/40 dark:border-border/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <Shield className="w-3 h-3 mr-1.5 text-primary/80" />
                  <span className="font-medium">Secure Checkout</span>
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs bg-background/60 backdrop-blur-sm border-border/40 dark:border-border/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <Truck className="w-3 h-3 mr-1.5 text-primary/80" />
                  <span className="font-medium">Free Returns</span>
                </Badge>
              </div>
            </div>
          </div>
            
          {/* Related products section - Enhanced */}
          {relatedProducts.length > 0 && (
            <div className="space-y-8 mt-12 pt-12 border-t border-border/30 dark:border-border/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80">
                  You May Also Like
                </h2>
                <Button 
                  variant="ghost"
                  className="rounded-full hover:bg-background/80 dark:hover:bg-background/40"
                  asChild
                >
                  <Link to={`/categories/${product.category_id}`}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <ProductGrid products={relatedProducts} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
