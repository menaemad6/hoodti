import { supabase } from "./client";

// Upload a product image
export const uploadProductImage = async (file: File, fileName?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = fileName || `product_${Date.now()}.${fileExt}`;
    // Try to upload with upsert true to handle existing files
    const { data, error } = await supabase.storage
      .from('products')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true // Enable upsert to handle existing files
      });
    if (error) {
      console.error('Upload error details:', error);
      throw error;
    }
    if (!data || !data.path) {
      throw new Error('Upload succeeded but no file path was returned');
    }
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(data.path);
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('File uploaded but could not generate public URL');
    }
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete a product image
export const deleteProductImage = async (path: string) => {
  try {
    const { error } = await supabase.storage
      .from('products')
      .remove([path]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
