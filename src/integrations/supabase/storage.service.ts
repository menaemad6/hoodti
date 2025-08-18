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

// Upload customization image (user uploads)
export const uploadCustomizationImage = async (file: File, userId: string, fileName?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = fileName || `customization_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${uniqueFileName}`;
    
    const { data, error } = await supabase.storage
      .from('customization-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Customization upload error:', error);
      throw error;
    }
    
    if (!data || !data.path) {
      throw new Error('Upload succeeded but no file path was returned');
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('customization-uploads')
      .getPublicUrl(data.path);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('File uploaded but could not generate public URL');
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading customization image:', error);
    throw error;
  }
};

// Upload final design image
export const uploadDesignImage = async (file: File, fileName?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = fileName || `design_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('customization-designs')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Design upload error:', error);
      throw error;
    }
    
    if (!data || !data.path) {
      throw new Error('Upload succeeded but no file path was returned');
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('customization-designs')
      .getPublicUrl(data.path);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('File uploaded but could not generate public URL');
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading design image:', error);
    throw error;
  }
};

// Delete customization image
export const deleteCustomizationImage = async (path: string, bucket: 'customization-uploads' | 'customization-designs') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting customization image:', error);
    throw error;
  }
};

// Get signed URL for customization uploads (for merchant access)
export const getCustomizationUploadUrl = async (filePath: string, expiresIn: number = 86400) => {
  try {
    const { data, error } = await supabase.storage
      .from('customization-uploads')
      .createSignedUrl(filePath, expiresIn);
    
    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed upload URL:', error);
    throw error;
  }
};

// Get signed URL for design downloads
export const getDesignDownloadUrl = async (filePath: string, expiresIn: number = 86400) => {
  try {
    const { data, error } = await supabase.storage
      .from('customization-designs')
      .createSignedUrl(filePath, expiresIn);
    
    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed download URL:', error);
    throw error;
  }
};



// List all customization uploads for a user (for merchant access)
export const listCustomizationUploads = async (userId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('customization-uploads')
      .list(userId);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error listing customization uploads:', error);
    throw error;
  }
};
