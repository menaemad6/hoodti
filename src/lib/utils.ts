import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Product } from "@/types";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import { mapSupabaseProductToAppProduct } from "@/types/supabase-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: "EGP" | "USD" | "EUR" | "GBP" | "BDT";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) {
  const { currency = "EGP", notation = "compact" } = options;

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  if (currency === "EGP") {
    // Show as '654 EGP'
    return `${numericPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })} EGP`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function convertSupabaseProductToAppProduct(product: any): Product {
  if (!product) return {} as Product;
  
  let categoryField: any;
  
  if (typeof product.category === 'object' && product.category !== null) {
    categoryField = {
      id: product.category.id || "",
      name: product.category.name || "",
      description: product.category.description || "",
      image: product.category.image || "",
      created_at: product.category.created_at || new Date().toISOString()
    };
  } else if (typeof product.category === 'string') {
    categoryField = product.category;
  } else {
    categoryField = {
      id: "",
      name: "",
      description: "",
      image: "",
      created_at: new Date().toISOString()
    };
  }
  
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discount: product.discount || 0,
    images: Array.isArray(product.images) ? product.images : (product.images ? JSON.parse(product.images) : []),
    unit: product.unit,
    stock: product.stock,
    featured: product.featured || false,
    category_id: product.category_id || "",
    category: categoryField,
    original_price: product.original_price,
    is_new: product.is_new || false,
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString()
  };
}

export function generateRandomId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

export function ensureProductTypeCompatibility(product: Product | SupabaseProduct | any): Product {
  // First check if product is undefined or null
  if (!product) {
    console.error("Product is undefined or null");
    return {} as Product;
  }
  
  // Check if this is already a normalized App product with expected properties
  if ('isNew' in product || 'originalPrice' in product || 
      (product.category && typeof product.category === 'string')) {
    return product as Product;
  }
  
  // Convert from Supabase product to App product format
  return mapSupabaseProductToAppProduct(product);
}
