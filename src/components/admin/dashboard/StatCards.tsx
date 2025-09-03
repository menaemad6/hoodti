
import React from "react";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import DashboardWidget from "@/components/admin/DashboardWidget";

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface StatCardsProps {
  stats: StatsData;
  isLoading: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <DashboardWidget
        title="Total Revenue"
        value={`${stats.totalRevenue.toLocaleString()} EGP`}
        description="Total revenue from all orders"
        trend={{ value: 20.1, isPositive: true }}
        icon={DollarSign}
        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800"
        isLoading={isLoading}
      />
      <DashboardWidget
        title="Orders"
        value={stats.totalOrders}
        description="Total orders placed"
        trend={{ value: 12, isPositive: true }}
        icon={ShoppingBag}
        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800"
        isLoading={isLoading}
      />
      <DashboardWidget
        title="Products"
        value={stats.totalProducts}
        description="Total products in inventory"
        trend={{ value: 5, isPositive: true }}
        icon={Package}
        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800"
        isLoading={isLoading}
      />
      <DashboardWidget
        title="Active Users"
        value={stats.totalCustomers}
        description="Total registered users"
        trend={{ value: 18, isPositive: true }}
        icon={Users}
        className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatCards;
