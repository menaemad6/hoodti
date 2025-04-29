import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecentOrders } from "@/integrations/supabase/orders.service";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  customer_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_avatar: string | null;
  items_count: number;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Fetch orders with forAdminView set to true
        const ordersData = await getRecentOrders(5, true);

        if (ordersData) {
          // Get all user IDs from orders
          const userIds = ordersData.map(order => order.user_id).filter(Boolean);
          
          // Fetch profiles separately for those user IDs
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, email, avatar')
            .in('id', userIds);
            
          if (profilesError) throw profilesError;
          
          // Create a map of profiles by user ID for quick lookup
          const profilesMap: Record<string, any> = {};
          if (profilesData) {
            profilesData.forEach(profile => {
              profilesMap[profile.id] = profile;
            });
          }

          // Count items per order
          const orderIds = ordersData.map(order => order.id);
          const { data: orderItemsCount, error: countError } = await supabase
            .from('order_items')
            .select('order_id, quantity')
            .in('order_id', orderIds);

          if (countError) throw countError;

          // Process the data
          const processedOrders = ordersData.map(order => {
            const itemsForOrder = orderItemsCount?.filter(item => item.order_id === order.id) || [];
            const itemsCount = itemsForOrder.reduce((sum, item) => sum + item.quantity, 0);
            const profile = order.user_id ? profilesMap[order.user_id] : null;

            return {
              id: order.id,
              created_at: order.created_at,
              status: order.status,
              total: order.total,
              customer_id: order.user_id,
              customer_name: profile?.name,
              customer_email: profile?.email,
              customer_avatar: profile?.avatar,
              items_count: itemsCount
            };
          });

          setOrders(processedOrders);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-2">No recent orders found</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>
          View All Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div 
          key={order.id} 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-3"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Avatar>
              <AvatarImage src={order.customer_avatar || ''} />
              <AvatarFallback>{getInitials(order.customer_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{order.customer_name || order.customer_email || 'Unknown Customer'}</h4>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <span>{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <div className="font-medium whitespace-nowrap">${order.total.toFixed(2)}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/admin/orders/${order.id}`)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentOrders;
