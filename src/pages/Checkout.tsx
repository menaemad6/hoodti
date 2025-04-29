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
import { getUserAddresses } from "@/integrations/supabase/address.service";
import { getShippingFee, getTaxRate } from "@/integrations/supabase/settings.service";
import Spinner from "@/components/ui/spinner";
import { getAvailableDeliverySlots } from "@/integrations/supabase/delivery.service";
import { incrementDiscountUsage } from "@/integrations/supabase/discounts.service";
import { sendOrderConfirmationEmail } from "@/integrations/email.service";
import { ProfileRow } from "@/integrations/supabase/types.service";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
    product_id: string;
    quantity: number;
    price_at_time: number;
    selected_color?: string;
    selected_size?: string;
  }>;
  email: string;
  phone_number: string;
  full_name: string;
}

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  const [taxRate, setTaxRate] = useState<number>(0.08);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [useProfileEmail, setUseProfileEmail] = useState(true);
  const [customEmail, setCustomEmail] = useState("");

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
        const fee = await getShippingFee();
        console.log("Fetched shipping fee:", fee);
        setShippingFee(fee);
        
        // Fetch tax rate
        const rate = await getTaxRate();
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
  }, []);
  
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
  
  useEffect(() => {
    if (cart.length === 0 && !createdOrderId) {
      navigate("/cart");
    }
  }, [cart, navigate, createdOrderId]);
  
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }

    // Fetch available delivery slots
    const fetchDeliverySlots = async () => {
      try {
        const slots = await getAvailableDeliverySlots();
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
        const fee = await getShippingFee();
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
    if (!selectedAddressId || !selectedSlotId) {
      toast({
        title: "Missing information",
        description: "Please select both a delivery address and time slot.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep('payment');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the active email based on tab selection
    const emailToUse = useProfileEmail ? formData.email : customEmail;
    
    if (!formData.firstName || !formData.lastName || !emailToUse || !formData.phone || 
        !selectedAddressId || !selectedSlotId || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const subtotal = cartTotal;
      const shipping = calculateShipping();
      const tax = calculateTax();
      const total = subtotal + shipping + tax - discount;
      
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      const shippingAddressText = selectedAddress ? 
        `${selectedAddress.line1}, ${selectedAddress.line2 ? selectedAddress.line2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}` : '';
      
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: item.product.price,
        selected_color: item.selectedColor,
        selected_size: item.selectedSize
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
        tax: tax,
        discount_amount: discount,
        shipping_amount: shipping,
        items: orderItems,
        // Add the new fields to save to the database
        email: emailToUse,
        phone_number: formData.phone,
        full_name: fullName
      };
      
      // Still increment usage counter if a discount was applied
      const order = await createOrder(orderData);
      setCreatedOrderId(order.id);
      
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
          products: {  // Change from 'product' to 'products' to match the structure expected by the email service
            name: item.product.name,
            price: item.product.price,
            image: item.product.image
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
          shippingCost: `$${shipping.toFixed(2)}`,
          taxAmount: `$${tax.toFixed(2)}`,
          discountAmount: discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00',
          customerPhone: formData.phone, // Add the customer's phone number
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
    return (subtotal > 50 || shippingFee === 0) ? 0 : shippingFee;
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
  const shipping = isFreeShipping ? 0 : shippingFee;
  const tax = calculateTax();
  const total = subtotal + shipping + tax - discount;
  
  if (cart.length === 0 && !isSubmitting && !createdOrderId) {
    return (
      <Layout>
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
                        onValueChange={(value) => handleRadioChange("paymentMethod", value)}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                      >
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem id="cash" value="cash" />
                          <Label htmlFor="cash">Cash on Delivery</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem id="credit-card" value="credit-card" />
                          <Label htmlFor="credit-card">Credit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem id="paypal" value="paypal" />
                          <Label htmlFor="paypal">PayPal</Label>
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
                      <a href="/terms" className="text-primary hover:underline mx-1">
                        Terms of Service
                      </a> and 
                      <a href="/privacy" className="text-primary hover:underline ml-1">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
