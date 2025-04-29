import { supabase } from "./client";
import { Wishlist, ProductDetail } from "./types.service";

export async function addToWishlist(userId: string, productId: string) {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .insert([
        { user_id: userId, product_id: productId }
      ])
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return null;
  }
}

export async function removeFromWishlist(wishlistId: string) {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
}

export async function removeAllFromWishlist(userId: string) {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing all items from wishlist:', error);
    return false;
  }
}

export async function getUserWishlist(userId: string): Promise<Wishlist[]> {
  try {
    // First get the wishlist items
    const { data, error } = await supabase
      .from('wishlists')
      .select('id, user_id, product_id, created_at')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get all product IDs from wishlist items
    const productIds = data.map(item => item.product_id).filter(Boolean);
    
    if (productIds.length === 0) {
      return data as Wishlist[];
    }
    
    // Fetch all products in a single query
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);
    
    if (productsError) {
      console.error('Error fetching products for wishlist:', productsError);
      return data as Wishlist[];
    }
    
    // Create a map of product data by id for quick lookup
    const productsMap: Record<string, any> = {};
    if (productsData) {
      productsData.forEach(product => {
        productsMap[product.id] = product;
      });
    }
    
    // Attach product data to each wishlist item
    const wishlistItemsWithProducts = data.map(item => ({
      ...item,
      // Add a products property to each wishlist item
      products: item.product_id ? {
        id: productsMap[item.product_id]?.id || '',
        name: productsMap[item.product_id]?.name || '',
        price: typeof productsMap[item.product_id]?.price === 'number' 
          ? productsMap[item.product_id]?.price 
          : 0,
        image: productsMap[item.product_id]?.image || '',
        unit: productsMap[item.product_id]?.unit
      } : null
    })) as Wishlist[];
    
    return wishlistItemsWithProducts;
  } catch (error) {
    console.error('Error getting user wishlist:', error);
    return [];
  }
}

export async function isProductInWishlist(userId: string, productId: string) {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return { data: null, error };
  }
}

export async function getWishlistedProducts(userId: string) {
  try {
    // Get wishlist items with products
    const wishlistItems = await getUserWishlist(userId);
    
    // Extract only the products from the wishlist items
    // Ensure we're only looking at items with a products property
    return wishlistItems
      .filter(item => item.products !== undefined && item.products !== null)
      .map(item => item.products);
  } catch (error) {
    console.error('Error fetching wishlisted products:', error);
    return [];
  }
}
