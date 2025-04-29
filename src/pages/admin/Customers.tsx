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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Mail, Calendar, Package, ArrowLeft, CheckCircle, Clock, Truck, AlertTriangle, XCircle, Phone, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Customer {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  created_at: string;
  role: UserRole;
  orderCount: number;
  totalSpent: number;
  phone_number?: string | null;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'shipping' | 'canceled';

interface Order {
  id: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  item_count: number;
}

interface OrderItemDB {
  id: string;
  quantity: number;
  price_at_time: number;
  selected_color?: string | null;
  selected_size?: string | null;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface OrderResponseDB {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_address: string | null;
  items: OrderItemDB[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selected_color?: string | null;
  selected_size?: string | null;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface OrderDetails {
  id: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  items: OrderItem[];
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  tax: number;
  shipping_amount: number;
  discount_amount: number;
  payment_method: string | null;
  delivery_slot_id: string | null;
  delivery_slot: string | null;
  order_notes: string | null;
}

const CustomersPage = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        // Get profiles with roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*, id, email, name, avatar, created_at, phone_number')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (profilesError) throw profilesError;

        // Get count for pagination
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        
        setTotalPages(Math.ceil((count || 0) / pageSize));

        const customersWithData = await Promise.all((profiles || []).map(async (profile) => {
          // Get highest role
          const { data: roleData } = await supabase.rpc('get_highest_role', {
            user_id: profile.id
          });

          // Get order summary for this user
          const { data: orderStats, error: orderError } = await supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('user_id', profile.id);

          const { data: totalSpentData } = await supabase
            .from('orders')
            .select('total')
            .eq('user_id', profile.id)
            .eq('status', 'delivered');

          const orderCount = orderStats?.length || 0;
          const spent = totalSpentData?.reduce((sum, order) => {
            return sum + (Number(order.total) || 0);
          }, 0) || 0;

          return {
            id: profile.id,
            email: profile.email || '',
            name: profile.name,
            avatar: profile.avatar,
            created_at: profile.created_at || '',
            role: roleData as UserRole,
            orderCount,
            totalSpent: spent,
            phone_number: profile.phone_number,
          };
        }));

        setCustomers(customersWithData);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load customers",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, pageSize, toast]);

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsLoadingOrders(true);
    
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total,
          items:order_items!order_items_order_id_fkey(count)
        `)
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: Order[] = (orders || []).map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status as Order['status'],
        total: order.total,
        item_count: order.items?.[0]?.count || 0
      }));

      // Calculate total spent from delivered orders
      const totalSpent = formattedOrders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);

      setSelectedCustomerOrders(formattedOrders);
      setSelectedCustomer(prev => prev ? { ...prev, totalSpent } : null);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load customer orders",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setIsLoadingOrderDetails(true);
    try {
      type DBResponse = {
        id: string;
        created_at: string;
        status: string;
        total: number;
        shipping_address: string | null;
        full_name: string | null;
        email: string | null;
        phone_number: string | null;
        tax: number;
        shipping_amount: number;
        discount_amount: number;
        payment_method: string | null;
        delivery_slot_id: string | null;
        delivery_slot: string | null;
        order_notes: string | null;
        items: {
          id: string;
          quantity: number;
          price_at_time: number;
          selected_color?: string | null;
          selected_size?: string | null;
          product: {
            id: string;
            name: string;
            image: string;
          };
        }[];
      };

      const { data: rawData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total,
          shipping_address,
          full_name,
          email,
          phone_number,
          tax,
          shipping_amount,
          discount_amount,
          payment_method,
          delivery_slot_id,
          delivery_slot,
          order_notes,
          items:order_items!order_items_order_id_fkey(
            id,
            quantity,
            price_at_time,
            selected_color,
            selected_size,
            product:products!order_items_product_id_fkey(
              id,
              name,
              image
            )
          )
        `)
        .eq('id', order.id)
        .single();

      if (error) throw error;

      // Type assertion with runtime validation
      const data = rawData as unknown as DBResponse;
      if (!data?.id || !Array.isArray(data.items)) {
        throw new Error('Invalid order data structure');
      }

      // Transform the data to match our interface
      const transformedItems: OrderItem[] = data.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price_at_time,
        selected_color: item.selected_color,
        selected_size: item.selected_size,
        product: item.product
      }));

      // Validate each item has the required properties
      if (!transformedItems.every(item => 
        item && 
        typeof item.id === 'string' && 
        typeof item.quantity === 'number' && 
        typeof item.price === 'number' && 
        item.product && 
        typeof item.product.id === 'string' && 
        typeof item.product.name === 'string' && 
        typeof item.product.image === 'string'
      )) {
        throw new Error('Invalid order item data structure');
      }

      const status = data.status as OrderStatus;
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'shipping', 'canceled'].includes(status)) {
        throw new Error(`Invalid order status: ${status}`);
      }

      const orderDetails: OrderDetails = {
        id: data.id,
        created_at: data.created_at,
        status,
        total: data.total,
        shipping_address: data.shipping_address,
        items: transformedItems,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        tax: data.tax || 0,
        shipping_amount: data.shipping_amount || 0,
        discount_amount: data.discount_amount || 0,
        payment_method: data.payment_method,
        delivery_slot_id: data.delivery_slot_id,
        delivery_slot: data.delivery_slot,
        order_notes: data.order_notes
      };

      setSelectedOrder(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details",
      });
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  const closeDialog = () => {
    setSelectedCustomer(null);
    setSelectedCustomerOrders([]);
    setSelectedOrder(null);
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500';
      case 'admin':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
      case 'shipping':
        return 'bg-purple-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
      case 'shipping':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'cancelled':
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'shipped':
      case 'shipping':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const columns = [
    {
      id: "customer",
      header: "Customer",
      accessorKey: "email",
      cell: ({ row }) => {
        const customer = row.original as Customer;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={customer.avatar || ''} />
              <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{customer.name || 'Unnamed User'}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => {
        const role = row.original.role as UserRole;
        return (
          <Badge variant="outline" className={`${getRoleColor(role)} text-white`}>
            {role}
          </Badge>
        );
      }
    },
    {
      id: "orders",
      header: "Orders",
      accessorKey: "orderCount"
    },
    {
      id: "spent",
      header: "Total Spent",
      accessorKey: "totalSpent",
      cell: ({ row }) => `$${row.original.totalSpent.toFixed(2)}`
    },
    {
      id: "joined",
      header: "Joined",
      accessorKey: "created_at",
      cell: ({ row }) => formatDate(row.original.created_at)
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
            handleViewCustomer(row.original as Customer);
          }}
        >
          View <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Customers</h1>
          </div>

          <GlassCard>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage your customers and their data.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={customers}
                columns={columns}
                isLoading={isLoading}
                onRowClick={(row) => handleViewCustomer(row as Customer)}
                pagination={{
                  pageIndex: page,
                  pageSize: pageSize,
                  pageCount: totalPages,
                  onPageChange: setPage,
                  onPageSizeChange: setPageSize,
                }}
                searchable={true}
                searchPlaceholder="Search customers..."
              />
            </CardContent>
          </GlassCard>
        </div>

        {/* Customer Details Dialog */}
        <Dialog open={!!selectedCustomer} onOpenChange={() => closeDialog()}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl">Customer Details</DialogTitle>
              <DialogDescription>
                Detailed information about this customer.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              {selectedCustomer && !selectedOrder && (
                <div className="mt-2">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center p-6 bg-card border border-border/50 shadow-sm rounded-xl w-full md:w-1/3">
                      <div className="relative mb-6">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={selectedCustomer.avatar || ''} />
                          <AvatarFallback className="text-3xl bg-primary/10">{getInitials(selectedCustomer.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2">
                          <Badge variant="outline" className={`${getRoleColor(selectedCustomer.role)} text-white px-3 py-1`}>
                            {selectedCustomer.role}
                          </Badge>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-center mb-1">{selectedCustomer.name || 'Unnamed User'}</h3>
                      <p className="text-muted-foreground text-sm mb-6">{selectedCustomer.email}</p>
                      
                      <div className="w-full space-y-4 bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm font-medium">{selectedCustomer.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="text-sm font-medium">{selectedCustomer.phone_number || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Joined</p>
                              <p className="text-sm font-medium">{formatDate(selectedCustomer.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary">{selectedCustomer.orderCount}</p>
                          <p className="text-xs text-muted-foreground mt-1">Orders</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary">${selectedCustomer.totalSpent.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="orders" className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Orders
                          </TabsTrigger>
                          <TabsTrigger value="activity" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Activity
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="orders" className="space-y-4 mt-6">
                          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                            <div>
                              <h3 className="font-semibold flex items-center">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Order History
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.orderCount} total orders
                              </p>
                            </div>
                            <div className="bg-card px-4 py-2 rounded-lg shadow-sm">
                              <p className="text-sm font-medium flex items-center gap-2">
                                Total Spent: <span className="font-bold text-primary">${selectedCustomer.totalSpent.toFixed(2)}</span>
                              </p>
                            </div>
                          </div>
                          
                          {isLoadingOrders ? (
                            <div className="space-y-2">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                  <Skeleton className="h-12 w-32" />
                                  <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-16" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : selectedCustomerOrders.length === 0 ? (
                            <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                              <p className="text-muted-foreground">No orders found for this customer.</p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[calc(90vh-300px)] overflow-y-auto pr-2 bg-muted/10 p-3 rounded-lg">
                              {selectedCustomerOrders.map((order) => (
                                <button
                                  key={order.id}
                                  className="w-full text-left"
                                  onClick={() => handleViewOrder(order)}
                                >
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow transition-all duration-200">
                                    <div>
                                      <p className="font-medium flex items-center">
                                        <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                                        #{order.id.slice(0, 8)}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(order.created_at)} • {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                                        {getStatusIcon(order.status)}
                                        <Badge variant={getStatusVariant(order.status)} className="ml-1">
                                          {order.status}
                                        </Badge>
                                      </div>
                                      <p className="font-semibold text-primary">${order.total.toFixed(2)}</p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="activity" className="space-y-4 mt-6">
                          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                            <div>
                              <h3 className="font-semibold flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Recent Activity
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Customer activity and interactions
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                            <p className="text-muted-foreground">Activity tracking coming soon.</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Customer
                  </Button>

                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{selectedOrder.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatDate(selectedOrder.created_at)}
                        </p>
                      </div>
                      
                      <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-3">
                        {getStatusIcon(selectedOrder.status)}
                        <Badge className="text-base px-3 py-1" variant={getStatusVariant(selectedOrder.status)}>
                          {selectedOrder.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Order Contact Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{selectedOrder.full_name || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedOrder.email || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{selectedOrder.phone_number || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping and Payment Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedOrder.shipping_address && (
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Shipping Address
                          </h4>
                          <p className="text-sm whitespace-pre-line">
                            {selectedOrder.shipping_address}
                          </p>
                        </div>
                      )}
                      
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Payment Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm text-muted-foreground">Payment Method:</p>
                            <p className="text-sm font-medium">{selectedOrder.payment_method || "Not specified"}</p>
                          </div>
                          {selectedOrder.delivery_slot && (
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Delivery Slot:</p>
                              <p className="text-sm font-medium">{selectedOrder.delivery_slot}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-4 border-b bg-muted/20">
                        <h4 className="font-medium">Order Items</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Variants</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg border overflow-hidden">
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium">{item.product.name}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {(item.selected_color || item.selected_size) ? (
                                      <>
                                        {item.selected_color && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground">Color:</span>
                                            <div className="flex items-center">
                                              <span 
                                                className="w-3 h-3 rounded-full mr-1"
                                                style={{ 
                                                  backgroundColor: 
                                                    ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                                      .includes(item.selected_color.toLowerCase()) 
                                                      ? item.selected_color.toLowerCase()
                                                      : '#888' 
                                                }}
                                              ></span>
                                              <span className="text-xs font-medium">{item.selected_color}</span>
                                            </div>
                                          </div>
                                        )}
                                        {item.selected_size && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground">Size:</span>
                                            <span className="text-xs font-medium">{item.selected_size}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No variants</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Order Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm">Subtotal:</p>
                          <p className="text-sm font-medium">
                            ${(selectedOrder.total - (selectedOrder.tax || 0) - (selectedOrder.shipping_amount || 0) + (selectedOrder.discount_amount || 0)).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">Shipping:</p>
                          <p className="text-sm font-medium">
                            ${selectedOrder.shipping_amount?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">Tax:</p>
                          <p className="text-sm font-medium">
                            ${selectedOrder.tax?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        {selectedOrder.discount_amount > 0 && (
                          <div className="flex justify-between">
                            <p className="text-sm">Discount:</p>
                            <p className="text-sm font-medium text-green-600">
                              -${selectedOrder.discount_amount.toFixed(2)}
                            </p>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <p className="font-medium">Total:</p>
                            <p className="font-bold">${selectedOrder.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedOrder.order_notes && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Order Notes</h4>
                        <p className="text-sm whitespace-pre-line">{selectedOrder.order_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
              <Button onClick={closeDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CustomersPage;
