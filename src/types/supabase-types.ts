import { Product as AppProduct, Category as AppCategory } from './index';
import { Product as SupabaseProduct } from '@/integrations/supabase/types.service';

// Function to convert a Supabase product to the app's Product type
export function mapSupabaseProductToAppProduct(supabaseProduct: any): AppProduct {
  if (!supabaseProduct) {
    console.error("Cannot map undefined or null product");
    return {} as AppProduct;
  }
  
  // Handle the category field properly based on its type
  let categoryField: any;
  
  if (supabaseProduct.category && typeof supabaseProduct.category === 'object') {
    categoryField = {
      id: supabaseProduct.category.id || "",
      name: supabaseProduct.category.name || "",
      description: supabaseProduct.category.description || "",
      image: supabaseProduct.category.image || "",
      created_at: supabaseProduct.category.created_at || new Date().toISOString()
    };
  } else if (typeof supabaseProduct.category === 'string') {
    categoryField = supabaseProduct.category;
  } else {
    categoryField = {
      id: "",
      name: "Uncategorized",
      description: "",
      image: "",
      created_at: new Date().toISOString()
    };
  }

  return {
    id: supabaseProduct.id || "",
    name: supabaseProduct.name || "",
    description: supabaseProduct.description || "",
    price: typeof supabaseProduct.price === 'number' ? supabaseProduct.price : 0,
    discount: supabaseProduct.discount || 0,
    images: Array.isArray(supabaseProduct.images) ? supabaseProduct.images : (supabaseProduct.images ? JSON.parse(supabaseProduct.images) : []),
    videos: Array.isArray(supabaseProduct.videos) ? supabaseProduct.videos : (supabaseProduct.videos ? JSON.parse(supabaseProduct.videos) : []),
    unit: supabaseProduct.unit || '',
    stock: typeof supabaseProduct.stock === 'number' ? supabaseProduct.stock : 0,
    featured: supabaseProduct.featured || false,
    category_id: supabaseProduct.category_id || "",
    category: categoryField,
    original_price: supabaseProduct.original_price || 0,
    is_new: supabaseProduct.is_new || false,
    // Add clothing-specific fields
    size: supabaseProduct.size || '',
    color: supabaseProduct.color || '',
    material: supabaseProduct.material || '',
    brand: supabaseProduct.brand || '',
    gender: supabaseProduct.gender || '',
    // Add compatibility properties
    originalPrice: supabaseProduct.original_price || 0,
    isNew: supabaseProduct.is_new || false,
    categoryId: supabaseProduct.category_id || (typeof supabaseProduct.category === 'object' ? supabaseProduct.category?.id : ""),
    created_at: supabaseProduct.created_at || new Date().toISOString(),
    updated_at: supabaseProduct.updated_at || new Date().toISOString()
  };
}

// Function to convert app's Product type to Supabase format
export function mapAppProductToSupabaseProduct(appProduct: Partial<AppProduct>): any {
  if (!appProduct) {
    return null;
  }
  
  return {
    id: appProduct.id,
    name: appProduct.name,
    description: appProduct.description,
    price: appProduct.price,
    discount: appProduct.discount || 0,
    images: appProduct.images,
    unit: appProduct.unit,
    stock: appProduct.stock,
    featured: appProduct.featured,
    category_id: appProduct.category_id || appProduct.categoryId || (appProduct.category && typeof appProduct.category === 'object' ? appProduct.category.id : ""),
    original_price: appProduct.original_price || appProduct.originalPrice,
    is_new: appProduct.is_new || appProduct.isNew,
    // Add clothing-specific fields
    size: appProduct.size || null,
    color: appProduct.color || null,
    material: appProduct.material || null,
    brand: appProduct.brand || null,
    gender: appProduct.gender || null,
    videos: appProduct.videos || [],
    created_at: appProduct.created_at || new Date().toISOString(),
    updated_at: appProduct.updated_at || new Date().toISOString()
  };
}

// Helper function to ensure product type compatibility - this is the key function that fixes our issues
export function ensureProductTypeCompatibility(product: any): AppProduct {
  // Check if product is undefined or null
  if (!product) {
    console.error("Product is undefined or null");
    return {} as AppProduct;
  }
  
  // Check if this is already an app product
  if (product.categoryId !== undefined || 
      product.originalPrice !== undefined || 
      product.isNew !== undefined) {
    // It's already the app's Product type
    return product as AppProduct;
  }
  
  // If it's a Supabase product format with a category object, make sure the category is in the right format
  if (product.category && typeof product.category === 'object') {
    // Ensure the category has all the required fields
    const normalizedCategory = {
      id: product.category.id || "",
      name: product.category.name || "Uncategorized",
      description: product.category.description || "",
      image: product.category.image || "",
      created_at: product.category.created_at || new Date().toISOString()
    };
    
    return {
      ...product,
      category: normalizedCategory,
      // Add compatibility properties
      categoryId: product.category_id || product.category?.id || "",
      originalPrice: product.original_price || 0,
      isNew: product.is_new || false,
      // Include clothing-specific fields
      size: product.size || '',
      color: product.color || '',
      material: product.material || '',
      brand: product.brand || '',
      gender: product.gender || '',
      videos: Array.isArray(product.videos) ? product.videos : (product.videos ? JSON.parse(product.videos) : [])
    } as AppProduct;
  }
  
  // Otherwise convert from any other product format
  return mapSupabaseProductToAppProduct(product);
}

// Reverse mapping for use with WishlistItem and ModernProductCard
export function mapAppProductToSupabaseProductForDisplay(appProduct: AppProduct): SupabaseProduct {
  if (!appProduct) {
    return {} as SupabaseProduct;
  }
  
  // Properly handle the category field
  let categoryField: any;
  
  if (appProduct.category && typeof appProduct.category === 'object') {
    categoryField = {
      id: appProduct.category.id || "",
      name: appProduct.category.name || "Uncategorized",
      description: appProduct.category.description || "",
      image: appProduct.category.image || "",
      created_at: appProduct.category.created_at || new Date().toISOString()
    };
  } else if (typeof appProduct.category === 'string') {
    categoryField = { 
      id: "", 
      name: appProduct.category, 
      description: "", 
      image: "", 
      created_at: new Date().toISOString() 
    };
  } else {
    categoryField = { 
      id: "", 
      name: "Uncategorized", 
      description: "", 
      image: "", 
      created_at: new Date().toISOString() 
    };
  }

  return {
    id: appProduct.id,
    name: appProduct.name,
    description: appProduct.description,
    price: appProduct.price,
    discount: appProduct.discount || 0,
    images: appProduct.images,
    unit: appProduct.unit,
    stock: appProduct.stock,
    featured: appProduct.featured,
    category_id: appProduct.category_id || appProduct.categoryId || (appProduct.category && typeof appProduct.category === 'object' ? appProduct.category.id : ""),
    category: categoryField,
    original_price: appProduct.original_price || appProduct.originalPrice,
    is_new: appProduct.is_new || appProduct.isNew,
    // Include clothing-specific fields
    size: appProduct.size || null,
    color: appProduct.color || null,
    material: appProduct.material || null,
    brand: appProduct.brand || null,
    gender: appProduct.gender || null,
    videos: appProduct.videos || [],
    created_at: appProduct.created_at || new Date().toISOString(),
    updated_at: appProduct.updated_at || new Date().toISOString()
  } as SupabaseProduct;
}
