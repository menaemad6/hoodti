
import React from "react";
import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

export type OrderStatus = "pending" | "processing" | "shipping" | "delivered";

interface OrderProgressProps {
  status: OrderStatus;
  estimatedDelivery?: string;
}

const OrderProgress: React.FC<OrderProgressProps> = ({ status, estimatedDelivery }) => {
  const steps = [
    { id: "pending", label: "Order Confirmed", icon: CheckCircle2 },
    { id: "processing", label: "Processing", icon: Package },
    { id: "shipping", label: "On the Way", icon: Truck },
    { id: "delivered", label: "Delivered", icon: Clock },
  ];

  const getStepStatus = (stepId: string) => {
    const statusMap: Record<OrderStatus, number> = {
      pending: 0,
      processing: 1,
      shipping: 2,
      delivered: 3,
    };
    
    const currentIndex = statusMap[status];
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <GlassCard className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Order Status</h3>
        {estimatedDelivery && (
          <div className="text-sm">
            <span className="text-muted-foreground">Estimated Delivery: </span>
            <span className="font-medium">{estimatedDelivery}</span>
          </div>
        )}
      </div>
      
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-[22px] left-0 w-full h-0.5 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-1000"
            style={{ 
              width: status === 'pending' ? '0%' : 
                     status === 'processing' ? '33%' : 
                     status === 'shipping' ? '66%' : '100%' 
            }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between relative">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const stepStatus = getStepStatus(step.id);
            
            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center w-1/4"
              >
                <div 
                  className={`flex items-center justify-center w-11 h-11 rounded-full border-2 z-10 transition-all duration-500 ${
                    stepStatus === 'completed' ? 'border-primary bg-primary text-white' :
                    stepStatus === 'current' ? 'border-primary text-primary bg-primary/10 animate-pulse' :
                    'border-muted-foreground/30 text-muted-foreground bg-background'
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                
                <span 
                  className={`mt-2 text-xs text-center transition-colors duration-500 ${
                    stepStatus === 'completed' || stepStatus === 'current'
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export default OrderProgress;
