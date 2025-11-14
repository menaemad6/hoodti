
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
  "Straight Pants",
  "Regular T-shirt",
  "Boxy T-shirt",
  "Oversized T-shirt",
  "Slim-Fit T-shirt",
  "Polo Shirt",
  "Polo Baskota",
  "Sweatshirt",
  "Hoodie",
  "Oversized Hoodie",
  "Oversized Crewneck",
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
    type: "Straight Pants",
    sizes: [
      { size: "M", waist: 28, length: 97 },
      { size: "L", waist: 31, length: 101 },
      { size: "XL", waist: 34, length: 104 },
      { size: "XXL", waist: 37, length: 107 },
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
    type: "Hoodie",
    sizes: [
      { size: "M", sleve: 44, length: 77, width: 62},
      { size: "L", sleve: 44, length: 79, width: 64},
      { size: "XL", sleve: 44, length: 81, width: 66},
      { size: "XXL", sleve: 44, length: 83, width: 68},
    ],
  },
  {
    type: "Oversized Hoodie",
    sizes: [
      { size: "S", length: 70, width: 58 },
      { size: "M", length: 72, width: 60 },
      { size: "L", length: 74, width: 62 },
      { size: "XL", length: 76, width: 64 },
      { size: "XXL", length: 78, width: 66 },
    ],
  },
  {
    type: "Oversized Crewneck",
    sizes: [
      { size: "M", length: 72, width: 60 },
      { size: "L", length: 74, width: 62 },
      { size: "XL", length: 76, width: 64 },
      { size: "XXL", length: 78, width: 66 },
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
  "Oversized Hoodie": "/assets/blank-hoodie.png",
  "Oversized Crewneck": "/assets/blank-sweatshirt.png",
  "Sweatshirt": "/assets/blank-sweatshirt.png",
  "Regular T-shirt": "/assets/blank-tshirt.png",
  "Boxy T-shirt": "/assets/blank-tshirt.png",
  "Oversized T-shirt": "/assets/blank-oversized-tshirt.png",
  "Slim-Fit T-shirt": "/assets/blank-tshirt.png",
  "Polo Shirt": "/assets/blank-polo.png",
  "Polo Baskota": "/assets/blank-polo.png",
};

// Product colors based on actual images in assets folders
export const PRODUCT_COLORS_BY_TYPE: Record<string, string[]> = {
  "Hoodie": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy-blue", "light-blue", "dark-green", "beige"
  ],
  "Oversized Hoodie": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy-blue", "light-blue", "dark-green", "beige"
  ],
  "Oversized Crewneck": [
    "black", "white", "red", "blue", "green", "pink", "beige", "offwhite", "baby-blue", "bubblegum"
  ],
  "Sweatshirt": [
    "black", "white", "red", "blue", "green", "pink", "beige", "offwhite", "baby-blue", "bubblegum"
  ],
  "Regular T-shirt": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ],
  "Boxy T-shirt": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ],
  "Oversized T-shirt": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ],
  "Slim-Fit T-shirt": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ],
  "Polo Shirt": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ],
  "Polo Baskota": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ],
  "Jeans": [
    "black", "white", "blue", "gray", "navy", "brown"
  ],
  "Sweet Pants": [
    "black", "white", "blue", "gray", "navy", "brown", "beige"
  ],
  "Straight Pants": [
    "black", "white", "blue", "gray", "navy", "brown", "beige"
  ],
  "Shorts": [
    "black", "white", "blue", "gray", "navy", "brown", "beige"
  ],
  "Jacket": [
    "black", "white", "blue", "gray", "navy", "brown", "beige"
  ],
  "Cargo Pants": [
    "black", "white", "blue", "gray", "navy", "brown", "beige", "green"
  ],
  "Denim Jacket": [
    "black", "white", "blue", "gray", "navy", "brown"
  ],
  "Track Pants": [
    "black", "white", "blue", "gray", "navy", "brown", "beige"
  ],
  "Chinos": [
    "black", "white", "blue", "gray", "navy", "brown", "beige", "green"
  ],
  "Other": [
    "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", 
    "brown", "gray", "navy", "baby-blue", "light-blue", "rose", "beige", "lime"
  ]
};

// Color to image mapping for each product type
export const PRODUCT_COLOR_IMAGES: Record<string, Record<string, string>> = {
  "Hoodie": {
    "black": "/assets/hoodies/black-hoodie.jpg",
    "white": "/assets/hoodies/white-hoodie.jpg",
    "red": "/assets/hoodies/red-hoodie.jpg",
    "blue": "/assets/hoodies/blue-hoodie.jpg",
    "green": "/assets/hoodies/green-hoodie.jpg",
    "yellow": "/assets/hoodies/yellow-hoodie.jpg",
    "orange": "/assets/hoodies/orange-hoodie.jpg",
    "purple": "/assets/hoodies/purple-hoodie.jpg",
    "pink": "/assets/hoodies/pink-hoodie.jpg",
    "brown": "/assets/hoodies/brown-hoodie.jpg",
    "gray": "/assets/hoodies/gray-hoodie.jpg",
    "navy-blue": "/assets/hoodies/navy-blue-hoodie.jpg",
    "light-blue": "/assets/hoodies/light-blue-hoodie.jpg",
    "dark-green": "/assets/hoodies/dark-green-hoodie.jpg",
    "beige": "/assets/hoodies/beige-hoodie.jpg"
  },
  "Oversized Hoodie": {
    "black": "/assets/hoodies/black-hoodie.jpg",
    "white": "/assets/hoodies/white-hoodie.jpg",
    "red": "/assets/hoodies/red-hoodie.jpg",
    "blue": "/assets/hoodies/blue-hoodie.jpg",
    "green": "/assets/hoodies/green-hoodie.jpg",
    "yellow": "/assets/hoodies/yellow-hoodie.jpg",
    "orange": "/assets/hoodies/orange-hoodie.jpg",
    "purple": "/assets/hoodies/purple-hoodie.jpg",
    "pink": "/assets/hoodies/pink-hoodie.jpg",
    "brown": "/assets/hoodies/brown-hoodie.jpg",
    "gray": "/assets/hoodies/gray-hoodie.jpg",
    "navy-blue": "/assets/hoodies/navy-blue-hoodie.jpg",
    "light-blue": "/assets/hoodies/light-blue-hoodie.jpg",
    "dark-green": "/assets/hoodies/dark-green-hoodie.jpg",
    "beige": "/assets/hoodies/beige-hoodie.jpg"
  },
  "Oversized Crewneck": {
    "black": "/assets/sweatshirts/black-sweatshirt.jpg",
    "white": "/assets/sweatshirts/white-sweatshirt.jpg",
    "red": "/assets/sweatshirts/red-sweatshirt.jpg",
    "blue": "/assets/sweatshirts/blue-sweatshirt.jpg",
    "green": "/assets/sweatshirts/green-sweatshirt.jpg",
    "pink": "/assets/sweatshirts/pink-sweatshirt.jpg",
    "beige": "/assets/sweatshirts/beige-sweatshirt.jpg",
    "offwhite": "/assets/sweatshirts/offwhite--sweatshirt.jpg",
    "baby-blue": "/assets/sweatshirts/baby-blue-sweatshirt.jpg",
    "bubblegum": "/assets/sweatshirts/bubblegum-sweatshirt.jpg"
  },
  "Sweatshirt": {
    "black": "/assets/sweatshirts/black-sweatshirt.jpg",
    "white": "/assets/sweatshirts/white-sweatshirt.jpg",
    "red": "/assets/sweatshirts/red-sweatshirt.jpg",
    "blue": "/assets/sweatshirts/blue-sweatshirt.jpg",
    "green": "/assets/sweatshirts/green-sweatshirt.jpg",
    "pink": "/assets/sweatshirts/pink-sweatshirt.jpg",
    "beige": "/assets/sweatshirts/beige-sweatshirt.jpg",
    "offwhite": "/assets/sweatshirts/offwhite--sweatshirt.jpg",
    "baby-blue": "/assets/sweatshirts/baby-blue-sweatshirt.jpg",
    "bubblegum": "/assets/sweatshirts/bubblegum-sweatshirt.jpg"
  },
  "Regular T-shirt": {
    "black": "/assets/shirts/black-shirt.jpg",
    "white": "/assets/shirts/white-shirt.jpg",
    "red": "/assets/shirts/red-shirt.jpg",
    "blue": "/assets/shirts/blue-shirt.jpg",
    "green": "/assets/shirts/green-shirt.jpg",
    "yellow": "/assets/shirts/yellow-shirt.jpg",
    "orange": "/assets/shirts/orange-shirt.jpg",
    "purple": "/assets/shirts/purple-shirt.jpg",
    "pink": "/assets/shirts/pink-shirt.jpg",
    "brown": "/assets/shirts/brown-shirt.jpg",
    "gray": "/assets/shirts/grey-shirt.jpg",
    "navy": "/assets/shirts/navy-shirt.jpg",
    "baby-blue": "/assets/shirts/baby-blue-shirt.jpg",
    "light-blue": "/assets/shirts/light-blue-shirt.jpg",
    "rose": "/assets/shirts/rose-shirt.jpg",
    "beige": "/assets/shirts/beige-shirt.jpg",
    "lime": "/assets/shirts/lime-shirt.jpg"
  },
  "Boxy T-shirt": {
    "black": "/assets/shirts/black-shirt.jpg",
    "white": "/assets/shirts/white-shirt.jpg",
    "red": "/assets/shirts/red-shirt.jpg",
    "blue": "/assets/shirts/blue-shirt.jpg",
    "green": "/assets/shirts/green-shirt.jpg",
    "yellow": "/assets/shirts/yellow-shirt.jpg",
    "orange": "/assets/shirts/orange-shirt.jpg",
    "purple": "/assets/shirts/purple-shirt.jpg",
    "pink": "/assets/shirts/pink-shirt.jpg",
    "brown": "/assets/shirts/brown-shirt.jpg",
    "gray": "/assets/shirts/grey-shirt.jpg",
    "navy": "/assets/shirts/navy-shirt.jpg",
    "baby-blue": "/assets/shirts/baby-blue-shirt.jpg",
    "light-blue": "/assets/shirts/light-blue-shirt.jpg",
    "rose": "/assets/shirts/rose-shirt.jpg",
    "beige": "/assets/shirts/beige-shirt.jpg",
    "lime": "/assets/shirts/lime-shirt.jpg"
  },
  "Oversized T-shirt": {
    "black": "/assets/shirts/black-shirt.jpg",
    "white": "/assets/shirts/white-shirt.jpg",
    "red": "/assets/shirts/red-shirt.jpg",
    "blue": "/assets/shirts/blue-shirt.jpg",
    "green": "/assets/shirts/green-shirt.jpg",
    "yellow": "/assets/shirts/yellow-shirt.jpg",
    "orange": "/assets/shirts/orange-shirt.jpg",
    "purple": "/assets/shirts/purple-shirt.jpg",
    "pink": "/assets/shirts/pink-shirt.jpg",
    "brown": "/assets/shirts/brown-shirt.jpg",
    "gray": "/assets/shirts/grey-shirt.jpg",
    "navy": "/assets/shirts/navy-shirt.jpg",
    "baby-blue": "/assets/shirts/baby-blue-shirt.jpg",
    "light-blue": "/assets/shirts/light-blue-shirt.jpg",
    "rose": "/assets/shirts/rose-shirt.jpg",
    "beige": "/assets/shirts/beige-shirt.jpg",
    "lime": "/assets/shirts/lime-shirt.jpg"
  },
  "Slim-Fit T-shirt": {
    "black": "/assets/shirts/black-shirt.jpg",
    "white": "/assets/shirts/white-shirt.jpg",
    "red": "/assets/shirts/red-shirt.jpg",
    "blue": "/assets/shirts/blue-shirt.jpg",
    "green": "/assets/shirts/green-shirt.jpg",
    "yellow": "/assets/shirts/yellow-shirt.jpg",
    "orange": "/assets/shirts/orange-shirt.jpg",
    "purple": "/assets/shirts/purple-shirt.jpg",
    "pink": "/assets/shirts/pink-shirt.jpg",
    "brown": "/assets/shirts/brown-shirt.jpg",
    "gray": "/assets/shirts/grey-shirt.jpg",
    "navy": "/assets/shirts/navy-shirt.jpg",
    "baby-blue": "/assets/shirts/baby-blue-shirt.jpg",
    "light-blue": "/assets/shirts/light-blue-shirt.jpg",
    "rose": "/assets/shirts/rose-shirt.jpg",
    "beige": "/assets/shirts/beige-shirt.jpg",
    "lime": "/assets/shirts/lime-shirt.jpg"
  },
  "Polo Shirt": {
    "black": "/assets/shirts/black-shirt.jpg",
    "white": "/assets/shirts/white-shirt.jpg",
    "red": "/assets/shirts/red-shirt.jpg",
    "blue": "/assets/shirts/blue-shirt.jpg",
    "green": "/assets/shirts/green-shirt.jpg",
    "yellow": "/assets/shirts/yellow-shirt.jpg",
    "orange": "/assets/shirts/orange-shirt.jpg",
    "purple": "/assets/shirts/purple-shirt.jpg",
    "pink": "/assets/shirts/pink-shirt.jpg",
    "brown": "/assets/shirts/brown-shirt.jpg",
    "gray": "/assets/shirts/grey-shirt.jpg",
    "navy": "/assets/shirts/navy-shirt.jpg",
    "baby-blue": "/assets/shirts/baby-blue-shirt.jpg",
    "light-blue": "/assets/shirts/light-blue-shirt.jpg",
    "rose": "/assets/shirts/rose-shirt.jpg",
    "beige": "/assets/shirts/beige-shirt.jpg",
    "lime": "/assets/shirts/lime-shirt.jpg"
  },
  "Polo Baskota": {
    "black": "/assets/shirts/black-shirt.jpg",
    "white": "/assets/shirts/white-shirt.jpg",
    "red": "/assets/shirts/red-shirt.jpg",
    "blue": "/assets/shirts/blue-shirt.jpg",
    "green": "/assets/shirts/green-shirt.jpg",
    "yellow": "/assets/shirts/yellow-shirt.jpg",
    "orange": "/assets/shirts/orange-shirt.jpg",
    "purple": "/assets/shirts/purple-shirt.jpg",
    "pink": "/assets/shirts/pink-shirt.jpg",
    "brown": "/assets/shirts/brown-shirt.jpg",
    "gray": "/assets/shirts/grey-shirt.jpg",
    "navy": "/assets/shirts/navy-shirt.jpg",
    "baby-blue": "/assets/shirts/baby-blue-shirt.jpg",
    "light-blue": "/assets/shirts/light-blue-shirt.jpg",
    "rose": "/assets/shirts/rose-shirt.jpg",
    "beige": "/assets/shirts/beige-shirt.jpg",
    "lime": "/assets/shirts/lime-shirt.jpg"
  }
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

// Get the actual product image based on type and color
export const getProductColorImage = (productType: string, color: string): string => {
  // Transform database product type to match our constants format
  const transformedType = transformProductType(productType);
  const colorImages = PRODUCT_COLOR_IMAGES[transformedType];
  if (colorImages && colorImages[color]) {
    return colorImages[color];
  }
  
  // Fallback to blank image if color not found
  return getProductImage(transformedType);
};

// Get available colors for a specific product type
export const getAvailableColorsForProduct = (productType: string): string[] => {
  // Transform database product type to match our constants format
  const transformedType = transformProductType(productType);
  return PRODUCT_COLORS_BY_TYPE[transformedType] || [];
};

// Transform database product type to match constants format
function transformProductType(dbType: string): string {
  // Handle common transformations from database format to constants format
  const transformations: Record<string, string> = {
    'regular_t-shirt': 'Regular T-shirt',
    'boxy_t-shirt': 'Boxy T-shirt',
    'oversized_t-shirt': 'Oversized T-shirt',
    'slim-fit_t-shirt': 'Slim-Fit T-shirt',
    'polo_shirt': 'Polo Shirt',
    'polo_baskota': 'Polo Baskota',
    'sweet_pants': 'Sweet Pants',
    'straight_pants': 'Straight Pants',
    'cargo_pants': 'Cargo Pants',
    'track_pants': 'Track Pants',
    'denim_jacket': 'Denim Jacket'
  };
  
  // Check if we have a direct transformation
  if (transformations[dbType.toLowerCase()]) {
    return transformations[dbType.toLowerCase()];
  }
  
  // Fallback: try to match by converting underscores to spaces and capitalizing
  const fallbackType = dbType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Check if the fallback type exists in our constants
  if (PRODUCT_COLORS_BY_TYPE[fallbackType]) {
    return fallbackType;
  }
  
  // If still no match, return the original type (might work for simple cases)
  return dbType;
} 