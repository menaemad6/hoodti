import { Database } from "./types";

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type DeliverySlotRow = Database['public']['Tables']['delivery_slots']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type AddressRow = Database['public']['Tables']['addresses']['Row'];
export type WishlistRow = Database['public']['Tables']['wishlists']['Row'];

export type ProductDetail = {
  id: string;
  name: string;
  price: number;
  images?: string[];
  unit?: string;
  discount?: number;
  is_new?: boolean;
  original_price?: number;
  description?: string;
  size?: string;
  color?: string;
  material?: string;
  brand?: string;
  gender?: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  created_at: string;
};

export type Product = Omit<ProductRow, 'category_id'> & {
  category: Category | string;
  category_id?: string; // Adding this to ensure compatibility
};

export type DeliverySlot = DeliverySlotRow;
export type Order = OrderRow & {
  order_items?: OrderItem[];
  delivery_slots?: DeliverySlot | null;
  delivery_slot?: string; // Adding the new delivery_slot field which stores the date as string
  full_name?: string;
  email?: string;
  phone_number?: string;
  tax?: number;
  discount_amount?: number;
  shipping_amount?: number;
};

// Update OrderItem type to include products property
export type OrderItem = OrderItemRow & {
  products?: ProductDetail | null;
  selected_color?: string;
  selected_size?: string;
};

export type Profile = ProfileRow;
export type Address = AddressRow;

// Update Wishlist type to include products
export type Wishlist = WishlistRow & {
  products?: ProductDetail | null;
};

/**
 * Helper function to get category name safely from a product
 */
export function getCategoryName(product: Product | null): string {
  if (!product || !product.category) return "Uncategorized";
  
  if (typeof product.category === 'string') {
    return product.category;
  }
  
  return product.category.name || "Uncategorized";
}

/**
 * Helper function to get category ID safely from a product
 */
export function getCategoryId(product: Product | null): string {
  if (!product) return "";
  
  if (typeof product.category === 'object' && product.category) {
    return product.category.id;
  }
  
  // Access the optional category_id property
  return product.category_id || "";
}

/**
 * Helper function to ensure product type compatibility
 */
export function ensureProductTypeCompatibility(product: any): Product {
  // If the product already has a category property that is an object
  if (product.category && typeof product.category === 'object') {
    return product as Product;
  }
  
  // If the product has a category property that is a string
  if (product.category && typeof product.category === 'string') {
    return product as Product;
  }
  
  // If the product has a category_id but no category property
  if (product.category_id && !product.category) {
    return {
      ...product,
      category: {
        id: product.category_id,
        name: "Uncategorized",
        description: "",
        image: "",
        created_at: new Date().toISOString()
      },
      // Ensure clothing-specific fields are present
      size: product.size || null,
      color: product.color || null,
      material: product.material || null,
      brand: product.brand || null,
      gender: product.gender || null
    } as Product;
  }
  
  // Default fallback
  return {
    ...product,
    category: {
      id: "",
      name: "Uncategorized",
      description: "",
      image: "",
      created_at: new Date().toISOString()
    },
    // Ensure clothing-specific fields are present
    size: product.size || null,
    color: product.color || null,
    material: product.material || null,
    brand: product.brand || null,
    gender: product.gender || null
  } as Product;
}
