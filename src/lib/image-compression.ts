import { IMAGE_CUSTOMIZATION_OPTIONS } from '@/types/customization.types';

/**
 * Compress an image file to reduce its size while maintaining quality
 */
export async function compressImage(
  file: File,
  maxWidth: number = IMAGE_CUSTOMIZATION_OPTIONS.maxDimensions.width,
  maxHeight: number = IMAGE_CUSTOMIZATION_OPTIONS.maxDimensions.height,
  quality: number = IMAGE_CUSTOMIZATION_OPTIONS.quality
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip compression for SVG files
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if an image needs compression based on file size
 */
export function needsCompression(file: File): boolean {
  return file.size > IMAGE_CUSTOMIZATION_OPTIONS.maxFileSize;
}

/**
 * Get the optimal quality setting based on file size
 */
export function getOptimalQuality(fileSize: number): number {
  if (fileSize > 2 * 1024 * 1024) return 0.6; // Very large files
  if (fileSize > 1 * 1024 * 1024) return 0.7; // Large files
  if (fileSize > 500 * 1024) return 0.8; // Medium files
  return 0.9; // Small files
}

/**
 * Validate image dimensions and suggest compression if needed
 */
export function validateImageDimensions(
  width: number,
  height: number
): { needsResize: boolean; suggestedWidth: number; suggestedHeight: number } {
  const maxWidth = IMAGE_CUSTOMIZATION_OPTIONS.maxDimensions.width;
  const maxHeight = IMAGE_CUSTOMIZATION_OPTIONS.maxDimensions.height;

  if (width <= maxWidth && height <= maxHeight) {
    return { needsResize: false, suggestedWidth: width, suggestedHeight: height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  const suggestedWidth = Math.round(width * ratio);
  const suggestedHeight = Math.round(height * ratio);

  return { needsResize: true, suggestedWidth, suggestedHeight };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
