import { supabase } from "./client";
import { BannerRow } from "./types.service";

export interface BannerInput {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  position?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  tenant_id?: string;
}

// Loosen Supabase generics locally to avoid deep type instantiation errors in tooling
const sb: any = supabase;

export async function getBanners(tenantId: string) {
  console.log('Fetching banners for tenant:', tenantId);
  try {
    const { data, error } = await sb
      .from('banners')
      .select('id,title,description,image_url,link_url,position,is_active,start_date,end_date,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
    
    return (data || []) as BannerRow[];
  } catch (error) {
    console.error('Exception in getBanners:', error);
    throw error;
  }
}

export async function getBannerById(id: string) {
  console.log(`Fetching banner with ID: ${id}`);
  
  if (!id) {
    const error = new Error('Banner ID is required');
    console.error(error);
    throw error;
  }
  
  try {
    const { data, error } = await sb
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
    
    return data as BannerRow;
  } catch (error) {
    console.error('Exception in getBannerById:', error);
    throw error;
  }
}

export async function createBanner(bannerData: BannerInput) {
  console.log('Creating banner with data:', bannerData);
  
  try {
    const { data, error } = await sb
      .from('banners')
      .insert([bannerData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
    
    console.log('Banner created successfully:', data);
    return data as BannerRow;
  } catch (error) {
    console.error('Exception in createBanner:', error);
    throw error;
  }
}

export async function updateBanner(id: string, bannerData: Partial<BannerInput>) {
  console.log(`Updating banner ${id} with data:`, bannerData);
  
  if (!id) {
    const error = new Error('Banner ID is required');
    console.error(error);
    throw error;
  }
  
  try {
    const { data, error } = await sb
      .from('banners')
      .update(bannerData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
    
    console.log('Banner updated successfully:', data);
    return data as BannerRow;
  } catch (error) {
    console.error('Exception in updateBanner:', error);
    throw error;
  }
}

export async function deleteBanner(id: string) {
  console.log(`Deleting banner with ID: ${id}`);
  
  if (!id) {
    const error = new Error('Banner ID is required');
    console.error(error);
    throw error;
  }
  
  try {
    const { error } = await sb
      .from('banners')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
    
    console.log('Banner deleted successfully');
    return true;
  } catch (error) {
    console.error('Exception in deleteBanner:', error);
    throw error;
  }
}

export async function uploadBannerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `banner_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `banner-images/${fileName}`;
  
  console.log(`Uploading banner image to bucket 'banners', path: ${filePath}`);
  
  const { error } = await sb.storage
    .from('banners')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (error) {
    console.error('Error uploading banner image:', error);
    throw error;
  }
  
  console.log(`Banner image uploaded successfully, getting public URL`);
  const { data } = sb.storage.from('banners').getPublicUrl(filePath);
  console.log(`Public URL: ${data.publicUrl}`);
  return data.publicUrl;
}

export async function deleteBannerImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'banners');
    
    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      throw new Error('Invalid banner image URL');
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    console.log(`Deleting banner image: ${filePath}`);
    
    const { error } = await sb.storage
      .from('banners')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting banner image:', error);
      throw error;
    }
    
    console.log('Banner image deleted successfully');
  } catch (error) {
    console.error('Exception in deleteBannerImage:', error);
    throw error;
  }
}
