import { supabase } from "./client";
import { useCurrentTenant } from "@/context/TenantContext";
import React from "react";

// Base API service class with tenant support
export class ApiService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Generic query method with tenant filtering
  private async query<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    let query = supabase.from(table).select(options.select || '*');
    
    // Add tenant filter
    query = query.eq('tenant_id', this.tenantId);
    
    // Add additional filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    // Add ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      });
    }
    
    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error querying ${table}:`, error);
      throw error;
    }
    
    return data || [];
  }

  // Generic insert method
  private async insert<T>(
    table: string,
    data: Record<string, any>
  ): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(table)
      .insert({ ...data, tenant_id: this.tenantId })
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
    
    return result;
  }

  // Generic update method
  private async update<T>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(table)
      .update({ ...data, tenant_id: this.tenantId })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
    
    return result;
  }

  // Generic delete method
  private async delete(table: string, id: string): Promise<boolean> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
    
    return true;
  }

  // Generic get by ID method
  private async getById<T>(
    table: string,
    id: string,
    select?: string
  ): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error getting ${table} by ID:`, error);
      throw error;
    }
    
    return data;
  }

  // Products API
  async getProducts(options?: {
    categoryId?: string;
    featured?: boolean;
    discounted?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const filters: Record<string, any> = {};
    if (options?.categoryId) filters.category_id = options.categoryId;
    if (options?.featured !== undefined) filters.featured = options.featured;
    
    let products = await this.query('products', {
      filters,
      limit: options?.limit,
      offset: options?.offset
    });
    
    // Filter discounted products if requested
    if (options?.discounted) {
      products = products.filter((p: any) => p.discount !== null);
    }
    
    return products;
  }

  async getProduct(id: string) {
    return this.getById('products', id);
  }

  async createProduct(data: Record<string, any>) {
    return this.insert('products', data);
  }

  async updateProduct(id: string, data: Record<string, any>) {
    return this.update('products', id, data);
  }

  async deleteProduct(id: string) {
    return this.delete('products', id);
  }

  // Categories API
  async getCategories() {
    return this.query('categories');
  }

  async getCategory(id: string) {
    return this.getById('categories', id);
  }

  async createCategory(data: Record<string, any>) {
    return this.insert('categories', data);
  }

  async updateCategory(id: string, data: Record<string, any>) {
    return this.update('categories', id, data);
  }

  async deleteCategory(id: string) {
    return this.delete('categories', id);
  }

  // Orders API
  async getOrders(options?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const filters: Record<string, any> = {};
    if (options?.userId) filters.user_id = options.userId;
    if (options?.status) filters.status = options.status;
    
    return this.query('orders', {
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async getOrder(id: string) {
    return this.getById('orders', id);
  }

  async createOrder(data: Record<string, any>) {
    return this.insert('orders', data);
  }

  async updateOrder(id: string, data: Record<string, any>) {
    return this.update('orders', id, data);
  }

  // Settings API
  async getSettings() {
    const settings = await this.query('settings', { limit: 1 });
    return settings[0] || null;
  }

  async updateSettings(data: Record<string, any>) {
    const settings = await this.getSettings();
    if (settings) {
      return this.update('settings', settings.id, data);
    } else {
      return this.insert('settings', data);
    }
  }

  // Discounts API
  async getDiscounts(options?: {
    active?: boolean;
    code?: string;
  }) {
    const filters: Record<string, any> = {};
    if (options?.active !== undefined) filters.is_active = options.active;
    if (options?.code) filters.code = options.code;
    
    return this.query('discounts', { filters });
  }

  async getDiscount(id: string) {
    return this.getById('discounts', id);
  }

  async createDiscount(data: Record<string, any>) {
    return this.insert('discounts', data);
  }

  async updateDiscount(id: string, data: Record<string, any>) {
    return this.update('discounts', id, data);
  }

  async deleteDiscount(id: string) {
    return this.delete('discounts', id);
  }

  // Delivery Slots API
  async getDeliverySlots(options?: {
    active?: boolean;
    dayOfWeek?: number;
  }) {
    const filters: Record<string, any> = {};
    if (options?.active !== undefined) filters.is_active = options.active;
    if (options?.dayOfWeek !== undefined) filters.day_of_week = options.dayOfWeek;
    
    return this.query('delivery_slots', { filters });
  }

  async getDeliverySlot(id: string) {
    return this.getById('delivery_slots', id);
  }

  async createDeliverySlot(data: Record<string, any>) {
    return this.insert('delivery_slots', data);
  }

  async updateDeliverySlot(id: string, data: Record<string, any>) {
    return this.update('delivery_slots', id, data);
  }

  async deleteDeliverySlot(id: string) {
    return this.delete('delivery_slots', id);
  }

  // Wishlists API
  async getWishlist(userId: string) {
    return this.query('wishlists', {
      filters: { user_id: userId }
    });
  }

  async addToWishlist(userId: string, productId: string) {
    return this.insert('wishlists', {
      user_id: userId,
      product_id: productId
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('tenant_id', this.tenantId);
    
    if (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
    
    return true;
  }

  async isInWishlist(userId: string, productId: string) {
    const wishlist = await this.query('wishlists', {
      filters: { user_id: userId, product_id: productId },
      limit: 1
    });
    
    return wishlist.length > 0;
  }
}

// Hook to get API service with current tenant
export function useApiService() {
  const tenant = useCurrentTenant();
  return React.useMemo(() => new ApiService(tenant.id), [tenant.id]);
}

// Export singleton instances for direct use
export const createApiService = (tenantId: string) => new ApiService(tenantId); 