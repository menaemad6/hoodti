import { supabase } from "./client";

// Create a storage bucket if it doesn't exist
export const createProductsBucket = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('products');
    
    if (error && error.message.includes('not found')) {
      // Bucket doesn't exist, create it
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }
      
      console.log('Created products bucket:', newBucket);
      return newBucket;
    } else if (error) {
      console.error('Error getting bucket:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createProductsBucket:', error);
    throw error;
  }
};

// Upload a product image
export const uploadProductImage = async (file: File, fileName?: string) => {
  try {
    // Make sure the bucket exists
    await createProductsBucket();
    
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
      
      // If it's an RLS error, provide more specific information
      if (error.message.includes('row-level security') || error.statusCode === 403) {
        throw new Error(`Permission denied: ${error.message}. Make sure the Supabase storage bucket has public insert enabled.`);
      }
      
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
