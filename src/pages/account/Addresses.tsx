import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Address as AddressType } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Home, Building2, MapPin, Check, Edit, Trash2 } from "lucide-react";
import AnimatedWrapper from "@/components/ui/animated-wrapper";

const addressSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  line1: z.string().min(5, {
    message: "Address line 1 must be at least 5 characters.",
  }),
  line2: z.string().optional(),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  postalCode: z.string().min(5, {
    message: "Postal code must be at least 5 characters.",
  }),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: AddressType;
  onSuccess: () => void;
  onCancel?: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: address?.name || "",
      line1: address?.line1 || "",
      line2: address?.line2 || "",
      city: address?.city || "",
      state: address?.state || "",
      postalCode: address?.postalCode || "",
      isDefault: address?.isDefault || false,
    },
  });

  async function onSubmit(values: AddressFormValues) {
    setIsSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data?.user?.id;

      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not authenticated.",
        });
        return;
      }

      if (address) {
        const { error } = await supabase
          .from("addresses")
          .update({
            name: values.name,
            line1: values.line1,
            line2: values.line2,
            city: values.city,
            state: values.state,
            postal_code: values.postalCode,
            is_default: values.isDefault
          })
          .eq("id", address.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Address updated successfully!",
        });
      } else {
        const { error } = await supabase.from("addresses").insert({
          name: values.name,
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          state: values.state,
          postal_code: values.postalCode,
          is_default: values.isDefault,
          user_id: userId
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Address added successfully!",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save address.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Label</FormLabel>
                <FormControl>
                  <Input placeholder="Home, Work, or Other" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apt 4B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="10001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-background/50 dark:bg-background/20">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel className="text-base font-semibold">
                  Set as Default Address
                </FormLabel>
                <FormDescription>
                  This address will be used as your default shipping address.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <DialogFooter>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : address ? "Update Address" : "Save Address"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

interface AddressListProps {
  addresses: AddressType[];
  onEdit: (address: AddressType) => void;
  onDelete: (address: AddressType) => void;
  onSetDefault: (address: AddressType) => void;
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  // Sort addresses to show default address first
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedAddresses.map((address) => {
        const isHome = address.name.toLowerCase().includes('home');
        const isWork = address.name.toLowerCase().includes('work');
        
        return (
          <Card 
            key={address.id} 
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              "border-0 shadow-md hover:shadow-lg dark:shadow-gray-950/10 dark:hover:shadow-gray-950/20",
              "bg-white/90 dark:bg-gray-900/50 backdrop-blur-sm",
              address.isDefault && "ring-2 ring-primary/50 dark:ring-primary/30"
            )}
          >
            {address.isDefault && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary flex items-center gap-1 px-2.5 py-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>Default</span>
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2.5 rounded-full",
                  isHome ? "bg-blue-50 text-blue-500 dark:bg-blue-950/50 dark:text-blue-400" :
                  isWork ? "bg-purple-50 text-purple-500 dark:bg-purple-950/50 dark:text-purple-400" :
                  "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400"
                )}>
                  {isHome ? <Home className="h-5 w-5" /> : 
                   isWork ? <Building2 className="h-5 w-5" /> : 
                   <MapPin className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{address.name}</CardTitle>
                  <CardDescription className="text-sm mt-1 line-clamp-2">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {address.city}, {address.state} {address.postalCode}
              </div>
              
              <div className="flex space-x-2 justify-end">
                {!address.isDefault && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSetDefault(address)}
                    className="h-8 px-3 text-xs rounded-full bg-transparent"
                  >
                    Set as Default
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onEdit(address)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        this address from your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(address)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const Addresses = () => {
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data?.user?.id;

      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not authenticated.",
        });
        return;
      }

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const mappedAddresses: AddressType[] = (data || []).map(dbAddress => ({
        id: dbAddress.id,
        name: dbAddress.name,
        line1: dbAddress.line1,
        line2: dbAddress.line2 || undefined,
        city: dbAddress.city,
        state: dbAddress.state,
        postalCode: dbAddress.postal_code,
        isDefault: dbAddress.is_default || false
      }));

      setAddresses(mappedAddresses);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load addresses.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: AddressType) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleDelete = async (address: AddressType) => {
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", address.id);

      if (error) throw error;

      setAddresses(addresses.filter((a) => a.id !== address.id));
      toast({
        title: "Success",
        description: "Address deleted successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete address.",
      });
    }
  };

  const handleSetDefault = async (address: AddressType) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data?.user?.id;

      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not authenticated.",
        });
        return;
      }

      const { error: unsetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      if (unsetError) throw unsetError;

      const { error: setError } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", address.id);

      if (setError) throw setError;

      setAddresses(
        addresses.map((a) => ({
          ...a,
          isDefault: a.id === address.id,
        }))
      );

      toast({
        title: "Success",
        description: "Default address updated successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to set default address.",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchAddresses();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 dark:from-background dark:to-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button 
                asChild 
                variant="ghost" 
                className="h-10 px-3 hover:bg-background/80 dark:hover:bg-background/40"
              >
                <Link to="/account">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <h1 className="hidden md:block text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
                My Addresses
              </h1>
            </div>
            <Button onClick={handleCreate} className="gap-1 rounded-full shadow-sm">
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </div>

          {/* Mobile-only centered title */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-primary/90 dark:via-primary/70 dark:to-secondary/90">
              My Addresses
            </h1>
          </div>

          <AnimatedWrapper animation="fade-in">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary/80 mb-4"></div>
                <p className="text-muted-foreground dark:text-muted-foreground/80">Loading your addresses...</p>
              </div>
            ) : (
              <>
                {addresses.length > 0 ? (
                  <AddressList
                    addresses={addresses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                ) : (
                  <Card className="max-w-2xl mx-auto border-0 shadow-lg shadow-gray-100/50 dark:shadow-black/10 dark:bg-gray-950/50">
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold mb-3 text-foreground/90 dark:text-foreground/80">
                        No Addresses Yet
                      </h2>
                      <p className="text-muted-foreground dark:text-muted-foreground/90 mb-6 max-w-md mx-auto">
                        You haven't added any addresses yet. Add an address to make checkout easier.
                      </p>
                      <Button onClick={handleCreate} className="gap-1 rounded-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 dark:from-green-500 dark:to-blue-500 dark:hover:from-green-600 dark:hover:to-blue-600 text-white shadow-lg shadow-blue-600/10 dark:shadow-blue-500/10">
                        <Plus className="h-4 w-4" />
                        Add New Address
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </AnimatedWrapper>
        </div>
      </div>

      {/* Address Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>
              {editingAddress ? "Update your shipping address information below." : "Fill in the details to add a new shipping address."}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            address={editingAddress || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Addresses;

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"
