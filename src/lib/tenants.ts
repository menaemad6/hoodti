export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  currency: string;
  currencySymbol: string;
  defaultLanguage: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  features: {
    wishlist: boolean;
    reviews: boolean;
    loyalty: boolean;
    liveChat: boolean;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingFee: number;
    expressShippingFee: number;
  };
  payment: {
    cashOnDelivery: boolean;
    onlinePayment: boolean;
    bankTransfer: boolean;
  };
}

export const tenants: Tenant[] = [
  {
    id: "hoodti",
    name: "Hoodti",
    domain: "hoodti.store",
    logo: "/hoodti-logo.jpg",
    primaryColor: "#1a1a1a",
    secondaryColor: "#f5f5f5",
    description: "Premium streetwear and urban fashion",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "info@hoodti.com",
    contactPhone: "+201234567890",
    address: "Cairo, Egypt",
    socialMedia: {
      facebook: "https://facebook.com/hoodti",
      instagram: "https://instagram.com/hoodti",
      twitter: "https://twitter.com/hoodti",
    },
    features: {
      wishlist: true,
      reviews: true,
      loyalty: true,
      liveChat: true,
    },
    shipping: {
      freeShippingThreshold: 500,
      defaultShippingFee: 30,
      expressShippingFee: 50,
    },
    payment: {
      cashOnDelivery: true,
      onlinePayment: true,
      bankTransfer: true,
    },
  },
  {
    id: "streetwear",
    name: "StreetWear",
    domain: "ecommerce-v15.netlify.app",
    logo: "/streetwear-logo.jpg",
    primaryColor: "#ff6b35",
    secondaryColor: "#2c3e50",
    description: "Urban fashion and street culture",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "contact@streetwear.com",
    contactPhone: "+201234567891",
    address: "Alexandria, Egypt",
    socialMedia: {
      facebook: "https://facebook.com/streetwear",
      instagram: "https://instagram.com/streetwear",
      youtube: "https://youtube.com/streetwear",
    },
    features: {
      wishlist: true,
      reviews: true,
      loyalty: false,
      liveChat: false,
    },
    shipping: {
      freeShippingThreshold: 300,
      defaultShippingFee: 25,
      expressShippingFee: 45,
    },
    payment: {
      cashOnDelivery: true,
      onlinePayment: true,
      bankTransfer: false,
    },
  },
  {
    id: "collab",
    name: "Collab Collection",
    domain: "collab.com",
    logo: "/collab-collection.jpg",
    primaryColor: "#8e44ad",
    secondaryColor: "#ecf0f1",
    description: "Collaborative fashion collections",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "hello@collab.com",
    contactPhone: "+201234567892",
    address: "Giza, Egypt",
    socialMedia: {
      instagram: "https://instagram.com/collab",
      twitter: "https://twitter.com/collab",
    },
    features: {
      wishlist: true,
      reviews: false,
      loyalty: true,
      liveChat: true,
    },
    shipping: {
      freeShippingThreshold: 400,
      defaultShippingFee: 35,
      expressShippingFee: 60,
    },
    payment: {
      cashOnDelivery: false,
      onlinePayment: true,
      bankTransfer: true,
    },
  },
];

export function getTenantById(id: string): Tenant | undefined {
  return tenants.find(tenant => tenant.id === id);
}

export function getTenantByDomain(domain: string): Tenant | undefined {
  return tenants.find(tenant => tenant.domain === domain);
}

export function getDefaultTenant(): Tenant {
  return tenants[0]; // Return the first tenant as default
}

export function getAllTenants(): Tenant[] {
  return tenants;
} 