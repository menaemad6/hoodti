import { SEOHeadProps } from '@/components/seo/SEOHead';
import { useCurrentTenant } from '@/context/TenantContext';

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

function buildBaseUrl(domain: string): string {
  if (!domain) return 'https://example.com';
  const hasProtocol = domain.startsWith('http://') || domain.startsWith('https://');
  return hasProtocol ? domain : `https://${domain}`;
}

function buildSEOForTenant(tenant: { name: string; domain: string; logo: string; description: string; seoDescription?: string; seoKeywords?: string; }): PageSEOConfig {
  const baseUrl = buildBaseUrl(tenant.domain);
  const brand = tenant.name;
	const defaultDescription = tenant.seoDescription || tenant.description || `${brand} online store`;
	const defaultKeywords = tenant.seoKeywords || 'shop, store, online shopping, deals, new arrivals, best sellers, fast delivery, easy returns';
	const defaultImage = tenant.logo || '/hoodti-logo.jpg';

  const cfg: PageSEOConfig = {
		home: {
			title: `${brand} | ${tenant.description}`,
			description: defaultDescription,
			keywords: defaultKeywords,
			image: defaultImage,
			url: baseUrl,
			type: 'website',
			tags: ['shop', 'store', 'online shopping', 'new arrivals', 'best sellers']
		},

		shop: {
			title: `${brand} | Shop`,
			description: `Browse curated products and new arrivals at ${brand}. Fast delivery and easy returns.` ,
			keywords: `shop, buy online, new arrivals, best sellers, ${brand}`,
			image: defaultImage,
			url: `${baseUrl}/shop`,
			type: 'website',
			tags: ['shop', 'store', 'online', 'deals', 'new arrivals']
		},

		categories: {
			title: `Shop Categories | ${brand}`,
			description: `Explore popular categories at ${brand}. Find what you need, fast.`,
			keywords: `categories, collections, browse, ${brand}`,
			image: defaultImage,
			url: `${baseUrl}/categories`,
			type: 'website',
			tags: ['categories', 'collections', 'browse', 'shop']
		},

		deals: {
			title: `Deals & Discounts | ${brand}`,
			description: `Latest deals at ${brand}. Save on favorites with limited-time offers.`,
			keywords: `deals, discounts, sales, offers, ${brand}`,
			image: defaultImage,
			url: `${baseUrl}/deals`,
			type: 'website',
			tags: ['deals', 'discounts', 'sales', 'offers']
		},

    cart: {
      title: `Shopping Cart | ${brand}`,
      description: `Review your selections. Secure checkout with fast shipping and easy returns at ${brand}.`,
      keywords: `shopping cart, cart, checkout, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/cart`,
      type: 'website',
      noIndex: true,
      tags: ['cart', 'checkout', 'shopping']
    },

    checkout: {
      title: `Checkout | ${brand}`,
      description: `Complete your purchase with secure payment and fast delivery options at ${brand}.`,
      keywords: `checkout, payment, purchase, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/checkout`,
      type: 'website',
      noIndex: true,
      tags: ['checkout', 'payment', 'purchase']
    },

    account: {
      title: `My Account | ${brand}`,
      description: `Manage your ${brand} account, view orders, and update your profile.`,
      keywords: `my account, user profile, order history, account management, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/account`,
      type: 'website',
      noIndex: true,
      tags: ['account', 'profile', 'orders']
    },

    accountOrders: {
      title: `My Orders | ${brand}`,
      description: `Track your orders and view order history at ${brand}.`,
      keywords: `my orders, order tracking, order history, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/account/orders`,
      type: 'website',
      noIndex: true,
      tags: ['orders', 'tracking', 'history']
    },

    accountWishlist: {
      title: `My Wishlist | ${brand}`,
      description: `Save your favorite items for later purchase at ${brand}.`,
      keywords: `wishlist, favorites, saved items, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/account/wishlist`,
      type: 'website',
      noIndex: true,
      tags: ['wishlist', 'favorites', 'saved']
    },

    accountAddresses: {
      title: `My Addresses | ${brand}`,
      description: `Manage your shipping and billing addresses at ${brand}.`,
      keywords: `addresses, shipping address, billing address, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/account/addresses`,
      type: 'website',
      noIndex: true,
      tags: ['addresses', 'shipping', 'billing']
    },

    signin: {
      title: `Sign In | ${brand}`,
      description: `Sign in to your ${brand} account to access exclusive products and manage your orders.`,
      keywords: `sign in, login, user login, account access, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/signin`,
      type: 'website',
      noIndex: true,
      tags: ['sign in', 'login', 'authentication']
    },

    signup: {
      title: `Sign Up | ${brand}`,
      description: `Create your ${brand} account to start shopping and get access to member-only deals.`,
      keywords: `sign up, register, create account, new user registration, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/signup`,
      type: 'website',
      noIndex: true,
      tags: ['sign up', 'register', 'new account']
    },

    forgotPassword: {
      title: `Forgot Password | ${brand}`,
      description: `Reset your ${brand} account password to regain access to your account.`,
      keywords: `forgot password, password reset, account recovery, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/forgot-password`,
      type: 'website',
      noIndex: true,
      tags: ['password reset', 'account recovery']
    },

    resetPassword: {
      title: `Reset Password | ${brand}`,
      description: `Create a new password to secure your ${brand} account.`,
      keywords: `reset password, update password, account security, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/reset-password`,
      type: 'website',
      noIndex: true,
      tags: ['reset password', 'security']
    },

    adminDashboard: {
      title: `Admin Dashboard | ${brand}`,
      description: `${brand} admin dashboard for store management.`,
      image: defaultImage,
      url: `${baseUrl}/admin/dashboard`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'dashboard']
    },

    adminCategories: {
      title: `Manage Categories | ${brand} Admin`,
      description: `View and manage product categories in the ${brand} admin panel.`,
      image: defaultImage,
      url: `${baseUrl}/admin/categories`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'categories', 'management']
    },

    adminProducts: {
      title: `Manage Products | ${brand} Admin` ,
      description: `Manage products in the ${brand} admin panel.`,
      image: defaultImage,
      url: `${baseUrl}/admin/products`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'products', 'management']
    },

    adminOrders: {
      title: `Manage Orders | ${brand} Admin`,
      description: `Manage customer orders in the ${brand} admin panel.`,
      image: defaultImage,
      url: `${baseUrl}/admin/orders`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'orders', 'management']
    },

    adminCustomers: {
      title: `Customers | ${brand} Admin`,
      description: `View and manage customers in the ${brand} admin panel.`,
      image: defaultImage,
      url: `${baseUrl}/admin/customers`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'customers']
    },

    adminUsers: {
      title: `Users | ${brand} Admin`,
      description: `Manage user roles and permissions in the ${brand} admin panel.`,
      image: defaultImage,
      url: `${baseUrl}/admin/users`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'users']
    },

    adminReports: {
      title: `Reports & Analytics | ${brand} Admin`,
      description: `Analyze sales and performance metrics for ${brand}.`,
      image: defaultImage,
      url: `${baseUrl}/admin/reports`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'reports', 'analytics']
    },

    adminContent: {
      title: `Content Management | ${brand} Admin`,
      description: `Manage content such as categories and banners for ${brand}.`,
      image: defaultImage,
      url: `${baseUrl}/admin/content`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'content']
    },

    adminDeliverySlots: {
      title: `Delivery Slots | ${brand} Admin`,
      description: `Configure delivery time slots for ${brand}.`,
      image: defaultImage,
      url: `${baseUrl}/admin/delivery-slots`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'delivery', 'slots']
    },

    adminProductEdit: {
      title: `Product Editor | ${brand} Admin`,
      description: `Create or edit products in the ${brand} admin panel.`,
      image: defaultImage,
      url: `${baseUrl}/admin/products/new`,
      type: 'website',
      noIndex: true,
      noFollow: true,
      tags: ['admin', 'products', 'edit']
    },

    notFound: {
      title: `Page Not Found | ${brand}`,
      description: `The page you're looking for doesn't exist. Continue shopping our exclusive collection at ${brand}.`,
      keywords: `404, page not found, error page, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/404`,
      type: 'website',
      noIndex: true,
      tags: ['404', 'error', 'not found']
    }
    ,
    orderConfirmation: {
      title: `Order Confirmation | ${brand}`,
      description: `Your ${brand} order was placed successfully. Review your order details and delivery information.`,
      keywords: `order confirmation, order status, purchase complete, ${brand}`,
      image: defaultImage,
      url: `${baseUrl}/order-confirmation`,
      type: 'website',
      noIndex: true,
      tags: ['order', 'confirmation']
    }
  };

  return cfg;
}

// Hook: tenant-aware SEO config for a specific page key
export const useSEOConfig = (pageKey: string): SEOHeadProps => {
  const tenant = useCurrentTenant();
  const config = buildSEOForTenant(tenant);
  return config[pageKey] || config.home;
};

// Hook: tenant-aware product-specific SEO
export const useProductSEO = (product: ProductSEO | null): SEOHeadProps => {
  const tenant = useCurrentTenant();
  const baseUrl = buildBaseUrl(tenant.domain);
  const brand = tenant.name;
  const productName = product?.name || 'Product';
  const productDescription = product?.description || `Discover ${productName} at ${brand}`;
  const productImage = product?.image || tenant.logo || '/hoodti-logo.jpg';
  const productPrice = product?.price ? `$${product.price}` : '';

  return {
    title: `${productName} | ${brand}`,
    description: `${productDescription}. ${productPrice ? `Available for ${productPrice}. ` : ''}Fast delivery and easy returns at ${brand}.`.trim(),
    keywords: `${productName}, ${product?.category_name || 'product'}, shop, buy online, ${brand}`,
    image: productImage,
    url: product?.id ? `${baseUrl}/product/${product.id}` : baseUrl,
    type: 'product',
    tags: [productName, product?.category_name || 'product', 'shop']
  };
};

// Hook: tenant-aware category-specific SEO
export const useCategorySEO = (category: CategorySEO | null): SEOHeadProps => {
  const tenant = useCurrentTenant();
  const baseUrl = buildBaseUrl(tenant.domain);
  const brand = tenant.name;
  const categoryName = category?.name || 'Category';
  const categoryDescription = category?.description || `Explore ${categoryName} at ${brand}`;

  return {
    title: `${categoryName} | ${brand}`,
    description: `${categoryDescription}. Find popular picks with fast delivery and easy returns.`,
    keywords: `${categoryName}, shop, online, ${brand}`,
    image: category?.image || tenant.logo || '/hoodti-logo.jpg',
    url: category?.id ? `${baseUrl}/category/${category.id}` : baseUrl,
    type: 'website',
    tags: [categoryName, 'shop', 'browse']
  };
};