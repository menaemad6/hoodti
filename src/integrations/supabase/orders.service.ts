import { supabase } from "./client";
import { Order, OrderItem, ProductDetail } from "./types.service";
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

export async function getOrdersWithItems(userId?: string, forAdminView: boolean = false, tenantId?: string) {
  try {
    // Build the base query
    let baseQuery = supabase
      .from('orders')
      .select(`
        *,
        order_items!order_items_order_id_fkey(
          id, 
          quantity, 
          price_at_time,
          product_id,
          customization_id,
          selected_color,
          selected_size,
          selected_type,
          product:products!order_items_product_id_fkey(
            id,
            name,
            price,
            images,
            unit,
            description
          ),
          customization:customizations!order_items_customization_id_fkey(
            id,
            base_product_type,
            base_product_size,
            base_product_color,
            design_data,
            total_customization_cost,
            preview_image_url
          )
        )
      `);
    
    // Apply filters
    if (tenantId) {
      baseQuery = baseQuery.eq('tenant_id', tenantId);
    }
    
    if (userId && !forAdminView) {
      baseQuery = baseQuery.eq('user_id', userId);
    }
    
    const { data, error } = await baseQuery.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
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

export async function getOrderItemsWithProducts(orderId: string, tenantId?: string) {
  try {
    let query = supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        price_at_time,
        product_id,
        customization_id,
        selected_color,
        selected_size,
        selected_type,
        product:products!order_items_product_id_fkey(
          id,
          name,
          price,
          images,
          unit,
          description
        ),
        customization:customizations!order_items_customization_id_fkey(
          id,
          base_product_type,
          base_product_size,
          base_product_color,
          design_data,
          total_customization_cost,
          preview_image_url
        )
      `)
      .eq('order_id', orderId);
    
    if (tenantId) {
      // Filter by tenant through the order
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .single();
      
      if (!order) {
        return [];
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting order items with products:', error);
    return [];
  }
}

export async function getOrderStats(tenantId?: string) {
  try {
    console.log('Getting order stats for tenant:', tenantId);
    
    // Build base query
    let ordersQuery = supabase.from('orders');
    
    // Add tenant filter if provided
    if (tenantId) {
      ordersQuery = ordersQuery.eq('tenant_id', tenantId);
    }
    
    // Get total number of orders
    const { count: totalOrders, error: ordersError } = await ordersQuery
      .select('*', { count: 'exact', head: true });
    
    if (ordersError) {
      console.error('Error getting orders count:', ordersError);
      throw ordersError;
    }
    
    console.log('Total orders found:', totalOrders);
    
    // Get total revenue - only if there are orders
    let totalRevenue = 0;
    if (totalOrders && totalOrders > 0) {
      const { data: orderData, error: revenueError } = await ordersQuery
        .select('total');
      
      if (revenueError) {
        console.error('Error getting revenue data:', revenueError);
        throw revenueError;
      }
      
      totalRevenue = orderData.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total?.toString() || '0');
        return sum + orderTotal;
      }, 0);
    }
    
    console.log('Total revenue calculated:', totalRevenue);
    
    // Get customers count (distinct user_ids) - only if there are orders
    let uniqueCustomers = 0;
    if (totalOrders && totalOrders > 0) {
      const { data: customers, error: customersError } = await ordersQuery
        .select('user_id')
        .limit(1000);
      
      if (customersError) {
        console.error('Error getting customers data:', customersError);
        throw customersError;
      }
      
      uniqueCustomers = new Set(customers.map(order => order.user_id).filter(Boolean)).size;
    }
    
    console.log('Unique customers found:', uniqueCustomers);
    
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

export async function getRecentOrders(limit = 5, forAdminView: boolean = false, tenantId?: string) {
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
    
    // Add tenant filter if provided
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
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
  tenant_id?: string; // Add tenant_id parameter
  items: {
    product_id: string | null; // Make nullable for customized products
    customization_id?: string | null; // Add this field
    quantity: number;
    price_at_time: number;
    selected_color?: string;
    selected_size?: string;
    selected_type?: string;
  }[];
}, pointsRedeemed: boolean = false) {
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

    // Get tenant ID from parameter or default to 'hoodti' if not provided
    // Note: localStorage is not available in server-side code
    const tenant_id = orderData.tenant_id || 'hoodti';
    
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
        full_name: orderData.full_name,
        tenant_id: tenant_id // Add tenant_id to the order
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id, // This can be null for customized products
      customization_id: item.customization_id, // Add this field
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      selected_color: item.selected_color,
      selected_size: item.selected_size,
      selected_type: item.selected_type
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Add points to user if points system is enabled for this tenant and points weren't already redeemed
    if (!pointsRedeemed) {
      try {
        const { addUserPoints } = await import('./profiles.service');
        const { getProductPoints } = await import('./settings.service');
        const { getTenantById } = await import('@/lib/tenants');
        
        // Get tenant configuration
        const tenant = getTenantById(tenant_id);
        
        if (tenant?.pointsSystem) {
          // Get points per product from settings
          const pointsPerProduct = await getProductPoints(tenant_id);
          
          // Calculate total points to award (points per product * number of products)
          const totalProducts = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
          const pointsToAward = pointsPerProduct * totalProducts;
          
          // Add points to user
          await addUserPoints(orderData.user_id, tenant_id, pointsToAward);
          
          console.log(`Awarded ${pointsToAward} points to user ${orderData.user_id} for order ${order.id}`);
        }
      } catch (pointsError) {
        // Don't fail the order creation if points awarding fails
        console.error('Error awarding points for order:', pointsError);
      }
    } else {
      console.log('Skipping points awarding because points were already redeemed for this order');
    }
    
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
