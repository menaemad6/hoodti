import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Plus, 
  Type, 
  Image as ImageIcon,
  Palette,
  Save,
  ShoppingCart,
  RotateCcw,
  CheckCircle,
  Circle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCustomization } from '@/hooks/useCustomization';
import { useCurrentTenant } from '@/context/TenantContext';
import { useCart } from '@/context/CartContext';
import { ProductSelector } from '@/components/customize/ProductSelector';
import { TextEditor } from '@/components/customize/TextEditor';
import { ImageUploader, ImageEditor } from '@/components/customize/ImageUploader';
import { useToast } from '@/hooks/use-toast';
import { getProductColorImage } from '@/lib/constants';
import { CustomizationText, CustomizationImage, FONT_FAMILIES, PRODUCT_COLORS, TEXT_COLORS } from '@/types/customization.types';
import Layout from '@/components/layout/Layout';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { CustomizationService } from '@/integrations/supabase/customization.service';
import { generateDesignImage, dataURLtoFile, generateDesignFilename } from '@/lib/design-image-generator';
import { uploadDesignImage } from '@/integrations/supabase/storage.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Helper function to convert color names to hex values
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    // Product colors
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
    'lightblue': '#87CEEB',
    'rose': '#FF007F',
    'beige': '#F5F5DC',
    'lime': '#32CD32',
    'darkgreen': '#006400',
    'offwhite': '#F5F5F5',
    // Text colors (additional)
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'maroon': '#800000',
    'olive': '#808000',
    'teal': '#008080',
    'indigo': '#4B0082',
    'violet': '#EE82EE',
    'coral': '#FF7F50',
    'salmon': '#FA8072',
    'turquoise': '#40E0D0',
    'lavender': '#E6E6FA',
    'plum': '#DDA0DD',
    'tan': '#D2B48C',
    'khaki': '#F0E68C',
    'crimson': '#DC143C'
  };
  
  return colorMap[colorName.toLowerCase()] || '#808080'; // Default to gray if color not found
}

export default function CustomizeProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentTenant = useCurrentTenant();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const {
    design,
    pricing,
    addText,
    updateText,
    removeText,
    addImage,
    updateImage,
    removeImage,
    selectElement,
    startResize,
    updateElementSize,
    stopResize,
    resetDesign,
    isValid,
    hasCustomization,
    updateBaseProduct,
    availableProductTypes,
    availableProductTypesWithInfo,
    isLoadingSettings,
  } = useCustomization();

  const [currentStep, setCurrentStep] = useState<'selection' | 'customization'>('selection');
  const [activeTab, setActiveTab] = useState('text');
  const [draggedElement, setDraggedElement] = useState<CustomizationText | CustomizationImage | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingElement, setResizingElement] = useState<CustomizationText | CustomizationImage | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [showTextModal, setShowTextModal] = useState(false);
  const [showEditTextModal, setShowEditTextModal] = useState(false);
  const [newTextInput, setNewTextInput] = useState('');
  const [editingText, setEditingText] = useState<CustomizationText | null>(null);
  const [clickToAddMode, setClickToAddMode] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    const validFont = FONT_FAMILIES.find(font => font !== '---');
    return validFont || 'Arial';
  });
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Calculate progress for the step indicator
  const getStepProgress = () => {
    if (currentStep === 'selection') {
      let progress = 0;
      if (design.baseProductType) progress += 33;
      if (design.baseProductSize) progress += 33;
      if (design.baseProductColor) progress += 34;
      return progress;
    }
    return 100;
  };

  // Get current step number for selection
  const getCurrentSelectionStep = () => {
    if (!design.baseProductType) return 1;
    if (!design.baseProductSize) return 2;
    if (!design.baseProductColor) return 3;
    return 4;
  };

  // Check if customization is enabled for this tenant
  useEffect(() => {
    // Only show error if we've finished loading and there are no settings
    if (!isLoadingSettings && !hasCustomization) {
      toast({
        title: "Customization Not Available",
        description: "This brand doesn't support product customization.",
        variant: "destructive",
      });
      navigate('/shop');
    }
  }, [isLoadingSettings, hasCustomization, navigate, toast]);

  // Scroll to top when navigating between steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep === 'customization') {
        if (e.ctrlKey && e.key === 't') {
          e.preventDefault();
          handleAddText();
        }
        if (e.key === 'Escape') {
          setClickToAddMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const handleProductSelectionComplete = () => {
    setCurrentStep('customization');
  };

  const handleAddText = () => {
    setShowTextModal(true);
  };

  const handleEditText = (text: CustomizationText) => {
    setEditingText(text);
    setNewTextInput(text.text);
    setSelectedFont(text.fontFamily);
    setSelectedColor(text.color);
    setShowEditTextModal(true);
  };

  const toggleClickToAddMode = () => {
    setClickToAddMode(!clickToAddMode);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!clickToAddMode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only add text if clicking within the canvas bounds (600x500) with padding consideration
    if (x >= 20 && x <= 580 && y >= 20 && y <= 480) {
      setNewTextInput('');
      setShowTextModal(true);
      // Store the click position for when text is confirmed
      setClickToAddMode(false);
      // We'll need to store this position temporarily
      const tempPosition = { x, y };
      // For now, we'll use a simple approach - you could enhance this with a more sophisticated state management
    }
  };

  const handleConfirmAddText = () => {
    if (newTextInput.trim() && selectedColor) {
      // Position text in the center of the canvas (600x500)
      const centerX = 300;
      const centerY = 250;
      addText(newTextInput.trim(), { x: centerX, y: centerY }, selectedFont, selectedColor);
      
      // Reset modal state
      setNewTextInput('');
      const validFont = FONT_FAMILIES.find(font => font !== '---') || 'Arial';
      setSelectedFont(validFont);
      setSelectedColor('');
      setShowTextModal(false);
      
      toast({
        title: "Text Added",
        description: "Text element has been added to your design.",
      });
    } else if (!selectedColor) {
      toast({
        title: "Color Required",
        description: "Please select a color for your text.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAddText = () => {
    setNewTextInput('');
    const validFont = FONT_FAMILIES.find(font => font !== '---') || 'Arial';
    setSelectedFont(validFont);
    setSelectedColor('');
    setShowTextModal(false);
  };

  const handleConfirmEditText = () => {
    if (newTextInput.trim() && selectedColor && editingText) {
      updateText(editingText.id, {
        text: newTextInput.trim(),
        fontFamily: selectedFont,
        color: selectedColor
      });
      
      // Reset modal state
      setNewTextInput('');
      const validFont = FONT_FAMILIES.find(font => font !== '---') || 'Arial';
      setSelectedFont(validFont);
      setSelectedColor('');
      setShowEditTextModal(false);
      setEditingText(null);
      
      toast({
        title: "Text Updated",
        description: "Text element has been updated successfully.",
      });
    } else if (!selectedColor) {
      toast({
        title: "Color Required",
        description: "Please select a color for your text.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditText = () => {
    setNewTextInput('');
    const validFont = FONT_FAMILIES.find(font => font !== '---') || 'Arial';
    setSelectedFont(validFont);
    setSelectedColor('');
    setShowEditTextModal(false);
    setEditingText(null);
  };

  const handleAddImage = async (file: File, position: { x: number; y: number }) => {
    try {
      await addImage(file, position);
      toast({
        title: "Image Added",
        description: "Image has been added to your design.",
      });
    } catch (error) {
      console.error('Error adding image:', error);
      toast({
        title: "Failed to Add Image",
        description: "Failed to add image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDesign = () => {
    // TODO: Implement save functionality
    toast({
      title: "Design Saved",
      description: "Your customization design has been saved.",
    });
  };

  const handleAddToCart = async () => {
    if (!isValid) {
      toast({
        title: "Incomplete Design",
        description: "Please complete your design before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);

    // Check if product type, size, and color are selected
    if (!design.baseProductType || !design.baseProductSize || !design.baseProductColor) {
      toast({
        title: "Product Not Selected",
        description: "Please select a product type, size, and color before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are any customizations
    if (design.texts.length === 0 && design.images.length === 0) {
      toast({
        title: "No Customizations",
        description: "Please add at least one text or image element to your design.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      setIsAddingToCart(false);
      return;
    }

    try {
      // Save customization to database first
      const customizationService = CustomizationService.getInstance();
      
      // Ensure tenant.id is available
      if (!currentTenant?.id) {
        throw new Error('Tenant ID is not available');
      }
      
      // Ensure user is authenticated
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }
      
      console.log('Creating customization with:', {
        userId: user.id,
        tenantId: currentTenant.id,
        design: design,
        pricing: pricing
      });
      
      // Validate design data
      if (!design.baseProductType || !design.baseProductSize || !design.baseProductColor) {
        throw new Error('Design is incomplete - missing product type, size, or color');
      }
      
      const customizationSession = await customizationService.createCustomization(
        user.id,
        currentTenant.id,
        design,
        pricing
      );

      if (!customizationSession) {
        throw new Error('Failed to save customization to database');
      }

      console.log('Customization created successfully:', customizationSession);

      // Generate design image from canvas
      let designImageUrl: string | null = null;
      if (canvasRef.current) {
        try {
          // Generate the design image
          const imageDataUrl = await generateDesignImage(canvasRef.current, {
            width: design.canvasWidth || 600,
            height: design.canvasHeight || 500,
            quality: 0.9,
            backgroundColor: '#ffffff'
          });

          // Convert to file and upload
          const filename = generateDesignFilename(customizationSession.id);
          const imageFile = dataURLtoFile(imageDataUrl, filename);
          designImageUrl = await uploadDesignImage(imageFile, filename);

          // Update customization with preview image
          await customizationService.completeCustomization(customizationSession.id, designImageUrl);

          console.log('Design image generated and stored:', designImageUrl);
        } catch (imageError) {
          console.error('Error generating design image:', imageError);
          // Continue without image - customization will still work
          toast({
            title: "Warning",
            description: "Design image generation failed, but product was added to cart.",
            variant: "destructive",
          });
        }
      }

      // Create a customized product object with the actual customization ID
      const customizedProduct: Product = {
        id: customizationSession.id, // Use the actual UUID from database
        name: `Custom ${design.baseProductType}`,
        description: `Customized ${design.baseProductType} with ${design.texts.length} text elements and ${design.images.length} image elements`,
        price: pricing.totalPrice,
        images: designImageUrl ? [designImageUrl] : (design.backgroundImage ? [design.backgroundImage] : []),
        unit: 'piece',
        category_id: 'customized',
        stock: 1,
        featured: false,
        discount: 0,
        is_new: true,
        original_price: pricing.totalPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        size: design.baseProductSize,
        color: design.baseProductColor,
        // Store customization data as metadata
        material: JSON.stringify({
          customizationId: customizationSession.id,
          texts: design.texts,
          images: design.images.map(img => ({
            ...img,
            // Images are kept locally in UI only - no merchant access needed
            localUrl: img.url,
            merchantUrl: '', // No upload to storage
          })),
          baseProductType: design.baseProductType,
          baseProductSize: design.baseProductSize,
          baseProductColor: design.baseProductColor,
          canvasWidth: design.canvasWidth,
          canvasHeight: design.canvasHeight,
          designImageUrl: designImageUrl, // Include the generated design image URL
        }),
      };

      console.log('Adding customized product to cart:', customizedProduct);

      // Add to cart with customization details
      addToCart(
        customizedProduct, 
        1, 
        design.baseProductColor, // selectedColor
        design.baseProductSize,  // selectedSize
        customizationSession.id, // selected_type (using customization ID as type identifier)
        customizationSession.id  // customizationId
      );

      toast({
        title: "Added to Cart",
        description: `Your customized ${design.baseProductType} has been added to cart!`,
        action: (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => navigate('/cart')} 
            className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 shrink-0"
          >
            View Cart
          </Button>
        ),
      });

      // Optionally navigate to cart or stay on page
      // navigate('/cart');
    } catch (error) {
      console.error('Error adding customized product to cart:', error);
      
      // Log additional details for debugging
      console.error('Error details:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        user: user,
        currentTenant: currentTenant,
        design: design,
        pricing: pricing
      });
      
      toast({
        title: "Error",
        description: `Failed to add customized product to cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your design? This action cannot be undone.')) {
      resetDesign();
      toast({
        title: "Design Reset",
        description: "Your design has been reset to default.",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, element: CustomizationText | CustomizationImage) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const elementX = 'text' in element ? element.position.x : element.position.x;
    const elementY = 'text' in element ? element.position.y : element.position.y;
    
    setDraggedElement(element);
    setDragOffset({
      x: e.clientX - rect.left - elementX,
      y: e.clientY - rect.top - elementY,
    });
    
    selectElement(element);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    // Constrain to canvas bounds (600x500) with padding consideration
    const constrainedX = Math.max(20, Math.min(newX, 580 - 100)); // canvas width - padding - approximate element width
    const constrainedY = Math.max(20, Math.min(newY, 480 - 50));  // canvas height - padding - approximate element height
    
    if ('text' in draggedElement) {
      updateText(draggedElement.id, {
        position: { x: constrainedX, y: constrainedY }
      });
    } else {
      updateImage(draggedElement.id, {
        position: { x: constrainedX, y: constrainedY }
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleResizeStart = (e: React.MouseEvent, element: CustomizationText | CustomizationImage, handle: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingElement(element);
    if ('text' in element) {
      // For text, use fontSize to calculate approximate size
      const fontSize = element.fontSize;
      const textWidth = element.text.length * (fontSize * 0.6); // Approximate text width
      setResizeStartSize({ width: textWidth, height: fontSize * 1.2 });
    } else {
      setResizeStartSize(element.size);
    }
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    
    startResize(element, handle);
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizingElement || !canvasRef.current) return;
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    let newWidth = resizeStartSize.width;
    let newHeight = resizeStartSize.height;
    
    // Calculate new size based on resize handle
    if ('text' in resizingElement) {
      // For text, adjust fontSize based on width change
      const sizeRatio = 1 + (deltaX / resizeStartSize.width);
      const newFontSize = Math.max(8, Math.min(72, Math.round(resizingElement.fontSize * sizeRatio)));
      
      updateText(resizingElement.id, { fontSize: newFontSize });
    } else {
      // For images, adjust both width and height
      newWidth = Math.max(50, Math.min(500, resizeStartSize.width + deltaX));
      newHeight = Math.max(50, Math.min(500, resizeStartSize.height + deltaY));
      
      updateImage(resizingElement.id, { size: { width: newWidth, height: newHeight } });
    }
  };

  const handleResizeEnd = () => {
    setResizingElement(null);
    setResizeStartSize({ width: 0, height: 0 });
    setResizeStartPos({ x: 0, y: 0 });
    stopResize();
  };

  // Show loading state while fetching customization settings
  if (isLoadingSettings) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading customization settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if customization is not available
  if (!hasCustomization) {
    return null;
  }

  if (currentStep === 'selection') {
    return (
      <Layout>
        <div className="min-h-screen ">
          {/* Hero Section */}
          <div className="relative overflow-hidden ">
            <div className="container mx-auto px-4 py-16 text-center relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  Customize Your Style
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create your perfect product with our easy-to-use customization tool. 
                Choose your product, size, and color to get started.
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="container mx-auto px-4 -mt-8 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className=" rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Step {getCurrentSelectionStep()} of 3
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {Math.round(getStepProgress())}% Complete
                  </Badge>
                </div>
                
                <Progress value={getStepProgress()} className="h-3 mb-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    design.baseProductType 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      design.baseProductType 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {design.baseProductType ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">1</span>}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Product Type</div>
                      <div className="text-xs text-muted-foreground">
                        {design.baseProductType || 'Not selected'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    design.baseProductSize 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      design.baseProductSize 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {design.baseProductSize ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">2</span>}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Size</div>
                      <div className="text-xs text-muted-foreground">
                        {design.baseProductSize || 'Not selected'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    design.baseProductColor 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      design.baseProductColor 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {design.baseProductColor ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">3</span>}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Color</div>
                      <div className="text-xs text-muted-foreground">
                        {design.baseProductColor || 'Not selected'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Selector */}
          <div className="container mx-auto px-4 pb-16">
            <div className="max-w-4xl mx-auto">
              <ProductSelector 
                onComplete={handleProductSelectionComplete}
                design={design}
                updateBaseProduct={updateBaseProduct}
                availableProductTypes={availableProductTypes}
                availableProductTypesWithInfo={availableProductTypesWithInfo}
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Enhanced Header */}
        <div className="pt-4 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('selection')}
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Selection</span>
                </Button>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Customize Your {design.baseProductType}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Size: {design.baseProductSize}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Color: {design.baseProductColor}
                    </Badge>
                    {design.texts.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {design.texts.length} Text{design.texts.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {design.images.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {design.images.length} Image{design.images.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDesign}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!isValid || design.texts.length === 0 && design.images.length === 0 || isAddingToCart}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
                  title={
                    !isValid 
                      ? "Please complete your design selection" 
                      : design.texts.length === 0 && design.images.length === 0
                      ? "Add at least one customization element"
                      : "Add customized product to cart"
                  }
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      {pricing.totalPrice > 0 && (
                        <span className="text-xs opacity-90">
                          {pricing.totalPrice.toFixed(2)} EGP
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {design.texts.length === 0 && design.images.length === 0 ? (
                    <>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-amber-700 dark:text-amber-300">
                        Add at least one text or image element to enable "Add to Cart"
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        ✅ Ready to add to cart! Total: {pricing.totalPrice.toFixed(2)} EGP
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {design.texts.length + design.images.length} customization elements
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Sidebar - Images */}
            <div className="xl:col-span-3 space-y-6 order-2 xl:order-1">
              {/* Image Uploader */}
              <Card className="border-0 shadow-lg ">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Add Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader onImageUpload={handleAddImage} />
                </CardContent>
              </Card>

              {/* Images List */}
              <Card className="border-0 shadow-lg ">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Added Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {design.images.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No images yet</p>
                      <p className="text-xs">Add an image to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {design.images.map((image) => (
                        <div key={image.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium truncate">Image {image.id.slice(0, 8)}</div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectElement(image)}
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                title="Select Image"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(image.id)}
                                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                title="Delete Image"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Size: {image.size.width}x{image.size.height}px | Opacity: {Math.round(image.opacity * 100)}%
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Stored locally for design preview
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Center - Canvas Preview */}
            <div className="xl:col-span-6 order-1 xl:order-2">
              <Card className="border-0 shadow-lg  backdrop-blur-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    Design Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div 
                    ref={canvasRef}
                    className="relative rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden shadow-inner customization-canvas"
                    style={{
                      width: '100%',
                      height: 'min(500px, 70vh)',
                      maxWidth: '600px',
                      margin: '0 auto',
                      aspectRatio: '1.2/1'
                    }}
                    onMouseMove={(e) => {
                      if (draggedElement) {
                        handleMouseMove(e);
                      } else if (resizingElement) {
                        handleResizeMove(e);
                      }
                    }}
                    onMouseUp={() => {
                      if (draggedElement) {
                        handleMouseUp();
                      } else if (resizingElement) {
                        handleResizeEnd();
                      }
                    }}
                    onMouseLeave={() => {
                      if (draggedElement) {
                        handleMouseUp();
                      } else if (resizingElement) {
                        handleResizeEnd();
                      }
                    }}
                    onClick={handleCanvasClick}
                  >
                    {/* Product Preview with Blank Image */}
                    <div className="w-full h-full flex items-center justify-center relative overflow-hidden p-4">
                      {/* Subtle safe area indicator */}
                      <div className="absolute inset-4 border border-gray-200 dark:border-gray-600 border-dashed opacity-30 pointer-events-none"></div>
                      
                      {design.backgroundImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Product image based on type and color */}
                          <img
                            src={getProductColorImage(design.baseProductType, design.baseProductColor)}
                            alt={`${design.baseProductColor} ${design.baseProductType}`}
                            className="w-full h-full object-contain relative z-10"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          
                          {/* Text elements overlay */}
                          {design.texts.map((text) => (
                            <div
                              key={text.id}
                              className={`absolute z-20 cursor-move select-none canvas-text-element ${
                                draggedElement?.id === text.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                              } ${resizingElement?.id === text.id ? 'ring-2 ring-green-500 ring-opacity-75' : ''}`}
                              style={{
                                left: `${text.position.x}px`,
                                top: `${text.position.y}px`,
                                transform: `rotate(${text.rotation}deg)`,
                                fontFamily: text.fontFamily,
                                fontSize: `${text.fontSize}px`,
                                color: text.color,
                                fontWeight: text.fontWeight,
                                fontStyle: text.fontStyle,
                                textDecoration: text.textDecoration,
                                userSelect: 'none',
                                cursor: draggedElement?.id === text.id ? 'grabbing' : 
                                       resizingElement?.id === text.id ? 'move' : 'grab',
                                maxWidth: '400px', // Prevent text from going off canvas
                                wordWrap: 'break-word'
                              }}
                              onMouseDown={(e) => handleMouseDown(e, text)}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectElement(text);
                              }}
                            >
                              <span className={text.fontFamily.toLowerCase().includes('arabic') ? 'arabic-text' : ''}>
                                {text.text}
                              </span>
                              
                              {/* Resize Handles */}
                              <div className={`absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize transition-all ${
                                resizingElement?.id === text.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, text, 'nw')} />
                              <div className={`absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize transition-all ${
                                resizingElement?.id === text.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, text, 'ne')} />
                              <div className={`absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize transition-all ${
                                resizingElement?.id === text.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, text, 'sw')} />
                              <div className={`absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize transition-all ${
                                resizingElement?.id === text.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, text, 'se')} />
                            </div>
                          ))}
                          
                          {/* Image elements overlay */}
                          {design.images.map((image) => (
                            <div
                              key={image.id}
                              className={`absolute z-20 cursor-move select-none ${
                                draggedElement?.id === image.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                              } ${resizingElement?.id === image.id ? 'ring-2 ring-green-500 ring-opacity-75' : ''}`}
                              style={{
                                left: `${image.position.x}px`,
                                top: `${image.position.y}px`,
                                transform: `rotate(${image.rotation}deg)`,
                                opacity: image.opacity,
                                userSelect: 'none',
                                cursor: draggedElement?.id === image.id ? 'grabbing' : 
                                       resizingElement?.id === image.id ? 'move' : 'grab',
                                maxWidth: '400px', // Prevent images from going off canvas
                                maxHeight: '400px'
                              }}
                              onMouseDown={(e) => handleMouseDown(e, image)}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectElement(image);
                              }}
                            >
                              <img
                                src={image.url}
                                alt="Customization"
                                style={{
                                  width: `${image.size.width}px`,
                                  height: `${image.size.height}px`,
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain'
                                }}
                                className="pointer-events-none"
                              />
                              
                              {/* Resize Handles */}
                              <div className={`absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize transition-all ${
                                resizingElement?.id === image.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, image, 'nw')} />
                              <div className={`absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize transition-all ${
                                resizingElement?.id === image.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, image, 'ne')} />
                              <div className={`absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize transition-all ${
                                resizingElement?.id === image.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, image, 'sw')} />
                              <div className={`absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize transition-all ${
                                resizingElement?.id === image.id ? 'opacity-100 scale-125' : 'opacity-0 hover:opacity-100'
                              }`}
                                   onMouseDown={(e) => handleResizeStart(e, image, 'se')} />
                            </div>
                          ))}
                          
                          {/* Selection indicator */}
                          {/* TODO: Implement canvasState and selection indicator */}
                          {/* {canvasState.selectedElement && (
                            <div className="absolute z-30 border-2 border-blue-500 border-dashed pointer-events-none"
                                 style={{
                                   left: `${canvasState.selectedElement.position.x}px`,
                                   top: `${canvasState.selectedElement.position.y}px`,
                                   width: 'selectedElement' in canvasState.selectedElement ? 
                                     canvasState.selectedElement.size.width : 100,
                                   height: 'selectedElement' in canvasState.selectedElement ? 
                                     canvasState.selectedElement.size.height : 50,
                                 }}>
                            </div>
                          )} */}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <div className="text-lg font-medium mb-2">Select a Product</div>
                          <div className="text-sm">
                            Choose a product type, size, and color to see the preview
                          </div>
                        </div>
                      )}
                    </div>
                    

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Text Management */}
            <div className="xl:col-span-3 order-3">
              <div className="space-y-6">
                {/* Add Text Section */}
                <Card className="border-0 shadow-lg ">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" />
                      Add Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={handleAddText}
                      variant="outline"
                      className="w-full justify-start h-11 hover:bg-primary/5 hover:border-primary/30"
                      size="sm"
                      title="Press Ctrl+T for quick access"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Text
                      {design.texts.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {design.texts.length}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      onClick={toggleClickToAddMode}
                      variant={clickToAddMode ? "default" : "outline"}
                      className="w-full justify-start h-11"
                      size="sm"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      {clickToAddMode ? "Click to Add Mode (ON)" : "Click to Add Mode"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Added Texts List */}
                <Card className="border-0 shadow-lg ">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Added Texts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {design.texts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No text elements yet</p>
                        <p className="text-xs">Click "Add Text" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {design.texts.map((text) => (
                          <div key={text.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg ">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium truncate">{text.text}</div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditText(text)}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  title="Edit Text"
                                >
                                  <Type className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeText(text.id)}
                                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                  title="Delete Text"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Font: {text.fontFamily} | Size: {text.fontSize}px | Color: {text.color}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Breakdown */}
                <Card className="border-0 shadow-lg ">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pricing Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Base Product Price */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Base {design.baseProductType || 'Product'}
                        </span>
                        <span className="text-sm font-medium">
                          {pricing.baseProductPrice.toFixed(2)} EGP
                        </span>
                      </div>

                      {/* Text Customization Cost */}
                      {design.texts.length > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Text Elements ({design.texts.length} × {pricing.textPrice.toFixed(2)}) EGP
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            +{(design.texts.length * pricing.textPrice).toFixed(2)} EGP
                          </span>
                        </div>
                      )}

                      {/* Image Customization Cost */}
                      {design.images.length > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Image Elements ({design.images.length} × {pricing.imagePrice.toFixed(2)}) EGP
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            +{(design.images.length * pricing.imagePrice).toFixed(2)} EGP
                          </span>
                        </div>
                      )}

                      {/* Total Customization Cost */}
                      {pricing.totalCustomizationCost > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Customization Total
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            +{pricing.totalCustomizationCost.toFixed(2)} EGP
                          </span>
                        </div>
                      )}

                      {/* Final Total */}
                      <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 dark:border-gray-600">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          Total Price
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {pricing.totalPrice.toFixed(2)} EGP
                        </span>
                      </div>

                      {/* Savings Info */}
                      {pricing.totalCustomizationCost > 0 && (
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          💡 Customization adds value to your product
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>


              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-30 xl:hidden">
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAddText}
              size="lg"
              disabled={isAddingToCart}
              className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
              title="Add Text"
            >
              <Plus className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => setActiveTab('images')}
              size="lg"
              variant="outline"
              disabled={isAddingToCart}
              className="w-14 h-14 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm disabled:opacity-50"
              title="Add Image"
            >
              <ImageIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>

                {/* Enhanced Text Input Modal */}
        <Dialog open={showTextModal} onOpenChange={setShowTextModal}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Type className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Add New Text</DialogTitle>
                  {pricing.textPrice > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Text customization fee: {pricing.textPrice.toFixed(2)} EGP
                    </p>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Text Content */}
              <div>
                <label htmlFor="new-text" className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Text Content
                </label>
                <input
                  id="new-text"
                  type="text"
                  value={newTextInput}
                  onChange={(e) => setNewTextInput(e.target.value)}
                  placeholder="Enter your text..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmAddText();
                    } else if (e.key === 'Escape') {
                      handleCancelAddText();
                    }
                  }}
                />
              </div>

              {/* Font Family Selection */}
              <div>
                <label htmlFor="font-family" className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Font Family
                </label>
                <select
                  id="font-family"
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                >
                  {FONT_FAMILIES.map((font) => {
                    if (font === '---') {
                      return (
                        <option key="separator" value="" disabled>
                          ─────────────────────────
                        </option>
                      );
                    }
                    
                    const isArabic = font.toLowerCase().includes('arabic') || 
                                   ['Amiri', 'Scheherazade New', 'Lateef', 'Reem Kufi', 'Cairo', 
                                    'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', 'Alkalami', 
                                    'Noto Kufi Arabic', 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 
                                    'Harmattan', 'Markazi Text', 'Rubik'].includes(font);
                    
                    return (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {isArabic ? `🌍 ${font} (Ar)` : `🔤 ${font} (En)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Text Color <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const validFont = FONT_FAMILIES.find(font => font !== '---') || 'Arial';
                      setSelectedFont(validFont);
                      setSelectedColor('');
                    }}
                    className="text-xs h-7 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-8 gap-3">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color 
                          ? 'border-gray-800 dark:border-white scale-110 ring-2 ring-primary ring-offset-2' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1 shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {selectedColor ? (
                    <>Selected: <span className="font-medium">{selectedColor}</span></>
                  ) : (
                    <span className="text-red-500">Please select a color</span>
                  )}
                </div>
              </div>

              {/* Preview */}
              {newTextInput.trim() && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Preview</label>
                  <div
                    className="text-center p-4 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                    style={{
                      fontFamily: selectedFont,
                      color: getColorHex(selectedColor),
                      fontSize: '18px',
                      fontWeight: '500',
                    }}
                  >
                    {newTextInput}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelAddText}
                size="lg"
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAddText}
                disabled={!newTextInput.trim() || !selectedColor}
                size="lg"
                className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Add Text
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Text Modal */}
        {showEditTextModal && editingText && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Type className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Text</h3>
                    {pricing.textPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Text customization fee: {pricing.textPrice.toFixed(2)} EGP
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Text Content */}
                  <div>
                    <label htmlFor="edit-text" className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Text Content
                    </label>
                    <input
                      id="edit-text"
                      type="text"
                      value={newTextInput}
                      onChange={(e) => setNewTextInput(e.target.value)}
                      placeholder="Enter your text..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleConfirmEditText();
                        } else if (e.key === 'Escape') {
                          handleCancelEditText();
                        }
                      }}
                    />
                  </div>

                  {/* Font Family Selection */}
                  <div>
                    <label htmlFor="edit-font-family" className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Font Family
                    </label>
                    <select
                      id="edit-font-family"
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all"
                    >
                      {FONT_FAMILIES.map((font) => {
                        if (font === '---') {
                          return (
                            <option key="separator" value="" disabled>
                              ─────────────────────────
                            </option>
                          );
                        }
                        
                        const isArabic = font.toLowerCase().includes('arabic') || 
                                       ['Amiri', 'Scheherazade New', 'Lateef', 'Reem Kufi', 'Cairo', 
                                        'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', 'Alkalami', 
                                        'Noto Kufi Arabic', 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 
                                        'Harmattan', 'Markazi Text', 'Rubik'].includes(font);
                        
                        return (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {isArabic ? `🌍 ${font} (Ar)` : `🔤 ${font} (En)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Text Color
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFont(editingText.fontFamily);
                          setSelectedColor(editingText.color);
                        }}
                        className="text-xs h-7 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Reset to Original
                      </Button>
                    </div>
                    <div className="grid grid-cols-8 gap-3">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`h-10 w-10 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === color 
                              ? 'border-gray-800 dark:border-white scale-110 ring-2 ring-primary ring-offset-2' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: getColorHex(color) }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1 shadow-sm" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                      Selected: <span className="font-medium">{selectedColor}</span>
                    </div>
                  </div>

                  {/* Preview */}
                  {newTextInput.trim() && (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Preview</label>
                      <div
                        className="text-center p-4 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                        style={{
                          fontFamily: selectedFont,
                          color: getColorHex(selectedColor),
                          fontSize: '18px',
                          fontWeight: '500',
                        }}
                      >
                        {newTextInput}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditText}
                      size="lg"
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmEditText}
                      disabled={!newTextInput.trim() || !selectedColor}
                      size="lg"
                      className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      Update Text
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Required Modal */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle>Authentication Required</DialogTitle>
              </div>
              <DialogDescription>
                You need to be logged in to add customized products to your cart.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please sign in or create an account to continue with your customization.
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/auth/signin');
                }}
                className="w-full sm:w-auto"
              >
                Sign In
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/auth/signup');
                }}
                className="w-full sm:w-auto"
              >
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
