import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTenant } from "@/context/TenantContext";
import { 
  getCustomizationSettings, 
  updateCustomizationSettings,
  CustomizationSettings,
  CustomizationProduct
} from "@/integrations/supabase/settings.service";
import Spinner from "@/components/ui/spinner";
import { DollarSign, Palette, Type, Image, Package } from "lucide-react";

const CustomizationsTab = () => {
  const { toast } = useToast();
  const currentTenant = useCurrentTenant();
  const [customizations, setCustomizations] = useState<CustomizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCustomizationSettings();
  }, []);

  const loadCustomizationSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getCustomizationSettings(currentTenant.id);
      if (settings) {
        setCustomizations(settings);
      } else {
        // Create default settings if none exist
        const defaultSettings: CustomizationSettings = {
          text_fee: 5.00,
          image_fee: 30.00,
          products: {
            hoodies: { enabled: true, base_price: 150.00 },
            sweatshirts: { enabled: true, base_price: 120.00 },
            regular_tshirts: { enabled: true, base_price: 80.00 },
            boxy_tshirts: { enabled: true, base_price: 85.00 },
            oversized_tshirts: { enabled: true, base_price: 90.00 },
            slim_fit_tshirts: { enabled: true, base_price: 75.00 },
            polo_shirts: { enabled: true, base_price: 95.00 },
            polo_baskota: { enabled: true, base_price: 100.00 }
          }
        };
        
        const success = await updateCustomizationSettings(defaultSettings, currentTenant.id);
        if (success) {
          setCustomizations(defaultSettings);
          toast({
            title: "Customization settings initialized",
            description: "Default customization settings have been created for your store."
          });
        }
      }
    } catch (error) {
      console.error('Error loading customization settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load customization settings"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customizations) return;
    
    setIsSaving(true);
    try {
      const success = await updateCustomizationSettings(customizations, currentTenant.id);
      if (success) {
        toast({
          title: "Settings saved",
          description: "Customization settings have been updated successfully."
        });
      } else {
        throw new Error("Failed to update customization settings");
      }
    } catch (error) {
      console.error("Error saving customization settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save customization settings."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTextFee = (value: string) => {
    if (!customizations) return;
    const fee = parseFloat(value) || 0;
    setCustomizations({
      ...customizations,
      text_fee: fee
    });
  };

  const updateImageFee = (value: string) => {
    if (!customizations) return;
    const fee = parseFloat(value) || 0;
    setCustomizations({
      ...customizations,
      image_fee: fee
    });
  };

  const updateProductEnabled = (productKey: string, enabled: boolean) => {
    if (!customizations) return;
    setCustomizations({
      ...customizations,
      products: {
        ...customizations.products,
        [productKey]: {
          ...customizations.products[productKey],
          enabled
        }
      }
    });
  };

  const updateProductPrice = (productKey: string, price: string) => {
    if (!customizations) return;
    const numPrice = parseFloat(price) || 0;
    setCustomizations({
      ...customizations,
      products: {
        ...customizations.products,
        [productKey]: {
          ...customizations.products[productKey],
          base_price: numPrice
        }
      }
    });
  };

  const getProductDisplayName = (key: string): string => {
    const names: { [key: string]: string } = {
      hoodies: "Hoodies",
      sweatshirts: "Sweatshirts",
      regular_tshirts: "Regular T-shirts",
      boxy_tshirts: "Boxy T-shirts",
      oversized_tshirts: "Oversized T-shirts",
      slim_fit_tshirts: "Slim-Fit T-shirts",
      polo_shirts: "Polo Shirts",
      polo_baskota: "Polo Baskota"
    };
    return names[key] || key;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (!customizations) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Failed to load customization settings
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Customization Fees
          </CardTitle>
          <CardDescription>
            Set the fees for text and image customizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="textFee" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Customization Fee
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="textFee"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  value={customizations.text_fee}
                  onChange={(e) => updateTextFee(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Fee charged for adding text to products
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFee" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image Customization Fee
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="imageFee"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  value={customizations.image_fee}
                  onChange={(e) => updateImageFee(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Fee charged for adding images to products
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Availability & Pricing
          </CardTitle>
          <CardDescription>
            Configure which products are available for customization and their base prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(customizations.products).map(([productKey, product]) => (
              <div key={productKey} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${productKey}-enabled`}
                      checked={product.enabled}
                      onCheckedChange={(enabled) => updateProductEnabled(productKey, enabled)}
                    />
                    <Label htmlFor={`${productKey}-enabled`} className="font-medium">
                      {getProductDisplayName(productKey)}
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`${productKey}-price`} className="text-sm text-muted-foreground">
                      Base Price
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        id={`${productKey}-price`}
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-6 h-8 w-24 text-sm"
                        value={product.base_price}
                        onChange={(e) => updateProductPrice(productKey, e.target.value)}
                        disabled={!product.enabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Spinner className="mr-2" size="sm" /> : null}
          Save Customization Settings
        </Button>
      </div>
    </div>
  );
};

export default CustomizationsTab;
