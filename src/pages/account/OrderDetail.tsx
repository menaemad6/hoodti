import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ModernCard from "@/components/ui/modern-card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, MapPin, Package, CreditCard, CalendarDays, TruckIcon, User, Mail, Phone, Paintbrush, Ruler } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, getOrderItemsWithProducts } from "@/integrations/supabase/orders.service";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order, OrderItem } from "@/integrations/supabase/types.service";
import { formatPrice } from "../../lib/utils";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";

interface DeliverySlot {
  date: string;
  time_slot: string;
}

// Normalize status to ensure consistent display
const normalizeStatus = (status: string): string => {
  const lowercaseStatus = status.toLowerCase();
  if (lowercaseStatus === 'shipping') return 'shipped';
  if (lowercaseStatus === 'canceled') return 'cancelled';
  return lowercaseStatus;
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

const getStatusColor = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  switch (normalizedStatus) {
    case 'delivered':
      return 'bg-green-500';
    case 'processing':
      return 'bg-primary';
    case 'shipped':
      return 'bg-purple-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = normalizeStatus(status);
  
  let badgeClass = '';
  
  switch (normalizedStatus) {
    case 'delivered':
      badgeClass = 'border-green-200 bg-green-50 text-green-700';
      break;
    case 'processing':
      badgeClass = 'border-primary/30 bg-primary/10 text-primary';
      break;
    case 'shipped':
      badgeClass = 'border-purple-200 bg-purple-50 text-purple-700';
      break;
    case 'pending':
      badgeClass = 'border-yellow-200 bg-yellow-50 text-yellow-700';
      break;
    case 'cancelled':
      badgeClass = 'border-red-200 bg-red-50 text-red-700';
      break;
    default:
      badgeClass = 'border-gray-200 bg-gray-50 text-gray-700';
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`capitalize border px-3 py-1.5 text-sm md:px-5 md:py-2 md:text-base flex items-center gap-1.5 md:gap-2 ${badgeClass}`}
    >
      <span 
        className={`h-2 w-2 md:h-3 md:w-3 rounded-full ${getStatusColor(status)}`}
      ></span>
      {normalizedStatus}
    </Badge>
  );
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const seoConfig = useSEOConfig('accountOrders');
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !id) return;
      
      try {
        setIsLoading(true);
        
        const orderData = await getOrderById(id);
        
        if (orderData) {
          const items = await getOrderItemsWithProducts(id);
          
          setOrder(orderData);
          setOrderItems(items as OrderItem[]);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, user, toast]);
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <SEOHead {...seoConfig} />
          <div className="container mx-auto max-w-5xl px-3 sm:px-4 lg:px-6 mb-12">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }
  
  if (!order) {
    return (
      <ProtectedRoute>
        <Layout>
          <SEOHead {...seoConfig} />
          <div className="container mx-auto max-w-5xl px-3 sm:px-4 lg:px-6 mb-12">
            <AnimatedWrapper animation="fade-in">
              <ModernCard className="p-4 sm:p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                <Button asChild>
                  <Link to="/account/orders">Back to Orders</Link>
                </Button>
              </ModernCard>
            </AnimatedWrapper>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Parse delivery slot information
  let deliverySlotInfo = null;
  if (order.delivery_slots) {
    // Using the delivery_slots relation
    deliverySlotInfo = {
      date: order.delivery_slots.date,
      time_slot: order.delivery_slots.time_slot
    };
  } else if (order.delivery_slot) {
    // Using the string-based delivery_slot format
    try {
      const [dateStr, timeSlot] = order.delivery_slot.split(' | ');
      deliverySlotInfo = {
        date: dateStr,
        time_slot: timeSlot || "Standard Delivery"
      };
    } catch (error) {
      console.warn("Could not parse delivery slot:", error);
      deliverySlotInfo = null;
    }
  }

  const normalizedStatus = normalizeStatus(order.status);
  
  return (
    <ProtectedRoute>
      <Layout>
        <SEOHead {...seoConfig} />
        <div className="min-h-screen bg-gradient-to-b from-background to-background/50 dark:from-background dark:to-background/80">
          <div className="container mx-auto max-w-5xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 sm:gap-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-2 sm:h-10 sm:px-3 hover:bg-primary/10 dark:hover:bg-primary/20"
                  asChild
                >
                  <Link to="/account/orders">
                    <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                    Back
                  </Link>
                </Button>
                <h1 className="hidden md:block text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
                  Order Details
                </h1>
              </div>
            </div>
            
            {/* Mobile-only centered title */}
            <div className="md:hidden text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
                Order Details
              </h1>
            </div>
            
            <AnimatedWrapper animation="fade-in" className="space-y-4 sm:space-y-6">
              <ModernCard 
                className="overflow-hidden border border-border shadow-md bg-card"
                headerClassName="bg-gradient-to-r from-background to-muted/50"
                title={
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 p-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground/90 dark:text-foreground/80">
                        Order #{order?.id.slice(0, 8)}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">
                          Placed {order ? formatDistanceToNow(new Date(order.created_at), { addSuffix: true }) : ''}
                        </p>
                        <p className="text-muted-foreground hidden sm:block">•</p>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">
                          {order ? format(new Date(order.created_at), "PPP") : ''}
                        </p>
                      </div>
                    </div>
                    {order && <StatusBadge status={order.status} />}
                  </div>
                } as any
              >
                {order && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
                      {/* Contact Information */}
                      <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border hover:border-border/80 transition-colors md:col-span-3">
                        <h3 className="font-medium mb-2 flex items-center text-foreground/90 dark:text-foreground/80">
                          <User className="h-4 w-4 mr-1.5 text-primary/90 dark:text-primary/80" /> 
                          Customer Information
                        </h3>
                        <div className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
                          {order.full_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <p>{order.full_name}</p>
                            </div>
                          )}
                          {order.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <p className="text-xs sm:text-sm break-all">{order.email}</p>
                            </div>
                          )}
                          {order.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <p>{order.phone_number}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {order.shipping_address && (
                        <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border hover:border-border/80 transition-colors">
                          <h3 className="font-medium mb-2 flex items-center text-foreground/90 dark:text-foreground/80">
                            <MapPin className="h-4 w-4 mr-1.5 text-primary/90 dark:text-primary/80" /> 
                            Shipping Address
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90 whitespace-pre-line">
                            {order.shipping_address}
                          </p>
                        </div>
                      )}
                      
                      {order.payment_method && (
                        <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border hover:border-border/80 transition-colors">
                          <h3 className="font-medium mb-2 flex items-center text-foreground/90 dark:text-foreground/80">
                            <CreditCard className="h-4 w-4 mr-1.5 text-primary/90 dark:text-primary/80" /> 
                            Payment Method
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90 capitalize">
                            {order.payment_method.replace(/-/g, ' ')}
                          </p>
                        </div>
                      )}
                      
                      {deliverySlotInfo && (
                        <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border hover:border-border/80 transition-colors">
                          <h3 className="font-medium mb-2 flex items-center text-foreground/90 dark:text-foreground/80">
                            <CalendarDays className="h-4 w-4 mr-1.5 text-primary/90 dark:text-primary/80" /> 
                            Delivery Window
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">
                            {format(new Date(deliverySlotInfo.date), "EEEE, MMMM d, yyyy")}
                            <br />
                            {deliverySlotInfo.time_slot}
                          </p>
                        </div>
                      )}
                    </div>
                    
                      <div className="p-3 sm:p-4 lg:p-6 pt-0">
                      <h3 className="font-medium mb-2 sm:mb-4 flex items-center text-foreground/90 dark:text-foreground/80">
                        <ShoppingBag className="h-4 w-4 mr-2 text-primary/90 dark:text-primary/80" /> 
                        Order Items ({orderItems.length})
                      </h3>
                      
                        <div className="rounded-xl border border-border overflow-hidden bg-background/40">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-primary/[0.03] dark:bg-primary/[0.02]">
                              <TableRow>
                                <TableHead className="w-[60px] sm:w-[80px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="p-2 sm:p-4">
                                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-primary/[0.03] dark:bg-primary/[0.02]">
                                      {item.product && Array.isArray(item.product.images) && item.product.images.length > 0 ? (
                                        <img 
                                          src={item.product.images[0]} 
                                          alt={item.product.name} 
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/40" />
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium p-2 sm:p-4">
                                    {item.product ? (
                                      <>
                                        <Link 
                                          to={`/product/${item.product_id}`}
                                          className="hover:text-primary dark:hover:text-primary/90 transition-colors line-clamp-1 text-sm sm:text-base"
                                        >
                                          {item.product.name}
                                        </Link>
                                        <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90 mt-1">
                                          {item.product.unit && `Per ${item.product.unit}`}
                                          
                                          {/* Display type, color and size if available */}
                                          {(item.selected_type || item.selected_color || item.selected_size) && (
                                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                                              {item.selected_type && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs bg-muted/50">
                                                  <Ruler className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-gray-500" />
                                                  {formatArrayValue(item.selected_type)}
                                                </span>
                                              )}
                                              {item.selected_size && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs bg-muted/50">
                                                  <Ruler className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-gray-500" />
                                                  {formatArrayValue(item.selected_size)}
                                                </span>
                                              )}
                                              {item.selected_color && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs bg-muted/50">
                                                  <Paintbrush className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-gray-500" />
                                                  <span 
                                                    className="w-2 h-2 rounded-full mr-0.5 sm:mr-1 border border-gray-300"
                                                    style={{ 
                                                      backgroundColor: 
                                                        ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                                          .includes(formatArrayValue(item.selected_color).split(',')[0].trim().toLowerCase()) 
                                                          ? formatArrayValue(item.selected_color).split(',')[0].trim().toLowerCase()
                                                          : '#888' 
                                                    }}
                                                  ></span>
                                                  {formatArrayValue(item.selected_color)}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">Product unavailable</div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90 p-2 sm:p-4">
                                    {formatPrice(item.price_at_time)}
                                  </TableCell>
                                  <TableCell className="text-right text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90 p-2 sm:p-4">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-xs sm:text-sm p-2 sm:p-4">
                                    {formatPrice(item.price_at_time * item.quantity)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                       <div className="mt-4 sm:mt-6 bg-muted/30 rounded-xl p-3 sm:p-4 border border-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">Subtotal</span>
                          <span className="text-xs sm:text-sm">{formatPrice(orderItems.reduce((total, item) => total + (Number(item.price_at_time) * item.quantity), 0))}</span>
                        </div>

                        {order.tax !== undefined && order.tax !== null && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">Tax</span>
                            <span className="text-xs sm:text-sm">{formatPrice(order.tax)}</span>
                          </div>
                        )}

                        {order.shipping_amount !== undefined && order.shipping_amount !== null && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">Shipping</span>
                            <span className="text-xs sm:text-sm">{Number(order.shipping_amount) === 0 ? 'Free' : formatPrice(order.shipping_amount)}</span>
                          </div>
                        )}

                        {order.discount_amount !== undefined && order.discount_amount !== null && Number(order.discount_amount) > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/90">Discount</span>
                            <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">-${Number(order.discount_amount).toFixed(2)}</span>
                          </div>
                        )}
                        
                        <Separator className="my-2 bg-border" />
                        <div className="flex justify-between items-center font-bold text-sm sm:text-base text-foreground/90 dark:text-foreground/80">
                          <span>Total</span>
                          <span>${formatPrice(Number(order.total))}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-4 lg:p-6 border-t border-border flex flex-col xs:flex-row justify-between gap-3">
                      <Button 
                        asChild 
                        variant="outline"
                        size="sm"
                        className="rounded-full border hover:bg-primary/10 dark:hover:bg-primary/20 text-xs sm:text-sm w-full xs:w-auto"
                      >
                        <Link to="/shop" className="justify-center xs:justify-start">
                          Continue Shopping
                        </Link>
                      </Button>
                      <Button 
                        asChild
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/80 dark:hover:from-primary/90 dark:hover:to-primary text-primary-foreground shadow-lg shadow-primary/10 dark:shadow-primary/10 text-xs sm:text-sm w-full xs:w-auto"
                      >
                        <Link to="/account/orders" className="justify-center xs:justify-start">
                          View All Orders
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </ModernCard>
            </AnimatedWrapper>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default OrderDetail;
