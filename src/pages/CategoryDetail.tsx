import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/shop/ProductGrid";
import GlassCard from "@/components/ui/glass-card";
import { useProductsService } from "@/integrations/supabase/products.service";
import { getCategories } from "@/integrations/supabase/categories.service";
import { Category, Product } from "@/integrations/supabase/types.service";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Grid, List, Layers, ShoppingBag, Filter, ArrowUpDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/seo/SEOHead";
import { useCategorySEO } from "@/lib/seo-config";
import { useCurrentTenant } from "@/context/TenantContext";

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const productsService = useProductsService();
  const currentTenant = useCurrentTenant();
  
  // Get SEO configuration for category page
  const seoConfig = category ? useCategorySEO({
    id: category.id,
    name: category.name,
    description: category.description,
    image: Array.isArray(category.image) ? category.image[0] : category.image || ''
  }) : useCategorySEO(null);

  const fetchCategoryData = async () => {
    if (!id) {
      setError("No category ID provided");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const categoriesData = await getCategories(currentTenant.id);
      const foundCategory = categoriesData.find(c => c.id === id);
      
      if (!foundCategory) {
        setError("Category not found");
        setIsLoading(false);
        return;
      }
      
      setCategory(foundCategory);
      
      const categoryProducts = await productsService.getProductsByCategory(id);
      setProducts(categoryProducts);
      
    } catch (error) {
      console.error("Error fetching category data:", error);
      setError("Failed to load category details");
      toast({
        title: "Error",
        description: "Failed to load category details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [id, currentTenant.id]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-6 mx-auto"></div>
            <h1 className="text-2xl font-bold mb-2">Loading Category</h1>
            <p className="text-muted-foreground">
              Please wait while we fetch the category details
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-lg"
          >
            <div className="w-20 h-20 mb-6 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {error || "The category you're looking for doesn't exist or may have been removed."}
            </p>
            <Button asChild className="rounded-full">
              <Link to="/categories">Browse All Categories</Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEOHead {...seoConfig} />
      <div className="container mx-auto px-4 py-8 mb-12 ">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="rounded-full pl-3 pr-4 h-9 mb-4 text-sm hover:bg-background/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center text-sm text-muted-foreground space-x-1">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-1">/</span>
            <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </div>
        </motion.div>
        
        {/* Category Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
            <img 
              src={Array.isArray(category.image) ? category.image[0] : category.image || '/placeholder.svg'} 
              alt={category.name} 
              className="w-full h-full object-cover object-center transition-transform duration-5000 group-hover:scale-105" 
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <Badge variant="secondary" className="mb-3 bg-primary/90 text-primary-foreground hover:bg-primary">
                {products.length} Products
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-sm">
                {category.name}
              </h1>
              <p className="text-white/90 max-w-2xl text-sm sm:text-base drop-shadow-sm">
                {category.description}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">All Products</h2>
              <p className="text-muted-foreground text-sm">
                Showing {products.length} products in "{category.name}"
              </p>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <GlassCard className="py-16 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                There are no products in this category yet. Check back later or browse other categories.
              </p>
              <Button asChild className="rounded-full">
                <Link to="/categories">Browse Categories</Link>
              </Button>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default CategoryDetail;
