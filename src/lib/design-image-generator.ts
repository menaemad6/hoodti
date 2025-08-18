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
    const canvas = await html2canvas(canvasElement, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    return canvas.toDataURL('image/png', options.quality || 0.9);
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
