# <img src="https://img.icons8.com/color/48/000000/shopping-bag.png" width="32" height="32"/> HoodTi

> **Modern E-commerce Platform for Streetwear & Fashion**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![HoodTi Demo](https://placehold.co/800x400/74a180/FFFFFF/png?text=HoodTi+E-Commerce+Platform&font=montserrat)

## 🛍️ Overview

HoodTi is a full-featured e-commerce platform built with modern web technologies. It offers a seamless shopping experience with a responsive user interface, secure authentication, robust product management, intuitive shopping cart functionality, streamlined order processing, and a comprehensive admin dashboard for store management.


## 🌟 Key Features

- 🔐 **User Authentication & Authorization** - Secure login, registration, and role-based access control
- 🏬 **Product Catalog** - Browse products with filtering, sorting, and search capabilities
- 🛒 **Shopping Cart** - Add products, adjust quantities, and apply promotions
- 💳 **Checkout Process** - Streamlined checkout with delivery slot selection
- 👤 **User Accounts** - Profile management, order history, saved addresses, and wishlist
- 📊 **Admin Dashboard** - Complete store management including:
  - 📦 Inventory management
  - 📋 Order processing
  - 👥 Customer management
  - 📈 Analytics and reporting
  - 🖋️ Content management
  - 🕒 Delivery slot scheduling
- 📱 **Responsive Design** - Optimized for all device sizes
- 📧 **Email Notifications** - Order confirmations and status updates


## 🔧 Tech Stack

### Frontend
- <img src="https://img.icons8.com/color/48/000000/react-native.png" width="18" height="18"/> **React** - JavaScript library for building user interfaces
- <img src="https://img.icons8.com/color/48/000000/typescript.png" width="18" height="18"/> **TypeScript** - Typed JavaScript for better code quality
- <img src="https://vitejs.dev/logo.svg" width="18" height="18"/> **Vite** - Next-generation frontend build tool
- <img src="https://tailwindcss.com/favicons/favicon-32x32.png" width="18" height="18"/> **TailwindCSS** - Utility-first CSS framework
- <img src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon-32x32.png" width="18" height="18"/> **Shadcn UI** - Accessible component system
- <img src="https://reactrouter.com/favicon-light.png" width="18" height="18"/> **React Router** - Declarative routing for React
- <img src="https://tanstack.com/favicon.ico" width="18" height="18"/> **Tanstack React Query** - Data fetching and state management
- <img src="https://www.framer.com/images/favicon.png" width="18" height="18"/> **Framer Motion** - Animation library for React
- <img src="https://react-hook-form.com/favicon.ico" width="18" height="18"/> **React Hook Form** - Form validation with Zod schema

### Backend & Database
- <img src="https://supabase.com/favicon/favicon-32x32.png" width="18" height="18"/> **Supabase** - Open source Firebase alternative
- <img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="18" height="18"/> **PostgreSQL** - Advanced open source database
- <img src="https://img.icons8.com/color/48/000000/api-settings.png" width="18" height="18"/> **RESTful API** - Standard interface for service communication

### Additional Tools
- <img src="https://img.icons8.com/color/48/000000/email.png" width="18" height="18"/> **EmailJS** - Client-side email sending
- <img src="https://recharts.org/favicon.ico" width="18" height="18"/> **Recharts** - Redefined chart library built with React
- <img src="https://swiperjs.com/images/favicon.png" width="18" height="18"/> **Swiper** - Modern touch slider

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- Supabase account
- EmailJS account (for email notifications)

### Installation

1️⃣ **Clone the repository:**
```bash
git clone https://github.com/yourusername/hoodti.git
cd hoodti
```

2️⃣ **Install dependencies:**
```bash
npm install
# or
yarn install
```

3️⃣ **Set up environment variables:**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_USER_ID=your_emailjs_user_id
```

4️⃣ **Set up the database:**

Execute the SQL files in the root directory to set up the required tables and policies:
- `create_profiles_table.sql`
- `create_profile_trigger.sql`
- `create_settings_table.sql`
- `create_user_role_trigger.sql`
- `profiles_rls_setup.sql`
- `role_functions.sql`
- `user_roles_rls_setup.sql`

5️⃣ **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

6️⃣ **Build for production:**
```bash
npm run build
# or
yarn build
```

## 🔒 Authentication

<b>User Roles and Permissions</b>

The application uses Supabase for authentication with the following roles:

- **user**: Regular customers with access to shopping and order management
- **admin**: Store administrators with access to the admin dashboard
- **super_admin**: Full system access with additional privileges

Each role has specific permissions implemented through Supabase Row Level Security (RLS).



## 🔄 Development Workflow

<details>
<summary><b>Recommended workflow for contributors</b></summary>

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.
</details>

## 📦 Project Structure

<b>Key directories and files</b>

```
hoodti/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Application pages
│   ├── integrations/     # External service integrations
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── *.sql                 # Database setup files
├── tailwind.config.ts    # Tailwind configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies
```


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  <img src="https://img.icons8.com/color/48/000000/shopping-bag.png" width="24" height="24"/>
  <br>
  Made with ❤️ for the modern e-commerce experience
</p> 