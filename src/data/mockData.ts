import { Category, DeliverySlot } from "@/types";
import { generateRandomId } from "@/lib/utils";

export const mockProducts = [
  {
    id: "1",
    name: "Organic Bananas",
    description: "Fresh, locally sourced organic bananas.",
    price: 0.79,
    image: "/images/products/banana.png",
    unit: "per lb",
    category_id: "1",
    stock: 50,
    featured: true,
    discount: 0,
    is_new: true,
    original_price: 0.99,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Organic Strawberries",
    description: "Sweet and juicy organic strawberries.",
    price: 3.99,
    image: "/images/products/strawberry.png",
    unit: "per lb",
    category_id: "1",
    stock: 30,
    featured: true,
    discount: 10,
    is_new: true,
    original_price: 4.99,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "3",
    name: "Organic Blueberries",
    description: "Plump and flavorful organic blueberries.",
    price: 4.99,
    image: "/images/products/blueberry.png",
    unit: "per lb",
    category_id: "1",
    stock: 40,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 4.99,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "4",
    name: "Organic Apples",
    description: "Crisp and delicious organic apples.",
    price: 1.49,
    image: "/images/products/apple.png",
    unit: "per lb",
    category_id: "1",
    stock: 60,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 1.49,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "5",
    name: "Organic Oranges",
    description: "Juicy and refreshing organic oranges.",
    price: 1.99,
    image: "/images/products/orange.png",
    unit: "per lb",
    category_id: "1",
    stock: 55,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 1.99,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "6",
    name: "Organic Carrots",
    description: "Crunchy and sweet organic carrots.",
    price: 0.99,
    image: "/images/products/carrot.png",
    unit: "per lb",
    category_id: "2",
    stock: 45,
    featured: true,
    discount: 0,
    is_new: true,
    original_price: 0.99,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "7",
    name: "Organic Broccoli",
    description: "Nutritious and fresh organic broccoli.",
    price: 2.49,
    image: "/images/products/broccoli.png",
    unit: "per lb",
    category_id: "2",
    stock: 35,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 2.49,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "8",
    name: "Organic Spinach",
    description: "Tender and healthy organic spinach.",
    price: 2.99,
    image: "/images/products/spinach.png",
    unit: "per lb",
    category_id: "2",
    stock: 40,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 2.99,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "9",
    name: "Organic Potatoes",
    description: "Versatile and hearty organic potatoes.",
    price: 0.79,
    image: "/images/products/potato.png",
    unit: "per lb",
    category_id: "2",
    stock: 50,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 0.79,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "10",
    name: "Organic Onions",
    description: "Flavorful and aromatic organic onions.",
    price: 0.69,
    image: "/images/products/onion.png",
    unit: "per lb",
    category_id: "2",
    stock: 55,
    featured: false,
    discount: 0,
    is_new: false,
    original_price: 0.69,
    created_at: "2024-03-01T10:00:00.000Z",
    updated_at: "2024-03-01T10:00:00.000Z",
  },
];

export const categories: Category[] = [
  {
    id: "c1",
    name: "Vegetables",
    image: "/images/categories/vegetables.jpg",
    description: "Fresh vegetables locally sourced"
  },
  {
    id: "c2",
    name: "Fruits",
    image: "/images/categories/fruits.jpg",
    description: "Fresh fruits from organic farms"
  },
  {
    id: "c3",
    name: "Dairy",
    image: "/images/categories/dairy.jpg",
    description: "Fresh dairy products"
  },
  {
    id: "c4",
    name: "Meat",
    image: "/images/categories/meat.jpg",
    description: "Premium quality meats"
  },
  {
    id: "c5",
    name: "Bakery",
    image: "/images/categories/bakery.jpg",
    description: "Freshly baked goods every day"
  },
  {
    id: "c6",
    name: "Beverages",
    image: "/images/categories/beverages.jpg",
    description: "Refreshing drinks for every taste"
  }
];

export const deliverySlots: DeliverySlot[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    time_slot: "9:00 AM - 11:00 AM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    time_slot: "11:00 AM - 1:00 PM",
    available: false
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    time_slot: "2:00 PM - 4:00 PM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    time_slot: "4:00 PM - 6:00 PM",
    available: true
  },
  
  {
    id: "00000000-0000-0000-0000-000000000005",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time_slot: "9:00 AM - 11:00 AM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time_slot: "11:00 AM - 1:00 PM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time_slot: "2:00 PM - 4:00 PM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time_slot: "4:00 PM - 6:00 PM",
    available: true
  },
  
  {
    id: "00000000-0000-0000-0000-000000000009",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time_slot: "9:00 AM - 11:00 AM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time_slot: "11:00 AM - 1:00 PM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time_slot: "2:00 PM - 4:00 PM",
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time_slot: "4:00 PM - 6:00 PM",
    available: true
  }
];
