import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRightIcon, 
  Box, 
  CreditCard, 
  DollarSign, 
  ListOrderedIcon, 
  PackageIcon, 
  PlusIcon, 
  ShoppingBag, 
  ShoppingCart, 
  TagIcon, 
  Truck, 
  UserIcon, 
  UsersIcon, 
  BarChart3
} from "lucide-react";

const QuickActions = () => {
  return (
    <Card className="h-full overflow-hidden bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-900/70 dark:to-gray-800/50 backdrop-blur-lg border border-white/20 dark:border-gray-800/30 shadow-xl">
      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/80 to-white/50 dark:from-gray-900/80 dark:to-gray-800/50 border-b border-gray-100/80 dark:border-gray-800/30">
        <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/admin/products/new"
            className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 dark:from-purple-900/20 dark:to-blue-900/30 dark:hover:from-purple-800/30 dark:hover:to-blue-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
            <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <PlusIcon className="h-5 w-5" />
            </div>
            <span className="relative z-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-br from-purple-700 to-blue-700 dark:from-purple-400 dark:to-blue-400 group-hover:from-purple-800 group-hover:to-blue-800 dark:group-hover:from-purple-300 dark:group-hover:to-blue-300 transition-all duration-300">Add Product</span>
          </Link>
          
          <Link 
            to="/admin/orders"
            className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 dark:from-blue-900/20 dark:to-cyan-900/30 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
            <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <ListOrderedIcon className="h-5 w-5" />
            </div>
            <span className="relative z-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-br from-blue-700 to-cyan-700 dark:from-blue-400 dark:to-cyan-400 group-hover:from-blue-800 group-hover:to-cyan-800 dark:group-hover:from-blue-300 dark:group-hover:to-cyan-300 transition-all duration-300">Manage Orders</span>
          </Link>
          
          <Link 
            to="/admin/products"
            className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 dark:from-emerald-900/20 dark:to-green-900/30 dark:hover:from-emerald-800/30 dark:hover:to-green-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
            <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="relative z-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-br from-emerald-700 to-green-700 dark:from-emerald-400 dark:to-green-400 group-hover:from-emerald-800 group-hover:to-green-800 dark:group-hover:from-emerald-300 dark:group-hover:to-green-300 transition-all duration-300">Manage Products</span>
          </Link>
          
          <Link 
            to="/admin/customers"
            className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 dark:from-indigo-900/20 dark:to-violet-900/30 dark:hover:from-indigo-800/30 dark:hover:to-violet-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
            <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <UsersIcon className="h-5 w-5" />
            </div>
            <span className="relative z-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 to-violet-700 dark:from-indigo-400 dark:to-violet-400 group-hover:from-indigo-800 group-hover:to-violet-800 dark:group-hover:from-indigo-300 dark:group-hover:to-violet-300 transition-all duration-300">Customers</span>
          </Link>
          
          <Link 
            to="/admin/delivery-slots"
            className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500/10 to-sky-500/10 hover:from-cyan-500/20 hover:to-sky-500/20 dark:from-cyan-900/20 dark:to-sky-900/30 dark:hover:from-cyan-800/30 dark:hover:to-sky-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
            <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Truck className="h-5 w-5" />
            </div>
            <span className="relative z-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-br from-cyan-700 to-sky-700 dark:from-cyan-400 dark:to-sky-400 group-hover:from-cyan-800 group-hover:to-sky-800 dark:group-hover:from-cyan-300 dark:group-hover:to-sky-300 transition-all duration-300">Delivery Slots</span>
          </Link>
          
          <Link 
            to="/admin/reports"
            className="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500/10 to-green-500/10 hover:from-teal-500/20 hover:to-green-500/20 dark:from-teal-900/20 dark:to-green-900/30 dark:hover:from-teal-800/30 dark:hover:to-green-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"></div>
            <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-teal-500 to-green-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="relative z-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-br from-teal-700 to-green-700 dark:from-teal-400 dark:to-green-400 group-hover:from-teal-800 group-hover:to-green-800 dark:group-hover:from-teal-300 dark:group-hover:to-green-300 transition-all duration-300">Reports</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
