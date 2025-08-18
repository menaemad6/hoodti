import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import { ensureProductTypeCompatibility, mapSupabaseProductToAppProduct } from "@/types/supabase-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCurrentTenant } from "@/context/TenantContext";

export interface CartItem {
  product: Product | SupabaseProduct;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selected_type?: string;
  customizationId?: string; // Add this field for customized products
}

export interface CartContextProps {
  items: CartItem[];
  cart: CartItem[];
  cartItemsCount: number;
  cartTotal: number;
  isCartInitialized: boolean;
  addItem: (product: Product | SupabaseProduct, quantity?: number, selectedColor?: string, selectedSize?: string, selected_type?: string, customizationId?: string) => void;
  addToCart: (product: Product | SupabaseProduct, quantity?: number, selectedColor?: string, selectedSize?: string, selected_type?: string, customizationId?: string) => void;
  removeItem: (productId: string, selectedColor?: string, selectedSize?: string, selected_type?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string, selectedSize?: string, selected_type?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string, selected_type?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemQuantity: (productId: string) => number;
}

// Base key; actual storage key is per-tenant and per-user for robust persistence
const CART_STORAGE_KEY_BASE = 'glassgrocer_cart_v3';
const LEGACY_CART_KEY_V2 = 'glassgrocer_cart_v2';

function buildCartStorageKey(tenantId: string, userId?: string | null) {
  const safeTenant = tenantId || 'default';
  const suffix = userId ? `user_${userId}` : 'guest';
  return `${CART_STORAGE_KEY_BASE}_${safeTenant}_${suffix}`;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

// Utility function to truncate long product names
const truncateProductName = (name: string, maxLength: number = 30) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

// Types for persisted storage (narrow, stable)
interface StoredProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  description?: string;
  category_id?: string;
  featured?: boolean;
  is_new?: boolean;
  discount?: number;
  category?: Record<string, unknown> | string;
  unit?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

interface StoredCartItem {
  product: StoredProduct;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selected_type?: string;
  customizationId?: string; // Add this field
}

interface CommonProductFields {
  id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  description?: string;
  category_id?: string;
  featured?: boolean;
  is_new?: boolean;
  discount?: number;
  category?: Record<string, unknown> | string;
  unit?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

function serializeProductForStorage(product: Product | SupabaseProduct): StoredProduct {
  const p = product as unknown as CommonProductFields;
  const images: string[] | undefined = Array.isArray(p.images)
    ? p.images
    : p.image
      ? [p.image]
      : undefined;

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    images,
    description: p.description,
    category_id: p.category_id,
    featured: p.featured,
    is_new: p.is_new,
    discount: p.discount,
    category: p.category,
    unit: p.unit,
    stock: p.stock,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartInitialized, setIsCartInitialized] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentTenant = useCurrentTenant();
  const previousUserIdRef = useRef<string | null>(null);
  const skipNextSaveRef = useRef<boolean>(false);

  const currentStorageKey = useMemo(() => {
    return buildCartStorageKey(currentTenant.id, user?.id ?? null);
  }, [currentTenant.id, user?.id]);

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const getTotal = () => {
    return items.reduce(
      (total, item) => total + (item.product.price || 0) * item.quantity,
      0
    );
  };

  const cartTotal = getTotal();

  // Utility: validate and normalize stored cart payload
  const normalizeStoredCart = (raw: unknown): CartItem[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item) =>
        item &&
        item.product &&
        typeof item.product === 'object' &&
        item.product.id &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      )
      .map((item: StoredCartItem) => ({
        product: mapSupabaseProductToAppProduct(item.product as unknown as SupabaseProduct),
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        selected_type: item.selected_type,
        customizationId: item.customizationId, // Add this field
      }));
  };

  // Load cart from localStorage whenever tenant/user scope changes
  useEffect(() => {
    setIsCartInitialized(false);
    try {
      const savedCart = localStorage.getItem(currentStorageKey);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const validated = normalizeStoredCart(parsed);
        setItems(validated);
        setIsCartInitialized(true);
        return;
      }

      // Fallback: migrate legacy key (guest only) once
      if (!user?.id) {
        const legacy = localStorage.getItem(LEGACY_CART_KEY_V2);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          const validated = normalizeStoredCart(parsed);
          if (validated.length > 0) {
            setItems(validated);
            localStorage.setItem(currentStorageKey, JSON.stringify(parsed));
          }
        }
        setIsCartInitialized(true);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      localStorage.removeItem(currentStorageKey);
      setIsCartInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStorageKey]);

  // Merge guest cart into user cart on sign-in (per tenant), like big ecommerces
  // Place BEFORE save effect to avoid race where guest items are saved to user key
  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = previousUserIdRef.current;

    // Detect sign-in or user change
    if (currentUserId && previousUserId !== currentUserId) {
      try {
        // Prevent save effect from copying guest items into the new user key before merge
        skipNextSaveRef.current = true;
        const guestKey = buildCartStorageKey(currentTenant.id, null);
        const userKey = buildCartStorageKey(currentTenant.id, currentUserId);

        const guestRaw = localStorage.getItem(guestKey);
        const userRaw = localStorage.getItem(userKey);
        const guestCart = guestRaw ? normalizeStoredCart(JSON.parse(guestRaw)) : [];
        const userCart = userRaw ? normalizeStoredCart(JSON.parse(userRaw)) : [];

        // Merge by product id + variant attributes
        const mergedMap = new Map<string, CartItem>();
        const addToMerged = (ci: CartItem) => {
          const normalizedProduct = ensureProductTypeCompatibility(ci.product);
          const key = `${normalizedProduct.id}|${ci.selectedColor || ''}|${ci.selectedSize || ''}|${ci.selected_type || ''}|${ci.customizationId || ''}`;
          const existing = mergedMap.get(key);
          const availableStock = typeof normalizedProduct.stock === 'number' ? normalizedProduct.stock : undefined;
          const mergedQuantity = (existing?.quantity || 0) + (ci.quantity || 0);
          const finalQuantity = availableStock !== undefined ? Math.max(0, Math.min(mergedQuantity, availableStock)) : mergedQuantity;
          if (finalQuantity <= 0) return;
          mergedMap.set(key, {
            product: normalizedProduct,
            quantity: finalQuantity,
            selectedColor: ci.selectedColor,
            selectedSize: ci.selectedSize,
            selected_type: ci.selected_type,
            customizationId: ci.customizationId, // Add this field
          });
        };

        userCart.forEach(addToMerged);
        guestCart.forEach(addToMerged);

        const merged = Array.from(mergedMap.values());
        setItems(merged);

        // Persist merged to user key and clear guest key
        const payload: StoredCartItem[] = merged.map(item => ({
          product: serializeProductForStorage(item.product as Product),
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          selected_type: item.selected_type,
          customizationId: item.customizationId, // Add this field
        }));

        localStorage.setItem(userKey, JSON.stringify(payload));
        localStorage.removeItem(guestKey);
      } catch (error) {
        console.error('Failed to merge guest cart into user cart:', error);
      } finally {
        previousUserIdRef.current = currentUserId;
        // Allow future saves (next render cycle)
        setTimeout(() => { skipNextSaveRef.current = false; }, 0);
        setIsCartInitialized(true);
      }
    }
  }, [user?.id, currentTenant.id]);

  // Save cart to localStorage whenever it changes (scoped to user/tenant)
  useEffect(() => {
    const saveCart = () => {
      try {
        const cartToSave: StoredCartItem[] = items.map(item => ({
          product: serializeProductForStorage(item.product as Product),
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          selected_type: item.selected_type,
          customizationId: item.customizationId // Add this field
        }));

        localStorage.setItem(currentStorageKey, JSON.stringify(cartToSave));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    };

    if (skipNextSaveRef.current) {
      // Skip one save cycle after auth scope change to avoid duplicating into user key before merge
      skipNextSaveRef.current = false;
      return;
    }

    if (items.length > 0) {
      saveCart();
    } else {
      localStorage.removeItem(currentStorageKey);
    }
  }, [items, currentStorageKey]);

  const addItem = (
    product: Product | SupabaseProduct,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string,
    selected_type?: string,
    customizationId?: string
  ) => {
    const normalizedProduct = mapSupabaseProductToAppProduct(product);
    setItems((prevItems) => {
      // Create a unique identifier including color, size, type, and customizationId to distinguish variations
      const productVariantId = `${normalizedProduct.id}-${selectedColor || ''}-${selectedSize || ''}-${selected_type || ''}-${customizationId || ''}`;
      // Find item with same id AND same color/size/type/customizationId combination
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === normalizedProduct.id && 
                 item.selectedColor === selectedColor && 
                 item.selectedSize === selectedSize &&
                 item.selected_type === selected_type &&
                 item.customizationId === customizationId
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        toast({
          title: "Cart updated",
          description: `${truncateProductName(normalizedProduct.name)} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
          action: (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate('/cart')} 
              className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 shrink-0"
            >
              Go to Cart
            </Button>
          ),
        });
        return updatedItems;
      } else {
        toast({
          title: "Item added to cart",
          description: `${truncateProductName(normalizedProduct.name)} added to your cart`,
          action: (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate('/cart')} 
              className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 shrink-0"
            >
              Go to Cart
            </Button>
          ),
        });
        return [...prevItems, { 
          product: normalizedProduct, 
          quantity,
          selectedColor,
          selectedSize,
          selected_type,
          customizationId
        }];
      }
    });
  };

  const addToCart = addItem;

  const removeItem = (productId: string, selectedColor?: string, selectedSize?: string, selected_type?: string) => {
    setItems((prevItems) => prevItems.filter(
      (item) =>
        !(item.product.id === productId &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          item.selected_type === selected_type)
    ));
  };

  const removeFromCart = removeItem;

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string, selectedSize?: string, selected_type?: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize &&
        item.selected_type === selected_type
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(currentStorageKey);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cart: items,
        cartItemsCount,
        cartTotal,
        isCartInitialized,
        addItem,
        addToCart,
        removeItem,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
