import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight, DollarSign, Truck, BadgePercent } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getShippingFee, getTaxRate, getShippingFeeForGovernment } from '../integrations/supabase/settings.service';
import OrderSummary from '@/components/checkout/OrderSummary';
import { formatPrice } from "../lib/utils";
import { useCurrentTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import SEOHead from "@/components/seo/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { useSEOConfig } from "@/lib/seo-config";

// Custom styles for animations and effects
import "./cart.css";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [shippingFee, setShippingFee] = useState<number>(5.99);
  const [taxRate, setTaxRate] = useState<number>(0.08); // Default tax rate
  const [discount, setDiscount] = useState<number>(0);
  const [discountId, setDiscountId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [cityShippingFee, setCityShippingFee] = useState<number>(0);
  const navigate = useNavigate();
  const currentTenant = useCurrentTenant();
  const seoConfig = useSEOConfig('cart');
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
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

  // Load selected city from session storage or localStorage
  useEffect(() => {
    const savedCity = sessionStorage.getItem('selectedCity') || localStorage.getItem('selectedCity');
    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);
  
  // Update shipping fee when city changes
  useEffect(() => {
    const updateCityShippingFee = async () => {
      if (selectedCity) {
        try {
          const fee = await getShippingFeeForGovernment(selectedCity);
          setCityShippingFee(fee);
        } catch (error) {
          console.error("Error getting city shipping fee:", error);
          setCityShippingFee(shippingFee); // Fallback to default
        }
      } else {
        setCityShippingFee(shippingFee); // Use default if no city selected
      }
    };

    updateCityShippingFee();
  }, [selectedCity, shippingFee]);
  
  const subtotal = cartTotal;
  const isFreeShipping = subtotal >= 50;
  const shipping = isFreeShipping ? 0 : cityShippingFee;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax - discount;
  
  // Load discount from session storage on initial load
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
  
  useEffect(() => {
    // Fetch the current shipping fee from settings
    const fetchShippingFee = async () => {
      try {
        const fee = await getShippingFee(currentTenant.id);
        setShippingFee(fee);
      } catch (error) {
        console.error("Error fetching shipping fee:", error);
        // Keep the default value
      }
    };
    
    // Fetch the current tax rate from settings
    const fetchTaxRate = async () => {
      try {
        const rate = await getTaxRate(currentTenant.id);
        setTaxRate(rate);
      } catch (error) {
        console.error("Error fetching tax rate:", error);
        // Keep the default value
      }
    };
    
    fetchShippingFee();
    fetchTaxRate();
  }, [currentTenant.id]);
  
  if (cart.length === 0) {
    return (
      <Layout>
        <SEOHead {...seoConfig} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-3xl opacity-20"></div>
              <div className="w-24 h-24 bg-muted/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 border-4 border-background/40 rounded-full animate-pulse"></div>
                <ShoppingCart className="h-10 w-10 text-primary/80" strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Your Cart is Empty
            </h1>
            
            <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-lg">
              Looks like you haven't added any products to your cart yet. Check out our amazing products!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="rounded-full px-8 py-6 text-base gap-2 shadow-lg shadow-primary/20"
              >
                <Link to="/shop">
                  Start Shopping
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 py-6 text-base border-primary/20"
              >
                <Link to="/deals">
                  <BadgePercent className="h-5 w-5 mr-2" />
                  Browse Deals
                </Link>
              </Button>
            </div>
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card hover:bg-card/80 border border-border/40 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-center">
                  <DollarSign className="h-10 w-10 text-primary/60 mb-4" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-lg mb-2 text-center">Best Prices</h3>
                <p className="text-muted-foreground text-sm">Get the best prices on all your favorite products with regular discounts and deals.</p>
              </div>
              
              <div className="bg-card hover:bg-card/80 border border-border/40 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-center">
                  <Truck className="h-10 w-10 text-primary/60 mb-4" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-lg mb-2 text-center">Fast Delivery</h3>
                <p className="text-muted-foreground text-sm">Free shipping on orders over $50 with quick and reliable delivery to your doorstep.</p>
              </div>
              
              <div className="bg-card hover:bg-card/80 border border-border/40 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-center">
                  <BadgePercent className="h-10 w-10 text-primary/60 mb-4" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-lg mb-2 text-center">Special Offers</h3>
                <p className="text-muted-foreground text-sm">Exclusive discounts and promotions available for regular customers.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEOHead {...seoConfig} />
      <div className="mb-12">
        {/* Ultra-modern hero section with 3D effects and animations */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/20 pt-20 pb-14 mb-8">
          {/* Dynamic background blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary/20 to-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-10 right-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-r from-violet-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Floating particles */}
            <div className="hidden md:block absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-float"></div>
            <div className="hidden md:block absolute top-1/3 right-1/4 w-3 h-3 bg-blue-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="hidden md:block absolute bottom-1/4 left-1/3 w-2 h-2 bg-violet-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
            
            {/* Decorative circles */}
            <div className="hidden md:block absolute top-1/4 right-1/5 w-32 h-32 border border-primary/10 rounded-full opacity-30 animate-spin-slow"></div>
            <div className="hidden md:block absolute bottom-1/4 left-1/5 w-40 h-40 border border-blue-500/10 rounded-full opacity-20"></div>
          </div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-grid-small-white/[0.03] -z-10"></div>
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-radial-gradient"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* 3D floating cart icon with animated rings */}
              <div className="relative mb-10 p-3 transform hover:scale-105 transition-transform duration-300">
                {/* Outer animated ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-blue-500/20 to-violet-500/30 animate-spin-slow"></div>
                
                {/* Middle pulsing ring */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-primary/20 to-blue-400/20 animate-pulse"></div>
                
                {/* Inner glass effect */}
                <div className="relative bg-background/60 backdrop-blur-lg rounded-full p-6 border border-white/10 shadow-2xl group">
                  <div className="relative z-10 transform group-hover:rotate-12 transition-transform duration-300">
                    <ShoppingCart className="h-10 w-10 text-primary" strokeWidth={1.5} />
                    
                    {/* Small item count badge */}
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-violet-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </div>
                  </div>
                  
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-md"></div>
                </div>
              </div>
              
              {/* Ultra-modern heading with animated gradient */}
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight relative">
                <span className="animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-violet-500">
                  Your Shopping Cart
                </span>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-36 h-1 bg-gradient-to-r from-primary/50 to-violet-500/50 rounded-full blur-sm"></div>
              </h1>
              
              {/* Elegant subheading */}
              <p className="text-lg text-foreground/80 max-w-xl mb-6 leading-relaxed">
                Continue your shopping journey with these carefully selected items
              </p>
              
              {/* Stats in a stylish card */}
              <div className="bg-background/40 backdrop-blur-lg border border-primary/10 rounded-2xl px-6 py-4 mb-8 shadow-lg shadow-primary/5">
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                      {cart.length}
                    </span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide mt-1">
                      {cart.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  
                  <div className="h-10 w-px bg-gradient-to-b from-border/0 via-border/60 to-border/0"></div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                      {formatPrice(cartTotal)}
                    </span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide mt-1">
                      Subtotal
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  className="rounded-full px-8 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                  onClick={() => {
                    const next = '/checkout';
                    if (isAuthenticated) {
                      navigate(next);
                    } else {
                      const nextFull = next; // include query if any later
                      toast({
                        title: "Sign in required",
                        description: "Please sign in to continue to checkout.",
                      });
                      try { sessionStorage.setItem('postAuthRedirect', nextFull); } catch (e) { /* ignore */ }
                      navigate(`/signin?next=${encodeURIComponent(nextFull)}`, { replace: false, state: { from: { pathname: nextFull } } });
                    }
                  }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Link 
                  to="/shop" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 mt-2 sm:mt-0 group"
                >
                  <span>Continue Shopping</span>
                  <div className="w-6 h-6 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:border-primary/50 transition-colors duration-300">
                    <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto text-background fill-current">
              <path d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
            </svg>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassCard>
                <div className="flow-root">
                  <ul className="divide-y divide-border">
                    {cart.map((item, index) => (
                      <li 
                        key={item.product.id} 
                        className="py-6 flex animate-fade-in cart-item rounded-xl hover:bg-background/60 p-3"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-md">
                          <img
                            src={Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="ml-4 sm:ml-6 flex-1 flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-base sm:text-lg font-medium">
                                <Link to={`/product/${item.product.id}`} className="hover:text-primary transition-colors duration-200 flex items-center gap-1">
                                  {item.product.name}
                                  <div className="w-4 h-px bg-primary/30 animate-pulse hidden sm:block"></div>
                                </Link>
                              </h3>
                              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                <span className="text-primary/80">{formatPrice(item.product.price)}</span> per item
                              </p>
                              {/* Display selected color, size, and type if available */}
                              {(item.selected_type  || item.selectedSize || item.selectedColor) && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {(item.selected_type ) && (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-background/70 border border-primary/10 backdrop-blur-sm shadow-sm">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-1 text-primary/70">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M8 10h8" />
                                        <path d="M8 14h4" />
                                      </svg>
                                      {item.selected_type}
                                    </span>
                                  )}
                                  {item.selectedSize && (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-background/70 border border-primary/10 backdrop-blur-sm shadow-sm">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-1 text-primary/70">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M8 10h8" />
                                        <path d="M8 14h4" />
                                      </svg>
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-background/70 border border-primary/10 backdrop-blur-sm shadow-sm">
                                      <span 
                                        className="w-3 h-3 rounded-full mr-1.5 ring-1 ring-border/60"
                                        style={{ 
                                          backgroundColor: 
                                            ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                              .includes(item.selectedColor.toLowerCase()) 
                                              ? item.selectedColor.toLowerCase()
                                              : '#888' 
                                        }}
                                      ></span>
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-base sm:text-lg font-medium mt-1 sm:mt-0">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                          
                          <div className="flex-1 flex items-end justify-between mt-2 sm:mt-0">
                            <div className="flex items-center border border-input rounded-full overflow-hidden">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                                disabled={item.quantity <= 1}
                                className="rounded-none h-6 w-6 sm:h-8 sm:w-8"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                                disabled={item.quantity >= item.product.stock}
                                className="rounded-none h-6 w-6 sm:h-8 sm:w-8"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize, item.selected_type)}
                              className="text-muted-foreground hover:text-destructive text-xs sm:text-sm px-2 sm:px-3"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden xs:inline">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>
            
            <div>
              <GlassCard className="sticky top-24">
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
                
                <div className="px-4 pb-4">
                  <Button className="w-full rounded-full" onClick={() => {
                    const next = '/checkout';
                    if (isAuthenticated) {
                      navigate(next);
                    } else {
                      toast({
                        title: "Sign in required",
                        description: "Please sign in to continue to checkout.",
                      });
                      try { sessionStorage.setItem('postAuthRedirect', next); } catch (e) { /* ignore */ }
                      navigate(`/signin?next=${encodeURIComponent(next)}`, { replace: false, state: { from: { pathname: next } } });
                    }
                  }}>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <Link to="/shop" className="text-sm text-primary hover:underline">
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
