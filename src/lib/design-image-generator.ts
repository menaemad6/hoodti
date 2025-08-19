import html2canvas from 'html2canvas';

export interface DesignImageOptions {
  width: number;
  height: number;
  quality?: number;
  backgroundColor?: string;
}

/**
 * Generates a design image from a canvas element
 */
export async function generateDesignImage(
  canvasElement: HTMLElement,
  options: DesignImageOptions
): Promise<string> {
  try {
    // Get the actual dimensions of the canvas element
    const rect = canvasElement.getBoundingClientRect();
    const actualWidth = rect.width;
    const actualHeight = rect.height;
    
    // Calculate the scale factor to maintain aspect ratio
    const scaleX = options.width / actualWidth;
    const scaleY = options.height / actualHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const canvas = await html2canvas(canvasElement, {
      width: actualWidth,
      height: actualHeight,
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Ensure proper positioning
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      // Maintain text positioning
      letterRendering: true,
      // Better text rendering
      removeContainer: false,
      // Preserve element positioning
      foreignObjectRendering: false,
      // Better compatibility
      imageTimeout: 15000,
      // Allow more time for complex designs
    });

    // Create a new canvas with the desired dimensions
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    
    if (!finalCtx) {
      throw new Error('Failed to get canvas context');
    }
    
    finalCanvas.width = options.width;
    finalCanvas.height = options.height;
    
    // Fill background
    finalCtx.fillStyle = options.backgroundColor || '#ffffff';
    finalCtx.fillRect(0, 0, options.width, options.height);
    
    // Calculate centering offset
    const scaledWidth = actualWidth * scale;
    const scaledHeight = actualHeight * scale;
    const offsetX = (options.width - scaledWidth) / 2;
    const offsetY = (options.height - scaledHeight) / 2;
    
    // Draw the captured canvas centered
    finalCtx.drawImage(
      canvas,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );

    return finalCanvas.toDataURL('image/png', options.quality || 0.9);
  } catch (error) {
    console.error('Error generating design image:', error);
    throw new Error('Failed to generate design image');
  }
}

/**
 * Converts a data URL to a File object
 */
export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Generates a unique filename for design images
 */
export function generateDesignFilename(customizationId: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  return `design_${customizationId}_${ts}.png`;
}
