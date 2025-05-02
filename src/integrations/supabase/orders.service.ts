import { supabase } from "./client";
import { Order, OrderItem, ProductDetail } from "./types.service";
import { getBaseSlotId } from './delivery.service';
import { format } from "date-fns";

export async function getOrders(userId?: string) {
  try {
    let query = supabase
      .from('orders')
      .select('*');
      
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export async function getOrdersWithItems(userId?: string, forAdminView: boolean = false) {
  try {
    // If viewing as admin and no specific userId is provided, don't filter by user_id
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items!order_items_order_id_fkey(
          id, 
          quantity, 
          price_at_time,
          product_id,
          selected_color,
          selected_size
        )
      `);
      
    // Only filter by user_id if it's provided and we're not in admin view
    if (userId && !forAdminView) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // If we have order data, append product information to each order item
    if (data && data.length > 0) {
      for (const order of data) {
        if (order.order_items && order.order_items.length > 0) {
          // Get all product IDs from order items
          const productIds = order.order_items
            .map(item => item.product_id)
            .filter(Boolean); // Filter out null/undefined
          
          if (productIds.length > 0) {
            // Fetch all products in a single query
            const { data: productsData } = await supabase
              .from('products')
              .select('id, name, price, image, unit')
              .in('id', productIds);
            
            // Create a map of product data by id for quick lookup
            const productsMap: Record<string, any> = {};
            if (productsData) {
              productsData.forEach(product => {
                productsMap[product.id] = product;
              });
            }
            
            // Attach product data to each order item
            order.order_items = order.order_items.map(item => ({
              ...item,
              products: item.product_id ? {
                id: productsMap[item.product_id]?.id || '',
                name: productsMap[item.product_id]?.name || '',
                price: typeof productsMap[item.product_id]?.price === 'number' 
                  ? productsMap[item.product_id]?.price 
                  : 0,
                image: productsMap[item.product_id]?.image || '',
                unit: productsMap[item.product_id]?.unit
              } : null
            }));
          }
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error getting orders with items:', error);
    return [];
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        delivery_slots(*)
      `)
      .eq('id', orderId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return null;
  }
}

export async function getOrderItemsWithProducts(orderId: string) {
  try {
    // First get the order items
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price_at_time,
        selected_color,
        selected_size
      `)
      .eq('order_id', orderId);
    
    if (error) {
      throw error;
    }
    
    // If no product_id is present in any items, return early
    if (!data.some(item => item.product_id)) {
      return data as OrderItem[];
    }
    
    // Get all product IDs from order items
    const productIds = data
      .map(item => item.product_id)
      .filter(Boolean); // Filter out null/undefined
    
    // Fetch all products in a single query for better performance
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image, unit')
      .in('id', productIds);
      
    if (productsError) {
      console.error('Error fetching products:', productsError);
    }
    
    // Create a map of product data by id for quick lookup
    const productsMap: Record<string, ProductDetail> = {};
    if (productsData) {
      productsData.forEach(product => {
        productsMap[product.id] = {
          id: product.id,
          name: product.name,
          price: typeof product.price === 'number' ? product.price : 0,
          image: product.image || '',
          unit: product.unit
        };
      });
    }
    
    // Attach product data to each order item
    const orderItemsWithProducts = data.map(item => ({
      ...item,
      products: item.product_id ? productsMap[item.product_id] || null : null
    })) as OrderItem[];
    
    return orderItemsWithProducts;
  } catch (error) {
    console.error('Error getting order items with products:', error);
    return [];
  }
}

export async function getOrderStats() {
  try {
    // Get total number of orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (ordersError) throw ordersError;
    
    // Get total revenue
    const { data: orderData, error: revenueError } = await supabase
      .from('orders')
      .select('total');
    
    if (revenueError) throw revenueError;
    
    const totalRevenue = orderData.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    
    // Get customers count (distinct user_ids)
    const { data: customers, error: customersError } = await supabase
      .from('orders')
      .select('user_id')
      .limit(1000);
    
    if (customersError) throw customersError;
    
    const uniqueCustomers = new Set(customers.map(order => order.user_id)).size;
    
    return {
      totalOrders: totalOrders || 0,
      totalRevenue,
      uniqueCustomers
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      uniqueCustomers: 0
    };
  }
}

export async function getRecentOrders(limit = 5, forAdminView: boolean = false) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total,
        user_id,
        order_items!order_items_order_id_fkey(
          id,
          quantity,
          price_at_time,
          product_id
        )
      `);
    
    // Only filter by user_id if we're not in admin view
    if (!forAdminView) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        query = query.eq('user_id', user.id);
      }
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting recent orders:', error);
    return [];
  }
}

export async function createOrder(orderData: {
  user_id: string;
  total: number;
  status: string;
  address_id?: string;
  delivery_slot_id?: string; // We'll still accept this for backward compatibility
  shipping_address?: string;
  billing_address?: string;
  payment_method?: string;
  order_notes?: string;
  tax?: number;
  discount_amount?: number;
  shipping_amount?: number;
  email?: string;
  phone_number?: string;
  full_name?: string;
  items: {
    product_id: string;
    quantity: number;
    price_at_time: number;
    selected_color?: string;
    selected_size?: string;
  }[];
}) {
  try {
    // Extract date and time slot from the composite slot ID (format: "YYYY-MM-DD_TimeSlot")
    let deliverySlot = null;
    if (orderData.delivery_slot_id) {
      const [dateStr, timeSlot] = orderData.delivery_slot_id.split('_');
      if (dateStr && timeSlot) {
        // Create formatted delivery info: "2024-03-20 | 9:00 AM - 11:00 AM"
        deliverySlot = `${dateStr} | ${timeSlot}`;
      }
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        total: parseFloat(orderData.total.toFixed(2)),
        status: orderData.status,
        address_id: orderData.address_id,
        delivery_slot: deliverySlot, // Use the combined date and time slot
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        payment_method: orderData.payment_method,
        order_notes: orderData.order_notes,
        tax: orderData.tax !== undefined ? parseFloat(Number(orderData.tax).toFixed(2)) : null,
        discount_amount: orderData.discount_amount !== undefined ? parseFloat(Number(orderData.discount_amount).toFixed(2)) : null,
        shipping_amount: orderData.shipping_amount !== undefined ? parseFloat(Number(orderData.shipping_amount).toFixed(2)) : null,
        email: orderData.email,
        phone_number: orderData.phone_number,
        full_name: orderData.full_name
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      selected_color: item.selected_color,
      selected_size: item.selected_size
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
