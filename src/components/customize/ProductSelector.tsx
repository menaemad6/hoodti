import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SIZING_OPTIONS } from '@/lib/constants';
import { PRODUCT_COLORS } from '@/types/customization.types';
import { CustomizationDesign } from '@/types/customization.types';
import { CheckCircle, ArrowRight, ArrowLeft, Package, Ruler, Palette } from 'lucide-react';

interface ProductSelectorProps {
  onComplete: () => void;
  design: CustomizationDesign;
  updateBaseProduct: (type: string, size: string, color: string) => void;
  availableProductTypes: string[];
}

export function ProductSelector({ onComplete, design, updateBaseProduct, availableProductTypes }: ProductSelectorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const selectedProductType = SIZING_OPTIONS.find(
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
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
                {availableProductTypes.map((type) => (
                  <Button
                    key={type}
                    variant={design.baseProductType === type ? "default" : "outline"}
                    className={`h-auto p-6 flex-col items-center gap-3 transition-all ${
                      design.baseProductType === type 
                        ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg scale-105' 
                        : 'hover:scale-105 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                    onClick={() => handleProductTypeChange(type)}
                  >
                    <div className="text-lg font-semibold">{type}</div>
                    <div className="text-sm text-muted-foreground">
                      {SIZING_OPTIONS.find(opt => opt.type === type)?.sizes.length || 0} sizes available
                    </div>
                    {design.baseProductType === type && (
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
                {design.baseProductColor && (
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 sm:grid-cols-8 lg:grid-cols-10">
                  {PRODUCT_COLORS.map((color) => (
                    <Button
                      key={color}
                      variant={design.baseProductColor === color ? "default" : "outline"}
                      className={`h-16 w-16 p-0 rounded-full border-2 hover:scale-110 transition-all ${
                        design.baseProductColor === color 
                          ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-lg' 
                          : 'hover:border-primary/30'
                      }`}
                      style={{ backgroundColor: color }}
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
                    Selected: <span className="font-semibold">{design.baseProductColor || 'None'}</span>
                  </div>
                  {design.baseProductColor && (
                    <div 
                      className="w-8 h-8 rounded-full mx-auto border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: design.baseProductColor }}
                    />
                  )}
                </div>
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
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceedToNext()}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onComplete}
            disabled={!isValid}
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:scale-105"
          >
            Continue to Customization
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
