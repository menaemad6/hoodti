export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  unit: string;
  category_id: string;
  stock: number;
  featured: boolean;
  discount: number;
  is_new: boolean;
  original_price: number;
  created_at: string;
  updated_at: string;
  // New clothing-specific fields
  size?: string;
  color?: string;
  material?: string;
  brand?: string;
  gender?: string;
  // Add properties to make compatible with Supabase type
  category?: {
    id: string;
    name: string;
    image: string;
    description: string;
    created_at?: string;
  } | string;
  isNew?: boolean;
  originalPrice?: number;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipping" | "delivered";
  address: Address;
  createdAt: Date;
  deliverySlot?: DeliverySlot;
}

export interface DeliverySlot {
  id: string;
  date: Date;
  time_slot: string;
  available: boolean;
}
