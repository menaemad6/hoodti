
import { getTenantById, getTenantByDomain, getDefaultTenant } from '@/lib/tenants';

function resolveBrandName(): string {
  try {
    let resolvedTenant = undefined as ReturnType<typeof getDefaultTenant> | undefined;

    if (typeof window !== 'undefined') {
      const docTenantId = typeof document !== 'undefined'
        ? document.documentElement.getAttribute('data-tenant')
        : null;

      if (docTenantId) {
        resolvedTenant = getTenantById(docTenantId);
      }

      const hostname = window.location.hostname;

      // Development: support subdomain on localhost (e.g., hoodti.localhost)
      const isDevelopment = hostname.includes('localhost') || hostname.includes('127.0.0.1');

      if (!resolvedTenant && isDevelopment) {
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
          resolvedTenant = getTenantById(subdomain);
        }
      }

      if (!resolvedTenant) {
        resolvedTenant = getTenantByDomain(hostname);
      }

      if (!resolvedTenant) {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        if (tenantParam) {
          resolvedTenant = getTenantById(tenantParam);
        }
      }
    }

    if (!resolvedTenant) {
      resolvedTenant = getDefaultTenant();
    }

    return resolvedTenant?.name || 'Hoodti';
  } catch {
    return 'Hoodti';
  }
}

export const BRAND_NAME = resolveBrandName();

export const PRODUCT_TYPE_OPTIONS = [
  "Sweet Pants",
  "Jeans",
  "Regular T-shirt",
  "Boxy T-shirt",
  "Oversized T-shirt",
  "Slim-Fit T-shirt",
  "Polo Shirt",
  "Polo Baskota",
  "Sweatshirt",
  "Hoodie",
  "Shorts",
  "Jacket",
  "Cargo Pants",
  "Denim Jacket",
  "Track Pants",
  "Chinos",
  "Other"
];

export const SIZING_OPTIONS = [
  {
    type: "Jeans",
    sizes: [
      { size: "30", waist: 42, length: 108 },
      { size: "32", waist: 44, length: 110 },
      { size: "34", waist: 46, length: 110 },
      { size: "36", waist: 48, length: 112 },
      { size: "38", waist: 50, length: 114 },
    ],
  },
  {
    type: "Sweet Pants",
    sizes: [
      { size: "L", waist: 33, length: 103 },
      { size: "XL", waist: 36, length: 106 },
      { size: "XXL", waist: 39, length: 109 },
    ],
  },
  {
    type: "Regular T-shirt",
    sizes: [
      { size: "M", length: 68, width: 54 },
      { size: "L", length: 70, width: 56 },
      { size: "XL", length: 72, width: 58 },
      { size: "XXL", length: 74, width: 60 },
    ],
  },
  {
    type: "Oversized T-shirt",
    sizes: [
      { size: "M", length: 73, width: 57 },
      { size: "L", length: 75, width: 59 },
      { size: "XL", length: 77, width: 61 },
      { size: "XXL", length: 79, width: 63 },
    ],
  },
  {
    type: "Boxy T-shirt",
    sizes: [
      { size: "L", length: 63, width: 60 },
      { size: "XXL", length: 67, width: 64 },
    ],
  },
  {
    type: "Polo Baskota",
    sizes: [
      { size: "M", length: 72, width: 56 },
      { size: "L", length: 74, width: 58 },
      { size: "XL", length: 76, width: 60 },
      { size: "XXL", length: 78, width: 62 },
      { size: "XXXL", length: 80, width: 64 },
    ],
  },
  {
    type: "Sweatshirt",
    sizes: [
      { size: "M", sleve: 44, length: 77, width: 62},
      { size: "L", sleve: 44, length: 79, width: 64},
      { size: "XL", sleve: 44, length: 81, width: 66},
      { size: "XXL", sleve: 44, length: 83, width: 68},
    ],
  },
  {
    type: "Other",
    sizes: [
      { size: "S", shoulder: 36, length: 43, sleeve_length: 15.5 },
      { size: "XS", shoulder: 34, length: 41, sleeve_length: 14.5 },
      { size: "M", shoulder: 38, length: 45, sleeve_length: 16.5 },
      { size: "L", shoulder: 40, length: 47, sleeve_length: 17.5 },
      { size: "XL", shoulder: 42, length: 49, sleeve_length: 18.5 },
      { size: "XXL", shoulder: 44, length: 51, sleeve_length: 19.5 },
    ],
  },
];

// Product type to blank image mapping for customization
export const PRODUCT_BLANK_IMAGES: Record<string, string> = {
  "Hoodie": "/assets/blank-hoodie.png",
  "Sweatshirt": "/assets/blank-sweatshirt.png",
  "Regular T-shirt": "/assets/blank-tshirt.png",
  "Boxy T-shirt": "/assets/blank-tshirt.png",
  "Oversized T-shirt": "/assets/blank-oversized-tshirt.png",
  "Slim-Fit T-shirt": "/assets/blank-tshirt.png",
  "Polo Shirt": "/assets/blank-polo.png",
  "Polo Baskota": "/assets/blank-polo.png",
};

// Fallback to placeholder if blank images don't exist
export const getProductImage = (productType: string): string => {
  const blankImage = PRODUCT_BLANK_IMAGES[productType];
  if (blankImage) {
    return blankImage;
  }
  
  // Fallback to a generic placeholder
  return "/assets/blank-hoodie.png"; // Default fallback
};

// Color mapping for product customization
// Maps hex colors to CSS filter values for better color representation
export const PRODUCT_COLOR_FILTERS: Record<string, string> = {
  "#000000": "brightness(0) saturate(100%)", // Black
  "#FFFFFF": "brightness(1) saturate(0%)", // White
  "#FF0000": "hue-rotate(0deg) saturate(100%) brightness(0.8)", // Red
  "#00FF00": "hue-rotate(120deg) saturate(100%) brightness(0.8)", // Green
  "#0000FF": "hue-rotate(240deg) saturate(100%) brightness(0.8)", // Blue
  "#FFFF00": "hue-rotate(60deg) saturate(100%) brightness(0.8)", // Yellow
  "#FF00FF": "hue-rotate(300deg) saturate(100%) brightness(0.8)", // Magenta
  "#00FFFF": "hue-rotate(180deg) saturate(100%) brightness(0.8)", // Cyan
  "#FFA500": "hue-rotate(30deg) saturate(100%) brightness(0.8)", // Orange
  "#800080": "hue-rotate(270deg) saturate(80%) brightness(0.6)", // Purple
  "#A52A2A": "hue-rotate(0deg) saturate(60%) brightness(0.4)", // Brown
  "#808080": "brightness(0.5) saturate(0%)", // Gray
  "#FFD700": "hue-rotate(45deg) saturate(100%) brightness(0.9)", // Gold
  "#C0C0C0": "brightness(0.8) saturate(0%)", // Silver
  "#FFC0CB": "hue-rotate(350deg) saturate(60%) brightness(0.9)", // Pink
  "#32CD32": "hue-rotate(120deg) saturate(80%) brightness(0.8)", // Lime Green
  "#FF4500": "hue-rotate(15deg) saturate(100%) brightness(0.7)", // Orange Red
  "#4169E1": "hue-rotate(220deg) saturate(80%) brightness(0.7)", // Royal Blue
  "#8B4513": "hue-rotate(30deg) saturate(60%) brightness(0.4)", // Saddle Brown
  "#2E8B57": "hue-rotate(150deg) saturate(60%) brightness(0.5)", // Sea Green
}; 