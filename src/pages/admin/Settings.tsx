import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  User, 
  CreditCard, 
  Send, 
  Globe, 
  Truck,
  Shield,
  Database,
  DollarSign,
  Percent
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getSettings, updateSettings } from "@/integrations/supabase/settings.service";
import Spinner from "@/components/ui/spinner";
import DiscountsTab from "@/components/admin/DiscountsTab";
import SEOHead from "@/components/seo/SEOHead";
import { getSEOConfig } from "@/lib/seo-config";

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discounts");
  const [shippingFee, setShippingFee] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Validate active tab is available
  useEffect(() => {
    // Only discounts and shipping tabs are available
    const availableTabs = ["discounts", "shipping"];
    if (!availableTabs.includes(activeTab)) {
      setActiveTab("discounts");
    }
  }, [activeTab]);
  
  useEffect(() => {
    // Load settings when component mounts or shipping tab is activated
    if (activeTab === "shipping") {
      loadSettings();
    }
  }, [activeTab]);
  
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getSettings();
      if (settings) {
        setShippingFee(settings.shipping_fee.toString());
        setTaxRate(settings.tax_rate.toString());
      } else {
        setShippingFee('5.99'); // Default value
        setTaxRate('0.08'); // Default value (8%)
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully."
    });
  };
  
  const handleSaveShippingSettings = async () => {
    // Validate shipping fee
    if (shippingFee === '' || shippingFee === '.') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid shipping fee."
      });
      return;
    }

    // Validate tax rate
    if (taxRate === '' || taxRate === '.') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid tax rate."
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Parse the strings to numbers before saving
      const shippingFeeNumber = parseFloat(shippingFee);
      const taxRateNumber = parseFloat(taxRate);
      
      // Validate the parsed numbers
      if (isNaN(shippingFeeNumber) || isNaN(taxRateNumber)) {
        throw new Error("Invalid number format");
      }
      
      const success = await updateSettings(shippingFeeNumber, taxRateNumber);
      if (success) {
        toast({
          title: "Settings updated",
          description: "Shipping and tax settings have been updated successfully."
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle shipping fee change with input validation
  const handleShippingFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Accept any input that could form a valid decimal number, including lone decimal points
    if (value === '' || value === '.' || /^(\d*\.?\d{0,2})$/.test(value)) {
      setShippingFee(value === '.' ? value : value === '' ? '' : value);
    }
  };
  
  // Handle tax rate change with input validation
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Accept any input that could form a valid decimal number, including lone decimal points
    if (value === '' || value === '.' || /^(\d*\.?\d{0,4})$/.test(value)) {
      setTaxRate(value === '.' ? value : value === '' ? '' : value);
    }
  };
  
  const seoConfig = getSEOConfig('adminDashboard');
  
  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <SEOHead {...seoConfig} />
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
            <div className="lg:border-r lg:pr-6">
              <div className="flex flex-row lg:flex-col h-auto lg:h-full w-full justify-start p-0 bg-transparent space-y-0 lg:space-y-1 space-x-1 lg:space-x-0 overflow-x-auto lg:overflow-x-visible">
                <button
                  onClick={() => setActiveTab("discounts")}
                  className={`flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm ${
                    activeTab === "discounts"
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Discounts
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm ${
                    activeTab === "shipping"
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Shipping
                </button>
                <button
                  disabled
                  className="flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  General <span className="ml-2 text-xs">(Coming Soon)</span>
                </button>
                <button
                  disabled
                  className="flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <User className="h-4 w-4 mr-2" />
                  Users <span className="ml-2 text-xs">(Coming Soon)</span>
                </button>
                <button
                  disabled
                  className="flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments <span className="ml-2 text-xs">(Coming Soon)</span>
                </button>
                <button
                  disabled
                  className="flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Notifications <span className="ml-2 text-xs">(Coming Soon)</span>
                </button>
                <button
                  disabled
                  className="flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Integrations <span className="ml-2 text-xs">(Coming Soon)</span>
                </button>
                <button
                  disabled
                  className="flex items-center justify-start w-full px-3 py-1.5 text-sm font-medium rounded-sm text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security <span className="ml-2 text-xs">(Coming Soon)</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {activeTab === "discounts" && (
                <DiscountsTab />
              )}
              
              {activeTab === "shipping" && (
                <GlassCard>
                  <CardHeader>
                    <CardTitle>Shipping & Tax Settings</CardTitle>
                    <CardDescription>
                      Configure shipping fees and tax rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <Spinner />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Shipping Fee</h3>
                          
                          <div className="grid gap-4 max-w-md">
                            <div className="grid gap-2">
                              <Label htmlFor="shippingFee">
                                Standard Shipping Fee ($)
                              </Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  id="shippingFee" 
                                  type="text"
                                  className="pl-10"
                                  placeholder="5.99"
                                  value={shippingFee}
                                  onChange={handleShippingFeeChange}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                This fee will be applied to all orders. Enter 0 for free shipping.
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="freeShippingThreshold" />
                              <div>
                                <Label htmlFor="freeShippingThreshold">Free shipping over $50</Label>
                                <p className="text-sm text-muted-foreground">
                                  Customers will get free shipping on orders over $50
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Tax Settings</h3>
                          
                          <div className="grid gap-4 max-w-md">
                            <div className="grid gap-2">
                              <Label htmlFor="taxRate">
                                Tax Rate (decimal)
                              </Label>
                              <div className="relative">
                                <Input 
                                  id="taxRate" 
                                  type="text"
                                  className="pl-3"
                                  placeholder="0.08"
                                  value={taxRate}
                                  onChange={handleTaxRateChange}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Enter tax rate as a decimal (e.g., 0.08 for 8%). Enter 0 for no tax.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-end">
                          <Button onClick={handleSaveShippingSettings} disabled={isSaving}>
                            {isSaving ? <Spinner className="mr-2" size="sm" /> : null}
                            Save Settings
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
