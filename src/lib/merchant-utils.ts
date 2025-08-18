import { getCustomizationUploadUrl, getDesignDownloadUrl } from '@/integrations/supabase/storage.service';

interface CustomizationImage {
  merchantUrl?: string;
  uploadedUrl?: string;
  url?: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  rotation: number;
  opacity: number;
}

interface CustomizationText {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number };
  rotation: number;
}

interface CustomizationMetadata {
  images?: CustomizationImage[];
  texts?: CustomizationText[];
  baseProductType?: string;
  baseProductSize?: string;
  baseProductColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  designImageUrl?: string;
}

/**
 * Extract raw image URLs from customization metadata for merchant printing
 */
export function extractRawImageUrls(customizationMetadata: string): string[] {
  try {
    const metadata = JSON.parse(customizationMetadata);
    const images = metadata.images || [];
    
    // Extract merchant URLs (raw uploaded images) from the metadata
    return images
      .map((img: CustomizationImage) => img.merchantUrl || img.uploadedUrl)
      .filter(Boolean); // Remove any undefined/null values
  } catch (error) {
    console.error('Error parsing customization metadata:', error);
    return [];
  }
}

/**
 * Get signed URLs for raw customization images (for merchant access)
 */
export async function getRawImageUrls(customizationMetadata: string): Promise<string[]> {
  try {
    const metadata = JSON.parse(customizationMetadata);
    const images = metadata.images || [];
    
    const signedUrls = await Promise.all(
      images.map(async (img: CustomizationImage) => {
        if (img.merchantUrl && img.merchantUrl.includes('customization-uploads')) {
          // Extract the file path from the URL
          const urlParts = img.merchantUrl.split('/');
          const filePath = urlParts.slice(-2).join('/'); // userId/filename
          
          try {
            return await getCustomizationUploadUrl(filePath);
          } catch (error) {
            console.error('Error getting signed URL for image:', error);
            return img.merchantUrl; // Fallback to original URL
          }
        }
        return img.merchantUrl || img.url;
      })
    );
    
    return signedUrls.filter(Boolean);
  } catch (error) {
    console.error('Error getting raw image URLs:', error);
    return [];
  }
}

/**
 * Get design preview image URL
 */
export function getDesignPreviewUrl(customizationMetadata: string): string | null {
  try {
    const metadata = JSON.parse(customizationMetadata);
    return metadata.designImageUrl || null;
  } catch (error) {
    console.error('Error parsing customization metadata:', error);
    return null;
  }
}

/**
 * Extract customization details for merchant reference
 */
export function extractCustomizationDetails(customizationMetadata: string) {
  try {
    const metadata = JSON.parse(customizationMetadata);
    
    return {
      productType: metadata.baseProductType,
      productSize: metadata.baseProductSize,
      productColor: metadata.baseProductColor,
      textElements: metadata.texts || [],
      imageElements: metadata.images || [],
      canvasDimensions: {
        width: metadata.canvasWidth,
        height: metadata.canvasHeight,
      },
      designImageUrl: metadata.designImageUrl,
    };
  } catch (error) {
    console.error('Error parsing customization metadata:', error);
    return null;
  }
}

/**
 * Generate a summary of customization for merchant printing
 */
export function generateCustomizationSummary(customizationMetadata: string): string {
  try {
    const metadata = JSON.parse(customizationMetadata);
    const texts = metadata.texts || [];
    const images = metadata.images || [];
    
    let summary = `Custom ${metadata.baseProductType} (${metadata.baseProductSize}, ${metadata.baseProductColor})\n`;
    summary += `Canvas: ${metadata.canvasWidth}x${metadata.canvasHeight}px\n`;
    
    if (texts.length > 0) {
      summary += `\nText Elements (${texts.length}):\n`;
      texts.forEach((text: CustomizationText, index: number) => {
        summary += `${index + 1}. "${text.text}" - ${text.fontFamily}, ${text.fontSize}px, ${text.color}\n`;
        summary += `   Position: (${text.position.x}, ${text.position.y}), Rotation: ${text.rotation}°\n`;
      });
    }
    
    if (images.length > 0) {
      summary += `\nImage Elements (${images.length}):\n`;
      images.forEach((img: CustomizationImage, index: number) => {
        summary += `${index + 1}. Size: ${img.size.width}x${img.size.height}px\n`;
        summary += `   Position: (${img.position.x}, ${img.position.y}), Rotation: ${img.rotation}°, Opacity: ${Math.round(img.opacity * 100)}%\n`;
        summary += `   Raw Image: ${img.merchantUrl || img.uploadedUrl || 'Not available'}\n`;
      });
    }
    
    return summary;
  } catch (error) {
    console.error('Error generating customization summary:', error);
    return 'Error parsing customization data';
  }
}
