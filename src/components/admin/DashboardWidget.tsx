import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardWidgetProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  isLoading = false
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-background rounded-md p-1.5 sm:p-2">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h3 className="text-sm sm:text-base font-medium">{title}</h3>
          </div>
          {trend && !isLoading && (
            <div className={cn(
              "text-xs font-medium flex items-center gap-1 rounded-full px-1.5 py-0.5",
              trend.isPositive 
                ? "text-green-600 dark:text-green-500" 
                : "text-red-600 dark:text-red-500"
            )}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </div>
          )}
        </div>
        
        {isLoading ? (
          <>
            <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 mb-1" />
            {description && <Skeleton className="h-3 sm:h-4 w-36 sm:w-40" />}
          </>
        ) : (
          <>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{value}</div>
            {description && <div className="text-xs sm:text-sm text-muted-foreground">{description}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
