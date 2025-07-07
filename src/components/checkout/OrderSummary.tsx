import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShoppingBag, Tag, DollarSign, Truck, Calculator, BadgePercent, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/context/CartContext";
import { validateDiscount } from "@/integrations/supabase/discounts.service";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  shipping_fee?: number;
  tax: number;
  discount?: number;
  total: number;
  onApplyPromo?: (code: string, discountPercent: number, discountId: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  shipping_fee,
  tax,
  discount = 0,
  total,
  onApplyPromo,
}) => {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || isPromoApplied || !onApplyPromo) return;
    
    setIsValidating(true);
    setValidationError(null);
    
    try {
      // Try to get the discount data first to check if it exists
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase());
      
      // If we couldn't find the code at all
      if (error || !data || data.length === 0) {
        setValidationError("This discount code doesn't exist.");
        setIsValidating(false);
        return;
      }
      
      // We found the code, now validate it properly
      const discount = await validateDiscount(promoCode, subtotal);
      
      if (!discount) {
        // The discount exists but couldn't be applied - provide more specific error
        const foundDiscount = data[0];
        
        if (!foundDiscount.active) {
          setValidationError("This discount code is inactive.");
        } else if (foundDiscount.start_date) {
          const startDate = new Date(foundDiscount.start_date);
          const currentDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          
          if (currentDate < startDate) {
            setValidationError(`This discount code is not active yet. It starts on ${startDate.toLocaleDateString()}.`);
            return;
          }
        } else if (foundDiscount.end_date) {
          const endDate = new Date(foundDiscount.end_date);
          const currentDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          
          if (currentDate > endDate) {
            setValidationError(`This discount code expired on ${endDate.toLocaleDateString()}.`);
            return;
          }
        } else if (foundDiscount.max_uses > 0 && foundDiscount.current_uses >= foundDiscount.max_uses) {
          setValidationError("This discount code has reached its maximum usage limit.");
        } else if (foundDiscount.min_order_amount > 0 && subtotal < foundDiscount.min_order_amount) {
          setValidationError(`This discount requires a minimum order of $${foundDiscount.min_order_amount.toFixed(2)}.`);
        } else {
          setValidationError("This discount code cannot be applied to your order.");
        }
        return;
      }
      
      // Call the parent component's handler with discount info
      onApplyPromo(
        discount.code, 
        discount.discount_percent, 
        discount.id
      );
      
      setIsPromoApplied(true);
      toast({
        title: "Discount applied!",
        description: `${discount.discount_percent}% discount has been applied to your order.`,
      });
    } catch (error) {
      console.error("Error validating discount:", error);
      setValidationError("There was a problem applying your discount code. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="animate-fade-in p-3 sm:p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center">
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Order Summary
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden rounded-full h-7 w-7 sm:h-8 sm:w-8 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>

      <div className={`space-y-3 sm:space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="max-h-60 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          {items.map((item) => (
            <div 
              key={item.product.id} 
              className="flex items-center py-2 border-b border-border/50 last:border-0 animate-fade-in"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded overflow-hidden flex-shrink-0 mr-2 sm:mr-3">
                <img 
                  src={Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"}
                  alt={item.product.name} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium truncate">{item.product.name}</p>
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>{item.quantity} × ${Number(item.product.price).toFixed(2)}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
                {/* Display selected type, size, and color if available */}
                {(item.selected_type || item.selectedSize || item.selectedColor) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.selected_type && (
                      <span className="text-xs px-1.5 py-0.5 bg-muted/50 rounded-sm">
                        {item.selected_type}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span className="text-xs px-1.5 py-0.5 bg-muted/50 rounded-sm">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="text-xs px-1.5 py-0.5 bg-muted/50 rounded-sm flex items-center">
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
            </div>
          ))}
        </div>
        
        {onApplyPromo && (
          <div className="space-y-2 mb-3 sm:mb-4">
            <div className="flex space-x-1 sm:space-x-2">
              <Input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setValidationError(null);
                }}
                disabled={isPromoApplied || isValidating}
                className="rounded-full font-mono text-xs sm:text-sm h-8 sm:h-10"
              />
              <Button 
                variant="outline" 
                onClick={handleApplyPromo} 
                disabled={isPromoApplied || isValidating || !promoCode.trim()}
                className="rounded-full whitespace-nowrap text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-3"
              >
                {isValidating ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                Apply
              </Button>
            </div>
            
            {validationError && (
              <Alert variant="destructive" className="py-1 sm:py-2 px-2 sm:px-3 mt-1 sm:mt-2 text-xs sm:text-sm">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <AlertDescription>
                  {validationError}
                </AlertDescription>
              </Alert>
            )}
            
            {isPromoApplied && (
              <p className="text-xs sm:text-sm text-green-600 animate-fade-in">
                Promo code applied successfully!
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
              Subtotal
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {/* Only show shipping if it's not zero */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
              Shipping
            </span>
            <span>
              ${shipping_fee ? shipping_fee.toFixed(2) : shipping.toFixed(2)}
            </span>
          </div>
          
          {/* Always show tax */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
              Tax
            </span>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="flex items-center">
                <BadgePercent className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Discount
              </span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-border pt-2 sm:pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${(subtotal + (shipping_fee || shipping) + tax - discount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
