/**
 * Image utility functions for the Azur Lane Simulator
 * Provides functions to load and process images for OCR
 */

/**
 * Loads an image from a given path and returns it as a data URL
 * @param imagePath The path to the image file (can be local or remote)
 * @returns A promise that resolves to the image as a data URL
 */
export async function loadImageAsDataUrl(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Enable CORS for cross-origin requests
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL());
    };

    img.onerror = (error) => {
      console.error(`Failed to load image from: ${imagePath}`, error);
      reject(new Error(`Failed to load image: ${imagePath}`));
    };

    // Set the source after setting event handlers
    img.src = imagePath;
  });
}