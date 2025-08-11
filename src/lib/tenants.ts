export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  // Background music autoplay per tenant
  autoPlayMusic?: boolean;
  // Optional tenant-specific marketing/SEO fields
  footerDescription?: string;
  seoDescription?: string;
  seoKeywords?: string;
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
    primaryColor: "#5879DB",
    secondaryColor: "#f5f5f5",
    description: "Premium streetwear and urban fashion",
    autoPlayMusic: true,
    footerDescription:
      "Discover curated streetwear collections built for urban culture. Quality, comfort, and bold designs that elevate your everyday style.",
    seoDescription:
      "Elevate your street game with Hoodti – exclusive streetwear drops, bold urban fashion, and limited collections.",
    seoKeywords:
      "streetwear, urban fashion, hype clothing, sneakers, street style, exclusive drops, Hoodti, streetwear ecommerce, urban culture, fashion, clothing, hoodies, t-shirts, streetwear brand, urban apparel",
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
      liveChat: false,
    },
    shipping: {
      freeShippingThreshold: 500,
      defaultShippingFee: 30,
      expressShippingFee: 50,
    },
    payment: {
      cashOnDelivery: true,
      onlinePayment: false,
      bankTransfer: false,
    },
  },
  {
    id: "streetwear",
    name: "StreetWear",
    domain: "ecommerce-v15.netlify.app",
    logo: "/streetwear-logo.jpg",
    primaryColor: "#75EF45",
    secondaryColor: "#2c3e50",
    description: "Urban fashion and street culture",
    autoPlayMusic: false,
    footerDescription:
      "Explore trend-forward urban fits and statement pieces inspired by street culture.",
    seoDescription:
      "Shop authentic streetwear and bold urban fashion. Discover limited drops and everyday essentials.",
    seoKeywords:
      "streetwear, urban clothing, street style, limited drops, sneakers, hoodies, tees, fashion, StreetWear",
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
    autoPlayMusic: false,
    footerDescription:
      "Limited collaborative capsules with artists and creators – crafted in small batches.",
    seoDescription:
      "Explore collaborative fashion collections, limited releases, and creative capsules.",
    seoKeywords:
      "collaboration, limited collection, capsule, fashion, streetwear, artists, creators, Collab Collection",
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