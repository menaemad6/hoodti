import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TenantProvider } from "@/context/TenantContext";
import AuthRoute from "@/components/auth/AuthRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/ui/spinner";
import ScrollToTop from "@/components/layout/ScrollToTop";
import MusicPlayer from "@/components/ui/music-player";

// Lazy-loaded components
const Index = lazy(() => import("@/pages/Index"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const Account = lazy(() => import("@/pages/Account"));
const Addresses = lazy(() => import("@/pages/account/Addresses"));
const Orders = lazy(() => import("@/pages/account/Orders"));
const OrderDetail = lazy(() => import("@/pages/account/OrderDetail"));
const Wishlist = lazy(() => import("@/pages/account/Wishlist"));
const Signin = lazy(() => import("@/pages/auth/Signin"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Callback = lazy(() => import("@/pages/auth/Callback"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Products = lazy(() => import("@/pages/admin/Products"));
const ProductEdit = lazy(() => import("@/pages/admin/ProductEdit"));
const Customers = lazy(() => import("@/pages/admin/Customers"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const Reports = lazy(() => import("@/pages/admin/Reports"));
const Categories = lazy(() => import("@/pages/Categories"));
const Deals = lazy(() => import("@/pages/Deals"));
const Content = lazy(() => import("@/pages/admin/Content"));
const Users = lazy(() => import("@/pages/admin/Users"));
const DeliverySlots = lazy(() => import("@/pages/admin/DeliverySlots"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <TenantProvider>
            <AuthProvider>
              <CartProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/category/:id" element={<CategoryDetail />} />
                  <Route path="/categories/:id" element={<CategoryDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/cart" element={<Cart />} />
                  
                  {/* Auth routes */}
                  <Route element={<AuthRoute />}>
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/auth/signin" element={<Signin />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<Callback />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/callback" element={<Callback />} />
                  </Route>
                  
                  {/* Protected user routes */}
                  <Route element={<ProtectedRoute requiredRole="user" />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/account/addresses" element={<Addresses />} />
                    <Route path="/account/orders" element={<Orders />} />
                    <Route path="/account/orders/:id" element={<OrderDetail />} />
                    <Route path="/account/wishlist" element={<Wishlist />} />
                  </Route>
                  
                  {/* Admin routes */}
                  <Route element={<ProtectedRoute requiredRole={["admin", "super_admin"]} />}>
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/products" element={<Products />} />
                    <Route path="/admin/products/new" element={<ProductEdit />} />
                    <Route path="/admin/products/edit/:id" element={<ProductEdit />} />
                    <Route path="/admin/customers" element={<Customers />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/reports" element={<Reports />} />
                    <Route path="/admin/content" element={<Content />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/delivery-slots" element={<DeliverySlots />} />
                  </Route>
                  
                  {/* Catch-all/404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              {/* Global background music player (needs Tenant context) */}
              <MusicPlayer />
            </CartProvider>
          </AuthProvider>
          </TenantProvider>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
