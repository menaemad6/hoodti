import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight, DollarSign, Truck, BadgePercent } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getShippingFee } from '../integrations/supabase/settings.service';
import OrderSummary from '@/components/checkout/OrderSummary';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [shippingFee, setShippingFee] = useState<number>(5.99);
  const [discount, setDiscount] = useState<number>(0);
  const [discountId, setDiscountId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const navigate = useNavigate();
  
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
  
  const subtotal = cartTotal;
  const isFreeShipping = subtotal >= 50;
  const shipping = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shipping - discount;
  
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
        const fee = await getShippingFee();
        setShippingFee(fee);
      } catch (error) {
        console.error("Error fetching shipping fee:", error);
        // Keep the default value
      }
    };
    
    fetchShippingFee();
  }, []);
  
  if (cart.length === 0) {
    return (
      <Layout>
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
      <div className="pt-8 sm:pt-12 mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassCard>
                <div className="flow-root">
                  <ul className="divide-y divide-border">
                    {cart.map((item) => (
                      <li key={item.product.id} className="py-6 flex animate-fade-in">
                        <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-md overflow-hidden">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 sm:ml-6 flex-1 flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-base sm:text-lg font-medium">
                                <Link to={`/products/${item.product.id}`} className="hover:text-primary">
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                ${item.product.price.toFixed(2)} per {item.product.unit}
                              </p>
                              {/* Display selected color and size if available */}
                              {(item.selectedColor || item.selectedSize) && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {item.selectedSize && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted/50">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted/50">
                                      <span 
                                        className="w-2 h-2 rounded-full mr-1"
                                        style={{ 
                                          backgroundColor: 
                                            ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                              .includes(item.selectedColor.toLowerCase()) 
                                              ? item.selectedColor.toLowerCase()
                                              : '#888' 
                                        }}
                                      ></span>
                                      {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-base sm:text-lg font-medium mt-1 sm:mt-0">
                              ${(item.product.price * item.quantity).toFixed(2)}
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
                              onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
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
                  tax={0}
                  discount={discount}
                  total={total}
                  onApplyPromo={handleApplyPromo}
                />
                
                <div className="px-4 pb-4">
                  <Button className="w-full rounded-full" asChild>
                    <Link to="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
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
