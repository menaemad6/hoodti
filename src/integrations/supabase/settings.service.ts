import { supabase } from "./client";

export interface SiteSettings {
  id: string;
  shipping_fee: number;
  tax_rate: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches the current site settings
 */
export async function getSettings(): Promise<SiteSettings | null> {
  try {
    // Always fetch the first row as there should only be one settings record
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

/**
 * Updates the shipping fee setting
 */
export async function updateShippingFee(shippingFee: number): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings();
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update({
          shipping_fee: shippingFee,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);
      
      if (error) throw error;
    } else {
      // Create new settings if none exist
      const { error } = await supabase
        .from('settings')
        .insert({
          shipping_fee: shippingFee,
          tax_rate: 0.08, // Default tax rate
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating shipping fee:", error);
    return false;
  }
}

/**
 * Updates the tax rate setting
 */
export async function updateTaxRate(taxRate: number): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings();
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update({
          tax_rate: taxRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);
      
      if (error) throw error;
    } else {
      // Create new settings if none exist
      const { error } = await supabase
        .from('settings')
        .insert({
          shipping_fee: 5.99, // Default shipping fee
          tax_rate: taxRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating tax rate:", error);
    return false;
  }
}

/**
 * Updates both shipping fee and tax rate at once
 */
export async function updateSettings(shippingFee: number, taxRate: number): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings();
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update({
          shipping_fee: shippingFee,
          tax_rate: taxRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);
      
      if (error) throw error;
    } else {
      // Create new settings if none exist
      const { error } = await supabase
        .from('settings')
        .insert({
          shipping_fee: shippingFee,
          tax_rate: taxRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating settings:", error);
    return false;
  }
}

/**
 * Gets the current shipping fee or returns a default value
 */
export async function getShippingFee(): Promise<number> {
  try {
    // Try to fetch settings first
    const settings = await getSettings();
    
    if (settings && typeof settings.shipping_fee === 'number') {
      console.log("Retrieved shipping fee from settings:", settings.shipping_fee);
      return settings.shipping_fee;
    }
    
    // If no settings exist or shipping_fee is not set, fetch directly from the table
    const { data, error } = await supabase
      .from('settings')
      .select('shipping_fee')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error fetching shipping fee directly:", error);
      return 5.99; // Default value
    }
    
    if (data && typeof data.shipping_fee === 'number') {
      console.log("Retrieved shipping fee directly:", data.shipping_fee);
      return data.shipping_fee;
    }
    
    // Default fallback
    return 5.99;
  } catch (error) {
    console.error("Error in getShippingFee:", error);
    return 5.99; // Default if anything goes wrong
  }
}

/**
 * Gets the current tax rate or returns a default value
 */
export async function getTaxRate(): Promise<number> {
  try {
    // Try to fetch settings first
    const settings = await getSettings();
    
    if (settings && typeof settings.tax_rate === 'number') {
      console.log("Retrieved tax rate from settings:", settings.tax_rate);
      return settings.tax_rate;
    }
    
    // If no settings exist or tax_rate is not set, fetch directly from the table
    const { data, error } = await supabase
      .from('settings')
      .select('tax_rate')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error fetching tax rate directly:", error);
      return 0.08; // Default value (8%)
    }
    
    if (data && typeof data.tax_rate === 'number') {
      console.log("Retrieved tax rate directly:", data.tax_rate);
      return data.tax_rate;
    }
    
    // Default fallback
    return 0.08;
  } catch (error) {
    console.error("Error in getTaxRate:", error);
    return 0.08; // Default if anything goes wrong
  }
} 