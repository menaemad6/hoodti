import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SIZING_OPTIONS, getAvailableColorsForProduct, getProductColorImage } from '@/lib/constants';
import { CustomizationDesign } from '@/types/customization.types';
import { CheckCircle, ArrowRight, ArrowLeft, Package, Ruler, Palette } from 'lucide-react';

// Helper function to convert color names to hex values for fallback
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#00FF00',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'gray': '#808080',
    'navy': '#000080',
    'navy-blue': '#000080',
    'baby-blue': '#87CEEB',
    'light-blue': '#ADD8E6',
    'rose': '#FF007F',
    'beige': '#F5F5DC',
    'lime': '#32CD32',
    'dark-green': '#006400',
    'offwhite': '#F5F5F5',
    'bubblegum': '#FFB6C1'
  };
  
  return colorMap[colorName.toLowerCase()] || '#808080'; // Default to gray if color not found
}

interface ProductSelectorProps {
  onComplete: () => void;
  design: CustomizationDesign;
  updateBaseProduct: (type: string, size: string, color: string) => void;
  availableProductTypes: string[];
  availableProductTypesWithInfo?: Array<{
    key: string;
    displayName: string;
    sizes: Array<{ size: string; [key: string]: string | number }>;
    basePrice: number;
    enabled: boolean;
  }>;
}

export function ProductSelector({ onComplete, design, updateBaseProduct, availableProductTypes, availableProductTypesWithInfo }: ProductSelectorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Use the new product info if available, otherwise fallback to constants
  const selectedProductType = availableProductTypesWithInfo?.find(
    product => product.key === design.baseProductType
  ) || SIZING_OPTIONS.find(
    option => option.type === design.baseProductType
  );

  // Calculate if the design is valid for proceeding to customization
  const isValid = design.baseProductType && design.baseProductSize && design.baseProductColor;

  const handleProductTypeChange = (type: string) => {
    // Clear size and color when changing product type
    updateBaseProduct(type, '', '');
  };

  const handleSizeChange = (size: string) => {
    if (design.baseProductType && size) {
      updateBaseProduct(design.baseProductType, size, design.baseProductColor || '');
    }
  };

  const handleColorChange = (color: string) => {
    if (design.baseProductType && design.baseProductSize && color) {
      updateBaseProduct(design.baseProductType, design.baseProductSize, color);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      // Scroll to top before changing step
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Small delay to allow scroll animation to complete
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Scroll to top before changing step
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Small delay to allow scroll animation to complete
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 300);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!design.baseProductType;
      case 2: return !!design.baseProductSize;
      case 3: return !!design.baseProductColor;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <span>1. Choose Product Type</span>
                {design.baseProductType && (
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(availableProductTypesWithInfo || availableProductTypes.map(type => ({ key: type, displayName: type, sizes: [], basePrice: 0, enabled: true }))).map((product) => (
                  <Button
                    key={product.key}
                    variant={design.baseProductType === product.key ? "default" : "outline"}
                    className={`h-auto p-6 flex-col items-center gap-3 transition-all ${
                      design.baseProductType === product.key 
                        ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg scale-105' 
                        : 'hover:scale-105 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                    onClick={() => handleProductTypeChange(product.key)}
                  >
                    <div className="text-lg font-semibold">{product.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sizes.length || 0} sizes available
                    </div>
                    {product.basePrice > 0 && (
                      <div className="text-sm font-medium text-foreground">
                        ${product.basePrice.toFixed(2)}
                      </div>
                    )}
                    {design.baseProductType === product.key && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Ruler className="w-5 h-5 text-primary" />
                </div>
                <span>2. Choose Size</span>
                {design.baseProductSize && (
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProductType ? (
                <div className="space-y-6">
                  <Select value={design.baseProductSize} onValueChange={handleSizeChange}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProductType.sizes.map((sizeOption) => (
                        <SelectItem key={sizeOption.size} value={sizeOption.size} className="text-lg">
                          {sizeOption.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Enhanced Size Chart */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Size Chart</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProductType.sizes.map((sizeOption) => (
                        <div 
                          key={sizeOption.size} 
                          className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 relative ${
                            design.baseProductSize === sizeOption.size
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                          onClick={() => handleSizeChange(sizeOption.size)}
                        >
                          {design.baseProductSize === sizeOption.size && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className="font-medium text-sm mb-1">{sizeOption.size}</div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {Object.entries(sizeOption)
                              .filter(([key]) => key !== 'size')
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key}:</span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Please select a product type first</p>
                  <p className="text-sm">Choose from the options above to see available sizes</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <span>3. Choose Color</span>
                {design.baseProductType && (
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {design.baseProductType ? (
                  <>
                    <div className="grid grid-cols-5 gap-4 sm:grid-cols-8 lg:grid-cols-10">
                      {getAvailableColorsForProduct(design.baseProductType).map((color) => (
                        <Button
                          key={color}
                          variant={design.baseProductColor === color ? "default" : "outline"}
                          className={`h-16 w-16 p-0 rounded-full border-2 hover:scale-110 transition-all ${
                            design.baseProductColor === color 
                              ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-lg' 
                              : 'hover:border-primary/30'
                          }`}
                          style={{ 
                            backgroundColor: getColorHex(color),
                            backgroundImage: `url(${getProductColorImage(design.baseProductType, color)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                          onClick={() => handleColorChange(color)}
                          aria-label={`Select color ${color}`}
                        >
                          {design.baseProductColor === color && (
                            <CheckCircle className="w-5 h-5 text-white drop-shadow-sm" />
                          )}
                        </Button>
                      ))}
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Selected: <span className="font-semibold capitalize">{design.baseProductColor || 'None'}</span>
                      </div>
                      {design.baseProductColor && (
                        <div className="w-8 h-8 rounded-full mx-auto border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                          <img 
                            src={getProductColorImage(design.baseProductType, design.baseProductColor)}
                            alt={design.baseProductColor}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">Please select a product type first</p>
                    <p className="text-sm">Choose from the options above to see available colors</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : step === currentStep 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceedToNext()}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto order-1 sm:order-2"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onComplete}
            disabled={!isValid}
            className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:scale-105 transition-all w-full sm:w-auto order-1 sm:order-2"
          >
            <span className="hidden sm:inline">Continue to Customization</span>
            <span className="sm:hidden">Continue</span>
            <ArrowRight className="w-4 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
