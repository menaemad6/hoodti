import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCustomization } from '@/hooks/useCustomization';
import { useTenant } from '@/context/TenantContext';

export function PricingCalculator() {
  const { pricing, design } = useCustomization();
  const { tenant } = useTenant();

  if (!tenant?.customization?.enabled) {
    return null;
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pricing Breakdown</span>
          <Badge variant="outline" className="text-lg font-bold">
            {tenant.currencySymbol}{pricing.totalPrice.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Product */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{design.baseProductType}</div>
            <div className="text-sm text-muted-foreground">
              Size: {design.baseProductSize} | Color: {design.baseProductColor}
            </div>
          </div>
          <div className="font-medium">
            {tenant.currencySymbol}{pricing.baseProductPrice.toFixed(2)}
          </div>
        </div>

        <Separator />

        {/* Customization Costs */}
        {pricing.textElements > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Text Customization</div>
              <div className="text-sm text-muted-foreground">
                {pricing.textElements} text element{pricing.textElements !== 1 ? 's' : ''} × {tenant.currencySymbol}{pricing.textPrice.toFixed(2)} each
              </div>
            </div>
            <div className="font-medium">
              {tenant.currencySymbol}{(pricing.textElements * pricing.textPrice).toFixed(2)}
            </div>
          </div>
        )}

        {pricing.imageElements > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Image Customization</div>
              <div className="text-sm text-muted-foreground">
                {pricing.imageElements} image element{pricing.imageElements !== 1 ? 's' : ''} × {tenant.currencySymbol}{pricing.imagePrice.toFixed(2)} each
              </div>
            </div>
            <div className="font-medium">
              {tenant.currencySymbol}{(pricing.imageElements * pricing.imagePrice).toFixed(2)}
            </div>
          </div>
        )}

        {pricing.totalCustomizationCost > 0 && <Separator />}

        {/* Total Customization Cost */}
        {pricing.totalCustomizationCost > 0 && (
          <div className="flex justify-between items-center">
            <div className="font-medium">Total Customization</div>
            <div className="font-medium text-blue-600">
              {tenant.currencySymbol}{pricing.totalCustomizationCost.toFixed(2)}
            </div>
          </div>
        )}

        <Separator />

        {/* Final Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Price</span>
          <span className="text-green-600">
            {tenant.currencySymbol}{pricing.totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Pricing Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <div className="font-medium mb-1">Pricing Information:</div>
            <div>• Text: {tenant.currencySymbol}{pricing.textPrice.toFixed(2)} per element</div>
            <div>• Images: {tenant.currencySymbol}{pricing.imagePrice.toFixed(2)} per element</div>
            <div>• Base product price varies by type</div>
          </div>
        </div>

        {/* Savings Notice */}
        {pricing.totalCustomizationCost > 0 && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-sm text-green-700 dark:text-green-300">
              <div className="font-medium">Customization Added!</div>
              <div>Your unique design will be printed on high-quality fabric</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
