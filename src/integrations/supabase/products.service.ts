import { supabase } from "./client";
import { Product, ProductRow, CategoryRow } from "./types.service";

export async function getProducts() {
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*');
  
  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return [];
  }

  // Map categories for easy lookup
  const categoriesMap = new Map<string, CategoryRow>();
  categoriesData.forEach((category) => {
    categoriesMap.set(category.id, category);
  });

  // Convert ProductRow to Product (with category object)
  return productsData.map((product: ProductRow) => {
    const category = categoriesMap.get(product.category_id);
    return {
      ...product,
      category: category || {
        id: product.category_id,
        name: 'Unknown',
        image: '',
        description: '',
        created_at: null
      }
    };
  });
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data;
}

export async function getProductsByCategory(categoryId: string) {
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId);
  
  if (productsError) {
    console.error('Error fetching products by category:', productsError);
    return [];
  }

  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (categoryError) {
    console.error('Error fetching category:', categoryError);
    return [];
  }

  // Convert ProductRow to Product (with category object)
  return productsData.map((product: ProductRow) => ({
    ...product,
    category: categoryData
  }));
}

export async function getProduct(productId: string) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (productError) {
    console.error('Error fetching product:', productError);
    return null;
  }

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', product.category_id)
    .single();

  if (categoryError) {
    console.error('Error fetching category:', categoryError);
    return null;
  }

  return {
    ...product,
    category
  };
}

export async function getDiscountedProducts() {
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .not('discount', 'is', null);
  
  if (productsError) {
    console.error('Error fetching discounted products:', productsError);
    return [];
  }

  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return [];
  }

  // Map categories for easy lookup
  const categoriesMap = new Map<string, CategoryRow>();
  categoriesData.forEach((category) => {
    categoriesMap.set(category.id, category);
  });

  // Convert ProductRow to Product (with category object)
  return productsData.map((product: ProductRow) => {
    const category = categoriesMap.get(product.category_id);
    return {
      ...product,
      category: category || {
        id: product.category_id,
        name: 'Unknown',
        image: '',
        description: '',
        created_at: null
      }
    };
  });
}
