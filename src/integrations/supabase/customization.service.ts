import { supabase } from './client';
import { 
  CustomizationSession, 
  CustomizationDesign, 
  CustomizationPricing,
  CustomizationSettings 
} from '@/types/customization.types';
import { getTenantById } from '@/lib/tenants';
import type { Database } from './types';
import { uploadDesignImage, uploadCustomizationImage } from './storage.service';
import { generateDesignImage, dataURLtoFile, generateDesignFilename } from '@/lib/design-image-generator';

type CustomizationRow = Database['public']['Tables']['customizations']['Row'];
type CustomizationInsert = Database['public']['Tables']['customizations']['Insert'];
type CustomizationUpdate = Database['public']['Tables']['customizations']['Update'];

export class CustomizationService {
  private static instance: CustomizationService;

  public static getInstance(): CustomizationService {
    if (!CustomizationService.instance) {
      CustomizationService.instance = new CustomizationService();
    }
    return CustomizationService.instance;
  }

  /**
   * Create a new customization session
   */
  async createCustomization(
    userId: string,
    tenantId: string,
    design: CustomizationDesign,
    pricing: CustomizationPricing
  ): Promise<CustomizationSession | null> {
    try {
      const insertData: CustomizationInsert = {
        user_id: userId,
        tenant_id: tenantId,
        base_product_type: design.baseProductType,
        base_product_size: design.baseProductSize,
        base_product_color: design.baseProductColor,
        design_data: design as unknown as Database['public']['Tables']['customizations']['Row']['design_data'],
        total_customization_cost: pricing.totalCustomizationCost,
        preview_image_url: null,
      };

      const { data, error } = await supabase
        .from('customizations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating customization:', error);
        return null;
      }

      return this.mapSupabaseToCustomizationSession(data);
    } catch (error) {
      console.error('Error creating customization:', error);
      return null;
    }
  }

  /**
   * Get customization by ID
   */
  async getCustomizationById(id: string): Promise<CustomizationSession | null> {
    try {
      const { data, error } = await supabase
        .from('customizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching customization:', error);
        return null;
      }

      return this.mapSupabaseToCustomizationSession(data);
    } catch (error) {
      console.error('Error fetching customization:', error);
      return null;
    }
  }

  /**
   * Get customizations by user ID
   */
  async getCustomizationsByUserId(userId: string): Promise<CustomizationSession[]> {
    try {
      const { data, error } = await supabase
        .from('customizations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user customizations:', error);
        return [];
      }

      return data.map(item => this.mapSupabaseToCustomizationSession(item));
    } catch (error) {
      console.error('Error fetching user customizations:', error);
      return [];
    }
  }

  /**
   * Update customization design data
   */
  async updateCustomizationDesign(
    id: string,
    design: CustomizationDesign,
    pricing: CustomizationPricing
  ): Promise<boolean> {
    try {
      const updateData: CustomizationUpdate = {
        design_data: design as unknown as Database['public']['Tables']['customizations']['Row']['design_data'],
        total_customization_cost: pricing.totalCustomizationCost,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('customizations')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating customization:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating customization:', error);
      return false;
    }
  }

  /**
   * Mark customization as completed (after order confirmation)
   */
  async completeCustomization(
    id: string,
    previewImageUrl: string
  ): Promise<boolean> {
    try {
      const updateData: CustomizationUpdate = {
        preview_image_url: previewImageUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('customizations')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error completing customization:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error completing customization:', error);
      return false;
    }
  }

  /**
   * Generate and store design image from canvas
   */
  async generateAndStoreDesignImage(
    customizationId: string,
    canvasElement: HTMLElement,
    design: CustomizationDesign
  ): Promise<string | null> {
    try {
      // Generate the design image
      const imageDataUrl = await generateDesignImage(canvasElement, {
        width: design.canvasWidth || 400,
        height: design.canvasHeight || 500,
        quality: 0.9,
        backgroundColor: '#ffffff'
      });

      // Convert to file
      const filename = generateDesignFilename(customizationId);
      const imageFile = dataURLtoFile(imageDataUrl, filename);

      // Upload to storage
      const imageUrl = await uploadDesignImage(imageFile, filename);

      // Update the customization with the preview image
      await this.completeCustomization(customizationId, imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('Error generating and storing design image:', error);
      return null;
    }
  }

  /**
   * Upload user customization images and return URLs
   */
  async uploadCustomizationImages(
    userId: string,
    images: File[]
  ): Promise<string[]> {
    try {
      const uploadPromises = images.map(async (image, index) => {
        const filename = `customization_${userId}_${Date.now()}_${index}.${image.name.split('.').pop()}`;
        return await uploadCustomizationImage(image, userId, filename);
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading customization images:', error);
      throw error;
    }
  }

  /**
   * Get customization with design image
   */
  async getCustomizationWithImage(id: string): Promise<CustomizationSession | null> {
    try {
      const { data, error } = await supabase
        .from('customizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching customization:', error);
        return null;
      }

      const customization = this.mapSupabaseToCustomizationSession(data);
      
      // If no preview image exists, try to generate one
      if (!customization.isCompleted && data.design_data) {
        // This would need to be called from the frontend with the canvas element
        console.log('Customization has no preview image. Call generateAndStoreDesignImage to create one.');
      }

      return customization;
    } catch (error) {
      console.error('Error fetching customization with image:', error);
      return null;
    }
  }

  /**
   * Delete customization
   */
  async deleteCustomization(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customizations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customization:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting customization:', error);
      return false;
    }
  }

  /**
   * Get tenant customization settings from local tenants.ts
   */
  getTenantCustomizationSettings(tenantId: string): CustomizationSettings | null {
    const tenant = getTenantById(tenantId);
    if (!tenant?.customization) {
      return null;
    }

    return {
      textPrice: tenant.customization.textPrice,
      imagePrice: tenant.customization.imagePrice,
      baseProductPrices: tenant.customization.baseProductPrices,
      enabled: tenant.customization.enabled,
    };
  }

  /**
   * Calculate customization pricing
   */
  calculatePricing(
    baseProductType: string,
    textElements: number,
    imageElements: number,
    tenantId: string
  ): CustomizationPricing {
    const tenantSettings = this.getTenantCustomizationSettings(tenantId);
    if (!tenantSettings) {
      return {
        baseProductPrice: 0,
        textElements: 0,
        imageElements: 0,
        textPrice: 0,
        imagePrice: 0,
        totalCustomizationCost: 0,
        totalPrice: 0,
      };
    }

    const baseProductPrice = tenantSettings.baseProductPrices[baseProductType] || 0;
    const textCost = textElements * tenantSettings.textPrice;
    const imageCost = imageElements * tenantSettings.imagePrice;
    const totalCustomizationCost = textCost + imageCost;
    const totalPrice = baseProductPrice + totalCustomizationCost;

    return {
      baseProductPrice,
      textElements,
      imageElements,
      textPrice: tenantSettings.textPrice,
      imagePrice: tenantSettings.imagePrice,
      totalCustomizationCost,
      totalPrice,
    };
  }

  /**
   * Map Supabase data to CustomizationSession
   */
  private mapSupabaseToCustomizationSession(data: CustomizationRow): CustomizationSession {
    // Safely parse the design_data from Json
    const designData = data.design_data as unknown as CustomizationDesign;
    
    return {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      design: designData,
      pricing: this.calculatePricing(
        data.base_product_type,
        designData.texts?.length || 0,
        designData.images?.length || 0,
        data.tenant_id
      ),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isCompleted: !!data.preview_image_url,
    };
  }
}

export const customizationService = CustomizationService.getInstance();
