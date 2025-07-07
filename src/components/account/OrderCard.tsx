import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModernCard from "@/components/ui/modern-card";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import { ChevronRight, Package, ShoppingBag, Paintbrush, Ruler } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  selected_color?: string;
  selected_size?: string;
  selected_type?: string;
  products?: {
    id: string;
    name: string;
    image: string;
    unit?: string;
  } | null;
}

interface OrderCardProps {
  order: {
    id: string;
    created_at: string;
    status: string;
    total: number;
    order_items?: OrderItem[];
  };
  status?: React.ReactNode;
  withItems?: boolean;
  onViewDetails?: () => void;
}

// Normalize status to ensure consistent display
const normalizeStatus = (status: string): string => {
  const lowercaseStatus = status.toLowerCase();
  if (lowercaseStatus === 'shipping') return 'shipped';
  if (lowercaseStatus === 'canceled') return 'cancelled';
  return lowercaseStatus;
};

const getStatusColor = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  switch (normalizedStatus) {
    case 'delivered':
      return 'bg-green-500 dark:bg-green-500/90';
    case 'processing':
      return 'bg-blue-500 dark:bg-blue-500/90';
    case 'shipped':
      return 'bg-purple-500 dark:bg-purple-500/90';
    case 'pending':
      return 'bg-yellow-500 dark:bg-yellow-500/90';
    case 'cancelled':
      return 'bg-red-500 dark:bg-red-500/90';
    default:
      return 'bg-gray-500 dark:bg-gray-500/90';
  }
};

const getBadgeStyles = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  switch (normalizedStatus) {
    case 'delivered':
      return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-400';
    case 'processing':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-900/20 dark:text-blue-400';
    case 'shipped':
      return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/60 dark:bg-purple-900/20 dark:text-purple-400';
    case 'pending':
      return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800/60 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800/60 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Format array values to display as comma-separated strings
const formatArrayValue = (value: string | string[] | null): string => {
  if (!value) return '';
  
  // If it's already an array, join it
  if (Array.isArray(value)) return value.join(', ');
  
  // If it's a string that looks like JSON array, try to parse it
  if (typeof value === 'string') {
    // Clean up the string in case it has extra quotes or escaped characters
    const cleanedValue = value
      .replace(/^"/, '')
      .replace(/"$/, '')
      .replace(/\\"/g, '"')
      .trim();
    
    // Try to parse as JSON if it looks like an array
    if ((cleanedValue.startsWith('[') && cleanedValue.endsWith(']')) ||
        (cleanedValue.includes(',') && !cleanedValue.includes(':'))) {
      try {
        // If it looks like a JSON array
        if (cleanedValue.startsWith('[') && cleanedValue.endsWith(']')) {
          const parsedArray = JSON.parse(cleanedValue);
          if (Array.isArray(parsedArray)) {
            return parsedArray.join(', ');
          }
        } 
        // If it's a comma-separated string but not JSON formatted
        else if (cleanedValue.includes(',')) {
          return cleanedValue;
        }
      } catch (e) {
        // If parsing fails, treat as a comma-separated string
        if (cleanedValue.includes(',')) {
          return cleanedValue;
        }
        // Just return the original string
        return value;
      }
    }
  }
  
  // Otherwise, return the string as is
  return value;
};

const OrderCard: React.FC<OrderCardProps> = ({ order, status, withItems = false, onViewDetails }) => {
  const formattedDate = order.created_at 
    ? formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
    : 'Date unknown';
  
  const exactDate = order.created_at
    ? format(new Date(order.created_at), "PPP")
    : '';

  const normalizedStatus = normalizeStatus(order.status);
  
  return (
    <ModernCard 
      className="overflow-hidden backdrop-blur-sm border-0 shadow-lg shadow-gray-100/50 dark:shadow-black/10 dark:bg-gray-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100/70 dark:hover:shadow-black/20"
      title={
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full">
          <div>
            <h3 className="font-medium text-base sm:text-lg">Order #{order.id.slice(0, 8)}</h3>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <span>{formattedDate}</span>
              <span className="mx-1 sm:mx-2">•</span>
              <span className="hidden xs:inline">{exactDate}</span>
            </div>
          </div>
          <div className="flex items-center">
            {status ? (
              status
            ) : (
              <Badge 
                variant="outline" 
                className={`capitalize border px-2 py-1 sm:px-3 sm:py-1 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm ${getBadgeStyles(order.status)}`}
              >
                <span 
                  className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${getStatusColor(order.status)}`}
                ></span>
                {normalizedStatus}
              </Badge>
            )}
          </div>
        </div>
      }
      headerClassName="p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-950/50"
      contentClassName="p-0"
      footerClassName="p-3 sm:p-5 bg-gray-50/50 dark:bg-gray-900/30"
      footer={
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center w-full gap-3 xs:gap-0">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-base sm:text-lg font-bold">${Number(order.total).toFixed(2)}</p>
          </div>
          {onViewDetails ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full xs:w-auto h-8 px-3 sm:h-9 text-xs sm:text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/80"
              onClick={onViewDetails}
            >
              View Details
              <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          ) : (
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="w-full xs:w-auto h-8 px-3 sm:h-9 text-xs sm:text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/80"
            >
              <Link to={`/account/orders/${order.id}`} className="w-full flex justify-center xs:justify-start items-center">
                View Details
                <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          )}
        </div>
      }
    >
      {withItems && order.order_items && order.order_items.length > 0 && (
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 bg-white/80 dark:bg-transparent dark:backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <h4 className="text-xs sm:text-sm font-medium">Items ({order.order_items.length})</h4>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {order.order_items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border border-gray-100 hover:border-gray-200 dark:border-gray-800/60 dark:hover:border-gray-700/80 transition-colors bg-gray-50/50 dark:bg-gray-900/20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                  {item.products && Array.isArray(item.products.images) && item.products.images.length > 0 ? (
                    <img 
                      src={item.products.images[0]} 
                      alt={item.products.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-medium truncate">
                      {item.products ? item.products.name : "Product unavailable"}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <span>${Number(item.price_at_time).toFixed(2)}</span>
                      <span>×</span>
                      <span>{item.quantity}</span>
                      {item.products?.unit && <span>({item.products.unit})</span>}
                    </div>
                    
                    {/* Product variations (type, size and color) */}
                    {(item.selected_type || item.selected_size || item.selected_color) && (
                      <div className="mt-1 flex flex-wrap gap-1 sm:gap-2">
                        {item.selected_type && (
                          <div className="text-[10px] sm:text-xs flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">
                            <Ruler className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-gray-500" />
                            <span>{formatArrayValue(item.selected_type)}</span>
                          </div>
                        )}
                        {item.selected_size && (
                          <div className="text-[10px] sm:text-xs flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">
                            <Ruler className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-gray-500" />
                            <span>{formatArrayValue(item.selected_size)}</span>
                          </div>
                        )}
                        {item.selected_color && (
                          <div className="text-[10px] sm:text-xs flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">
                            <Paintbrush className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-gray-500" />
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-0.5 sm:mr-1" style={{backgroundColor: formatArrayValue(item.selected_color)}}></span>
                            <span>{formatArrayValue(item.selected_color)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block text-right text-xs font-medium mt-1 sm:mt-0">
                    ${(Number(item.price_at_time) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            {order.order_items.length > 3 && (
              <div className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1">
                +{order.order_items.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}
    </ModernCard>
  );
};

export default OrderCard;
