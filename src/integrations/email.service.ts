import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from './email.config';

interface OrderStatusEmailProps {
  userEmail: string;      // Recipient email
  userName: string;       // Customer's name
  orderId: string;        // Order ID
  orderStatus: string;    // New status (pending, processing, shipping, delivered, canceled)
  orderTotal: string;     // Order total amount
  orderDate: string;      // Order date
  orderItems?: any[];     // Optional order items
  subtotal?: string;      // Optional subtotal
  shippingCost?: string;  // Optional shipping cost
  taxAmount?: string;     // Optional tax amount
  discountAmount?: string; // Optional discount amount
  shippingAddress?: string; // Shipping address (optional for status updates)
  paymentMethod?: string;   // Payment method (optional for status updates)
  deliverySlot?: string;    // Delivery slot (optional for status updates)
  customerPhone?: string;   // Customer's phone number (optional)
  customerEmail?: string;   // Customer's email (might be different from recipient)
}

interface OrderConfirmationEmailProps {
  userEmail: string;      // Recipient email
  userName: string;       // Customer's name
  orderId: string;        // Order ID
  orderTotal: string;     // Order total amount
  orderDate: string;      // Order date
  orderItems: any[];      // Order items
  shippingAddress: string; // Shipping address
  paymentMethod: string;   // Payment method
  deliverySlot?: string;   // Delivery slot information (optional)
  subtotal?: string;       // Subtotal amount (optional)
  shippingCost?: string;   // Shipping cost (optional)
  taxAmount?: string;      // Tax amount (optional) 
  discountAmount?: string; // Discount amount (optional)
  customerPhone?: string;  // Customer's phone number (optional)
  customerEmail?: string;  // Customer's email (might be different from recipient)
}

// Build a simple HTML table for order items that won't be escaped
const buildItemsTable = (items: any[]) => {
  if (!items || items.length === 0) {
    return '<div style="text-align: center; padding: 15px 0;">No items available</div>';
  }
  
  let tableHTML = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
    <thead>
      <tr>
        <th align="left" style="padding: 10px 5px; border-bottom: 1px solid #e5e7eb; width: 60%; font-weight: 600; color: #4b5563;">Item</th>
        <th align="center" style="padding: 10px 5px; border-bottom: 1px solid #e5e7eb; width: 15%; font-weight: 600; color: #4b5563;">Qty</th>
        <th align="right" style="padding: 10px 5px; border-bottom: 1px solid #e5e7eb; width: 25%; font-weight: 600; color: #4b5563;">Price</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  items.forEach(item => {
    const name = item.products?.name || 'Product';
    const quantity = item.quantity || 1;
    const unitPrice = parseFloat(item.price_at_time?.toString() || '0');
    const totalPrice = (unitPrice * quantity).toFixed(2);
    
    tableHTML += `
      <tr>
        <td align="left" style="padding: 10px 5px; border-bottom: 1px solid #e5e7eb;">${name}</td>
        <td align="center" style="padding: 10px 5px; border-bottom: 1px solid #e5e7eb;">${quantity}</td>
        <td align="right" style="padding: 10px 5px; border-bottom: 1px solid #e5e7eb;">$${totalPrice}</td>
      </tr>
    `;
  });
  
  // Remove border from last row
  tableHTML = tableHTML.replace(/border-bottom: 1px solid #e5e7eb;([^<]*)<\/td>\s*<\/tr>\s*<\/tbody>/g, '$1</td></tr></tbody>');
  
  tableHTML += `
    </tbody>
  </table>
  `;
  
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
      customer_phone: emailData.customerPhone || "Not provided"
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
const fetchAdditionalOrderDetails = async (orderId: string): Promise<any> => {
  // In a real implementation, this would query your database
  // For now, we're returning placeholder data
  console.log(`Fetching additional details for order ${orderId}`);
  return {
    shippingAddress: "Shipping address would be fetched from database",
    paymentMethod: "Payment method would be fetched from database",
    deliverySlot: "Delivery information would be fetched from database"
  };
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
    
    // Log the tax amount for debugging
    console.log("Tax amount being used in status email:", taxAmount);
    
    // Format order items using table HTML
    const itemsTableHTML = buildItemsTable(emailData.orderItems || []);
    
    // Use shipping and payment info if provided, otherwise use generic placeholders
    const shippingAddress = emailData.shippingAddress || "Please refer to your order confirmation email for shipping details";
    const paymentMethod = emailData.paymentMethod || "Please refer to your order confirmation email for payment details";
    const deliverySlot = emailData.deliverySlot || "Please refer to your order confirmation email for delivery details";
    
    // Prepare template parameters based on EmailJS template
    const templateParams = {
      to_email: emailData.userEmail,
      to_name: emailData.userName,
      order_id: emailData.orderId.slice(0, 8),
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
      customer_email: emailData.customerEmail || emailData.userEmail,
      customer_phone: emailData.customerPhone || "Not provided"
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