# HoodTi - E-commerce Platform

HoodTi is a modern full-stack e-commerce platform specializing in streetwear and fashion products. It features a responsive user interface, secure authentication, product management, shopping cart functionality, order processing, and a comprehensive admin dashboard for store management.

## 🚀 Features

- **User Authentication & Authorization**: Secure login, registration, and role-based access control
- **Product Catalog**: Browse products with filtering, sorting, and search capabilities
- **Shopping Cart**: Add products, adjust quantities, and apply promotions
- **Checkout Process**: Streamlined checkout with delivery slot selection
- **User Accounts**: Profile management, order history, saved addresses, and wishlist
- **Admin Dashboard**: Complete store management including:
  - Inventory management
  - Order processing
  - Customer management
  - Analytics and reporting
  - Content management
  - Delivery slot scheduling
- **Responsive Design**: Optimized for all device sizes
- **Email Notifications**: Order confirmations and status updates

## 🛠️ Tech Stack

- **Frontend**:
  - React with TypeScript
  - Vite as build tool
  - TailwindCSS for styling
  - Shadcn UI components
  - React Router for navigation
  - Tanstack React Query for data fetching
  - Framer Motion for animations
  - React Hook Form with Zod for validation

- **Backend & Database**:
  - Supabase for authentication, database, and storage
  - PostgreSQL database with RLS policies
  - RESTful API services

- **Additional Tools**:
  - EmailJS for email functionality
  - Recharts for data visualization
  - Swiper for carousels and sliders

## 📋 Prerequisites

- Node.js 16.x or higher
- Supabase account
- EmailJS account (for email notifications)

## 🚩 Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/hoodti.git
cd hoodti
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_USER_ID=your_emailjs_user_id
```

4. **Set up the database**

Execute the SQL files in the root directory to set up the required tables and policies:
- `create_profiles_table.sql`
- `create_profile_trigger.sql`
- `create_settings_table.sql`
- `create_user_role_trigger.sql`
- `profiles_rls_setup.sql`
- `role_functions.sql`
- `user_roles_rls_setup.sql`

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

6. **Build for production**

```bash
npm run build
# or
yarn build
```

## 🔒 Authentication

The application uses Supabase for authentication with the following roles:
- **user**: Regular customers
- **admin**: Store administrators
- **super_admin**: Full system access

## 🔄 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 