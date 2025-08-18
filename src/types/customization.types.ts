export interface CustomizationText {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
}

export interface CustomizationImage {
  id: string;
  url: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  opacity: number;
  originalFile?: File; // For temporary storage before order confirmation
  uploadedUrl?: string; // URL of the uploaded image in the bucket (for merchant access)
  isUploading?: boolean; // Whether the image is currently being uploaded
}

export interface CustomizationDesign {
  id: string;
  baseProductType: string;
  baseProductSize: string;
  baseProductColor: string;
  texts: CustomizationText[];
  images: CustomizationImage[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundImage?: string; // Product template image
}

export interface CustomizationPricing {
  baseProductPrice: number;
  textElements: number;
  imageElements: number;
  textPrice: number;
  imagePrice: number;
  totalCustomizationCost: number;
  totalPrice: number;
}

export interface CustomizationSession {
  id: string;
  userId: string;
  tenantId: string;
  design: CustomizationDesign;
  pricing: CustomizationPricing;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

export interface CustomizationProduct {
  type: string;
  sizes: Array<{
    size: string;
    [key: string]: string | number; // For different measurement types
  }>;
  basePrice: number;
  templateImage: string;
  availableColors: string[];
}

export interface CustomizationSettings {
  textPrice: number;
  imagePrice: number;
  baseProductPrices: {
    [key: string]: number;
  };
  enabled: boolean;
}

// Canvas editor state
export interface CanvasState {
  selectedElement: CustomizationText | CustomizationImage | null;
  zoom: number;
  pan: {
    x: number;
    y: number;
  };
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | null;
  resizeDirection: 'horizontal' | 'vertical' | 'both' | null;
}

// Font options for text customization
export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Courier New',
  'Lucida Console',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
  'Futura',
  'Century Gothic',
  'Baskerville',
  'Didot',
  'Bodoni',
  // Arabic fonts
  'Noto Sans Arabic',
  'Noto Serif Arabic',
  'Amiri',
  'Scheherazade',
  'Lateef',
  'Reem Kufi',
  'Cairo',
  'Tajawal',
  'Almarai',
  'IBM Plex Sans Arabic'
] as const;

export type FontFamily = typeof FONT_FAMILIES[number];

// Color palette for text and product customization
export const PRODUCT_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
  '#808080', // Gray
  '#FFD700', // Gold
  '#C0C0C0', // Silver
  '#FFC0CB', // Pink
  '#32CD32', // Lime Green
  '#FF4500', // Orange Red
  '#4169E1', // Royal Blue
  '#8B4513', // Saddle Brown
  '#2E8B57'  // Sea Green
] as const;

export type ProductColor = typeof PRODUCT_COLORS[number];

// Text customization options
export const TEXT_CUSTOMIZATION_OPTIONS = {
  minFontSize: 8,
  maxFontSize: 72,
  defaultFontSize: 24,
  minOpacity: 0.1,
  maxOpacity: 1.0,
  defaultOpacity: 1.0,
} as const;

// Image customization options
export const IMAGE_CUSTOMIZATION_OPTIONS = {
  maxFileSize: 2 * 1024 * 1024, // 2MB - reduced for server compatibility
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  minSize: { width: 50, height: 50 },
  maxSize: { width: 500, height: 500 },
  defaultOpacity: 1.0,
  minOpacity: 0.1,
  maxOpacity: 1.0,
  maxDimensions: { width: 1920, height: 1080 }, // Max dimensions for compression
  quality: 0.8, // JPEG quality for compression
} as const;
