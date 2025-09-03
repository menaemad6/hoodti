import { supabase } from "./client";

export interface Discount {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all discount codes
 */
export async function getAllDiscounts(): Promise<Discount[]> {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
}

/**
 * Fetch active discount codes
 */
export async function getActiveDiscounts(): Promise<Discount[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .or(`valid_from.is.null,valid_from.lte.${now}`)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching active discounts:', error);
    return [];
  }
}

/**
 * Create a new discount code
 */
export async function createDiscount(discount: Omit<Discount, 'id' | 'created_at' | 'updated_at' | 'used_count'>): Promise<Discount | null> {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .insert({
        ...discount,
        used_count: 0,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating discount:', error);
    return null;
  }
}

/**
 * Update an existing discount
 */
export async function updateDiscount(id: string, discount: Partial<Discount>): Promise<Discount | null> {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .update(discount)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating discount:', error);
    return null;
  }
}

/**
 * Delete a discount code
 */
export async function deleteDiscount(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting discount:', error);
    return false;
  }
}

/**
 * Validate and apply a discount code
 * Returns null if code is invalid or used up
 */
export async function validateDiscount(code: string, orderAmount: number = 0): Promise<Discount | null> {
  try {
    console.log(`Validating discount code: ${code}, order amount: ${orderAmount}`);
    
    // Get the discount code
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', code.trim().toUpperCase());
    
    // Check if we have any results
    if (error || !data || data.length === 0) {
      console.log('Discount code not found:', code);
      return null;
    }
    
    // Get the first matching discount
    const discount = data[0];
    console.log('Found discount:', discount);

    // Check if the discount is active
    if (!discount.is_active) {
      console.log('Discount code is inactive:', code);
      return null;
    }
    
    // Check date constraints - use proper date formatting
    if (discount.valid_from) {
      const startDate = new Date(discount.valid_from);
      const currentDate = new Date();
      
      // Set start date to beginning of day to avoid time comparison issues
      startDate.setHours(0, 0, 0, 0);
      
      if (currentDate < startDate) {
        console.log(`Discount not yet active. Current: ${currentDate.toISOString()}, Starts: ${startDate.toISOString()}`);
        return null;
      }
    }
    
    if (discount.valid_until) {
      const endDate = new Date(discount.valid_until);
      const currentDate = new Date();
      
      // Set end date to end of day to ensure the entire end date is included
      endDate.setHours(23, 59, 59, 999);
      
      if (currentDate > endDate) {
        console.log(`Discount expired. Current: ${currentDate.toISOString()}, Ended: ${endDate.toISOString()}`);
        return null;
      }
    }
    
    // Check if discount has reached max uses
    if (discount.usage_limit && discount.usage_limit > 0 && discount.used_count >= discount.usage_limit) {
      console.log('Discount code has reached maximum uses:', code);
      return null;
    }
    
    // Check minimum order amount
    if (discount.minimum_order_amount > 0 && discount.minimum_order_amount > orderAmount) {
      console.log(`Order amount ${orderAmount} is less than minimum required ${discount.minimum_order_amount}`);
      return null;
    }
    
    console.log('Discount code is valid:', discount);
    return discount;
  } catch (error) {
    console.error('Error validating discount code:', error);
    return null;
  }
}

/**
 * Apply a discount by incrementing its usage counter
 */
export async function incrementDiscountUsage(id: string): Promise<boolean> {
  try {
    // First get the current discount to check if it can still be used
    const { data, error } = await supabase
      .from('discounts')
      .select('used_count, usage_limit')
      .eq('id', id);
    
    if (error || !data || data.length === 0) {
      console.error('Error fetching discount:', error);
      return false;
    }
    
    const discount = data[0];
    
    // Check if discount has reached max uses
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      console.error('Discount has already reached maximum uses');
      return false;
    }
    
    // Increment the usage counter
    const { error: updateError } = await supabase
      .from('discounts')
      .update({ used_count: discount.used_count + 1 })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error incrementing discount usage:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error applying discount:', error);
    return false;
  }
} 