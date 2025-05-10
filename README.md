# <img src="https://img.icons8.com/color/48/000000/shopping-bag.png" width="32" height="32"/> HoodTi

> **Modern E-commerce Platform for Streetwear & Fashion**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![HoodTi Demo](https://placehold.co/800x400/6366f1/FFFFFF/png?text=HoodTi+E-Commerce+Platform&font=montserrat)

## 🛍️ Overview

HoodTi is a full-featured e-commerce platform built with modern web technologies. It offers a seamless shopping experience with a responsive user interface, secure authentication, robust product management, intuitive shopping cart functionality, streamlined order processing, and a comprehensive admin dashboard for store management.

<details>
<summary><b>🌟 Key Features</b></summary>

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
</details>

## 🔧 Tech Stack

<details>
<summary><b>Frontend</b></summary>

- ⚛️ React with TypeScript
- ⚡ Vite as build tool
- 🎨 TailwindCSS for styling
- 🧩 Shadcn UI components
- 🔄 React Router for navigation
- 📊 Tanstack React Query for data fetching
- 💫 Framer Motion for animations
- 📝 React Hook Form with Zod for validation
</details>

<details>
<summary><b>Backend & Database</b></summary>

- 🗃️ Supabase for authentication, database, and storage
- 🔒 PostgreSQL database with RLS policies
- 🔌 RESTful API services
</details>

<details>
<summary><b>Additional Tools</b></summary>

- 📧 EmailJS for email functionality
- 📊 Recharts for data visualization
- 🎞️ Swiper for carousels and sliders
</details>

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

<details>
<summary><b>User Roles and Permissions</b></summary>

The application uses Supabase for authentication with the following roles:

- **user**: Regular customers with access to shopping and order management
- **admin**: Store administrators with access to the admin dashboard
- **super_admin**: Full system access with additional privileges

Each role has specific permissions implemented through Supabase Row Level Security (RLS).
</details>

## 📱 Screenshots

<div align="center">
  <img src="https://placehold.co/400x225/6366f1/FFFFFF/png?text=Homepage" alt="Homepage" width="45%">
  <img src="https://placehold.co/400x225/6366f1/FFFFFF/png?text=Product+Page" alt="Product Page" width="45%">
  <img src="https://placehold.co/400x225/6366f1/FFFFFF/png?text=Shopping+Cart" alt="Shopping Cart" width="45%">
  <img src="https://placehold.co/400x225/6366f1/FFFFFF/png?text=Admin+Dashboard" alt="Admin Dashboard" width="45%">
</div>

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

<details>
<summary><b>Key directories and files</b></summary>

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
</details>

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  <img src="https://img.icons8.com/color/48/000000/shopping-bag.png" width="24" height="24"/>
  <br>
  Made with ❤️ for the modern e-commerce experience
</p> 