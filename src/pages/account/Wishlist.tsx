import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import EmptyState from "@/components/account/EmptyState";
import WishlistItem from "@/components/account/WishlistItem";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserWishlist, 
  removeFromWishlist,
  removeAllFromWishlist
} from "@/integrations/supabase/wishlist.service";
import { ensureProductTypeCompatibility } from "@/lib/utils";
import { ChevronLeft, Heart, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/seo/SEOHead";
import { getSEOConfig } from "@/lib/seo-config";

const Wishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const seoConfig = getSEOConfig('accountWishlist');

  useEffect(() => {
    const fetchWishlistedProducts = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const items = await getUserWishlist(user.id);

        if (items && items.length > 0) {
          setWishlistItems(items);
        } else {

          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your wishlist items."
        });
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistedProducts();
  }, [user, toast]);

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    if (!user) return;
    
    try {
      const result = await removeFromWishlist(wishlistId);
      
      if (result) {
        setWishlistItems(wishlistItems.filter(item => item.id !== wishlistId));
        toast({
          title: "Removed from wishlist",
          description: "Product has been removed from your wishlist."
        });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove product from wishlist."
      });
    }
  };

  const handleClearAllWishlist = async () => {
    if (!user || wishlistItems.length === 0) return;
    
    setIsClearingAll(true);
    try {
      const result = await removeAllFromWishlist(user.id);
      
      if (result) {
        setWishlistItems([]);
        toast({
          title: "Wishlist cleared",
          description: "All products have been removed from your wishlist."
        });
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear your wishlist."
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <Layout>
      <SEOHead {...seoConfig} />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                <Button asChild variant="ghost" className="mr-4 rounded-full h-10 px-4 hover:bg-background/80 dark:hover:bg-background/40">
                  <Link to="/account" className="flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Account
                  </Link>
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-full text-sm px-3 sm:px-4">
                  <Link to="/shop" className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-1 sm:mr-2" /> 
                    <span className="hidden xs:inline">Continue Shopping</span>
                    <span className="xs:hidden">Shop</span>
                  </Link>
                </Button>
                <Button asChild className="rounded-full text-sm px-3 sm:px-4">
                  <Link to="/cart" className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-1 sm:mr-2" /> 
                    <span className="hidden xs:inline">Go to Cart</span>
                    <span className="xs:hidden">Cart</span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-background/60 backdrop-blur-md shadow-sm rounded-lg p-6 border border-border/30 dark:border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-bold">My Wishlist</h1>
                </div>
                
                {wishlistItems.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleClearAllWishlist}
                    disabled={isClearingAll}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isClearingAll ? "Clearing..." : "Clear All"}
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved to your wishlist
              </p>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary/30" />
                  </div>
                </div>
              </div>
            ) : wishlistItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <EmptyState
                  title="Your wishlist is empty"
                  description="Save items you like by clicking the heart icon on products."
                  icon="❤️"
                  buttonLabel="Browse Products"
                  buttonHref="/shop"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {wishlistItems.map((item) => (
                  item.products && (
                    <WishlistItem
                      key={item.id}
                      wishlistItem={item}
                      product={item.products}
                      onRemove={() => handleRemoveFromWishlist(item.id)}
                    />
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
