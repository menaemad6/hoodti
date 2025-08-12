import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock, Ruler, Shield, Truck, Undo2 } from "lucide-react";

type PolicyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "shipping" | "terms";
};

const PolicyModal: React.FC<PolicyModalProps> = ({ open, onOpenChange, defaultTab = "shipping" }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-b from-background to-background/95">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-xl">Shipping & Returns • Terms</DialogTitle>
            <DialogDescription className="text-xs">Clear, simple policies designed for custom-made products</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="shipping" className="rounded-lg">
                  Shipping & Returns
                </TabsTrigger>
                <TabsTrigger value="terms" className="rounded-lg">
                  Terms of Service
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shipping" className="mt-4">
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/40 bg-background/60 p-4">
                    <div className="flex items-start gap-3">
                      <Undo2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Return Policy</p>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 text-foreground/70" />
                            <span>Returns are accepted only if there is an issue with the order (e.g., a design or production mistake) and must be reported within <span className="font-semibold text-foreground">24 hours</span> of delivery.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield className="h-4 w-4 mt-0.5 text-foreground/70" />
                            <span>No exchanges are accepted due to the customized nature of the products.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Ruler className="h-4 w-4 mt-0.5 text-foreground/70" />
                            <span>For sizing issues, a replacement may be possible. The customer is responsible for paying shipping costs again.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 text-foreground/70" />
                            <span>To start a return request, contact support within 24 hours with photos and your order number.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/60 p-4">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Shipping</p>
                        <p className="mt-2 text-sm text-muted-foreground">Delivery times vary by location. Expedited options may be available at checkout. Shipping fees are calculated at checkout, and additional shipping applies for any approved size-related replacement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="mt-4">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p className="text-foreground font-medium">Key Terms</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Custom products are made to order. Cancellations may be limited once production starts.</li>
                    <li>Prices, fees, and delivery estimates are shown at checkout and may vary by location.</li>
                    <li>By placing an order, you confirm your design, size, color, and shipping details are correct.</li>
                    <li>Liability is limited to the cost of the product; indirect or incidental losses are excluded.</li>
                    <li>For any issue, contact support with your order number. We will review and respond promptly.</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;


