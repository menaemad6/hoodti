import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from './email.config';
import { BRAND_NAME } from '@/lib/constants';
import { supabase } from './supabase/client';

interface OrderStatusEmailProps {
  userEmail: string;      // Recipient email
  userName: string;       // Customer's name
  orderId: string;        // Order ID
  orderStatus: string;    // New status (pending, processing, shipping, delivered, canceled)
  orderTotal: string;     // Order total amount
  orderDate: string;      // Order date
  orderItems?: OrderEmailItem[];     // Optional order items
  subtotal?: string;      // Optional subtotal
  shippingCost?: string;  // Optional shipping cost
  taxAmount?: string;     // Optional tax amount
  discountAmount?: string; // Optional discount amount
  shippingAddress?: string; // Shipping address (optional for status updates)
  paymentMethod?: string;   // Payment method (optional for status updates)
  deliverySlot?: string;    // Delivery slot (optional for status updates)
  customerPhone?: string;   // Customer's phone number (optional)
  customerEmail?: string;   // Customer's email (might be different from recipient)
  brandName?: string;       // Store/brand name (optional)
  domain?: string;          // Tenant domain (optional)
}

interface OrderConfirmationEmailProps {
  userEmail: string;      // Recipient email
  userName: string;       // Customer's name
  orderId: string;        // Order ID
  orderTotal: string;     // Order total amount
  orderDate: string;      // Order date
  orderItems: OrderEmailItem[];      // Order items
  shippingAddress: string; // Shipping address
  paymentMethod: string;   // Payment method
  deliverySlot?: string;   // Delivery slot information (optional)
  subtotal?: string;       // Subtotal amount (optional)
  shippingCost?: string;   // Shipping cost (optional)
  taxAmount?: string;      // Tax amount (optional) 
  discountAmount?: string; // Discount amount (optional)
  customerPhone?: string;  // Customer's phone number (optional)
  customerEmail?: string;  // Customer's email (might be different from recipient)
  brandName?: string;      // Store/brand name (optional)
  domain?: string;         // Tenant domain (optional)
}

// Define an interface for order item structure
interface OrderEmailItem {
  quantity: number;
  price_at_time: number;
  products?: {
    name: string;
    price: number;
    image?: string;
  };
  selected_color?: string | null;
  selected_size?: string | null;
}

interface OrderDetails {
  shippingAddress?: string;
  paymentMethod?: string;
  deliverySlot?: string;
  customerEmail?: string;
  [key: string]: unknown; // For any other properties that might be returned
}

// Define a type for the order data from the database
interface OrderData {
  id: string;
  shipping_address?: string;
  payment_method?: string;
  delivery_slot?: string;
  email?: string;
  phone_number?: string;
  [key: string]: unknown; // For other fields
}

// Build a simple HTML table for order items that won't be escaped
const buildItemsTable = (items: OrderEmailItem[]): string => {
  if (!items || items.length === 0) {
    return '<div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px; color: #6b7280; font-size: 14px;">No items available</div>';
  }
  
  let tableHTML = `
  <div style="border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
    <!-- Header Row -->
    <div style="background-color: #f3f4f6; padding: 12px 15px; display: grid; grid-template-columns: 60% 15% 25%; font-weight: 600; color: #374151; font-size: 14px;">
      <div style="text-align: left;">Product</div>
      <div style="text-align: center;">Qty</div>
      <div style="text-align: right;">Price</div>
    </div>
  `;
  
  // Add each product as a row
  items.forEach((item, index) => {
    const name = item.products?.name || 'Product';
    const quantity = item.quantity || 1;
    const unitPrice = parseFloat(item.price_at_time?.toString() || '0');
    const totalPrice = (unitPrice * quantity).toFixed(2);
    
    // Extract color and size information
    const selectedColor = item.selected_color || null;
    const selectedSize = item.selected_size || null;
    
    // Determine if this is the last item (for border styling)
    const isLastItem = index === items.length - 1;
    const borderStyle = isLastItem ? '' : 'border-bottom: 1px solid #e5e7eb;';
    
    // Build product details with color and size if available
    let productDetails = `<div style="font-weight: 500; color: #111827;">${name}</div>`;
    if (selectedSize || selectedColor) {
      productDetails += '<div style="font-size: 12px; color: #6b7280; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">';
      if (selectedSize) {
        productDetails += `<span style="display: inline-block; background-color: #f3f4f6; padding: 3px 8px; border-radius: 15px; font-weight: 500;">Size: ${selectedSize}</span>`;
      }
      if (selectedColor) {
        // Check if it's a standard color that can be displayed directly
        const standardColors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray'];
        // Add color swatch if it's a standard color
        const colorDot = standardColors.includes(selectedColor.toLowerCase())
          ? `<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${selectedColor.toLowerCase()}; margin-right: 4px; border: 1px solid rgba(0,0,0,0.1);"></span>`
          : '';
        
        productDetails += `<span style="display: inline-block; background-color: #f3f4f6; padding: 3px 8px; border-radius: 15px; font-weight: 500;">${colorDot}Color: ${selectedColor}</span>`;
      }
      productDetails += '</div>';
    }
    
    // Create the row with elegant styling
    tableHTML += `
      <div style="padding: 15px; display: grid; grid-template-columns: 60% 15% 25%; ${borderStyle} background-color: white;">
        <div style="text-align: left;">${productDetails}</div>
        <div style="text-align: center; align-self: center; color: #4b5563;">${quantity}</div>
        <div style="text-align: right; align-self: center; font-weight: 500; color: #111827;">$${totalPrice}</div>
      </div>
    `;
  });
  
  // Close the container
  tableHTML += '</div>';
  
  return tableHTML;
};

// Function to calculate tax correctly based on subtotal - only used as a fallback
const calculateTax = (subtotal: number) => {
  // Common tax rate is around 6-8%, using 7% as default
  return subtotal * 0.07;
};

/**
 * Sends an order confirmation email to a customer when they place a new order
 * @param emailData Data needed for the order confirmation email
 * @returns Promise with the result of the email send operation
 */
export const sendOrderConfirmationEmail = async (emailData: OrderConfirmationEmailProps) => {
  try {
    // Use the exact tax amount provided, don't recalculate
    let taxAmount = emailData.taxAmount || '';
    // Only calculate tax if absolutely no tax value was provided
    if (!taxAmount && emailData.subtotal) {
      console.warn("No tax amount provided, calculating fallback tax");
      const subtotalValue = parseFloat(emailData.subtotal.replace(/[^0-9.]/g, ''));
      if (!isNaN(subtotalValue)) {
        const calculatedTax = calculateTax(subtotalValue);
        taxAmount = `$${calculatedTax.toFixed(2)}`;
      }
    }
    
    // Format order items using table HTML
    const itemsTableHTML = buildItemsTable(emailData.orderItems);
    
    // Prepare template parameters based on EmailJS template
    const templateParams = {
      to_email: emailData.userEmail,
      to_name: emailData.userName,
      order_id: emailData.orderId.slice(0, 8),
      full_order_id: emailData.orderId,
      order_total: emailData.orderTotal,
      order_date: emailData.orderDate,
      status_title: "Thank You for Your Order!",
      status_message: "We've received your order and will begin processing it shortly. You'll receive updates as your order status changes.",
      order_status: "pending", // New orders are always in pending status
      shipping_address: emailData.shippingAddress || "No shipping address provided",
      payment_method: emailData.paymentMethod || "Payment method not specified",
      delivery_slot: emailData.deliverySlot || "Standard Delivery",
      // Financial details
      subtotal: emailData.subtotal || "N/A",
      shipping_cost: emailData.shippingCost || "$0.00",
      tax_amount: taxAmount || "N/A",
      discount_amount: emailData.discountAmount || "$0.00",
      // Order items as HTML table
      order_items_formatted: itemsTableHTML,
      // Customer contact information
      customer_email: emailData.customerEmail || emailData.userEmail,
      customer_phone: emailData.customerPhone || "Not provided",
      brand_name: emailData.brandName || BRAND_NAME,
      domain: emailData.domain || (typeof window !== 'undefined' ? window.location.hostname : '')
    };

    console.log('Sending order confirmation email with params:', {
      recipient: templateParams.to_email,
      items_count: emailData.orderItems.length,
      tax_amount: templateParams.tax_amount
    });

    // Send the email using credentials from config
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.PUBLIC_KEY
    );

    console.log('Order confirmation email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
};

/**
 * Queries the database to fetch order details like shipping address and payment method
 * This is needed when sending status updates since this info might not be available
 * 
 * @param orderId The order ID to look up
 * @returns Any additional order information that was found
 */
const fetchAdditionalOrderDetails = async (orderId: string): Promise<OrderDetails> => {
  try {
    // Query the orders table to get the email address from the order itself
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
    
    // Use a more specific type for the order data
    const orderData = data as OrderData;
    
    // Return actual data from the database, checking if each field exists
    return {
      shippingAddress: orderData?.shipping_address || "",
      paymentMethod: orderData?.payment_method || "",
      deliverySlot: orderData?.delivery_slot || "",
      customerEmail: orderData?.email || "", // Get email directly from the order
    };
  } catch (error) {
    console.error(`Error fetching details for order ${orderId}:`, error);
    // Return empty values if there's an error
    return {
      shippingAddress: "",
      paymentMethod: "",
      deliverySlot: "",
      customerEmail: "",
    };
  }
};

/**
 * Sends an order status update email to a customer
 * @param emailData Data needed for the order status email
 * @returns Promise with the result of the email send operation
 */
export const sendOrderStatusEmail = async (emailData: OrderStatusEmailProps) => {
  try {
    // Get status-specific messaging
    const statusMessage = getStatusMessage(emailData.orderStatus);
    
    // Get additional order details including the customer's email from the order record
    const orderDetails = await fetchAdditionalOrderDetails(emailData.orderId);
    
    // Use the exact tax amount provided, don't recalculate
    let taxAmount = emailData.taxAmount || '';
    // Only calculate tax if absolutely no tax value was provided
    if (!taxAmount && emailData.subtotal) {
      console.warn("No tax amount provided for status update email, using fallback");
      const subtotalValue = parseFloat(emailData.subtotal.replace(/[^0-9.]/g, ''));
      if (!isNaN(subtotalValue)) {
        const calculatedTax = calculateTax(subtotalValue);
        taxAmount = `$${calculatedTax.toFixed(2)}`;
      }
    }
    
    // Format order items using table HTML
    const itemsTableHTML = buildItemsTable(emailData.orderItems || []);
    
    // Use order details if available, otherwise use what was provided in the function call
    const shippingAddress = orderDetails.shippingAddress || emailData.shippingAddress || "Please refer to your order confirmation email for shipping details";
    const paymentMethod = orderDetails.paymentMethod || emailData.paymentMethod || "Please refer to your order confirmation email for payment details";
    const deliverySlot = orderDetails.deliverySlot || emailData.deliverySlot || "Please refer to your order confirmation email for delivery details";
    
    // For the recipient email, strongly prioritize the email from the order record
    const recipientEmail = orderDetails.customerEmail || emailData.customerEmail || emailData.userEmail;
    
    console.log('Sending order status update to email:', recipientEmail);
    
    // Prepare template parameters based on EmailJS template
    const templateParams = {
      to_email: recipientEmail, // Use order's customer email instead of profile email
      to_name: emailData.userName,
      order_id: emailData.orderId.slice(0, 8),
      full_order_id: emailData.orderId, // Add full order ID for tracking link
      order_status: emailData.orderStatus,
      order_total: emailData.orderTotal,
      order_date: emailData.orderDate,
      status_title: statusMessage.title,
      status_message: statusMessage.message,
      // Use shipping and payment info if available
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      delivery_slot: deliverySlot,
      // Financial details - use provided values or defaults
      subtotal: emailData.subtotal || "N/A",
      shipping_cost: emailData.shippingCost || "$0.00",
      tax_amount: taxAmount || "N/A",
      discount_amount: emailData.discountAmount || "$0.00",
      // Order items as HTML table
      order_items_formatted: itemsTableHTML,
      // Customer contact information
      customer_email: recipientEmail, // Show same email in the email body
      customer_phone: emailData.customerPhone || "Not provided",
      brand_name: emailData.brandName || BRAND_NAME,
      domain: emailData.domain || (typeof window !== 'undefined' ? window.location.hostname : '')
    };

    // Send the email using credentials from config
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.PUBLIC_KEY
    );

    console.log('Status update email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

/**
 * Status-specific messaging to customize email content based on order status
 */
export const getStatusMessage = (status: string): { title: string, message: string } => {
  switch (status) {
    case 'pending':
      return {
        title: 'Your Order is Pending',
        message: 'We have received your order and are preparing to process it.'
      };
    case 'processing':
      return {
        title: 'Your Order is Being Processed',
        message: 'Good news! We\'re currently processing your order and preparing your items.'
      };
    case 'shipping':
      return {
        title: 'Your Order is on the Way',
        message: 'Your order has been shipped and is on its way to you!'
      };
    case 'delivered':
      return {
        title: 'Your Order has Been Delivered',
        message: 'Your order has been delivered. We hope you enjoy your purchase!'
      };
    case 'canceled':
      return {
        title: 'Your Order has Been Canceled',
        message: 'Your order has been canceled. If you did not request this cancellation, please contact our support team.'
      };
    default:
      return {
        title: 'Order Status Update',
        message: 'There has been an update to your order.'
      };
  }
}; 