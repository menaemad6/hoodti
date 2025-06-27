import { SEOHeadProps } from '@/components/seo/SEOHead';

export interface PageSEOConfig {
  [key: string]: SEOHeadProps;
}

// Define types for product and category
interface ProductSEO {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price?: number;
  category_name?: string;
}

interface CategorySEO {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export const seoConfig: PageSEOConfig = {
  // Home Page
  home: {
    title: 'Hoodti | Streetwear for Urban Culture',
    description: 'Elevate your street game with Hoodti – your plug for exclusive streetwear drops, bold urban fashion, and limited collections. Discover authentic urban apparel for those who define their own path.',
    keywords: 'streetwear, urban fashion, hype clothing, sneakers, street style, exclusive drops, Hoodti, streetwear ecommerce, urban culture, fashion, clothing, hoodies, t-shirts, streetwear brand, urban apparel',
    image: '/hoodti-collab.webp',
    url: 'https://hoodti.com',
    type: 'website',
    tags: ['streetwear', 'urban fashion', 'street style', 'fashion', 'clothing']
  },

  // Shop Page
  shop: {
    title: 'Shop Streetwear | Hoodti',
    description: 'Browse our exclusive collection of premium streetwear. From hoodies and t-shirts to sneakers and accessories, find your perfect urban style at Hoodti.',
    keywords: 'shop streetwear, buy hoodies, urban clothing, street fashion, t-shirts, sneakers, streetwear store, fashion shopping, urban apparel',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/shop',
    type: 'website',
    tags: ['shop', 'streetwear', 'clothing', 'fashion', 'urban style']
  },

  // Categories Page
  categories: {
    title: 'Streetwear Categories | Hoodti',
    description: 'Explore our curated streetwear categories. From hoodies and t-shirts to accessories and footwear, find your perfect urban style.',
    keywords: 'streetwear categories, hoodies, t-shirts, sneakers, accessories, urban fashion categories, streetwear collections',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/categories',
    type: 'website',
    tags: ['categories', 'streetwear', 'collections', 'fashion']
  },

  // Deals Page
  deals: {
    title: 'Hot Deals & Discounts | Hoodti',
    description: 'Don\'t miss out on our exclusive streetwear deals and discounts. Limited time offers on premium urban fashion and accessories.',
    keywords: 'streetwear deals, fashion discounts, urban clothing sales, streetwear offers, fashion promotions, clothing deals',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/deals',
    type: 'website',
    tags: ['deals', 'discounts', 'sales', 'offers', 'streetwear']
  },

  // Cart Page
  cart: {
    title: 'Shopping Cart | Hoodti',
    description: 'Review your streetwear selections. Secure checkout with fast shipping and easy returns.',
    keywords: 'shopping cart, streetwear cart, fashion checkout, urban clothing cart',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/cart',
    type: 'website',
    noIndex: true,
    tags: ['cart', 'checkout', 'shopping']
  },

  // Checkout Page
  checkout: {
    title: 'Checkout | Hoodti',
    description: 'Complete your streetwear purchase with secure payment and fast delivery options.',
    keywords: 'checkout, payment, streetwear purchase, fashion checkout',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/checkout',
    type: 'website',
    noIndex: true,
    tags: ['checkout', 'payment', 'purchase']
  },

  // Account Pages
  account: {
    title: 'My Account | Hoodti',
    description: 'Manage your Hoodti account, view orders, and update your profile.',
    keywords: 'my account, user profile, order history, account management',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/account',
    type: 'website',
    noIndex: true,
    tags: ['account', 'profile', 'orders']
  },

  accountOrders: {
    title: 'My Orders | Hoodti',
    description: 'Track your streetwear orders and view order history.',
    keywords: 'my orders, order tracking, order history, streetwear orders',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/account/orders',
    type: 'website',
    noIndex: true,
    tags: ['orders', 'tracking', 'history']
  },

  accountWishlist: {
    title: 'My Wishlist | Hoodti',
    description: 'Save your favorite streetwear items for later purchase.',
    keywords: 'wishlist, favorites, saved items, streetwear wishlist',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/account/wishlist',
    type: 'website',
    noIndex: true,
    tags: ['wishlist', 'favorites', 'saved']
  },

  accountAddresses: {
    title: 'My Addresses | Hoodti',
    description: 'Manage your shipping and billing addresses.',
    keywords: 'addresses, shipping address, billing address, address management',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/account/addresses',
    type: 'website',
    noIndex: true,
    tags: ['addresses', 'shipping', 'billing']
  },

  // Auth Pages
  signin: {
    title: 'Sign In | Hoodti',
    description: 'Sign in to your Hoodti account to access exclusive streetwear and manage your orders.',
    keywords: 'sign in, login, user login, account access',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/signin',
    type: 'website',
    noIndex: true,
    tags: ['sign in', 'login', 'authentication']
  },

  signup: {
    title: 'Sign Up | Hoodti',
    description: 'Create your Hoodti account to start shopping exclusive streetwear and get access to member-only deals.',
    keywords: 'sign up, register, create account, new user registration',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/signup',
    type: 'website',
    noIndex: true,
    tags: ['sign up', 'register', 'new account']
  },

  forgotPassword: {
    title: 'Forgot Password | Hoodti',
    description: 'Reset your Hoodti account password to regain access to your account.',
    keywords: 'forgot password, password reset, account recovery',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/forgot-password',
    type: 'website',
    noIndex: true,
    tags: ['password reset', 'account recovery']
  },

  // Admin Pages (noindex for security)
  adminDashboard: {
    title: 'Admin Dashboard | Hoodti',
    description: 'Hoodti admin dashboard for store management.',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/admin/dashboard',
    type: 'website',
    noIndex: true,
    noFollow: true,
    tags: ['admin', 'dashboard']
  },

  adminProducts: {
    title: 'Manage Products | Hoodti Admin',
    description: 'Manage streetwear products in the Hoodti admin panel.',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/admin/products',
    type: 'website',
    noIndex: true,
    noFollow: true,
    tags: ['admin', 'products', 'management']
  },

  adminOrders: {
    title: 'Manage Orders | Hoodti Admin',
    description: 'Manage customer orders in the Hoodti admin panel.',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/admin/orders',
    type: 'website',
    noIndex: true,
    noFollow: true,
    tags: ['admin', 'orders', 'management']
  },

  // 404 Page
  notFound: {
    title: 'Page Not Found | Hoodti',
    description: 'The page you\'re looking for doesn\'t exist. Continue shopping our exclusive streetwear collection.',
    keywords: '404, page not found, error page',
    image: '/hoodti-logo.jpg',
    url: 'https://hoodti.com/404',
    type: 'website',
    noIndex: true,
    tags: ['404', 'error', 'not found']
  }
};

// Helper function to get SEO config for a specific page
export const getSEOConfig = (pageKey: string): SEOHeadProps => {
  return seoConfig[pageKey] || seoConfig.home;
};

// Helper function to generate product-specific SEO
export const getProductSEO = (product: ProductSEO | null): SEOHeadProps => {
  const productName = product?.name || 'Product';
  const productDescription = product?.description || 'Exclusive streetwear from Hoodti';
  const productImage = product?.image || '/hoodti-logo.jpg';
  const productPrice = product?.price ? `$${product.price}` : '';
  
  return {
    title: `${productName} | Hoodti`,
    description: `${productDescription} ${productPrice ? `Available for ${productPrice}.` : ''} Shop exclusive streetwear at Hoodti.`,
    keywords: `${productName}, streetwear, urban fashion, ${product?.category_name || 'clothing'}, Hoodti, fashion, urban style`,
    image: productImage,
    url: `https://hoodti.com/product/${product?.id}`,
    type: 'product',
    tags: [productName, 'streetwear', 'urban fashion', product?.category_name || 'clothing']
  };
};

// Helper function to generate category-specific SEO
export const getCategorySEO = (category: CategorySEO | null): SEOHeadProps => {
  const categoryName = category?.name || 'Category';
  const categoryDescription = category?.description || `Explore our ${categoryName} collection`;
  
  return {
    title: `${categoryName} Collection | Hoodti`,
    description: `${categoryDescription}. Shop exclusive ${categoryName.toLowerCase()} streetwear and urban fashion at Hoodti.`,
    keywords: `${categoryName}, streetwear, urban fashion, ${categoryName.toLowerCase()} collection, Hoodti, fashion`,
    image: category?.image || '/hoodti-logo.jpg',
    url: `https://hoodti.com/category/${category?.id}`,
    type: 'website',
    tags: [categoryName, 'streetwear', 'collection', 'urban fashion']
  };
}; 