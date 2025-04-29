
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addToWishlist, isProductInWishlist, removeFromWishlist } from "@/integrations/supabase/wishlist.service";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "button";
  className?: string;
  size?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  variant = "icon",
  className = "",
  size
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsInWishlist(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const result = await isProductInWishlist(user.id, productId);
        
        if (result && result.data) {
          setIsInWishlist(true);
          setWishlistId(result.data.id);
        } else {
          setIsInWishlist(false);
          setWishlistId(null);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (productId) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, productId, user]);
  
  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "default",
        action: (
          <Button size="sm" variant="outline" onClick={() => navigate('/signin')}>
            Sign In
          </Button>
        )
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isInWishlist && wishlistId) {
        await removeFromWishlist(wishlistId);
        setIsInWishlist(false);
        setWishlistId(null);
        
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        });
      } else {
        const result = await addToWishlist(user!.id, productId);
        
        if (result) {
          setIsInWishlist(true);
          setWishlistId(result.id);
          
          toast({
            title: "Added to wishlist",
            description: "Item has been added to your wishlist.",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: isInWishlist 
          ? "Failed to remove item from wishlist." 
          : "Failed to add item to wishlist."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (variant === "icon") {
    return (
      <button
        onClick={toggleWishlist}
        disabled={isLoading}
        className={`p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors ${className}`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
        />
      </button>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading}
      onClick={toggleWishlist}
      className={className}
    >
      <Heart 
        className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
      />
      {isInWishlist ? "Added to Wishlist" : "Add to Wishlist"}
    </Button>
  );
};

export default WishlistButton;
