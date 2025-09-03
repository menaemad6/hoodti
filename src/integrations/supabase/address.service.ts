
import { supabase } from "./client";
import { Address } from "@/types";

export async function getUserAddresses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    
    // Map from database format to app format
    return data.map((address) => ({
      id: address.id,
      name: address.name,
      line1: address.line1,
      line2: address.line2 || undefined,
      city: address.city,
      state: address.state || undefined,
      postalCode: address.postal_code || undefined,
      isDefault: address.is_default || false
    })) as Address[];
  } catch (error) {
    console.error('Error getting user addresses:', error);
    return [];
  }
}

export async function addAddress(userId: string, address: Omit<Address, 'id'>) {
  try {
    // Check if this is the first address and set it as default
    const existing = await getUserAddresses(userId);
    const isDefault = existing.length === 0 ? true : address.isDefault;
    
    // If setting this as default, unset any existing default
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: userId,
        name: address.name,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state || null,
        postal_code: address.postalCode || null,
        is_default: isDefault
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      line1: data.line1,
      line2: data.line2 || undefined,
      city: data.city,
      state: data.state || undefined,
      postalCode: data.postal_code || undefined,
      isDefault: data.is_default || false
    } as Address;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
}

export async function updateAddress(addressId: string, address: Omit<Address, 'id'>, userId: string) {
  try {
    // If setting this as default, unset any existing default
    if (address.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .update({
        name: address.name,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state || null,
        postal_code: address.postalCode || null,
        is_default: address.isDefault
      })
      .eq('id', addressId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      line1: data.line1,
      line2: data.line2 || undefined,
      city: data.city,
      state: data.state || undefined,
      postalCode: data.postal_code || undefined,
      isDefault: data.is_default || false
    } as Address;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}

export async function setDefaultAddress(addressId: string, userId: string) {
  try {
    // First, unset any existing default
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
    
    // Then set the new default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
}
