/**
 * EmailJS Configuration Module
 * 
 * This module provides a centralized place to access EmailJS credentials.
 * For production, these should be loaded from environment variables.
 * For development, you can directly set them here.
 */

// Initialize with your EmailJS credentials
// Replace these with your actual EmailJS credentials when provided
export const EMAIL_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_EMAILJS_SERVICE_ID",
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_EMAILJS_TEMPLATE_ID",
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_EMAILJS_PUBLIC_KEY",
};

/**
 * Instructions for setting up EmailJS:
 * 
 * 1. Create an account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template for order status updates with the following variables:
 *    - to_email: Customer's email address
 *    - to_name: Customer's name
 *    - order_id: Order ID (first 8 characters)
 *    - order_status: Current order status (pending, processing, etc.)
 *    - order_total: Total amount of the order
 *    - order_date: Date the order was placed
 *    - order_items_summary: Summary of ordered items
 * 
 * 4. Get your Service ID, Template ID, and Public Key from EmailJS dashboard
 * 5. Add these credentials to your environment variables:
 *    - VITE_EMAILJS_SERVICE_ID
 *    - VITE_EMAILJS_TEMPLATE_ID
 *    - VITE_EMAILJS_PUBLIC_KEY
 */ 