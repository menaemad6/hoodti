import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCurrentTenant } from '@/context/TenantContext';
import {
  CustomizationDesign,
  CustomizationText,
  CustomizationImage,
  CustomizationPricing,
  CustomizationSession,
  CanvasState,
  FONT_FAMILIES,
  PRODUCT_COLORS,
  TEXT_CUSTOMIZATION_OPTIONS,
  IMAGE_CUSTOMIZATION_OPTIONS,
} from '@/types/customization.types';
import { getProductImage } from '@/lib/constants';

export function useCustomization() {
  const { user } = useAuth();
  const currentTenant = useCurrentTenant();
  
  // Main customization state
  const [design, setDesign] = useState<CustomizationDesign>({
    id: crypto.randomUUID(),
    baseProductType: '',
    baseProductSize: '',
    baseProductColor: '#000000',
    texts: [],
    images: [],
    canvasWidth: 600,
    canvasHeight: 500,
    backgroundImage: '',
  });

  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    selectedElement: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    resizeDirection: null,
  });

  // Pricing calculation using local tenant data
  const pricing = useMemo((): CustomizationPricing => {
    if (!currentTenant?.customization?.enabled) {
      return {
        baseProductPrice: 0,
        textElements: 0,
        imageElements: 0,
        textPrice: 0,
        imagePrice: 0,
        totalCustomizationCost: 0,
        totalPrice: 0,
      };
    }

    const baseProductPrice = currentTenant.customization.baseProductPrices[design.baseProductType] || 0;
    const textCost = design.texts.length * currentTenant.customization.textPrice;
    const imageCost = design.images.length * currentTenant.customization.imagePrice;
    const totalCustomizationCost = textCost + imageCost;
    const totalPrice = baseProductPrice + totalCustomizationCost;

    return {
      baseProductPrice,
      textElements: design.texts.length,
      imageElements: design.images.length,
      textPrice: currentTenant.customization.textPrice,
      imagePrice: currentTenant.customization.imagePrice,
      totalCustomizationCost,
      totalPrice,
    };
  }, [design, currentTenant]);

  // Update base product selection
  const updateBaseProduct = useCallback((type: string, size: string, color: string) => {
    const backgroundImage = getProductImage(type);
    setDesign(prev => ({
      ...prev,
      baseProductType: type,
      baseProductSize: size,
      baseProductColor: color,
      backgroundImage,
    }));
  }, []);

  // Add text element
  const addText = useCallback((text: string, position: { x: number; y: number }, fontFamily?: string, color?: string) => {
    const newText: CustomizationText = {
      id: crypto.randomUUID(),
      text,
      fontFamily: fontFamily || FONT_FAMILIES[0],
      fontSize: TEXT_CUSTOMIZATION_OPTIONS.defaultFontSize,
      color: color || '#000000',
      position,
      rotation: 0,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
    };

    setDesign(prev => ({
      ...prev,
      texts: [...prev.texts, newText],
    }));
  }, []);

  // Update text element
  const updateText = useCallback((id: string, updates: Partial<CustomizationText>) => {
    setDesign(prev => ({
      ...prev,
      texts: prev.texts.map(text =>
        text.id === id ? { ...text, ...updates } : text
      ),
    }));
  }, []);

  // Remove text element
  const removeText = useCallback((id: string) => {
    setDesign(prev => ({
      ...prev,
      texts: prev.texts.filter(text => text.id !== id),
    }));
  }, []);

  // Add image element
  const addImage = useCallback(async (file: File, position: { x: number; y: number }) => {
    let localUrl: string | null = null;
    
    try {
      // Create local URL for immediate preview only (no upload to storage)
      localUrl = URL.createObjectURL(file);
      
      // Create image object for display in UI
      const image: CustomizationImage = {
        id: crypto.randomUUID(),
        url: localUrl,
        position,
        size: { width: 100, height: 100 },
        rotation: 0,
        opacity: IMAGE_CUSTOMIZATION_OPTIONS.defaultOpacity,
        originalFile: file,
        uploadedUrl: '', // Not used when keeping images in UI only
        isUploading: false, // No upload happening
      };

      // Add to design immediately for preview
      setDesign(prev => ({
        ...prev,
        images: [...prev.images, image],
      }));
    } catch (error) {
      console.error('Error adding image:', error);
      // Remove the temporary image if creation failed
      if (localUrl) {
        setDesign(prev => ({
          ...prev,
          images: prev.images.filter(img => img.url !== localUrl),
        }));
        // Clean up the local URL
        URL.revokeObjectURL(localUrl);
      }
      throw error;
    }
  }, []);

  // Update image element
  const updateImage = useCallback((id: string, updates: Partial<CustomizationImage>) => {
    setDesign(prev => ({
      ...prev,
      images: prev.images.map(image =>
        image.id === id ? { ...image, ...updates } : image
      ),
    }));
  }, []);

  // Remove image element
  const removeImage = useCallback((id: string) => {
    setDesign(prev => {
      const imageToRemove = prev.images.find(img => img.id === id);
      if (imageToRemove?.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return {
        ...prev,
        images: prev.images.filter(image => image.id !== id),
      };
    });
  }, []);

  // Update canvas state
  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
  }, []);

  // Select element
  const selectElement = useCallback((element: CustomizationText | CustomizationImage | null) => {
    setCanvasState(prev => ({ ...prev, selectedElement: element }));
  }, []);

  // Start resize operation
  const startResize = useCallback((element: CustomizationText | CustomizationImage, handle: 'nw' | 'ne' | 'sw' | 'se') => {
    setCanvasState(prev => ({ 
      ...prev, 
      selectedElement: element,
      isResizing: true,
      resizeHandle: handle,
      resizeDirection: handle === 'nw' || handle === 'se' ? 'both' : 
                     handle === 'ne' || handle === 'sw' ? 'both' : 'both'
    }));
  }, []);

  // Update element size during resize
  const updateElementSize = useCallback((id: string, newSize: { width: number; height: number }, isText: boolean) => {
    if (isText) {
      // For text, update fontSize based on width change (maintain aspect ratio)
      setDesign(prev => ({
        ...prev,
        texts: prev.texts.map(text => {
          if (text.id === id) {
            const sizeRatio = newSize.width / 100; // Assuming 100px is base width
            const newFontSize = Math.max(8, Math.min(72, Math.round(TEXT_CUSTOMIZATION_OPTIONS.defaultFontSize * sizeRatio)));
            return { ...text, fontSize: newFontSize };
          }
          return text;
        }),
      }));
    } else {
      // For images, update the size directly
      setDesign(prev => ({
        ...prev,
        images: prev.images.map(image => {
          if (image.id === id) {
            return { ...image, size: newSize };
          }
          return image;
        }),
      }));
    }
  }, []);

  // Stop resize operation
  const stopResize = useCallback(() => {
    setCanvasState(prev => ({ 
      ...prev, 
      isResizing: false,
      resizeHandle: null,
      resizeDirection: null
    }));
  }, []);

  // Reset design
  const resetDesign = useCallback(() => {
    // Clean up image URLs
    design.images.forEach(image => {
      if (image.url) {
        URL.revokeObjectURL(image.url);
      }
    });

    setDesign({
      id: crypto.randomUUID(),
      baseProductType: '',
      baseProductSize: '',
      baseProductColor: '#000000',
      texts: [],
      images: [],
      canvasWidth: 600,
      canvasHeight: 500,
      backgroundImage: '',
    });

    setCanvasState({
      selectedElement: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      isDragging: false,
      isResizing: false,
      resizeHandle: null,
      resizeDirection: null,
    });
  }, [design.images]);

  // Check if customization is valid
  const isValid = useMemo(() => {
    return (
      design.baseProductType &&
      design.baseProductSize &&
      design.baseProductColor
      // Removed the requirement for texts or images since this is for the product selection stage
    );
  }, [design]);

  // Get available product types from local tenant data
  const availableProductTypes = useMemo(() => {
    if (!currentTenant?.customization?.enabled) return [];
    return Object.keys(currentTenant.customization.baseProductPrices);
  }, [currentTenant]);

  // Get available colors for selected product
  const availableColors = useMemo(() => {
    return PRODUCT_COLORS;
  }, []);

  // Get available fonts
  const availableFonts = useMemo(() => {
    return FONT_FAMILIES;
  }, []);

  return {
    // State
    design,
    canvasState,
    pricing,
    
    // Computed values
    isValid,
    availableProductTypes,
    availableColors,
    availableFonts,
    
    // Actions
    updateBaseProduct,
    addText,
    updateText,
    removeText,
    addImage,
    updateImage,
    removeImage,
    updateCanvasState,
    selectElement,
    startResize,
    updateElementSize,
    stopResize,
    resetDesign,
    
    // Utility
    hasCustomization: currentTenant?.customization?.enabled || false,
  };
}
