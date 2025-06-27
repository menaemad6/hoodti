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
  Percent,
  MapPin,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  getSettings, 
  updateSettings, 
  getGovernmentShippingFees, 
  updateGovernmentShippingFees,
  GovernmentShippingFee 
} from "@/integrations/supabase/settings.service";
import Spinner from "@/components/ui/spinner";
import DiscountsTab from "@/components/admin/DiscountsTab";
import SEOHead from "@/components/seo/SEOHead";
import { getSEOConfig } from "@/lib/seo-config";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discounts");
  const [shippingFee, setShippingFee] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');
  const [governmentFees, setGovernmentFees] = useState<GovernmentShippingFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingGovernmentFees, setIsSavingGovernmentFees] = useState(false);
  const [editingGovernment, setEditingGovernment] = useState<string | null>(null);
  const [newGovernmentName, setNewGovernmentName] = useState<string>('');
  const [newGovernmentFee, setNewGovernmentFee] = useState<string>('');
  
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
      loadGovernmentFees();
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

  const loadGovernmentFees = async () => {
    try {
      const fees = await getGovernmentShippingFees();
      setGovernmentFees(fees);
    } catch (error) {
      console.error("Error loading government fees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load government shipping fees."
      });
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

  const handleSaveGovernmentFees = async () => {
    setIsSavingGovernmentFees(true);
    try {
      const success = await updateGovernmentShippingFees(governmentFees);
      if (success) {
        toast({
          title: "Government fees updated",
          description: "Government shipping fees have been updated successfully."
        });
      } else {
        throw new Error("Failed to update government fees");
      }
    } catch (error) {
      console.error("Error saving government fees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save government shipping fees."
      });
    } finally {
      setIsSavingGovernmentFees(false);
    }
  };

  const handleAddGovernment = () => {
    if (!newGovernmentName.trim() || newGovernmentFee === '' || newGovernmentFee === '.') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both government name and shipping fee."
      });
      return;
    }

    const fee = parseFloat(newGovernmentFee);
    if (isNaN(fee)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid shipping fee."
      });
      return;
    }

    // Check if government already exists
    if (governmentFees.some(g => g.name.toLowerCase() === newGovernmentName.trim().toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This government already exists."
      });
      return;
    }

    const newGovernment: GovernmentShippingFee = {
      name: newGovernmentName.trim(),
      shipping_fee: fee
    };

    setGovernmentFees([...governmentFees, newGovernment]);
    setNewGovernmentName('');
    setNewGovernmentFee('');
  };

  const handleDeleteGovernment = (governmentName: string) => {
    setGovernmentFees(governmentFees.filter(g => g.name !== governmentName));
  };

  const handleEditGovernment = (government: GovernmentShippingFee) => {
    setEditingGovernment(government.name);
    setNewGovernmentName(government.name);
    setNewGovernmentFee(government.shipping_fee.toString());
  };

  const handleSaveEdit = () => {
    if (!newGovernmentName.trim() || newGovernmentFee === '' || newGovernmentFee === '.') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both government name and shipping fee."
      });
      return;
    }

    const fee = parseFloat(newGovernmentFee);
    if (isNaN(fee)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid shipping fee."
      });
      return;
    }

    // Check if new name conflicts with existing governments (excluding the one being edited)
    const conflictingGovernment = governmentFees.find(g => 
      g.name.toLowerCase() === newGovernmentName.trim().toLowerCase() && 
      g.name !== editingGovernment
    );

    if (conflictingGovernment) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This government name already exists."
      });
      return;
    }

    setGovernmentFees(governmentFees.map(g => 
      g.name === editingGovernment 
        ? { name: newGovernmentName.trim(), shipping_fee: fee }
        : g
    ));
    setEditingGovernment(null);
    setNewGovernmentName('');
    setNewGovernmentFee('');
  };

  const handleCancelEdit = () => {
    setEditingGovernment(null);
    setNewGovernmentName('');
    setNewGovernmentFee('');
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

  // Handle government fee change with input validation
  const handleGovernmentFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Accept any input that could form a valid decimal number, including lone decimal points
    if (value === '' || value === '.' || /^(\d*\.?\d{0,2})$/.test(value)) {
      setNewGovernmentFee(value === '.' ? value : value === '' ? '' : value);
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
                <div className="space-y-6">
                  <GlassCard>
                    <CardHeader>
                      <CardTitle>General Shipping & Tax Settings</CardTitle>
                      <CardDescription>
                        Configure default shipping fees and tax rates
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
                            <h3 className="text-lg font-medium">Default Shipping Fee</h3>
                            
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
                                  This fee will be applied as fallback when government-specific fees are not set.
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

                  <GlassCard>
                    <CardHeader>
                      <CardTitle>Government Shipping Fees</CardTitle>
                      <CardDescription>
                        Configure shipping fees for each government/region
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Add New Government</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newGovernmentName">Government Name</Label>
                            <Input
                              id="newGovernmentName"
                              placeholder="e.g., Cairo, Alexandria"
                              value={newGovernmentName}
                              onChange={(e) => setNewGovernmentName(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newGovernmentFee">Shipping Fee ($)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="newGovernmentFee"
                                type="text"
                                className="pl-10"
                                placeholder="0.00"
                                value={newGovernmentFee}
                                onChange={handleGovernmentFeeChange}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-end">
                            <Button onClick={handleAddGovernment} className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Government
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Current Governments</h3>
                        
                        {governmentFees.length === 0 ? (
                          <p className="text-muted-foreground">No governments configured yet.</p>
                        ) : (
                          <div className="grid gap-3">
                            {governmentFees.map((government) => (
                              <div
                                key={government.name}
                                className="flex items-center justify-between p-3 border rounded-lg bg-background/50"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  
                                  {editingGovernment === government.name ? (
                                    // Edit mode - show inputs
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex-1">
                                        <Input
                                          value={newGovernmentName}
                                          onChange={(e) => setNewGovernmentName(e.target.value)}
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                      <div className="relative w-24">
                                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                        <Input
                                          type="text"
                                          className="pl-6 h-8 text-sm"
                                          placeholder="0.00"
                                          value={newGovernmentFee}
                                          onChange={handleGovernmentFeeChange}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    // View mode - show text
                                    <>
                                      <span className="font-medium">{government.name}</span>
                                      <Badge variant={government.shipping_fee === 0 ? "default" : "secondary"}>
                                        ${government.shipping_fee.toFixed(2)}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  {editingGovernment === government.name ? (
                                    // Edit mode - show save/cancel buttons
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSaveEdit}
                                        className="h-8 px-3 text-xs"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                        className="h-8 px-3 text-xs"
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    // View mode - show edit/delete buttons
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditGovernment(government)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteGovernment(government.name)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button onClick={handleSaveGovernmentFees} disabled={isSavingGovernmentFees}>
                          {isSavingGovernmentFees ? <Spinner className="mr-2" size="sm" /> : null}
                          Save Government Fees
                        </Button>
                      </div>
                    </CardContent>
                  </GlassCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
