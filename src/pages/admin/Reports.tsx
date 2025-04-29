import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/Layout";
import GlassCard from "@/components/ui/glass-card";
import ModernCard from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ChevronDown,
  Download,
  ShoppingBag,
  Users,
  Loader2,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  DollarSign,
  Package,
  BarChart as BarChartIcon,
  TriangleIcon,
} from "lucide-react";
import {
  salesData as mockSalesData, 
  productPerformanceData as mockProductData, 
  categoryData as mockCategoryData, 
  customerData as mockCustomerData, 
  COLORS 
} from "@/data/reportsData";
import { getAllReportData, getProductPerformanceData, getCategoryData, getSalesSummary, getAllOrdersProductData } from "@/integrations/supabase/reports.service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TopProduct } from "@/components/admin/dashboard/TopProductsList";

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  percentChange: number;
  image?: string;
  price?: number;
  category?: string;
}

const ReportsPage = () => {
  const [timeframe, setTimeframe] = useState("yearly");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductDataLoading, setIsProductDataLoading] = useState(false);
  const [isAllOrdersProductDataLoading, setIsAllOrdersProductDataLoading] = useState(false);
  const [productSortBy, setProductSortBy] = useState<"revenue" | "units">("revenue");
  const { toast } = useToast();
  
  // Add state for all data
  const [salesData, setSalesData] = useState(mockSalesData);
  const [productPerformanceData, setProductPerformanceData] = useState<TopProduct[]>([]);
  const [allOrdersProductData, setAllOrdersProductData] = useState<TopProduct[]>([]);
  const [categoryData, setCategoryData] = useState(mockCategoryData);
  const [customerData, setCustomerData] = useState(mockCustomerData);
  const [customerSegments, setCustomerSegments] = useState({
    segments: [
      { name: "New", value: 30 },
      { name: "Occasional", value: 25 },
      { name: "Regular", value: 35 },
      { name: "VIP", value: 10 }
    ],
    vipStats: {
      percentage: 10,
      revenuePercentage: 42
    }
  });
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    salesPercentChange: '0.0',
    averageOrderValue: 0,
    aovPercentChange: '0.0',
    conversionRate: 0,
    conversionPercentChange: 0,
    totalUnits: 0,
    unitsPercentChange: '0.0'
  });
  const [customerInsights, setCustomerInsights] = useState({
    totalCustomers: 0,
    newCustomersMTD: 0,
    repeatPurchaseRate: 0,
    customerLifetimeValue: 0
  });

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const data = await getAllReportData();
        
        // Update state with real data
        setSalesData(data.salesData.length > 0 ? data.salesData : mockSalesData);
        setProductPerformanceData(data.productPerformanceData.length > 0 ? data.productPerformanceData : mockProductData);
        setCategoryData(data.categoryData.length > 0 ? data.categoryData : mockCategoryData);
        setCustomerData(data.customerData.length > 0 ? data.customerData : mockCustomerData);
        setCustomerSegments(data.customerSegments);
        setSalesSummary(data.salesSummary);
        setCustomerInsights(data.customerInsights);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load reports",
          description: "There was an error loading the analytics data."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [toast]);

  // Function to refresh all report data
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllReportData();
      setSalesData(data.salesData.length > 0 ? data.salesData : mockSalesData);
      setProductPerformanceData(data.productPerformanceData.length > 0 ? data.productPerformanceData : mockProductData);
      setCategoryData(data.categoryData.length > 0 ? data.categoryData : mockCategoryData);
      setCustomerData(data.customerData.length > 0 ? data.customerData : mockCustomerData);
      setCustomerSegments(data.customerSegments);
      setSalesSummary(data.salesSummary);
      setCustomerInsights(data.customerInsights);
      
      toast({
        title: "Data Refreshed",
        description: "All reports have been updated with the latest information"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        variant: "destructive",
        title: "Failed to refresh data",
        description: "There was an error loading the latest data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch real product data
  const fetchRealProductData = async () => {
    setIsProductDataLoading(true);
    try {
      // Use the correctly implemented service function that filters by order status
      const productData = await getProductPerformanceData();
      
      // Get current month's sales summary to ensure consistency with Sales tab
      const salesSummaryData = await getSalesSummary();
      
      if (productData.length > 0) {
        setProductPerformanceData(productData);
        setSalesSummary(prev => ({
          ...prev,
          ...salesSummaryData
        }));
      }
    } catch (error) {
      console.error("Error fetching product performance data:", error);
    } finally {
      setIsProductDataLoading(false);
    }
  };

  // Function to fetch all orders product data
  const fetchAllOrdersProductData = async () => {
    setIsAllOrdersProductDataLoading(true);
    try {
      const allProductData = await getAllOrdersProductData();
      
      if (allProductData.length > 0) {
        setAllOrdersProductData(allProductData);
      }
    } catch (error) {
      console.error("Error fetching all orders product data:", error);
    } finally {
      setIsAllOrdersProductDataLoading(false);
    }
  };

  // Load product data when the product tab is selected
  const handleTabChange = (value: string) => {
    if (value === 'products') {
      fetchRealProductData();
      fetchAllOrdersProductData();
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`Value: $${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const topSellingProductsData = productPerformanceData
    .map((product, index) => ({
      ...product,
      uniqueId: `${product.id}-${index}` // Add a uniqueId property for key usage
    }))
    .sort((a, b) => (productSortBy === "revenue" ? 
      ((b.price || 0) * b.sales) - ((a.price || 0) * a.sales) : 
      b.sales - a.sales))
    .slice(0, 5);

  const maxSales = Math.max(...(topSellingProductsData.map(product => product.sales) || [1]));

  // Get product with most units sold
  const mostSoldProduct = [...productPerformanceData]
    .sort((a, b) => b.sales - a.sales)[0];
  
  // Get product with highest revenue
  const highestRevenueProduct = [...productPerformanceData]
    .sort((a, b) => (b.price * b.sales) - (a.price * a.sales))[0];

  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <div className="flex gap-2">
              <Select 
                value={timeframe}
                onValueChange={setTimeframe}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          ) : (
            <Tabs defaultValue="sales" className="space-y-6" onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 w-full md:w-[600px]">
                <TabsTrigger value="sales" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Sales</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Categories</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="sales" className="space-y-6">
                {/* KPI Summary Cards */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Sales Performance</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshAllData}
                    className="h-8 gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Data</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Total Revenue
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          ${salesSummary.totalSales.toLocaleString()}
                        </CardTitle>
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <DollarSign size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        {parseFloat(salesSummary.salesPercentChange) >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${parseFloat(salesSummary.salesPercentChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(salesSummary.salesPercentChange) >= 0 ? '+' : ''}{salesSummary.salesPercentChange}%
                        </span>
                        <span className="ml-1 text-muted-foreground">vs last period</span>
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Average Order Value
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          ${salesSummary.averageOrderValue.toLocaleString()}
                        </CardTitle>
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          <BarChartIcon size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        {parseFloat(salesSummary.aovPercentChange) >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${parseFloat(salesSummary.aovPercentChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(salesSummary.aovPercentChange) >= 0 ? '+' : ''}{salesSummary.aovPercentChange}%
                        </span>
                        <span className="ml-1 text-muted-foreground">vs last period</span>
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Conversion Rate
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          {salesSummary.conversionRate}%
                        </CardTitle>
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          <BarChartIcon size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        {salesSummary.conversionPercentChange >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${salesSummary.conversionPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {salesSummary.conversionPercentChange >= 0 ? '+' : ''}{salesSummary.conversionPercentChange}%
                        </span>
                        <span className="ml-1 text-muted-foreground">vs last period</span>
                      </div>
                    </CardContent>
                  </GlassCard>
                  
                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Orders This Month
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          {salesSummary.totalSales > 0 ? Math.round(salesSummary.totalSales / salesSummary.averageOrderValue) : 0}
                        </CardTitle>
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                          <Package size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Current Month</span>
                      </div>
                    </CardContent>
                  </GlassCard>
                </div>
                
                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard className="overflow-hidden h-full">
                    <CardHeader className="p-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                          Sales Overview
                        </CardTitle>
                    <CardDescription>
                      Monthly sales performance vs targets
                    </CardDescription>
                      </div>
                      <Select
                        value={timeframe}
                        onValueChange={setTimeframe}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                  </CardHeader>
                    <CardContent className="px-2 pb-6">
                      <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={salesData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                            barSize={20}
                            barGap={8}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} width={60} tickFormatter={(value) => `$${value}`} />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, undefined]}
                            labelFormatter={(label) => `Month: ${label}`}
                              contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                              }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="sales" name="Sales" fill="rgba(124, 58, 237, 0.8)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="target" name="Target" fill="rgba(52, 211, 153, 0.8)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </GlassCard>
                
                  <GlassCard className="overflow-hidden h-full">
                    <CardHeader className="p-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                          Sales Trends
                        </CardTitle>
                    <CardDescription>
                      Year-to-date sales progression
                    </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 px-3">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                  </CardHeader>
                    <CardContent className="px-2 pb-6">
                      <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={salesData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} width={60} tickFormatter={(value) => `$${value}`} />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, undefined]}
                            labelFormatter={(label) => `Month: ${label}`}
                              contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                              }}
                          />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            name="Sales"
                              stroke="hsl(var(--primary))"
                            activeDot={{ r: 8 }}
                              strokeWidth={3}
                              dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </GlassCard>
                        </div>
                        
                {/* Projections Section */}
                <GlassCard className="overflow-hidden">
                  <CardHeader className="p-6 flex flex-row items-center justify-between">
                          <div>
                      <CardTitle className="text-xl font-bold flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-primary" />
                        Sales Projections
                      </CardTitle>
                      <CardDescription>
                        Projected sales forecast for upcoming periods
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <RefreshCw className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Refresh</span>
                      </Button>
                    </div>
                    </CardHeader>
                  <CardContent className="px-2 pb-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              // Generate projection data based on recent sales trends
                              ...salesData.slice(-3),
                              { 
                                month: "Next", 
                                sales: Math.round(salesData[salesData.length - 1]?.sales * 1.05) || 0,
                                target: Math.round(salesData[salesData.length - 1]?.target * 1.05) || 0
                              },
                              { 
                                month: "Proj 2", 
                                sales: Math.round(salesData[salesData.length - 1]?.sales * 1.1) || 0,
                                target: Math.round(salesData[salesData.length - 1]?.target * 1.1) || 0
                              },
                              { 
                                month: "Proj 3", 
                                sales: Math.round(salesData[salesData.length - 1]?.sales * 1.15) || 0,
                                target: Math.round(salesData[salesData.length - 1]?.target * 1.15) || 0
                              }
                            ]}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} width={60} tickFormatter={(value) => `$${value}`} />
                            <Tooltip 
                              formatter={(value) => [`$${value}`, undefined]}
                              labelFormatter={(label) => `Month: ${label}`}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              padding: '12px'
                            }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              name="Projected Sales"
                            stroke="rgba(124, 58, 237, 0.8)"
                              strokeDasharray="5 5"
                              strokeWidth={2}
                            dot={{ r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="target"
                              name="Projected Target"
                            stroke="rgba(52, 211, 153, 0.8)"
                              strokeDasharray="3 3"
                              strokeWidth={2}
                            dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    
                    {/* Projection Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Projected Next Month</p>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold">
                            ${Math.round(salesData[salesData.length - 1]?.sales * 1.05).toLocaleString() || "0"}
                          </p>
                          <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            +5%
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Quarterly Outlook</p>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold">
                            ${Math.round(salesData[salesData.length - 1]?.sales * 3.3).toLocaleString() || "0"}
                          </p>
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                            +10%
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Year-End Estimate</p>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold">
                            ${Math.round(salesData.reduce((sum, month) => sum + month.sales, 0) * 1.15).toLocaleString() || "0"}
                          </p>
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                            +15%
                          </div>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </GlassCard>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-6">
                {/* Header with refresh button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Product Analysis</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchRealProductData}
                    disabled={isProductDataLoading}
                    className="h-8 gap-1"
                  >
                    {isProductDataLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh Data</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Total Revenue
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          ${salesSummary.totalSales.toLocaleString()}
                        </CardTitle>
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <DollarSign size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        {parseFloat(salesSummary.salesPercentChange) >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${parseFloat(salesSummary.salesPercentChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(salesSummary.salesPercentChange) >= 0 ? '+' : ''}{salesSummary.salesPercentChange}%
                        </span>
                        <span className="ml-1 text-muted-foreground">vs last period</span>
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Total Units Sold
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          {productPerformanceData.length > 0 
                            ? productPerformanceData.reduce((sum, p) => sum + p.sales, 0).toLocaleString() 
                            : "0"}
                        </CardTitle>
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <Package size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        {parseFloat(salesSummary.aovPercentChange) >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${parseFloat(salesSummary.aovPercentChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(salesSummary.aovPercentChange) >= 0 ? '+' : ''}{salesSummary.aovPercentChange}%
                        </span>
                        <span className="ml-1 text-muted-foreground">from delivered orders only</span>
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Average Order Value
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                          ${salesSummary.averageOrderValue.toLocaleString()}
                        </CardTitle>
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          <BarChartIcon size={18} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm">
                        {parseFloat(salesSummary.aovPercentChange) >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${parseFloat(salesSummary.aovPercentChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(salesSummary.aovPercentChange) >= 0 ? '+' : ''}{salesSummary.aovPercentChange}%
                        </span>
                        <span className="ml-1 text-muted-foreground">vs last period</span>
                      </div>
                    </CardContent>
                  </GlassCard>
                </div>

                {/* Main Chart */}
                <GlassCard className="col-span-12 overflow-hidden">
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                          Product Performance
                        </CardTitle>
                    <CardDescription>
                          Top 10 products by revenue from delivered orders only
                    </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={productSortBy}
                          onValueChange={(value) => {
                            setProductSortBy(value as "revenue" | "units");
                          }}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue">By Revenue</SelectItem>
                            <SelectItem value="units">By Units Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-0">
                    {isProductDataLoading ? (
                      <div className="h-[400px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="p-0">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                              data={[...(productPerformanceData || [])]
                                .sort((a, b) =>
                                  productSortBy === "revenue"
                                    ? b.sales - a.sales
                                    : b.sales - a.sales
                                )
                                .slice(0, 10)
                              }
                          layout="vertical"
                          margin={{
                                top: 5,
                            right: 30,
                            left: 100,
                            bottom: 5,
                          }}
                        >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                              <XAxis
                                type="number"
                                domain={[0, "auto"]}
                                tickFormatter={(value) =>
                                  productSortBy === "revenue" ? `$${value}` : `${value}`
                                }
                              />
                          <YAxis 
                            type="category" 
                                dataKey="name"
                                width={90}
                                tick={{
                                  fontSize: 12,
                                }}
                              />
                              <Tooltip
                                formatter={(value, name) => {
                                  if (name === "sales") {
                                    return [`$${value}`, "Revenue"];
                                  }
                                  return [value, "Units Sold"];
                                }}
                              />
                              <Bar
                                dataKey={productSortBy === "revenue" ? "sales" : "sales"}
                                fill="rgba(124, 58, 237, 0.8)"
                                barSize={20}
                                radius={[0, 4, 4, 0]}
                                name={productSortBy === "revenue" ? "Revenue" : "Units Sold"}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>
                
                {/* Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ModernCard className="h-full">
                    {isProductDataLoading ? (
                      <div className="h-[240px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <h3 className="font-medium text-lg">Top Selling Products</h3>
                        </div>
                        
                        <div className="space-y-6">
                          {topSellingProductsData
                            .map((product, index) => (
                              <div key={product.uniqueId} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-start gap-3">
                                    {product.image ? (
                                      <div className="h-10 w-10 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="h-10 w-10 rounded-md flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                        <span className="font-semibold text-xs text-primary">{product.name.substring(0, 2).toUpperCase()}</span>
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-medium">{product.name}</span>
                                      {product.category && (
                                        <span className="text-xs text-muted-foreground">{product.category}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">${((product.price || 0) * product.sales).toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">{product.sales} units</div>
                                  </div>
                                </div>
                                <Progress
                                  value={(product.sales / maxSales) * 100}
                                  className="h-2"
                                />
                              </div>
                            ))}
                          <div className="text-xs text-muted-foreground text-center mt-2">
                            * Data from delivered orders only
                          </div>
                        </div>
                      </>
                    )}
                  </ModernCard>

                  <ModernCard className="h-full">
                    {isAllOrdersProductDataLoading ? (
                      <div className="h-[240px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <ShoppingBag className="h-5 w-5 text-blue-500" />
                          <h3 className="font-medium text-lg">Top Selling Products (All Orders)</h3>
                        </div>
                        
                        <div className="space-y-6">
                          {allOrdersProductData
                            .map((product, index) => ({
                              ...product,
                              uniqueId: `all-${product.id}-${index}` // Add a uniqueId property for key usage
                            }))
                            .sort((a, b) => (productSortBy === "revenue" ? 
                              ((b.price || 0) * b.sales) - ((a.price || 0) * a.sales) : 
                              b.sales - a.sales))
                            .slice(0, 5)
                            .map((product) => {
                              // Calculate max sales for percentage calculations
                              const maxAllOrdersSales = Math.max(...(allOrdersProductData.map(p => p.sales) || [1]));
                              
                              return (
                                <div key={product.uniqueId} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                      {product.image ? (
                                        <div className="h-10 w-10 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
                                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className="h-10 w-10 rounded-md flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                          <span className="font-semibold text-xs text-blue-600 dark:text-blue-400">{product.name.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        <span className="font-medium">{product.name}</span>
                                        {product.category && (
                                          <span className="text-xs text-muted-foreground">{product.category}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">${((product.price || 0) * product.sales).toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">{product.sales} units</div>
                                    </div>
                                  </div>
                                  <Progress
                                    value={(product.sales / maxAllOrdersSales) * 100}
                                    className="h-2 bg-blue-100 dark:bg-blue-900/30"
                                    indicatorClassName="bg-blue-600 dark:bg-blue-400"
                                  />
                                </div>
                              );
                            })}
                          <div className="text-xs text-muted-foreground text-center mt-2">
                            * Data includes all orders regardless of status
                          </div>
                        </div>
                      </>
                    )}
                  </ModernCard>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Category Analysis</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        // Fetch fresh category data
                        const data = await getCategoryData();
                        setCategoryData(data.length > 0 ? data : mockCategoryData);
                        toast({
                          title: "Category Data Refreshed",
                          description: "Category data has been updated based on completed and delivered orders"
                        });
                      } catch (error) {
                        console.error("Error refreshing category data:", error);
                        toast({
                          variant: "destructive",
                          title: "Failed to refresh data",
                          description: "There was an error loading the latest category data"
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="h-8 gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Data</span>
                  </Button>
                </div>

                <GlassCard>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>
                      Sales distribution by product category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </GlassCard>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard>
                    <CardHeader>
                      <CardTitle>Category Performance</CardTitle>
                      <CardDescription>
                        Comparative performance across categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryData.slice(0, 6).map((category, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{category.name}</span>
                              <span className="text-sm text-muted-foreground">${category.value.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${Math.round((category.value / categoryData[0].value) * 100)}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </GlassCard>
                  
                  <GlassCard>
                    <CardHeader>
                      <CardTitle>Category Insights</CardTitle>
                      <CardDescription>
                        Key metrics for product categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Top Performing Category
                            </p>
                            <p className="text-lg font-bold">{categoryData[0]?.name || "N/A"}</p>
                          </div>
                          <div className="text-green-500 flex items-center">
                            <span>${categoryData[0]?.value.toLocaleString() || "0"}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Category Share
                            </p>
                            <p className="text-lg font-bold">{categoryData[0]?.name || "N/A"}</p>
                          </div>
                          <div className="text-blue-500">
                            <span>
                              {categoryData.length > 0 
                                ? Math.round((categoryData[0].value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Categories Count
                            </p>
                            <p className="text-lg font-bold">{categoryData.length}</p>
                          </div>
                          <div className="text-blue-500">
                            <span>Total Categories</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Average per Category
                            </p>
                            <p className="text-lg font-bold">
                              ${categoryData.length > 0 
                                ? Math.round(categoryData.reduce((sum, cat) => sum + cat.value, 0) / categoryData.length).toLocaleString()
                                : "0"}
                            </p>
                          </div>
                          <div className="text-blue-500">
                            <span>Avg Revenue</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </GlassCard>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ReportsPage;
