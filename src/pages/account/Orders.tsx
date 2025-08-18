import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ModernCard from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getOrdersWithItems } from "@/integrations/supabase/orders.service";
import OrderCard from "@/components/account/OrderCard";
import { ChevronLeft, PackageSearch } from "lucide-react";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";
import type { Order as SupabaseOrder, OrderItem as SupabaseOrderItem } from "@/integrations/supabase/types.service";

interface Customization {
  id: string;
  base_product_type: string;
  base_product_size: string;
  base_product_color: string;
  design_data: Record<string, unknown>;
  total_customization_cost: number;
}

interface ExtendedOrderItem extends SupabaseOrderItem {
  customization?: Customization | null;
}

type AccountOrder = SupabaseOrder & { order_items?: ExtendedOrderItem[] };

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const seoConfig = useSEOConfig('accountOrders');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const userOrders = await getOrdersWithItems(user.id) as unknown as AccountOrder[];

        if (userOrders && userOrders.length > 0) {
          setOrders(userOrders);
        } else {

          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your orders."
        });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, toast]);

  return (
    <Layout>
      <SEOHead {...seoConfig} />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 dark:from-background dark:to-background/80">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                asChild 
                variant="ghost" 
                className="h-9 px-2 sm:h-10 sm:px-3 hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                <Link to="/account">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <h1 className="hidden md:block text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
                My Orders
              </h1>
            </div>
          </div>

          {/* Mobile-only centered title */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
              My Orders
            </h1>
          </div>

          <AnimatedWrapper animation="fade-in">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary dark:border-primary/80 mb-4"></div>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/80">Loading your orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="grid gap-4 sm:gap-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    withItems={true}
                  />
                ))}
              </div>
            ) : (
              <ModernCard className="max-w-2xl mx-auto border-0 shadow-lg">
                <div className="p-4 sm:p-8 text-center">
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
                      <PackageSearch className="w-6 h-6 sm:w-8 sm:h-8 text-primary dark:text-primary/90" />
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-foreground/90 dark:text-foreground/80">
                    No Orders Yet
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 mb-4 sm:mb-6 max-w-md mx-auto">
                    You haven't placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Button 
                    asChild 
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/80 dark:hover:from-primary/90 dark:hover:to-primary text-primary-foreground shadow-lg shadow-primary/10 dark:shadow-primary/10 text-xs sm:text-sm px-4 py-2 h-auto"
                  >
                    <Link to="/shop">Start Shopping</Link>
                  </Button>
                </div>
              </ModernCard>
            )}
          </AnimatedWrapper>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
