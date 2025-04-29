import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  withDot = true,
  className,
}) => {
  const getStatusConfig = (status: string) => {
    const lowercaseStatus = status.toLowerCase();
    
    switch (lowercaseStatus) {
      case 'delivered':
        return {
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-400',
          dotColor: 'bg-green-500 dark:bg-green-400'
        };
      case 'processing':
        return {
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-400',
          dotColor: 'bg-blue-500 dark:bg-blue-400'
        };
      case 'shipped':
      case 'shipping':
        return {
          color: 'purple',
          bgColor: 'bg-purple-50 dark:bg-purple-950/30',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-700 dark:text-purple-400',
          dotColor: 'bg-purple-500 dark:bg-purple-400'
        };
      case 'pending':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          dotColor: 'bg-yellow-500 dark:bg-yellow-400'
        };
      case 'cancelled':
        return {
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-400',
          dotColor: 'bg-red-500 dark:bg-red-400'
        };
      case 'completed':
        return {
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-400',
          dotColor: 'bg-green-500 dark:bg-green-400'
        };
      case 'refunded':
        return {
          color: 'orange',
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-700 dark:text-orange-400',
          dotColor: 'bg-orange-500 dark:bg-orange-400'
        };
      default:
        return {
          color: 'gray',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          dotColor: 'bg-gray-500 dark:bg-gray-400'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1.5 text-sm';
      default: // md
        return 'px-3 py-1 text-xs';
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "capitalize border flex items-center gap-1.5 font-medium transition-colors",
        getSizeClasses(),
        config.bgColor,
        config.borderColor,
        config.textColor,
        className
      )}
    >
      {withDot && (
        <span 
          className={cn("h-2 w-2 rounded-full", config.dotColor)}
        ></span>
      )}
      {status}
    </Badge>
  );
};

export default StatusBadge;
