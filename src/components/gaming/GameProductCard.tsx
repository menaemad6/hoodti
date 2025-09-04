import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sword, Shield } from 'lucide-react';
import { Product } from '@/integrations/supabase/types.service';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import clsx from 'clsx';

interface GameProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

const GameProductCard: React.FC<GameProductCardProps> = ({ 
  product, 
  index = 0, 
  className 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  // Handle adding item to cart
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    // Visual feedback
    const button = e.currentTarget;
    button.classList.add('bg-yellow_gaming-300', 'text-black');
    
    // Get the first color from the product colors array
    let selectedColor: string | undefined;
    if (product.color) {
      try {
        if (product.color.startsWith('[') && product.color.endsWith(']')) {
          const colorsArray = JSON.parse(product.color);
          selectedColor = Array.isArray(colorsArray) && colorsArray.length > 0 ? 
            colorsArray[0].toString().replace(/"/g, '') : undefined;
        } else {
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
        if (product.size.startsWith('[') && product.size.endsWith(']')) {
          const sizesArray = JSON.parse(product.size);
          selectedSize = Array.isArray(sizesArray) && sizesArray.length > 0 ? 
            sizesArray[0].toString().replace(/"/g, '') : undefined;
        } else {
          const sizesArray = product.size.split(',').map(s => s.trim());
          selectedSize = sizesArray.length > 0 ? sizesArray[0].replace(/"/g, '') : undefined;
        }
      } catch (error) {
        console.error('Error parsing size:', error);
        selectedSize = undefined;
      }
    }
    
    // Create a fixed product object with the original ID
    const fixedProduct = {
      ...product,
      id: product.id.replace('featured-', '').replace('new-', '')
    };
    
    // Use the CartContext to add the item with selected color and size
    addToCart(fixedProduct, 1, selectedColor, selectedSize);
    
    // Reset button style after a delay
    setTimeout(() => {
      button.classList.remove('bg-yellow_gaming-300', 'text-black');
    }, 800);
  };

  // Parse product colors only if they exist
  const getProductColors = () => {
    if (!product.color) return [];
    
    try {
      if (product.color.startsWith('[') && product.color.endsWith(']')) {
        const parsedColors = JSON.parse(product.color);
        if (Array.isArray(parsedColors)) {
          return parsedColors.map(c => c.toString().replace(/"/g, '').trim());
        }
      } else {
        return product.color.split(',').map(c => c.replace(/"/g, '').trim());
      }
    } catch (error) {
      console.error('Error parsing product colors:', error);
    }
    
    return [];
  };

  const productColors = getProductColors();

  // Clean product ID for URLs
  const cleanProductId = product.id.replace('featured-', '').replace('new-', '');

  return (
    <div 
      className={clsx(
        "group relative w-80 h-[440px] bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-gray-700/50 cursor-target",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount badge with game-style design */}
      {product.original_price && (
        <div className="absolute top-4 right-4 z-30">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-lg transform rotate-3"></div>
            <span className="relative inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
              -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Game-style decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue_gaming-50/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow_gaming-300/50 to-transparent"></div>

      {/* Product Image with game-style frame */}
      <Link to={`/product/${cleanProductId}`} className="block cursor-target">
        <div className="relative h-64 overflow-hidden m-4 rounded-xl border-2 border-gray-700/50">
          {/* Hover overlay with game-style effects */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center z-20 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-4">
              <button className="bg-gradient-to-r from-yellow_gaming-300 to-yellow_gaming-200 hover:from-yellow_gaming-200 hover:to-yellow_gaming-300 text-black px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl cursor-target">
                <Sword className="w-4 h-4 inline mr-2" />
                Quick View
              </button>
              
              {product.stock === 0 ? (
                <button 
                  className="bg-gray-600 text-white px-6 py-3 rounded-full font-bold text-sm cursor-not-allowed border border-gray-500"
                  disabled
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Sold Out
                </button>
              ) : (
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-6 py-3 rounded-full font-bold text-sm backdrop-blur-sm transition-all duration-300 cursor-target"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="w-4 h-4 inline mr-2" />
                  Add to Cart
                </button>
              )}
            </div>
          </div>
          
          {/* Image with game-style effects */}
          <img
            src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : `/collab-collection.jpg`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/collab-collection.jpg";
            }}
          />
          
          {/* Game-style corner decorations */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-yellow_gaming-300/60"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-yellow_gaming-300/60"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-blue_gaming-50/60"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-blue_gaming-50/60"></div>
        </div>
      </Link>

      {/* Product Info with game-style design */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue_gaming-50 font-medium uppercase tracking-wider bg-blue_gaming-50/10 px-2 py-1 rounded">
            {typeof product.category === 'object' ? product.category?.name : 'Gaming'}
          </span>
          
          {/* Color dots - only show if colors exist */}
          {productColors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {productColors.slice(0, 3).map((color, i) => {
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
                  'teal': '#0d9488'
                };
                
                const hexColor = colorMap[color.toLowerCase()] || color;
                return (
                  <span 
                    key={i} 
                    className="w-3 h-3 rounded-full border-2 border-white/30 shadow-sm" 
                    style={{ backgroundColor: hexColor }}
                    title={color}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        <Link to={`/product/${cleanProductId}`} className="cursor-target">
          <h3 className="text-lg font-bold mb-2 group-hover:text-yellow_gaming-300 transition-colors text-white line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          
          {/* Add to cart button with game-style design */}
          {product.stock === 0 ? (
            <button 
              className="p-3 rounded-full border-2 border-gray-500 bg-gray-600 text-white cursor-not-allowed"
              disabled
              aria-label="Sold out"
            >
              <Shield className="h-5 w-5" />
            </button>
          ) : (
            <button 
              className="p-3 rounded-full border-2 border-white/20 hover:border-yellow_gaming-300 bg-white/5 hover:bg-yellow_gaming-300 text-white hover:text-black transition-all duration-300 cursor-target"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-yellow_gaming-300/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};

export default GameProductCard;