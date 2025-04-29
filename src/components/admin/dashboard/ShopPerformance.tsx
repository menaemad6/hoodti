
import React from "react";
import ModernCard from "@/components/ui/modern-card";
import { Truck, ShieldCheck } from "lucide-react";

export const ShopPerformance: React.FC = () => {
  return (
    <ModernCard title="Shop Performance" className="h-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Delivery Rate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold">98.2%</span>
            <span className="text-xs text-green-600 dark:text-green-400">+2.4%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Customer Satisfaction</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold">4.8/5</span>
            <span className="text-xs text-green-600 dark:text-green-400">+0.2</span>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

export default ShopPerformance;
