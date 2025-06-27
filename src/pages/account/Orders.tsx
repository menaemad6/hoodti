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
import { getSEOConfig } from "@/lib/seo-config";

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const seoConfig = getSEOConfig('accountOrders');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const userOrders = await getOrdersWithItems(user.id);

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
                className="h-9 px-2 sm:h-10 sm:px-3 hover:bg-background/80 dark:hover:bg-background/40"
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
              <ModernCard className="max-w-2xl mx-auto border-0 shadow-lg shadow-gray-100/50 dark:shadow-black/10 dark:bg-gray-950/50">
                <div className="p-4 sm:p-8 text-center">
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 flex items-center justify-center">
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
                    className="rounded-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 dark:from-green-500 dark:to-blue-500 dark:hover:from-green-600 dark:hover:to-blue-600 text-white shadow-lg shadow-blue-600/10 dark:shadow-blue-500/10 text-xs sm:text-sm px-4 py-2 h-auto"
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
