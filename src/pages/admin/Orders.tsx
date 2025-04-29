import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/Layout";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DataTable } from "@/components/admin/DataTable";
import { ChevronRight, Download, FileText, PackageCheck, Truck, ShoppingBag, CheckCircle, AlertCircle, XCircle, Clock, BarChart, Mail, User, MapPin, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getOrdersWithItems, getOrderItemsWithProducts } from "@/integrations/supabase/orders.service";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge from "@/components/ui/status-badge";
import { useRoleAccess } from "@/hooks/use-role-access";
import { sendOrderStatusEmail } from "@/integrations/email.service";

// Add function to calculate relative time
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return `${diffInSecs} second${diffInSecs !== 1 ? 's' : ''} ago`;
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
};

const OrdersPage = () => {
  const { toast } = useToast();
  const { isAdmin } = useRoleAccess();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [customerDetails, setCustomerDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Pass true for forAdminView to get all orders
        const ordersData = await getOrdersWithItems(undefined, true);
        setOrders(ordersData || []);
        
        // Fetch customer details for all orders
        const userIds = [...new Set(ordersData.map((order: any) => order.user_id))];
        if (userIds.length > 0) {
          const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, name, email, phone_number")
            .in("id", userIds);
          
          if (!error && profiles) {
            const customerMap: Record<string, any> = {};
            profiles.forEach((profile) => {
              customerMap[profile.id] = profile;
            });
            setCustomerDetails(customerMap);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load orders data."
        });
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  useEffect(() => {
    if (orderFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === orderFilter));
    }
  }, [orders, orderFilter]);

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    
    try {
      const items = await getOrderItemsWithProducts(order.id);
      setSelectedOrderItems(items || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      setSelectedOrderItems([]);
    }
  };

  const closeDialog = () => {
    setSelectedOrder(null);
    setSelectedOrderItems([]);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    
    setIsUpdatingStatus(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', selectedOrder.id);
      
      if (error) throw error;
      
      // If we get here, the update was successful (204 No Content is success)
      // Update the local state with the new status
      const updatedOrder = { ...selectedOrder, status };
      
      // Update both orders and filteredOrders arrays
      const updateOrdersState = (ordersList: any[]) => {
        return ordersList.map(order => 
          order.id === selectedOrder.id ? updatedOrder : order
        );
      };

      setOrders(prev => updateOrdersState(prev));
      setFilteredOrders(prev => updateOrdersState(prev));
      setSelectedOrder(updatedOrder);
      
      // Send email notification to the customer
      const customerProfile = customerDetails[selectedOrder.user_id];
      if (customerProfile?.email) {
        try {
          // Calculate financial information for the email
          const orderSubtotal = selectedOrderItems.reduce(
            (sum, item) => sum + (parseFloat(item.price_at_time.toString()) * item.quantity), 
            0
          );
          
          // Use the actual tax from the order, don't calculate it
          // This ensures we use the exact tax value that was charged when the order was placed
          let orderTax = selectedOrder.tax;
          if (orderTax === undefined || orderTax === null) {
            console.warn("Tax value not found in order, using fallback calculation");
            orderTax = orderSubtotal * 0.07; // Only as absolute fallback
          } else if (typeof orderTax === 'string') {
            // Handle case where tax might be stored as string
            orderTax = parseFloat(orderTax);
          }
          
          const orderShipping = selectedOrder.shipping_amount || 0;
          const orderDiscount = selectedOrder.discount_amount || 0;
          
          // Format shipping address
          let shippingAddress = "Address not available";
          if (selectedOrder.shipping_address) {
            if (typeof selectedOrder.shipping_address === 'string') {
              shippingAddress = selectedOrder.shipping_address;
            } else if (typeof selectedOrder.shipping_address === 'object') {
              const addr = selectedOrder.shipping_address;
              const parts = [
                addr.name,
                addr.street,
                addr.city,
                addr.state,
                addr.zip
              ].filter(Boolean);
              shippingAddress = parts.join(', ');
            }
          }
          
          // Get payment method information
          const paymentMethod = selectedOrder.payment_method || 
                                (selectedOrder.payment_details?.method) || 
                                "Payment information not available";
          
          // Get delivery information
          const deliverySlot = selectedOrder.delivery_slot || 
                               (selectedOrder.delivery_details?.slot) || 
                               "Standard delivery";
          
          console.log("Sending email with tax value:", orderTax);
          
          await sendOrderStatusEmail({
            userEmail: customerProfile.email,
            userName: customerProfile.name || 'Valued Customer',
            orderId: selectedOrder.id,
            orderStatus: status,
            orderTotal: `$${parseFloat(selectedOrder.total).toFixed(2)}`,
            orderDate: new Date(selectedOrder.created_at).toLocaleDateString(),
            orderItems: selectedOrderItems,
            // Include shipping and payment information
            shippingAddress,
            paymentMethod,
            deliverySlot,
            // Include financial details 
            subtotal: `$${orderSubtotal.toFixed(2)}`,
            shippingCost: `$${orderShipping.toFixed(2)}`,
            taxAmount: `$${orderTax.toFixed(2)}`,
            discountAmount: orderDiscount > 0 ? `-$${orderDiscount.toFixed(2)}` : '$0.00',
            customerPhone: selectedOrder.phone_number || customerProfile.phone || 'Not provided',
          });
          
          toast({
            title: "Email Sent",
            description: `Notification email sent to ${customerProfile.email}`,
          });
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
          toast({
            variant: "destructive",
            title: "Email Notification Failed",
            description: "Status updated but customer email notification failed"
          });
        }
      }
      
      toast({
        title: "Status Updated",
        description: `Order ${selectedOrder.id.slice(0, 8)} status changed to ${status}`,
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update order status"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ShoppingBag className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <PackageCheck className="h-5 w-5 text-blue-500" />;
      case "shipping":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "canceled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ShoppingBag className="h-5 w-5" />;
    }
  };

  const getCustomerName = (userId: string) => {
    const profile = customerDetails[userId];
    if (profile) {
      return profile.name || profile.email || userId.slice(0, 8);
    }
    return userId ? userId.slice(0, 8) : 'Unknown';
  };

  const orderColumns = [
    {
      id: "orderId",
      header: "Order ID",
      accessorKey: "id",
      cell: ({ row }) => `#${row.original.id.slice(0, 8)}`
    },
    {
      id: "customer",
      header: "Customer",
      accessorKey: "user_id",
      cell: ({ row }) => {
        const profile = customerDetails[row.original.user_id];
        return (
          <div>
            <p className="font-medium">{getCustomerName(row.original.user_id)}</p>
            <p className="text-xs text-muted-foreground">{profile?.email || "Customer"}</p>
          </div>
        );
      }
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      id: "date",
      header: "Date",
      accessorKey: "created_at",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
    },
    {
      id: "total",
      header: "Total",
      accessorKey: "total",
      cell: ({ row }) => `$${parseFloat(row.original.total).toFixed(2)}`
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button 
          size="sm" 
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleViewOrder(row.original);
          }}
        >
          View <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )
    }
  ];

  const defaultAddress = {
    name: "Not provided",
    street: "Not provided",
    city: "Not provided",
    state: "Not provided",
    zip: "Not provided"
  };

  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-muted-foreground mt-1">Manage and track customer orders</p>
            </div>
            <Button variant="outline" className="shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Export Orders
            </Button>
          </div>

          {/* Stats Overview - Single row on large screens, grid on smaller screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-row items-center p-4">
                  <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <BarChart className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">All Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
              </CardContent>
            </Card>
            
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-row items-center p-4">
                  <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => order.status === "pending").length}
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300"></div>
              </CardContent>
            </Card>
            
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-row items-center p-4">
                  <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <PackageCheck className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => order.status === "processing").length}
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>
              </CardContent>
            </Card>
            
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-row items-center p-4">
                  <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                    <Truck className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Shipping</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => order.status === "shipping").length}
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300"></div>
              </CardContent>
            </Card>
            
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-row items-center p-4">
                  <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => order.status === "delivered").length}
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 via-green-400 to-green-300"></div>
              </CardContent>
            </Card>
            
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-row items-center p-4">
                  <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Canceled</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => order.status === "canceled").length}
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-300"></div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage customer orders.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Select
                  value={orderFilter}
                  onValueChange={setOrderFilter}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredOrders.length}</span> orders
                </p>
              </div>
              
              <DataTable
                data={filteredOrders.slice(page * pageSize, (page + 1) * pageSize)}
                columns={orderColumns}
                isLoading={isLoading}
                onRowClick={handleViewOrder}
                pagination={{
                  pageIndex: page,
                  pageSize,
                  pageCount: Math.ceil(filteredOrders.length / pageSize),
                  onPageChange: setPage,
                  onPageSizeChange: setPageSize,
                }}
                searchable={true}
                searchPlaceholder="Search orders..."
              />
            </CardContent>
          </Card>
        </div>

        <Dialog open={!!selectedOrder} onOpenChange={() => closeDialog()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-background to-background/90 backdrop-blur-sm">
            <DialogHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {selectedOrder && getStatusIcon(selectedOrder.status)}
                  Order #{selectedOrder?.id && selectedOrder.id.slice(0, 8)}
                </DialogTitle>
              </div>
              <DialogDescription className="mt-2">
                {selectedOrder && (
                  <>
                    Placed on {new Date(selectedOrder.created_at).toLocaleDateString()} at {new Date(selectedOrder.created_at).toLocaleTimeString()}
                    <span className="ml-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {getRelativeTimeString(new Date(selectedOrder.created_at))}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="py-4">
                <div className="bg-gradient-to-r from-blue-50/30 to-blue-100/20 dark:from-blue-900/10 dark:to-blue-800/5 rounded-xl p-5 mb-6 border border-blue-200/30 dark:border-blue-800/30 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Status</h3>
                      <div className="flex items-center mt-1 gap-2">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="font-semibold text-base">{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Update Status</h3>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={handleUpdateStatus}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger className="w-[220px] bg-card/80 backdrop-blur-sm border shadow-sm">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipping">Shipping</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-card to-muted/50 backdrop-blur-sm col-span-full overflow-hidden">
                    <CardHeader className="pb-2 border-b border-border/20">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Order Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1 bg-card/60 p-3 rounded-lg border border-border/20">
                          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                          <p className="font-medium">{selectedOrder.full_name || getCustomerName(selectedOrder.user_id)}</p>
                        </div>
                        <div className="space-y-1 bg-card/60 p-3 rounded-lg border border-border/20">
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedOrder.email || customerDetails[selectedOrder.user_id]?.email || "Not provided"}</p>
                        </div>
                        <div className="space-y-1 bg-card/60 p-3 rounded-lg border border-border/20">
                          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{selectedOrder.phone_number || "Not provided"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50/80 to-green-100/30 dark:from-green-900/10 dark:to-green-800/5 overflow-hidden">
                    <CardHeader className="pb-2 border-b border-green-200/30 dark:border-green-800/30 bg-green-100/20 dark:bg-green-900/10">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        Customer Profile
                      </CardTitle>
                      <CardDescription>Account information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                      {customerDetails[selectedOrder.user_id] ? (
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Name:</span> 
                            <span className="font-medium truncate">{customerDetails[selectedOrder.user_id]?.name || "Not provided"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Email:</span> 
                            <span className="font-medium truncate" title={customerDetails[selectedOrder.user_id]?.email || "Not provided"}>
                              {customerDetails[selectedOrder.user_id]?.email || "Not provided"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Phone:</span> 
                            <span className="font-medium truncate">{customerDetails[selectedOrder.user_id]?.phone_number || "Not provided"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">User ID:</span> 
                            <span className="font-medium text-xs truncate" title={selectedOrder.user_id}>
                              {selectedOrder.user_id}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No profile information available</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 dark:from-indigo-900/10 dark:to-indigo-800/5 overflow-hidden">
                    <CardHeader className="pb-2 border-b border-indigo-200/30 dark:border-indigo-800/30 bg-indigo-100/20 dark:bg-indigo-900/10">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      {typeof selectedOrder.shipping_address === "string" ? (
                        <p className="text-sm">{selectedOrder.shipping_address}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No shipping address provided</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50/80 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/5 overflow-hidden">
                    <CardHeader className="pb-2 border-b border-purple-200/30 dark:border-purple-800/30 bg-purple-100/20 dark:bg-purple-900/10">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Method:</span>
                          <Badge variant="outline" className="font-normal bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
                            {selectedOrder.payment_method || "Not specified"}
                          </Badge>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Total:</span>
                          <span className="font-semibold">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-800/5 mb-6 overflow-hidden">
                  <CardHeader className="pb-2 border-b border-amber-200/30 dark:border-amber-800/30 bg-amber-100/20 dark:bg-amber-900/10">
                    <CardTitle className="flex items-center text-lg gap-2">
                      <ShoppingBag className="h-4 w-4 text-amber-600" />
                      Order Items
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({selectedOrderItems.length} {selectedOrderItems.length === 1 ? 'item' : 'items'})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    {selectedOrderItems.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrderItems.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-card/60 backdrop-blur-sm shadow-sm border border-amber-200/30 dark:border-amber-800/30 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-md flex items-center justify-center overflow-hidden shadow-sm">
                                {item.products?.image ? (
                                  <img src={item.products.image} alt={item.products?.name || 'Product'} className="object-cover w-full h-full" />
                                ) : (
                                  <ShoppingBag className="h-5 w-5 text-amber-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{item.products?.name || 'Unknown Product'}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-xs px-2 py-0.5 bg-amber-100/50 dark:bg-amber-900/30 rounded-full">Qty: {item.quantity}</p>
                                  <p className="text-xs text-muted-foreground">${parseFloat(item.price_at_time).toFixed(2)} each</p>
                                </div>
                                
                                {/* Display selected color and size if available */}
                                {(item.selected_color || item.selected_size) && (
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {item.selected_size && (
                                      <span className="text-xs px-1.5 py-0.5 bg-amber-100/50 dark:bg-amber-900/30 rounded-full">
                                        Size: {item.selected_size}
                                      </span>
                                    )}
                                    {item.selected_color && (
                                      <span className="text-xs px-1.5 py-0.5 bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center">
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
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="font-semibold text-amber-900 dark:text-amber-200">${(parseFloat(item.price_at_time) * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-card/40 backdrop-blur-sm rounded-lg border border-amber-200/30 dark:border-amber-800/30 border-dashed">
                        <ShoppingBag className="h-8 w-8 text-amber-400/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No items in this order.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50/80 to-blue-100/30 dark:from-blue-900/10 dark:to-blue-800/5 overflow-hidden">
                  <CardHeader className="pb-2 border-b border-blue-200/30 dark:border-blue-800/30 bg-blue-100/20 dark:bg-blue-900/10">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-blue-600" />
                        Order Summary
                      </CardTitle>
                      <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:from-blue-100 hover:to-blue-200/50 dark:hover:from-blue-800/20 dark:hover:to-blue-700/10 border-blue-200/50 dark:border-blue-800/50">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Generate Invoice
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${selectedOrderItems.reduce((total, item) => total + (Number(item.price_at_time) * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tax:</span>
                        <span className="font-medium">${Number(selectedOrder.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span className="font-medium">${(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="font-medium text-green-600">-${Number(selectedOrder.discount_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200/50 dark:via-blue-800/30 to-transparent my-2"></div>
                      <div className="flex justify-between pt-1">
                        <span className="font-semibold">Total:</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter className="border-t border-border/40 pt-4 mt-2">
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" onClick={closeDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default OrdersPage;
