import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import DeliverySlotSelector from "@/components/checkout/DeliverySlotSelector";
import AddressSelector from "@/components/checkout/AddressSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CreditCard, MapPin, Truck, Check, AlertCircle, Mail, User } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { Address } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/integrations/supabase/orders.service";
import { getUserAddresses, addAddress } from "@/integrations/supabase/address.service";
import { getShippingFee, getTaxRate, getShippingFeeForGovernment } from "@/integrations/supabase/settings.service";
import { checkProductStock, updateProductStock } from "@/integrations/supabase/products.service";
import Spinner from "@/components/ui/spinner";
import { getAvailableDeliverySlots } from "@/integrations/supabase/delivery.service";
import { useCurrentTenant } from "@/context/TenantContext";
import { incrementDiscountUsage } from "@/integrations/supabase/discounts.service";
import { sendOrderConfirmationEmail } from "@/integrations/email.service";
import { ProfileRow } from "@/integrations/supabase/types.service";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/constants";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";
import PolicyModal from "@/components/policies/PolicyModal";
import { CustomizationService } from "@/integrations/supabase/customization.service";

// Define types for slots and order data
interface DeliverySlot {
  id: string;
  time_slot?: string;
  available?: boolean;
}

interface OrderData {
  user_id: string;
  total: number;
  status: string;
  address_id: string;
  delivery_slot_id: string;
  shipping_address: string;
  payment_method: string;
  order_notes: string;
  tax: number;
  discount_amount: number;
  shipping_amount: number;
  items: Array<{
    product_id: string | null; // Make nullable for customized products
    customization_id?: string | null; // Add this field
    quantity: number;
    price_at_time: number;
    selected_color?: string;
    selected_size?: string;
    selected_type?: string;
  }>;
  email: string;
  phone_number: string;
  full_name: string;
  tenant_id: string;
}

const Checkout = () => {
  const { cart, cartTotal, clearCart, isCartInitialized } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentTenant = useCurrentTenant();
  
  const [currentStep, setCurrentStep] = useState<'delivery' | 'payment'>('delivery');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "cash"
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [discountId, setDiscountId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(5.99);
  const [cityShippingFee, setCityShippingFee] = useState<number>(5.99);
  const [taxRate, setTaxRate] = useState<number>(0.08);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [useProfileEmail, setUseProfileEmail] = useState(true);
  const [customEmail, setCustomEmail] = useState("");
  const seoConfig = useSEOConfig('checkout');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<"shipping" | "terms">("terms");

  // Load discount from session storage
  useEffect(() => {
    const savedDiscount = sessionStorage.getItem('discountInfo');
    if (savedDiscount) {
      try {
        const discountInfo = JSON.parse(savedDiscount);
        setDiscountCode(discountInfo.code);
        setDiscountPercent(discountInfo.percent);
        setDiscountId(discountInfo.id);
        
        // Recalculate discount amount based on current cart total
        const discountAmount = cartTotal * (discountInfo.percent / 100);
        setDiscount(discountAmount);
      } catch (error) {
        console.error('Error parsing saved discount:', error);
        sessionStorage.removeItem('discountInfo');
      }
    }
  }, [cartTotal]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        
        // Set form data from profile
        if (data) {
          // Split name into first and last name
          let firstName = "", lastName = "";
          if (data.name) {
            const nameParts = data.name.split(" ");
            firstName = nameParts[0];
            lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
          }
          
          setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            phone: data.phone_number || "",
            email: data.email || user.email || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Fetch the settings (shipping fee and tax rate) from the database
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        // Fetch shipping fee
        const fee = await getShippingFee(currentTenant.id);
        console.log("Fetched shipping fee:", fee);
        setShippingFee(fee);
        setCityShippingFee(fee); // Initialize with default fee
        
        // Fetch tax rate
        const rate = await getTaxRate(currentTenant.id);
        console.log("Fetched tax rate:", rate);
        setTaxRate(rate);
      } catch (error) {
        console.error("Error fetching settings:", error);
        // Keep the defaults if there's an error
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, [currentTenant.id]);
  
  useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        try {
          const userAddresses = await getUserAddresses(user.id);
          if (userAddresses && userAddresses.length > 0) {
            setAddresses(userAddresses);
            const defaultAddress = userAddresses.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
            } else {
              setSelectedAddressId(userAddresses[0].id);
            }
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }
      };
      
      fetchAddresses();
    }
  }, [user]);
  
  // Update shipping fee when selected address changes
  useEffect(() => {
    const updateShippingFeeForAddress = async () => {
      if (selectedAddressId) {
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
        if (selectedAddress && selectedAddress.city) {
          try {
            const fee = await getShippingFeeForGovernment(selectedAddress.city, currentTenant.id);
            setCityShippingFee(fee);
          } catch (error) {
            console.error("Error getting shipping fee for city:", error);
            setCityShippingFee(shippingFee); // Fallback to default
          }
        } else {
          setCityShippingFee(shippingFee); // Use default if no city
        }
      } else {
        setCityShippingFee(shippingFee); // Use default if no address selected
      }
    };

    updateShippingFeeForAddress();
  }, [selectedAddressId, addresses, shippingFee]);
  
  useEffect(() => {
    if (!isCartInitialized) return;
    if (cart.length === 0 && !createdOrderId) {
      navigate("/cart");
    }
  }, [isCartInitialized, cart, navigate, createdOrderId]);
  
  useEffect(() => {
    if (!isCartInitialized) return;
    if (cart.length === 0) {
      navigate("/cart");
    }

    // Fetch available delivery slots
    const fetchDeliverySlots = async () => {
      try {
        const slots = await getAvailableDeliverySlots(currentTenant.id);
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error fetching delivery slots:", error);
        toast({
          title: "Error",
          description: "Could not load delivery slots. Please try again.",
          variant: "destructive"
        });
      }
    };

    // Fetch shipping fee
    const fetchShippingFee = async () => {
      try {
        const fee = await getShippingFee(currentTenant.id);
        setShippingFee(fee);
      } catch (error) {
        console.error("Error fetching shipping fee:", error);
        // Keep the default value
      }
    };
    
    fetchDeliverySlots();
    fetchShippingFee();
  }, [cart, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApplyPromo = (code: string, percent: number, id: string) => {
    setDiscountCode(code);
    setDiscountPercent(percent);
    setDiscountId(id);
    
    // Calculate the discount amount based on the percent
    const discountAmount = cartTotal * (percent / 100);
    setDiscount(discountAmount);
    
    // Store the discount in session storage
    sessionStorage.setItem('discountInfo', JSON.stringify({
      code,
      percent,
      id,
      amount: discountAmount
    }));
  };
  
  const handleAddAddress = (address: Address) => {
    setAddresses(prev => [...prev, address]);
    setSelectedAddressId(address.id);
    
    toast({
      title: "Address added",
      description: "Your new address has been added and selected"
    });
  };
  
  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      toast({
        title: "Address required",
        description: "Please select a shipping address",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSlotId) {
      toast({
        title: "Delivery slot required",
        description: "Please select a delivery time slot",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep('payment');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place an order",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedAddressId) {
      toast({
        title: "Address required",
        description: "Please select a shipping address",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSlotId) {
      toast({
        title: "Delivery slot required",
        description: "Please select a delivery time slot",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the active email based on tab selection
      const emailToUse = useProfileEmail ? formData.email : customEmail;
      
      // Check stock for all items in the cart
      for (const item of cart) {
        // Skip stock check for customized products
        if (item.customizationId) {
          continue;
        }
        
        const stock = await checkProductStock(item.product.id);
        if (stock < item.quantity) {
          toast({
            title: "Insufficient stock",
            description: `Only ${stock} units of ${item.product.name} are available.`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      const subtotal = cartTotal;
      // Use the same shipping calculation as the one used in the UI
      const isFreeShipping = subtotal >= 50;
      const shipping = isFreeShipping ? 0 : cityShippingFee;
      const tax = calculateTax();
      
      // Calculate the total with the shipping fee
      const total = subtotal + cityShippingFee + tax - discount;
      
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      const shippingAddressText = selectedAddress ? 
        `${selectedAddress.line1}, ${selectedAddress.line2 ? selectedAddress.line2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}` : '';
      
      const orderItems = cart.map(item => ({
        product_id: item.customizationId ? null : item.product.id, // Set to null for customized products
        customization_id: item.customizationId || null, // Add customization_id field
        quantity: item.quantity,
        price_at_time: item.product.price,
        selected_color: item.selectedColor,
        selected_size: item.selectedSize,
        selected_type: item.selected_type,
        image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"
      }));
      
      // Create the full name from first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Create the order
      const orderData: OrderData = {
        user_id: user.id,
        total,
        status: 'pending',
        address_id: selectedAddressId,
        delivery_slot_id: selectedSlotId,
        shipping_address: shippingAddressText,
        payment_method: formData.paymentMethod,
        order_notes: formData.notes,
        tax: parseFloat(tax.toFixed(2)),
        discount_amount: parseFloat(discount.toFixed(2)),
        shipping_amount: parseFloat(cityShippingFee.toFixed(2)), // Use city-specific shipping fee
        items: orderItems,
        // Add the new fields to save to the database
        email: emailToUse,
        phone_number: formData.phone,
        full_name: fullName,
        tenant_id: currentTenant.id // Add tenant_id from current tenant
      };
      
      // Still increment usage counter if a discount was applied
      const order = await createOrder(orderData);
      setCreatedOrderId(order.id);
      
      // Handle customization image uploads for completed orders
      const customizationService = CustomizationService.getInstance();
      for (const item of cart) {
        if (item.customizationId) {
          try {
            // Get the customization data to extract user-uploaded images
            const customization = await customizationService.getCustomizationById(item.customizationId);
            if (customization && customization.design.images.length > 0) {
              // Upload user images to permanent storage
              const userImages = customization.design.images.map(img => img.originalFile).filter(Boolean) as File[];
              if (userImages.length > 0) {
                await customizationService.uploadCustomizationImages(user.id, userImages);
                console.log(`Uploaded ${userImages.length} user images for customization ${item.customizationId}`);
              }
            }
          } catch (uploadError) {
            console.error(`Failed to upload customization images for ${item.customizationId}:`, uploadError);
            // Don't prevent order completion if image upload fails
          }
        }
      }
      
      // Update stock for all items in the cart
      for (const item of cart) {
        // Skip stock update for customized products
        if (item.customizationId) {
          continue;
        }
        
        await updateProductStock(item.product.id, -item.quantity);
      }
      
      // If a discount was applied, increment its usage counter
      if (discountId) {
        await incrementDiscountUsage(discountId);
        // Clear discount from session storage after successful use
        sessionStorage.removeItem('discountInfo');
      }
      
      // Send order confirmation email
      try {
        // Get the selected delivery slot information
        const selectedSlot = availableSlots.find((slot: DeliverySlot) => slot.id === selectedSlotId);
        
        // Fix the delivery slot format
        let deliverySlotText = "Standard Delivery";
        
        if (selectedSlotId) {
          // The slot ID is in format 'yyyy-MM-dd_HH:MM AM - HH:MM PM'
          const [dateStr, timeSlot] = selectedSlotId.split('_');
          
          if (dateStr && timeSlot) {
            try {
              // Format the date nicely
              const date = new Date(dateStr);
              const formattedDate = date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              
              // Use the time slot directly from the ID
              deliverySlotText = `${formattedDate} | ${timeSlot}`;
              
              console.log('Parsed delivery slot for email:', deliverySlotText);
            } catch (err) {
              console.error('Error parsing delivery date:', err);
            }
          }
        }
        
        // Format cart items for the email
        const emailItems = cart.map(item => ({
          quantity: item.quantity,
          price_at_time: item.product.price,
          selected_color: item.selectedColor || null,
          selected_size: item.selectedSize || null,
          products: {  // Change from 'product' to 'products' to match the structure expected by the email service
            name: item.product.name,
            price: item.product.price,
            image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"
          }
        }));
        
        // Get the correct payment method text based on selection
        let paymentMethodText = "Cash on Delivery";
        if (formData.paymentMethod === "credit-card") {
          paymentMethodText = "Credit Card";
        } else if (formData.paymentMethod === "paypal") {
          paymentMethodText = "PayPal";
        }
        
        await sendOrderConfirmationEmail({
          userEmail: emailToUse,
          userName: fullName, // Use the same full name here
          orderId: order.id,
          orderTotal: `$${total.toFixed(2)}`,
          orderDate: new Date().toLocaleDateString(),
          orderItems: emailItems,
          shippingAddress: shippingAddressText,
          paymentMethod: paymentMethodText,
          deliverySlot: deliverySlotText,
          // Include financial details
          subtotal: `$${subtotal.toFixed(2)}`,
          shippingCost: `$${cityShippingFee.toFixed(2)}`,
          taxAmount: `$${tax.toFixed(2)}`,
          discountAmount: discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00',
          customerPhone: formData.phone, // Add the customer's phone number
          brandName: BRAND_NAME, // Add brand name for the email template
          domain: currentTenant.domain
        });
        
        console.log('Order confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't prevent checkout completion if email fails
      }
      
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being processed."
      });
      
      clearCart();
      // Redirect to order confirmation page with order ID
      navigate(`/order-confirmation?orderId=${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculateShipping = () => {
    // Free shipping for orders over $50 or if shipping fee is set to 0
    return (subtotal > 50 || cityShippingFee === 0) ? 0 : cityShippingFee;
  };
  
  const calculateTax = () => {
    // Make sure taxRate is a valid number
    if (taxRate === 0 || isNaN(taxRate)) {
      return 0;
    }
    
    // Calculate tax amount using proper decimal arithmetic
    const taxAmount = subtotal * taxRate;
    
    // Round to 2 decimal places to avoid floating point issues
    return Math.round(taxAmount * 100) / 100;
  };
  
  // Calculate order totals
  const subtotal = cartTotal;
  const isFreeShipping = subtotal >= 50;
  const shipping = isFreeShipping ? 0 : cityShippingFee;
  const tax = calculateTax();
  const total = subtotal + cityShippingFee + tax - discount;
  
  if (isCartInitialized && cart.length === 0 && !isSubmitting && !createdOrderId) {
    return (
      <Layout>
        <SEOHead {...seoConfig} />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 pt-8">
          <GlassCard className="p-8 text-center my-12">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to your cart before proceeding to checkout.</p>
            <Button onClick={() => navigate('/shop')} className="rounded-full">
              Browse Products
            </Button>
          </GlassCard>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEOHead {...seoConfig} />
      <div className="pt-8 sm:pt-12 mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center animate-fade-in">Checkout</h1>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-4 left-0 w-full h-0.5 bg-muted">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: currentStep === 'delivery' ? '50%' : '100%' }}
                />
              </div>
              
              <div className="flex justify-between relative">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white z-10">
                    1
                  </div>
                  <span className="mt-2 text-sm font-medium">Delivery</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full z-10 transition-colors duration-500 ${
                    currentStep === 'payment' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className={`mt-2 text-sm transition-colors duration-500 ${
                    currentStep === 'payment' ? 'font-medium' : 'text-muted-foreground'
                  }`}>
                    Payment
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {currentStep === 'delivery' ? (
                  <>
                    <GlassCard className="mb-8 p-4 sm:p-6 animate-fade-in">
                      <AddressSelector
                        addresses={addresses}
                        selectedAddressId={selectedAddressId}
                        onSelectAddress={setSelectedAddressId}
                        onAddNewAddress={handleAddAddress}
                      />
                    </GlassCard>
                    
                    <GlassCard className="mb-8 p-4 sm:p-6 animate-fade-in">
                      <DeliverySlotSelector
                        selectedSlotId={selectedSlotId}
                        onSelectSlot={setSelectedSlotId}
                        availableSlots={availableSlots}
                      />
                    </GlassCard>
                    
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContinueToPayment();
                      }}
                      className="w-full rounded-full mt-6 animate-fade-in"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Continue to Payment
                    </Button>
                  </>
                ) : (
                  <>
                    <GlassCard className="mb-8 p-4 sm:p-6 animate-fade-in">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Contact Information
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address * <span className="text-xs text-muted-foreground">(For order status updates)</span></Label>
                          {profile?.email ? (
                            <Tabs defaultValue="profile" className="w-full" onValueChange={(value) => setUseProfileEmail(value === "profile")}>
                              <TabsList className="grid w-full grid-cols-2 mb-2">
                                <TabsTrigger value="profile">Profile Email</TabsTrigger>
                                <TabsTrigger value="custom">Different Email</TabsTrigger>
                              </TabsList>
                              <TabsContent value="profile">
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  readOnly
                                  className="bg-muted cursor-not-allowed"
                                />
                              </TabsContent>
                              <TabsContent value="custom">
                                <Input
                                  id="customEmail"
                                  name="customEmail"
                                  type="email"
                                  value={customEmail}
                                  onChange={(e) => setCustomEmail(e.target.value)}
                                  required
                                  placeholder="Enter a different email address"
                                />
                              </TabsContent>
                            </Tabs>
                          ) : (
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="your@email.com"
                            />
                          )}
                        </div>
                      </div>
                    </GlassCard>
                    
                    <GlassCard className="mb-8 p-4 sm:p-6 animate-fade-in">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Method
                      </h2>
                      
                      <RadioGroup 
                        defaultValue="cash"
                        name="paymentMethod" 
                        onValueChange={(value) => {
                          if (value === "credit-card" || value === "paypal") {
                            toast({
                              title: "Payment Method Unavailable",
                              description: `${value === "credit-card" ? "Credit card" : "PayPal"} payment is not available yet.`,
                              variant: "default"
                            });
                            // Keep cash as selected
                            handleRadioChange("paymentMethod", "cash");
                          } else {
                            handleRadioChange("paymentMethod", value);
                          }
                        }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                      >
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem id="cash" value="cash" />
                          <Label htmlFor="cash">Cash on Delivery</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-4 relative group opacity-70 cursor-not-allowed">
                          <RadioGroupItem id="credit-card" value="credit-card" disabled />
                          <Label htmlFor="credit-card" className="cursor-not-allowed">Credit Card</Label>
                          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                            Soon
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-4 relative group opacity-70 cursor-not-allowed">
                          <RadioGroupItem id="paypal" value="paypal" disabled />
                          <Label htmlFor="paypal" className="cursor-not-allowed">PayPal</Label>
                          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                            Soon
                          </span>
                        </div>
                      </RadioGroup>
                    </GlassCard>
                    
                    <GlassCard className="mb-8 p-4 sm:p-6 animate-fade-in">
                      <h2 className="text-xl font-semibold mb-6">Additional Information</h2>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Order Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Special instructions for delivery"
                          className="min-h-[100px]"
                        />
                      </div>
                    </GlassCard>
                    
                    <div className="flex gap-4 animate-fade-in">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep('delivery')}
                        className="flex-1 rounded-full"
                      >
                        Back to Delivery
                      </Button>
                      
                      <Button 
                        type="submit" 
                        className="flex-1 rounded-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Processing...
                          </>
                        ) : "Place Order"}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </div>
            
            <div>
              <div className="lg:sticky lg:top-24 space-y-6">
                <GlassCard>
                  {isLoadingSettings ? (
                    <div className="flex justify-center p-8">
                      <Spinner />
                    </div>
                  ) : (
                    <OrderSummary
                      items={cart}
                      subtotal={subtotal}
                      shipping={shipping}
                      shipping_fee={cityShippingFee}
                      tax={tax}
                      discount={discount}
                      total={total}
                      onApplyPromo={handleApplyPromo}
                    />
                  )}
                </GlassCard>
                
                <GlassCard className="p-4 text-sm animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      By placing your order, you agree to our 
                      <button type="button" onClick={() => { setPolicyTab('terms'); setPolicyOpen(true); }} className="text-primary hover:underline mx-1">
                        Terms of Service
                      </button>
                      and 
                      <button type="button" onClick={() => { setPolicyTab('shipping'); setPolicyOpen(true); }} className="text-primary hover:underline ml-1">
                        Shipping & Returns
                      </button>
                    </p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PolicyModal open={policyOpen} onOpenChange={setPolicyOpen} defaultTab={policyTab} />
    </Layout>
  );
};

export default Checkout;
