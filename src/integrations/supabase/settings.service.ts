import { supabase } from "./client";

export interface GovernmentShippingFee {
  name: string;
  shipping_fee: number;
}

export interface CustomizationProduct {
  enabled: boolean;
  base_price: number;
}

export interface CustomizationSettings {
  text_fee: number;
  image_fee: number;
  products: {
    [key: string]: CustomizationProduct;
  };
}

export interface SiteSettings {
  id: string;
  shipping_fee: number;
  tax_rate: number;
  government_shipping_fees?: GovernmentShippingFee[];
  delivery_delay?: number;
  customizations?: CustomizationSettings;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches the current site settings
 */
export async function getSettings(tenantId?: string): Promise<SiteSettings | null> {
  try {
    let query = supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query.single();

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
export async function updateShippingFee(shippingFee: number, tenantId?: string): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings(tenantId);
    
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
          tenant_id: tenantId || 'hoodti',
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
export async function updateTaxRate(taxRate: number, tenantId?: string): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings(tenantId);
    
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
          tax_rate: taxRate,
          shipping_fee: 5.99, // Default shipping fee
          tenant_id: tenantId || 'hoodti',
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
 * Updates government shipping fees
 */
export async function updateGovernmentShippingFees(governmentFees: GovernmentShippingFee[], tenantId?: string): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings(tenantId);
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update({
          government_shipping_fees: governmentFees,
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
          tax_rate: 0.08, // Default tax rate
          government_shipping_fees: governmentFees,
          tenant_id: tenantId || 'hoodti',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating government shipping fees:", error);
    return false;
  }
}

/**
 * Updates both shipping fee and tax rate at once
 */
export async function updateSettings(shippingFee: number, taxRate: number, tenantId?: string): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings(tenantId);
    
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
          tenant_id: tenantId || 'hoodti',
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
export async function getShippingFee(tenantId?: string): Promise<number> {
  try {
    // Try to fetch settings first
    const settings = await getSettings(tenantId);
    
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
export async function getTaxRate(tenantId?: string): Promise<number> {
  try {
    // Try to fetch settings first
    const settings = await getSettings(tenantId);
    
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

/**
 * Gets government shipping fees
 */
export async function getGovernmentShippingFees(tenantId?: string): Promise<GovernmentShippingFee[]> {
  try {
    const settings = await getSettings(tenantId);
    
    if (settings && settings.government_shipping_fees) {
      return settings.government_shipping_fees;
    }
    
    // If no settings exist, fetch directly from the table
    const { data, error } = await supabase
      .from('settings')
      .select('government_shipping_fees')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error fetching government shipping fees directly:", error);
      return []; // Return empty array as default
    }
    
    if (data && data.government_shipping_fees) {
      return data.government_shipping_fees;
    }
    
    // Default fallback - return empty array
    return [];
  } catch (error) {
    console.error("Error in getGovernmentShippingFees:", error);
    return []; // Return empty array if anything goes wrong
  }
}

/**
 * Gets shipping fee for a specific government
 */
export async function getShippingFeeForGovernment(governmentName: string, tenantId?: string): Promise<number> {
  try {
    const governmentFees = await getGovernmentShippingFees(tenantId);
    const government = governmentFees.find(g => g.name === governmentName);
    
    if (government) {
      return government.shipping_fee;
    }
    
    // If government not found, return default shipping fee
    return await getShippingFee(tenantId);
  } catch (error) {
    console.error("Error getting shipping fee for government:", error);
    return 5.99; // Default fallback
  }
}

/**
 * Updates the delivery delay setting
 */
export async function updateDeliveryDelay(delay: number, tenantId?: string): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings(tenantId);
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update({
          delivery_delay: delay,
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
          tax_rate: 0.08, // Default tax rate
          delivery_delay: delay,
          tenant_id: tenantId || 'hoodti',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating delivery delay:", error);
    return false;
  }
}

/**
 * Gets the current delivery delay or returns a default value
 */
export async function getDeliveryDelay(tenantId?: string): Promise<number> {
  try {
    const settings = await getSettings(tenantId);
    
    if (settings && typeof settings.delivery_delay === 'number') {
      console.log("Retrieved delivery delay from settings:", settings.delivery_delay);
      return settings.delivery_delay;
    }
    
    // If no settings exist or delivery_delay is not set, fetch directly from the table
    let query = supabase
      .from('settings')
      .select('delivery_delay')
      .limit(1);
      
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error("Error fetching delivery delay directly:", error);
      return 0; // Default value
    }
    
    if (data && typeof data.delivery_delay === 'number') {
      console.log("Retrieved delivery delay directly:", data.delivery_delay);
      return data.delivery_delay;
    }
    
    // Default fallback
    return 0;
  } catch (error) {
    console.error("Error in getDeliveryDelay:", error);
    return 0; // Default if anything goes wrong
  }
}

/**
 * Gets customization settings
 */
export async function getCustomizationSettings(tenantId?: string): Promise<CustomizationSettings | null> {
  try {
    const settings = await getSettings(tenantId);
    
    if (settings && settings.customizations) {
      return settings.customizations;
    }
    
    // If no settings exist, fetch directly from the table
    let query = supabase
      .from('settings')
      .select('customizations')
      .limit(1);
      
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error("Error fetching customization settings directly:", error);
      return null;
    }
    
    if (data && data.customizations) {
      return data.customizations;
    }
    
    // Default fallback
    return null;
  } catch (error) {
    console.error("Error in getCustomizationSettings:", error);
    return null;
  }
}

/**
 * Updates customization settings
 */
export async function updateCustomizationSettings(customizations: CustomizationSettings, tenantId?: string): Promise<boolean> {
  try {
    // Get current settings
    const settings = await getSettings(tenantId);
    
    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update({
          customizations: customizations,
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
          tax_rate: 0.08, // Default tax rate
          customizations: customizations,
          tenant_id: tenantId || 'hoodti',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating customization settings:", error);
    return false;
  }
}