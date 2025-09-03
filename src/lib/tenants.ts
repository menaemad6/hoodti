export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  // Background music autoplay per tenant
  musicSrc?: string;
  autoPlayMusic?: boolean;
  // Background music autoplay per tenant
  hideInitialNavbar?: boolean;
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
    customization?: boolean; // New feature flag
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
  // New customization settings
  customization?: {
    textPrice: number;
    imagePrice: number;
    baseProductPrices: {
      [key: string]: number;
    };
    enabled: boolean;
  };
  productsOptions?: {
    colors?: boolean;
    types?: boolean;
    sizes?: boolean;
    materials?: boolean;
    gender?: boolean;
  };
  pointsSystem?: boolean;
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
    hideInitialNavbar: true,
    footerDescription:
      "Discover curated streetwear collections built for urban culture. Quality, comfort, and bold designs that elevate your everyday style.",
    seoDescription:
      "Elevate your street game with Hoodti – exclusive streetwear drops, bold urban fashion, and limited collections.",
    seoKeywords:
      "streetwear, urban fashion, hype clothing, sneakers, street style, exclusive drops, Hoodti, streetwear ecommerce, urban culture, fashion, clothing, hoodies, t-shirts, streetwear brand, urban apparel",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "medhatbavly4@gmail.com",
    contactPhone: "+201272606636",
    address: "Sohag, Egypt",
    socialMedia: {
      // facebook: "https://facebook.com/hoodti",
      instagram: "https://instagram.com/hoodti_store1/",
      // twitter: "https://twitter.com/hoodti",
    },
    features: {
      wishlist: true,
      reviews: true,
      loyalty: true,
      liveChat: false,
      customization: true,
    },
    pointsSystem: false,
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
    customization: {
      textPrice: 5.00,
      imagePrice: 30.00,
      baseProductPrices: {
        "Hoodie": 150.00,
        "Sweatshirt": 120.00,
        "Regular T-shirt": 80.00,
        "Boxy T-shirt": 85.00,
        "Oversized T-shirt": 90.00,
        "Slim-Fit T-shirt": 75.00,
        "Polo Shirt": 95.00,
        "Polo Baskota": 100.00,
      },
      enabled: true,
    },
  },
  {
    id: "gamezoo",
    name: "GameZoo",
    domain: "gamezoo.store",
    logo: "/gaming-assets/img/gamezoo-logo.jpg",
    primaryColor: "#edff66",
    secondaryColor: "#f5f5f5",
    description: "Premium board games and tabletop gaming",
    autoPlayMusic: true,
    musicSrc: "/gaming-assets/audio/loop.mp3",
    hideInitialNavbar: true,
    footerDescription:
      "Discover curated board game collections for every gamer. Strategy, family fun, and premium tabletop experiences that bring people together.",
    seoDescription:
      "Explore GameZoo's premium board game collection – strategy games, family favorites, and exclusive tabletop gaming experiences.",
    seoKeywords:
      "board games, tabletop games, strategy games, family games, card games, dice games, gaming accessories, GameZoo, board game store, tabletop gaming, party games, cooperative games, competitive games, board game collection",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "email@gmail.com",
    contactPhone: "+0000000000000",
    address: "Sohag, Egypt",
    socialMedia: {
      // facebook: "https://facebook.com/hoodti",
      instagram: "https://instagram.com/gamezoo_store/",
      // twitter: "https://twitter.com/hoodti",
    },
    features: {
      wishlist: true,
      reviews: true,
      loyalty: true,
      liveChat: false,
      customization: true,
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
    customization: {
      textPrice: 5.00,
      imagePrice: 30.00,
      baseProductPrices: {
        "Hoodie": 150.00,
        "Sweatshirt": 120.00,
        "Regular T-shirt": 80.00,
        "Boxy T-shirt": 85.00,
        "Oversized T-shirt": 90.00,
        "Slim-Fit T-shirt": 75.00,
        "Polo Shirt": 95.00,
        "Polo Baskota": 100.00,
      },
      enabled: false,
    },
    productsOptions: {
      colors: false,
      types: false,
      sizes: false,
      materials: false,
      gender: false,
    },
    pointsSystem: true,
  },
  {
    id: "diamond",
    name: "Diamond",
    domain: "diamond-covers.netlify.app",
    logo: "/diamond-logo.jpg",
    primaryColor: "#ff0000",
    secondaryColor: "#f5f5f5",
    description: "Premium phone cases",
    autoPlayMusic: true,
    hideInitialNavbar: false,
    footerDescription:
      "Discover premium phone cases. Quality, and bold designs that elevate your everyday style.",
    seoDescription:
      "Elevate your street game with Hoodti – exclusive streetwear drops, bold urban fashion, and limited collections.",
    seoKeywords:
      "streetwear, urban fashion, hype clothing, sneakers, street style, exclusive drops, Hoodti, streetwear ecommerce, urban culture, fashion, clothing, hoodies, t-shirts, streetwear brand, urban apparel",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "info@diamond-covers.com",
    contactPhone: "+201234567890",
    address: "Sohag, Egypt",
    socialMedia: {
      facebook: "https://facebook.com/diamond",
      instagram: "https://instagram.com/diamond_covers_1",
      twitter: "https://twitter.com/diamond",
    },
    features: {
      wishlist: true,
      reviews: true,
      loyalty: true,
      liveChat: false,
      customization: false, // Phone cases don't need clothing customization
    },
    pointsSystem: false,
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
    hideInitialNavbar: false,
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
      customization: true,
    },
    pointsSystem: false,
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
    customization: {
      textPrice: 7.00, // Higher pricing for premium brand
      imagePrice: 35.00,
      baseProductPrices: {
        "Hoodie": 180.00,
        "Sweatshirt": 140.00,
        "Regular T-shirt": 95.00,
        "Boxy T-shirt": 100.00,
        "Oversized T-shirt": 105.00,
        "Slim-Fit T-shirt": 90.00,
        "Polo Shirt": 110.00,
        "Polo Baskota": 115.00,
      },
      enabled: true,
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
    hideInitialNavbar: false,
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
      customization: true,
    },
    pointsSystem: false,
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
    customization: {
      textPrice: 10.00, // Premium pricing for collaborative brand
      imagePrice: 50.00,
      baseProductPrices: {
        "Hoodie": 200.00,
        "Sweatshirt": 160.00,
        "Regular T-shirt": 110.00,
        "Boxy T-shirt": 115.00,
        "Oversized T-shirt": 120.00,
        "Slim-Fit T-shirt": 105.00,
        "Polo Shirt": 125.00,
        "Polo Baskota": 130.00,
      },
      enabled: true,
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