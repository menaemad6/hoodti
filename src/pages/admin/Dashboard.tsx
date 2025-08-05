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
import { useCurrentTenant } from "@/context/TenantContext";

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
  images?: string[];
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  images?: string[];
}

interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  time: string;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentTenant = useCurrentTenant();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>(sampleRevenueData);
  const [salesData, setWeeklySalesData] = useState<SalesDataPoint[]>(sampleSalesData);
  const [topSellingProducts, setTopSellingProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        
        
        // Fetch each stat separately with proper error handling
        let ordersStats = { totalOrders: 0, totalRevenue: 0, uniqueCustomers: 0 };
        let productsCount = 0;
        let customersCount = 0;
        let topProductsData: any[] = [];
        let lowStockData: any[] = [];
        let activitiesData: any[] = [];

        try {
          // Direct query to get orders count for the tenant
          const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', currentTenant.id);
          
          if (error) throw error;
          
          // Get total revenue
          const { data: orderData, error: revenueError } = await supabase
            .from('orders')
            .select('total')
            .eq('tenant_id', currentTenant.id);
          
          if (revenueError) throw revenueError;
          
          const totalRevenue = orderData?.reduce((sum, order) => {
            const orderTotal = parseFloat(order.total?.toString() || '0');
            return sum + orderTotal;
          }, 0) || 0;
          
          // Get unique customers
          const { data: customers, error: customersError } = await supabase
            .from('orders')
            .select('user_id')
            .eq('tenant_id', currentTenant.id);
          
          if (customersError) throw customersError;
          
          const uniqueCustomers = new Set(customers?.map(order => order.user_id).filter(Boolean)).size;
          
          ordersStats = {
            totalOrders: count || 0,
            totalRevenue,
            uniqueCustomers
          };
          

        } catch (error) {
          console.error('Error fetching orders stats:', error);
        }

        try {
          const { count, error } = await supabase
            .from('products')
            .select('', { count: 'exact', head: true })
            .eq('tenant_id', currentTenant.id);
          
          if (error) throw error;
          productsCount = count || 0;

        } catch (error) {
          console.error('Error fetching products count:', error);
        }

        try {
          const { count, error } = await supabase
            .from('profiles')
            .select('', { count: 'exact', head: true })
            .eq('tenant_id', currentTenant.id);

          
          if (error) throw error;
          customersCount = count || 0;
        } catch (error) {
          console.error('Error fetching customers count:', error);
        }

        try {
          // Simplified top products query
          const { data, error } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .order('quantity', { ascending: false })
            .limit(20);
          
          if (error) throw error;
          topProductsData = data || [];
        } catch (error) {
          console.error('Error fetching top products:', error);
        }

        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, name, stock, images')
            .eq('tenant_id', currentTenant.id)
            .lte('stock', 10)
            .order('stock', { ascending: true })
            .limit(5);
          
          if (error) throw error;
          lowStockData = data || [];
        } catch (error) {
          console.error('Error fetching low stock products:', error);
        }

        try {
          const { data, error } = await supabase
            .from('orders')
            .select('id, created_at, status, total')
            .eq('tenant_id', currentTenant.id)
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (error) throw error;
          activitiesData = data || [];
        } catch (error) {
          console.error('Error fetching activities:', error);
        }


        setStats({
          totalRevenue: ordersStats.totalRevenue || 0,
          totalOrders: ordersStats.totalOrders || 0,
          totalProducts: productsCount,
          totalCustomers: customersCount,
        });

        // Process top selling products - simplified
        if (topProductsData.length > 0) {
          const productSales: Record<string, TopProduct> = {};
          
          // Get unique product IDs
          const productIds = [...new Set(topProductsData.map(item => item.product_id).filter(Boolean))];
          
          if (productIds.length > 0) {
            try {
              // Fetch product details separately
              const { data: productsData, error } = await supabase
                .from('products')
                .select('id, name, price, images')
                .in('id', productIds)
                .eq('tenant_id', currentTenant.id);
              
              if (!error && productsData) {
                const productsMap: Record<string, any> = {};
                productsData.forEach(product => {
                  productsMap[product.id] = product;
                });

                // Calculate sales for each product
                topProductsData.forEach(item => {
                  const productId = item.product_id;
                  const product = productsMap[productId];
                  
                  if (productId && product) {
                    if (!productSales[productId]) {
                      productSales[productId] = {
                        id: parseInt(productId) || 0,
                        name: product.name,
                        sales: 0,
                        percentChange: Math.random() * 20 - 10,
                        price: product.price,
                        category: 'General',
                        images: Array.isArray(product.images) ? product.images : []
                      };
                    }
                    productSales[productId].sales += item.quantity;
                  }
                });
              }
            } catch (error) {
              console.error('Error fetching product details:', error);
            }
          }
          
          setTopSellingProducts(Object.values(productSales).slice(0, 5));
        }

        // Process low stock products
        if (lowStockData.length > 0) {
          setLowStockProducts(lowStockData.map((product: { id: string; name: string; stock: number; images: string[] }) => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
            images: Array.isArray(product.images) ? product.images : []
          })));
        }

        // Process recent activities
        if (activitiesData.length > 0) {
          const activityList: Activity[] = activitiesData.map((order: { id: string; created_at: string }, index: number) => ({
            id: index + 1,
            type: 'order' as ActivityType,
            description: `New order #${order.id.slice(-6)} received`,
            time: new Date(order.created_at).toLocaleDateString()
          }));
          setRecentActivities(activityList);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentTenant]);

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

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          <div className="md:col-span-1 overflow-hidden">
            <RecentOrders />
          </div>
          <div className="md:col-span-1 overflow-hidden">
            <LowStockProducts products={lowStockProducts} />
          </div>
          <div className="md:col-span-1 overflow-hidden">
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
