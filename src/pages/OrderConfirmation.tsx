import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Check, ChevronRight, MapPin, Calendar, CreditCard, ShoppingBag, Package, ArrowRight, Truck, Clock, User } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ModernCard from "@/components/ui/modern-card";
import { Separator } from "@/components/ui/separator";
import { getOrderById, getOrderItemsWithProducts } from "@/integrations/supabase/orders.service";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/spinner";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { useToast } from "@/hooks/use-toast";
import { getDeliverySlotByDateAndTime } from "@/integrations/supabase/delivery.service";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderItem as SupabaseOrderItem } from "@/integrations/supabase/types.service";
import { formatPrice } from "../lib/utils";

interface LocalOrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    unit?: string;
  } | null;
  price_at_time: number;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  selected_type?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_address: string;
  payment_method: string;
  delivery_slot: {
    date: string;
    time_slot: string;
  };
  items: LocalOrderItem[];
  tax?: number;
  discount_amount?: number;
  shipping_amount?: number;
  email?: string;
  phone_number?: string;
  full_name?: string;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  const orderId = searchParams.get("orderId");
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        setError("Order ID not provided in the URL");
        return;
      }
      
      try {
        const orderData = await getOrderById(orderId);
        
        if (!orderData) {
          console.error("Order not found", orderId);
          setError("Order not found");
          setIsLoading(false);
          return;
        }
        
        // Type assertion for additional properties
        const orderWithExtras = orderData as any;
        
        const orderItems = await getOrderItemsWithProducts(orderId);
        
        let deliverySlotData = null;
        // Check if we have a delivery_slot field (new format)
        if ('delivery_slot' in orderData && orderData.delivery_slot) {
          // Parse the combined date and time slot string: "2024-03-20 | 9:00 AM - 11:00 AM"
          const deliverySlotStr = String(orderData.delivery_slot);
          const [dateStr, timeSlot] = deliverySlotStr.split(' | ');
          deliverySlotData = {
            date: new Date(String(dateStr)), // Ensure it's a string
            time_slot: timeSlot || "Standard Delivery" // Use the time slot if available
          };
        } 
        // Fallback to delivery_slot_id (old format)
        else if (orderData.delivery_slot_id) {
          try {
            deliverySlotData = await getDeliverySlotByDateAndTime(orderData.delivery_slot_id);
          } catch (error) {
            console.warn("Could not get delivery slot details:", error);
            // Create a fallback if slot not found
            deliverySlotData = {
              date: new Date(),
              time_slot: "Standard Delivery"
            };
          }
        }
        
        const transformedOrder: Order = {
          id: orderData.id,
          created_at: orderData.created_at || new Date().toISOString(),
          status: orderData.status || 'pending',
          total: orderData.total || 0,
          shipping_address: orderData.shipping_address || '',
          payment_method: orderData.payment_method || 'card',
          delivery_slot: deliverySlotData ? {
            date: typeof deliverySlotData.date === 'string' 
              ? deliverySlotData.date 
              : deliverySlotData.date.toISOString(),
            time_slot: deliverySlotData.time_slot
          } : {
            date: new Date().toISOString(),
            time_slot: 'Not specified'
          },
          items: orderItems.map(item => ({
            id: item.id,
            product: item.product ? {
              id: item.product.id || '',
              name: item.product.name || '',
              price: typeof item.product.price === 'number' ? item.product.price : 0,
              image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg",
              unit: item.product.unit
            } : null,
            price_at_time: item.price_at_time,
            quantity: item.quantity,
            selected_color: item.selected_color,
            selected_size: item.selected_size,
            selected_type: item.selected_type
          })),
          tax: typeof orderWithExtras.tax === 'number' ? orderWithExtras.tax : undefined,
          discount_amount: typeof orderWithExtras.discount_amount === 'number' ? orderWithExtras.discount_amount : undefined,
          shipping_amount: typeof orderWithExtras.shipping_amount === 'number' ? orderWithExtras.shipping_amount : undefined,
          email: orderWithExtras.email || undefined,
          phone_number: orderWithExtras.phone_number || undefined,
          full_name: orderWithExtras.full_name || undefined
        };
        
        setOrder(transformedOrder);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, toast]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-16">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-16">
            <ModernCard className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "Could not find order information"}</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </ModernCard>
        </div>
      </Layout>
    );
  }
  
  // Normalize status to ensure consistent display
  const normalizeStatus = (status: string): string => {
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus === 'shipping') return 'shipped';
    if (lowercaseStatus === 'canceled') return 'cancelled';
    return lowercaseStatus;
  };

  const orderStatus = normalizeStatus(order.status);
  const statusConfig = {
    delivered: { color: 'green', icon: Check },
    processing: { color: 'primary', icon: Clock },
    shipped: { color: 'purple', icon: Truck },
    pending: { color: 'yellow', icon: Clock },
    cancelled: { color: 'red', icon: Package }
  } as const;

  const currentStatus = statusConfig[orderStatus as keyof typeof statusConfig] || { color: 'gray', icon: Package };
  const StatusIcon = currentStatus.icon;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 dark:from-background dark:to-background/80">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <AnimatedWrapper animation="fade-up" className="space-y-8">
            <div className="text-center relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur-3xl"></div>
              </div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 ring-8 ring-background mb-6">
                  <StatusIcon className={`h-10 w-10 ${
                    orderStatus === 'delivered' ? 'text-green-600 dark:text-green-400' :
                    orderStatus === 'processing' ? 'text-primary dark:text-primary' :
                    orderStatus === 'shipped' ? 'text-purple-600 dark:text-purple-400' :
                    orderStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                    orderStatus === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                    'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  {orderStatus === 'pending' && "Thank You for Your Order!"}
                  {orderStatus === 'processing' && "Your Order is Being Processed"}
                  {orderStatus === 'shipped' && "Your Order is on the Way"}
                  {orderStatus === 'delivered' && "Your Order has Been Delivered"}
                  {orderStatus === 'cancelled' && "Your Order has Been Cancelled"}
                  {!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus) && "Order Status"}
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
                  {orderStatus === 'pending' && "We've received your order and will begin processing it shortly. You'll receive updates about your order via email."}
                  {orderStatus === 'processing' && "We're currently preparing your items for shipment. We'll notify you when it's on the way."}
                  {orderStatus === 'shipped' && "Your order is on its way to you! You can track its progress here."}
                  {orderStatus === 'delivered' && "Your order has been delivered. We hope you enjoy your purchase!"}
                  {orderStatus === 'cancelled' && "Your order has been cancelled. If you did not request this cancellation, please contact our support team."}
                  {!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus) && "Check your order details and status below."}
                </p>
              </div>
            </div>

            <ModernCard className="overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-950/50 p-4 sm:p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-xl sm:text-2xl font-bold">Order #{order.id.slice(-8)}</h2>
                      <Badge 
                        variant="outline" 
                    className={`capitalize border px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm ${
                      orderStatus === 'delivered' ? 'border-green-800 bg-green-950 text-green-400' :
                      orderStatus === 'processing' ? 'border-primary/40 bg-primary/10 text-primary' :
                      orderStatus === 'shipped' ? 'border-purple-800 bg-purple-950 text-purple-400' :
                      orderStatus === 'pending' ? 'border-yellow-800 bg-yellow-950 text-yellow-400' :
                      orderStatus === 'cancelled' ? 'border-red-800 bg-red-950 text-red-400' :
                      'border-gray-800 bg-gray-950 text-gray-400'
                    }`}
                      >
                        <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        {orderStatus}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="w-full">
                    <h3 className="font-medium mb-3 flex items-center text-foreground">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      {order.full_name && (
                        <div>
                          <span className="font-medium block">Name</span>
                          {order.full_name}
                        </div>
                      )}
                      {order.email && (
                        <div>
                          <span className="font-medium block">Email</span>
                          <span className="break-words">{order.email}</span>
                        </div>
                      )}
                      {order.phone_number && (
                        <div>
                          <span className="font-medium block">Phone</span>
                          {order.phone_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AnimatedWrapper animation="fade-in" delay="500" className="mt-2">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border hover:border-border/80 transition-colors h-full">
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> Delivery Address
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
                        {order.shipping_address || "Not provided"}
                      </p>
                    </div>
                  </AnimatedWrapper>

                  <AnimatedWrapper animation="fade-in" delay="600" className="mt-2">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border hover:border-border/80 transition-colors h-full">
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" /> Delivery Date
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_slot && (
                          <>
                            {format(new Date(order.delivery_slot.date), "EEEE, MMMM d, yyyy")}
                            <br />
                            {order.delivery_slot.time_slot}
                          </>
                        )}
                      </p>
                    </div>
                  </AnimatedWrapper>

                  <AnimatedWrapper animation="fade-in" delay="700" className="mt-2">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border hover:border-border/80 transition-colors h-full">
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" /> Payment Method
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.payment_method || "Credit Card"}
                      </p>
                    </div>
                  </AnimatedWrapper>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="p-4 sm:p-6">
                <h3 className="font-medium mb-4 sm:mb-6 flex items-center text-base sm:text-lg text-foreground">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-muted-foreground" /> 
                  Order Items ({order.items?.length || 0})
                </h3>

                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <AnimatedWrapper key={item.id} animation="fade-up" delay={index < 7 ? ("100" as const) : ("0" as const)}>
                      <div className="group relative rounded-xl border border-border bg-background p-3 sm:p-4 hover:bg-muted/30 transition-all duration-200">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 ring-1 ring-border mx-auto sm:mx-0">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                                <Package className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors text-center sm:text-left">
                                  {item.product?.name || "Product unavailable"}
                                </h4>
                                {item.product?.unit && (
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 text-center sm:text-left">
                                    Per {item.product.unit}
                                  </p>
                                )}
                                {/* Display selected type, size, and color if available */}
                                {(item.selected_type || item.selected_size || item.selected_color) && (
                                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    {item.selected_type && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs px-2 py-0.5 bg-background border-border/50">
                                        {item.selected_type}
                                      </Badge>
                                    )}
                                    {item.selected_size && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs px-2 py-0.5 bg-background border-border/50">
                                        Size: {item.selected_size}
                                      </Badge>
                                    )}
                                    {item.selected_color && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs px-2 py-0.5 bg-background border-border/50 flex items-center">
                                        <span 
                                          className="w-2 h-2 rounded-full mr-1"
                                          style={{ 
                                            backgroundColor: 
                                              ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                                .includes(item.selected_color.toLowerCase()) 
                                                ? item.selected_color.toLowerCase()
                                                : '#888' 
                                          }}
                                        ></span>
                                        {item.selected_color}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-row justify-center sm:flex-col items-center sm:items-end gap-3 sm:gap-1 mt-2 sm:mt-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm text-muted-foreground">Qty:</span>
                                  <Badge 
                                    variant="outline" 
                                    className="font-mono border-border bg-background px-2 min-w-[2.5rem] text-center text-xs sm:text-sm"
                                  >
                                    {item.quantity}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm text-muted-foreground">Price:</span>
                                  <span className="font-medium text-xs sm:text-sm">{formatPrice(item.price_at_time)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Subtotal:</span>
                                <span className="font-semibold text-foreground text-sm sm:text-base">
                                  {formatPrice(item.price_at_time * item.quantity)}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-primary text-xs sm:text-sm"
                                asChild
                              >
                                <Link to={`/product/${item.product?.id}`}>
                                  View Product
                                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AnimatedWrapper>
                  ))}
                </div>

                <div className="mt-8 rounded-xl border border-border p-4 sm:p-6 bg-muted/30">
                  <div className="space-y-3">
                    {/* Subtotal - Calculate from items */}
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(order.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0))}
                      </span>
                    </div>
                    
                    {/* Tax */}
                    {order.tax !== undefined && order.tax > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-medium">{formatPrice(order.tax)}</span>
                      </div>
                    )}
                    
                    {/* Shipping */}
                    {order.shipping_amount !== undefined && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Shipping</span>
                          {order.shipping_amount === 0 && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
                              Free
                            </Badge>
                          )}
                        </div>
                        <span className={`font-medium ${order.shipping_amount === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {formatPrice(order.shipping_amount)}
                        </span>
                      </div>
                    )}
                    
                    {/* Discount */}
                    {order.discount_amount !== undefined && order.discount_amount > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-green-600">-{formatPrice(order.discount_amount)}</span>
                      </div>
                    )}
                    
                    <Separator className="bg-border !my-4" />
                    
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-semibold">Total</span>
                      <div className="flex flex-col items-end">
                        <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
              <Button 
                asChild 
                variant="outline"
                className="border-2 hover:bg-muted/40 text-sm"
              >
                <Link to="/" className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>

              <Button 
                asChild 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/10 text-sm"
              >
                <Link to="/account/orders" className="flex items-center gap-2">
                  View All Orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
