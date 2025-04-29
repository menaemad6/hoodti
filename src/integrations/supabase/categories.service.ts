import { supabase } from "./client";
import { CategoryRow } from "./types.service";

export interface CategoryInput {
  name: string;
  description?: string;
  image?: string;
}

export async function getCategories() {
  console.log('Fetching all categories');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} categories`);
    return data as CategoryRow[];
  } catch (error) {
    console.error('Exception in getCategories:', error);
    throw error;
  }
}

export async function getCategoryById(id: string) {
  console.log(`Fetching category with ID: ${id}`);
  
  if (!id) {
    const error = new Error('Category ID is required');
    console.error(error);
    throw error;
  }
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
    
    if (!data) {
      const notFoundError = new Error(`Category with ID ${id} not found`);
      console.error(notFoundError);
      throw notFoundError;
    }
    
    console.log(`Retrieved category:`, data);
    return data as CategoryRow;
  } catch (error) {
    console.error('Exception in getCategoryById:', error);
    throw error;
  }
}

export async function createCategory(category: CategoryInput) {
  console.log('Creating new category:', category);
  
  // Validate input
  if (!category.name || category.name.trim() === '') {
    throw new Error('Category name is required');
  }
  
  // Check if a category with this name already exists
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', category.name.trim())
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking for existing category:', checkError);
    throw new Error('Error validating category name');
  }
  
  if (existingCategory) {
    throw new Error('A category with this name already exists');
  }
  
  // Create the category with required fields
  const categoryData = {
    name: category.name.trim(),
    description: category.description || '',
    image: category.image || ''
  };
  
  console.log('Inserting category with data:', categoryData);
  
  // Create the category
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select();
  
  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error('Failed to create category: No data returned');
  }
  
  console.log('Category created successfully:', data[0]);
  return data[0] as CategoryRow;
}

export async function updateCategory(id: string, category: CategoryInput) {
  console.log(`Updating category with ID: ${id}`, category);
  
  if (!id) {
    const error = new Error('Category ID is required');
    console.error(error);
    throw error;
  }
  
  // First check if the category exists
  console.log('Checking if category exists...');
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error finding category to update:', checkError);
    throw new Error(`Category not found or could not be accessed: ${checkError.message}`);
  }
  
  if (!existingCategory) {
    const notFoundError = new Error(`Category with ID ${id} not found`);
    console.error(notFoundError);
    throw notFoundError;
  }
  
  console.log('Found existing category:', existingCategory);
  
  // Prepare update data
  const updateData = {
    name: category.name.trim(),
    description: category.description?.trim() || existingCategory.description || '',
    image: category.image || existingCategory.image || ''
  };
  
  console.log('Performing update with data:', updateData);
  
  // Then perform the update
  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
  
  console.log('Update response:', data);
  
  if (!data || data.length === 0) {
    console.log('No data returned, returning existing category with updates applied');
    // If no data is returned but there's no error, return the existingCategory with updates
    const resultCategory = {
      ...existingCategory,
      ...updateData
    };
    console.log('Returning merged category:', resultCategory);
    return resultCategory as CategoryRow;
  }
  
  console.log('Update successful, returning:', data[0]);
  return data[0] as CategoryRow;
}

export async function deleteCategory(id: string) {
  // First check if the category exists
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error finding category to delete:', checkError);
    throw new Error('Error checking category existence');
  }
  
  if (!existingCategory) {
    throw new Error('Category not found');
  }
  
  // Check if the category is being used by any products
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);
  
  if (countError) {
    console.error('Error checking if category is in use:', countError);
    throw new Error('Could not verify if category is in use');
  }
  
  if (count && count > 0) {
    throw new Error(`Cannot delete category that is used by ${count} products. Please reassign these products first.`);
  }
  
  // Now perform the delete
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
  
  return true;
}

export async function uploadCategoryImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `category-images/${fileName}`;
  
  console.log(`Uploading image to bucket 'website-images', path: ${filePath}`);
  
  const { error } = await supabase.storage
    .from('website-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  console.log(`Image uploaded successfully, getting public URL`);
  const { data } = supabase.storage.from('website-images').getPublicUrl(filePath);
  console.log(`Public URL: ${data.publicUrl}`);
  return data.publicUrl;
} 