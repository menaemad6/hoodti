import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModernCard from "@/components/ui/modern-card";
import { PlusCircle, ShoppingBag, Activity, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RecentOrders from "@/components/admin/RecentOrders";
import { getOrderStats } from "@/integrations/supabase/orders.service";
import { ActivityType } from "@/components/admin/dashboard/RecentActivity";

// Import refactored dashboard components
import StatCards from "@/components/admin/dashboard/StatCards";

// Lazy load components for code splitting
const RevenueChart = lazy(() => import("@/components/admin/dashboard/RevenueChart"));
const SalesChart = lazy(() => import("@/components/admin/dashboard/SalesChart"));
const QuickActions = lazy(() => import("@/components/admin/dashboard/QuickActions"));
const TopSellingProducts = lazy(() => import("@/components/admin/dashboard/TopSellingProducts"));
import ShopPerformance from "@/components/admin/dashboard/ShopPerformance";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import LowStockProducts from "@/components/admin/dashboard/LowStockProducts";

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-full min-h-[250px] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

interface RevenueDataPoint {
  month: string;
  revenue: number;
}

interface SalesDataPoint {
  name: string;
  sales: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  percentChange: number;
  image?: string;
  price?: number;
  category?: string;
}

// Sample data as fallback
const sampleRevenueData = [
  { month: "Jan", revenue: 5300 },
  { month: "Feb", revenue: 4200 },
  { month: "Mar", revenue: 3800 },
  { month: "Apr", revenue: 4900 },
  { month: "May", revenue: 5700 },
  { month: "Jun", revenue: 6200 },
  { month: "Jul", revenue: 7500 },
  { month: "Aug", revenue: 9100 },
  { month: "Sep", revenue: 8300 },
  { month: "Oct", revenue: 7600 },
  { month: "Nov", revenue: 8500 },
  { month: "Dec", revenue: 9800 },
];

const sampleSalesData = [
  { name: "Mon", sales: 40 },
  { name: "Tue", sales: 30 },
  { name: "Wed", sales: 50 },
  { name: "Thu", sales: 40 },
  { name: "Fri", sales: 70 },
  { name: "Sat", sales: 60 },
  { name: "Sun", sales: 30 },
];

const sampleTopProducts = [
  { id: 1, name: "Organic Apples", sales: 230, percentChange: 12.5, price: 4.99, category: "Fruits" },
  { id: 2, name: "Fresh Milk", sales: 185, percentChange: -4.2, price: 3.49, category: "Dairy" },
  { id: 3, name: "Whole Grain Bread", sales: 142, percentChange: 8.3, price: 5.99, category: "Bakery" },
  { id: 4, name: "Free Range Eggs", sales: 125, percentChange: 2.1, price: 6.49, category: "Dairy" },
  { id: 5, name: "Organic Spinach", sales: 98, percentChange: 5.7, price: 3.29, category: "Vegetables" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>(sampleRevenueData);
  const [salesData, setWeeklySalesData] = useState<SalesDataPoint[]>(sampleSalesData);
  const [topSellingProducts, setTopSellingProducts] = useState<TopProduct[]>(sampleTopProducts);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setIsLoading(true);
      try {
        // Single query to get counts
        const [
          { count: productCount },
          { count: userCount },
          { data: ordersData }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('id, created_at, total, status')
        ]);

        // Process orders data for multiple stats at once
        const completedOrders = ordersData?.filter(order => 
          ['completed', 'delivered'].includes(order.status)
        ) || [];
        
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = ordersData?.length || 0;

        // Set the main dashboard stats
        setStats({
          totalRevenue,
          totalOrders,
          totalProducts: productCount || 0,
          totalCustomers: userCount || 0,
        });

        // Process monthly revenue data
        const currentYear = new Date().getFullYear();
        const monthlyOrders = completedOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getFullYear() === currentYear;
        });
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue: { [key: string]: number } = {};
        
        // Initialize all months with 0
        monthNames.forEach(month => {
          monthlyRevenue[month] = 0;
        });
        
        // Fill in actual data
        if (monthlyOrders && monthlyOrders.length > 0) {
          monthlyOrders.forEach(order => {
            const date = new Date(order.created_at);
            const month = monthNames[date.getMonth()];
            monthlyRevenue[month] += order.total || 0;
          });
        }
        
        // Convert to chart data format
        const realRevenueData = monthNames.map(month => ({
          month,
          revenue: Math.round(monthlyRevenue[month])
        }));
        
        // Use real data if available
        if (realRevenueData.some(item => item.revenue > 0)) {
          setRevenueData(realRevenueData);
        }
        
        // Process weekly sales data
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const weeklyOrders = ordersData?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= startOfWeek && orderDate <= endOfWeek;
        }) || [];
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailySales: { [key: string]: number } = {};
        
        // Initialize all days with 0
        dayNames.forEach(day => {
          dailySales[day] = 0;
        });
        
        // Fill in actual data - count orders per day
        if (weeklyOrders.length > 0) {
          weeklyOrders.forEach(order => {
            const date = new Date(order.created_at);
            const day = dayNames[date.getDay()];
            dailySales[day] += 1;
          });
        }
        
        // Convert to chart data format
        const realWeeklySalesData = dayNames.map(day => ({
          name: day,
          sales: dailySales[day]
        }));
        
        // Use real data if available
        if (realWeeklySalesData.some(item => item.sales > 0)) {
          setWeeklySalesData(realWeeklySalesData);
        }
        
        // Fetch top selling products data
        try {
          // First get order items with quantity and product ID
          const { data: orderItemsData, error: orderItemsError } = await supabase
            .from('order_items')
            .select('product_id, quantity');
          
          if (orderItemsError) throw orderItemsError;
          
          if (orderItemsData && orderItemsData.length > 0) {
            // Calculate total sales per product
            const productSalesMap: Record<string, number> = {};
            orderItemsData.forEach(item => {
              if (item.product_id) {
                const productId = String(item.product_id);
                productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
              }
            });
            
            // Get product IDs with sales - ensure they're strings for UUID compatibility
            const productIds = Object.keys(productSalesMap).filter(id => id && id !== "null" && id !== "undefined");
            
            if (productIds.length > 0) {
              // Fetch product details for these products
              const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
                  id, 
                  name, 
                  price, 
                  image,
                  categories:category_id (name)
                `)
                .in('id', productIds);
              
              if (productsError) throw productsError;
              
              if (productsData && productsData.length > 0) {
                // Combine sales data with product details
                const productsWithSales = productsData.map(product => ({
                  id: Number(product.id) || 0, // Ensure it's a number to match TopProduct interface
                  name: product.name,
                  sales: productSalesMap[String(product.id)] || 0,
                  percentChange: Math.random() > 0.5 ? 
                    Math.round(Math.random() * 15 * 10) / 10 : 
                    -Math.round(Math.random() * 10 * 10) / 10,
                  image: product.image,
                  price: product.price,
                  category: product.categories?.name || 'Uncategorized'
                }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);
                
                if (productsWithSales.length > 0) {
                  setTopSellingProducts(productsWithSales);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching top products:', error);
          // Keep using the sample data (already set in state)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Already using fallback data from initial state
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllDashboardData();
  }, []);

  // Loading state component
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 md:gap-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>Back to Store</Button>
            <Button onClick={() => navigate('/admin/products/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

        <StatCards stats={stats} isLoading={false} />

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          <div className="md:col-span-1 lg:col-span-2 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <RevenueChart data={revenueData} />
            </Suspense>
          </div>
          <div className="overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <QuickActions />
            </Suspense>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          <div className="md:col-span-1 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <SalesChart data={salesData} />
            </Suspense>
          </div>
          <div className="md:col-span-1 lg:col-span-2 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <TopSellingProducts products={topSellingProducts} />
            </Suspense>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
