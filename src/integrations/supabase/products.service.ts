import { useApiService, createApiService } from "./api.service";
import { Product, ProductRow, CategoryRow, ensureProductTypeCompatibility } from "./types.service";
import { supabase } from "./client";

// Function to check product stock
export async function checkProductStock(productId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error checking product stock:', error);
      throw error;
    }

    return data?.stock || 0;
  } catch (error) {
    console.error('Error in checkProductStock:', error);
    throw error;
  }
}

// Function to update product stock
export async function updateProductStock(productId: string, quantity: number): Promise<boolean> {
  try {
    // First get current stock
    const currentStock = await checkProductStock(productId);
    
    // Ensure stock doesn't go below zero
    const newStock = Math.max(0, currentStock + quantity);
    
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    throw error;
  }
}

// Standalone functions for direct import
export async function getProducts(options?: {
  categoryId?: string;
  featured?: boolean;
  discounted?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.featured) {
      query = query.eq('is_featured', true);
    }

    if (options?.discounted) {
      query = query.gt('discount', 0);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // Get categories for the products
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    const categoriesMap = new Map<string, CategoryRow>();
    categories?.forEach((category) => {
      categoriesMap.set(category.id, category);
    });

    // Convert ProductRow to Product (with category object)
    return (data || []).map((product: any) => {
      const category = categoriesMap.get(product.category_id);
      const productWithCategory = {
        ...product,
        category: category || {
          id: product.category_id,
          name: 'Unknown',
          image: '',
          description: '',
          created_at: null
        }
      };
      return ensureProductTypeCompatibility(productWithCategory) as Product;
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}

export async function getProduct(productId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Get the category for this product
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', data.category_id)
      .single();

    const productWithCategory = {
      ...data,
      category: category || {
        id: data.category_id,
        name: 'Unknown',
        image: '',
        description: '',
        created_at: null
      }
    };
    
    return ensureProductTypeCompatibility(productWithCategory);
  } catch (error) {
    console.error('Error in getProduct:', error);
    throw error;
  }
}

// Hook-based service functions for React components
export function useProductsService() {
  const api = useApiService();
  
  return {
    async getProducts(options?: {
      categoryId?: string;
      featured?: boolean;
      discounted?: boolean;
      limit?: number;
      offset?: number;
    }) {
      const products = await api.getProducts(options) as ProductRow[];
      
      // Get categories for the products
      const categories = await api.getCategories() as CategoryRow[];
      const categoriesMap = new Map<string, CategoryRow>();
      categories.forEach((category) => {
        categoriesMap.set(category.id, category);
      });

      // Convert ProductRow to Product (with category object)
      return products.map((product: ProductRow) => {
        const category = categoriesMap.get(product.category_id);
        const productWithCategory = {
          ...product,
          category: category || {
            id: product.category_id,
            name: 'Unknown',
            image: '',
            description: '',
            created_at: null
          }
        };
        return ensureProductTypeCompatibility(productWithCategory);
      });
    },

    async getCategories() {
      return api.getCategories() as Promise<CategoryRow[]>;
    },

    async getProductsByCategory(categoryId: string) {
      const products = await api.getProducts({ categoryId }) as ProductRow[];
      const category = await api.getCategory(categoryId) as CategoryRow | null;

      if (!category) {
        return [];
      }

      // Convert ProductRow to Product (with category object)
      return products.map((product: ProductRow) => {
        const productWithCategory = {
          ...product,
          category
        };
        return ensureProductTypeCompatibility(productWithCategory);
      });
    },

    async getProduct(productId: string) {
      const product = await api.getProduct(productId) as ProductRow | null;
      
      if (!product) {
        return null;
      }

      const category = await api.getCategory(product.category_id) as CategoryRow | null;
      
      const productWithCategory = {
        ...product,
        category: category || {
          id: product.category_id,
          name: 'Unknown',
          image: '',
          description: '',
          created_at: null
        }
      };
      
      return ensureProductTypeCompatibility(productWithCategory);
    },

    async getDiscountedProducts() {
      const products = await api.getProducts({ discounted: true }) as ProductRow[];
      
      // Get categories for the products
      const categories = await api.getCategories() as CategoryRow[];
      const categoriesMap = new Map<string, CategoryRow>();
      categories.forEach((category) => {
        categoriesMap.set(category.id, category);
      });

      // Convert ProductRow to Product (with category object)
      return products.map((product: ProductRow) => {
        const category = categoriesMap.get(product.category_id);
        const productWithCategory = {
          ...product,
          category: category || {
            id: product.category_id,
            name: 'Unknown',
            image: '',
            description: '',
            created_at: null
          }
        };
        return ensureProductTypeCompatibility(productWithCategory);
      });
    },

    async createProduct(data: Record<string, unknown>) {
      return api.createProduct(data);
    },

    async updateProduct(id: string, data: Record<string, unknown>) {
      return api.updateProduct(id, data);
    },

    async deleteProduct(id: string) {
      return api.deleteProduct(id);
    }
  };
}

// Direct service functions for non-React contexts
export function createProductsService(tenantId: string) {
  const api = createApiService(tenantId);
  
  return {
    async getProducts(options?: {
      categoryId?: string;
      featured?: boolean;
      discounted?: boolean;
      limit?: number;
      offset?: number;
    }) {
      const products = await api.getProducts(options) as ProductRow[];
      
      // Get categories for the products
      const categories = await api.getCategories() as CategoryRow[];
      const categoriesMap = new Map<string, CategoryRow>();
      categories.forEach((category) => {
        categoriesMap.set(category.id, category);
      });

      // Convert ProductRow to Product (with category object)
      return products.map((product: ProductRow) => {
        const category = categoriesMap.get(product.category_id);
        const productWithCategory = {
          ...product,
          category: category || {
            id: product.category_id,
            name: 'Unknown',
            image: '',
            description: '',
            created_at: null
          }
        };
        return ensureProductTypeCompatibility(productWithCategory);
      });
    },

    async getCategories() {
      return api.getCategories() as Promise<CategoryRow[]>;
    },

    async getProductsByCategory(categoryId: string) {
      const products = await api.getProducts({ categoryId }) as ProductRow[];
      const category = await api.getCategory(categoryId) as CategoryRow | null;

      if (!category) {
        return [];
      }

      // Convert ProductRow to Product (with category object)
      return products.map((product: ProductRow) => {
        const productWithCategory = {
          ...product,
          category
        };
        return ensureProductTypeCompatibility(productWithCategory);
      });
    },

    async getProduct(productId: string) {
      const product = await api.getProduct(productId) as ProductRow | null;
      
      if (!product) {
        return null;
      }

      const category = await api.getCategory(product.category_id) as CategoryRow | null;
      
      const productWithCategory = {
        ...product,
        category: category || {
          id: product.category_id,
          name: 'Unknown',
          image: '',
          description: '',
          created_at: null
        }
      };
      
      return ensureProductTypeCompatibility(productWithCategory);
    },

    async getDiscountedProducts() {
      const products = await api.getProducts({ discounted: true }) as ProductRow[];
      
      // Get categories for the products
      const categories = await api.getCategories() as CategoryRow[];
      const categoriesMap = new Map<string, CategoryRow>();
      categories.forEach((category) => {
        categoriesMap.set(category.id, category);
      });

      // Convert ProductRow to Product (with category object)
      return products.map((product: ProductRow) => {
        const category = categoriesMap.get(product.category_id);
        const productWithCategory = {
          ...product,
          category: category || {
            id: product.category_id,
            name: 'Unknown',
            image: '',
            description: '',
            created_at: null
          }
        };
        return ensureProductTypeCompatibility(productWithCategory);
      });
    },

    async createProduct(data: Record<string, unknown>) {
      return api.createProduct(data);
    },

    async updateProduct(id: string, data: Record<string, unknown>) {
      return api.updateProduct(id, data);
    },

    async deleteProduct(id: string) {
      return api.deleteProduct(id);
    }
  };
}
