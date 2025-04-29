# Order Status Email Notifications Setup

This document provides step-by-step instructions for setting up automatic email notifications for the (Brand) application using EmailJS.

## What's Implemented

We've integrated EmailJS to automatically send email notifications:

1. **Order Confirmation Emails** - Sent immediately when a customer places an order
2. **Order Status Update Emails** - Sent when an admin changes the status of an order

Each email includes:
- Order details (ID, date, total)
- Current status of the order
- Status-specific messaging
- List of order items
- Shipping and delivery information

## Setup Instructions

### 1. Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for an account
2. The free tier allows 200 emails per month which should be sufficient for testing

### 2. Add an Email Service

1. In your EmailJS dashboard, click on "Email Services" in the left sidebar
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Name your service (e.g., "(Brand) Notifications")
6. Copy the **Service ID** - you'll need this later

### 3. Create an Email Template

1. In your EmailJS dashboard, click on "Email Templates" in the left sidebar
2. Click "Create New Template"
3. Give your template a name (e.g., "Order Status Update")
4. Design your template using the visual editor or HTML
   - We've provided a sample template in `src/integrations/emailjs-template-example.html` that you can copy and paste
   - The template uses these dynamic variables:
     - `{{to_email}}`: Customer's email
     - `{{to_name}}`: Customer's name
     - `{{order_id}}`: Order ID 
     - `{{order_status}}`: Current status (pending, processing, etc.)
     - `{{order_total}}`: Total amount
     - `{{order_date}}`: Date the order was placed
     - `{{status_title}}`: Status-specific title
     - `{{status_message}}`: Status-specific message
     - `{{order_items_summary}}`: List of items in the order
     - `{{shipping_address}}`: Customer's shipping address (for order confirmations)
     - `{{payment_method}}`: Payment method used (for order confirmations)
     - `{{delivery_slot}}`: Delivery date and time (for order confirmations)
5. Save the template and copy the **Template ID** - you'll need this later

### 4. Get Your Public Key

1. In your EmailJS dashboard, click on "Account" in the left sidebar
2. Look for your **Public Key** in the API Keys section
3. Copy this key - you'll need it for the next step

### 5. Configure Environment Variables

Add your EmailJS credentials to the project's environment variables:

1. Create or edit `.env` file in the project root
2. Add the following variables:

```
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

3. Replace the placeholder values with your actual credentials

### 6. Test the Implementation

#### Testing Order Confirmation Emails:
1. Restart your development server to load the new environment variables
2. Log in as a customer
3. Add items to your cart
4. Complete the checkout process
5. You should receive an order confirmation email

#### Testing Order Status Update Emails:
1. Log in as an admin
2. Go to the Orders page
3. Change the status of an order
4. The customer should receive an email notification about the status change

## Troubleshooting

If emails aren't being sent:

1. Check browser console for any errors
2. Verify your EmailJS credentials are correct
3. Make sure your email service is properly connected
4. Check that your template contains all the required variables
5. Ensure your environment variables are properly loaded

## Security Considerations

- Your EmailJS public key is meant to be used in client-side code, but keep your service details private
- For a production environment, consider implementing rate limiting to prevent abuse
- Monitor your EmailJS usage to stay within your plan limits

## Additional Customization

You can customize the email notification system further by:

1. Editing the template design in EmailJS dashboard
2. Modifying the status messages in `src/integrations/email.service.ts`
3. Adding additional data to the email by updating the `templateParams` object in the email service functions

For more information, visit the [EmailJS documentation](https://www.emailjs.com/docs/). 