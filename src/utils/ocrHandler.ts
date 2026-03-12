import { Character } from '../types';
// import { loadImageAsDataUrl } from './imageLoader';

/**
 * OCR Handler for Azur Lane Simulator
 * Handles character recognition from position screenshots using various OCR libraries
 */

// Define character recognition result structure
export interface OcrResult {
  characters: string[]; // Raw character names identified
  matchedCharacters: Character[]; // Characters matched to the game database
  unrecognized: string[]; // Character names that couldn't be matched
  confidence: number; // Overall confidence score (0-100)
}

// Define UI element coordinates for Azur Lane screenshots
interface UiElements {
  characterGrid: { x: number; y: number; width: number; height: number };
  characterSpacing: { x: number; y: number };
  characterBoxSize: { width: number; height: number };
  nameRegionOffset: { x: number; y: number; width: number; height: number };
}

/**
 * Detect common Azur Lane UI layout and extract character grid positions
 * @param img HTMLImageElement to analyze
 * @returns Detected UI elements or default layout
 */
function detectUiLayout(img: HTMLImageElement): UiElements {
  // For now, we'll use estimated regions based on common Azur Lane UI
  // In a more advanced implementation, we'd use computer vision to detect these
  const width = img.width;
  const height = img.height;

  // Estimate common Azur Lane character grid positions
  // This is a simplified estimation - real implementation would use image detection
  const characterGrid = {
    x: width * 0.05, // Start 5% from left
    y: height * 0.2, // Start 20% from top (below headers)
    width: width * 0.9, // 90% of screen width
    height: height * 0.7 // 70% of screen height for grid
  };

  // Assuming a 3x2 or 3x3 grid layout typical in Azur Lane
  const characterBoxSize = {
    width: characterGrid.width / 3,
    height: characterGrid.height / 3
  };

  const nameRegionOffset = {
    x: characterBoxSize.width * 0.1, // Name text usually at top-left of character box
    y: characterBoxSize.height * 0.7, // Name often appears at bottom of character box
    width: characterBoxSize.width * 0.8,
    height: characterBoxSize.height * 0.25
  };

  return {
    characterGrid,
    characterSpacing: { x: characterBoxSize.width, y: characterBoxSize.height },
    characterBoxSize,
    nameRegionOffset
  };
}

/**
 * Extract character name regions from image based on detected UI layout
 * @param img Image to extract from
 * @param uiElements Detected UI layout
 * @returns Array of image data URLs for each character name region
 */
function extractCharacterNameRegions(img: HTMLImageElement, uiElements: UiElements): string[] {
  const { characterGrid, characterBoxSize, nameRegionOffset } = uiElements;
  const regions: string[] = [];

  // Estimate grid size - typically 3 columns
  const cols = 3;
  const rows = Math.min(6, Math.floor((img.height - characterGrid.y) / characterBoxSize.height)); // Max 6 rows

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return regions;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Extract each character name region
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = characterGrid.x + col * characterBoxSize.width + nameRegionOffset.x;
      const y = characterGrid.y + row * characterBoxSize.height + nameRegionOffset.y;

      // Ensure the region is within image bounds
      if (x + nameRegionOffset.width <= img.width && y + nameRegionOffset.height <= img.height) {
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        if (croppedCtx) {
          croppedCanvas.width = nameRegionOffset.width;
          croppedCanvas.height = nameRegionOffset.height;

          // Draw the name region
          croppedCtx.drawImage(
            canvas,
            x, y, nameRegionOffset.width, nameRegionOffset.height,
            0, 0, nameRegionOffset.width, nameRegionOffset.height
          );

          regions.push(croppedCanvas.toDataURL());
        }
      }
    }
  }

  return regions;
}

/**
 * Preprocess image to improve OCR accuracy
 * @param imageUrl URL of the image to preprocess
 * @returns Promise with processed image data URL
 */
export async function preprocessImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size (upscale for better OCR)
        canvas.width = img.width * 6;  // Further increased scaling factor for better text recognition
        canvas.height = img.height * 6;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Apply transformations to improve OCR
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Enhance contrast and sharpen image for better text recognition
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply unsharp mask to enhance edges/text
        const enhancedData = applyUnsharpMask(data, canvas.width, canvas.height);

        // Convert to grayscale
        for (let i = 0; i < enhancedData.length; i += 4) {
          const gray = 0.299 * enhancedData[i] + 0.587 * enhancedData[i + 1] + 0.114 * enhancedData[i + 2];
          enhancedData[i] = gray;     // Red
          enhancedData[i + 1] = gray; // Green
          enhancedData[i + 2] = gray; // Blue
        }

        // Apply adaptive threshold to make text more defined
        const thresholdedImageData = applyAdaptiveThreshold(enhancedData, canvas.width, canvas.height);

        ctx.putImageData(thresholdedImageData, 0, 0);
        resolve(canvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

// Helper function to preprocess a cropped region specifically for character name OCR
export async function preprocessCharacterNameRegion(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // For character names, even higher scaling
        canvas.width = img.width * 12;  // Increased scaling specifically for character names
        canvas.height = img.height * 12;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image at high resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply multiple preprocessing passes for character names
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // First pass: enhance contrast specifically for text
        let processedData = enhanceContrastForCharacterNames(imageData.data, canvas.width, canvas.height);

        // Second pass: denoise
        processedData = applyDenoising(processedData, canvas.width, canvas.height);

        // Third pass: sharpen edges for character name clarity
        processedData = applySharpeningForCharacterNames(processedData, canvas.width, canvas.height);

        // Fourth pass: apply unsharp mask to enhance character name features
        processedData = applyUnsharpMaskForCharacterNames(processedData, canvas.width, canvas.height);

        // Convert to grayscale
        for (let i = 0; i < processedData.length; i += 4) {
          const gray = 0.299 * processedData[i] + 0.587 * processedData[i + 1] + 0.114 * processedData[i + 2];
          processedData[i] = gray;     // R
          processedData[i + 1] = gray; // G
          processedData[i + 2] = gray; // B
        }

        ctx.putImageData(new ImageData(processedData, canvas.width, canvas.height), 0, 0);
        resolve(canvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

// Helper function to enhance contrast specifically for character names
function enhanceContrastForCharacterNames(data: Uint8ClampedArray, _width: number, _height: number): Uint8ClampedArray {
  // Process RGB channels to enhance contrast for character names
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Convert to grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply contrast enhancement specifically optimized for character names
    // Character names in games often have specific color schemes and contrasts
    let adjusted;
    if (gray < 100) {
      // Make dark text pixels more distinct
      adjusted = gray * 0.1;
    } else if (gray < 150) {
      // Medium range - preserve details
      adjusted = 50 + (gray - 100) * 0.8;
    } else {
      // Bright areas - reduce slightly to improve contrast
      adjusted = 180 + (gray - 150) * 0.6;
    }

    const finalValue = Math.min(255, Math.max(0, adjusted));

    // Apply to all channels to maintain grayscale but enhance character name visibility
    result[i] = finalValue;     // R
    result[i + 1] = finalValue; // G
    result[i + 2] = finalValue; // B
    result[i + 3] = data[i + 3]; // A remains unchanged
  }

  return result;
}

// Helper function to apply sharpening specifically for character names
function applySharpeningForCharacterNames(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Sharpening kernel optimized for character name edges
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;
      let kSum = 0;

      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const pixelY = Math.max(0, Math.min(height - 1, y + ky - 1));
          const pixelX = Math.max(0, Math.min(width - 1, x + kx - 1));
          const pixelIdx = (pixelY * width + pixelX) * 4;
          const kVal = kernel[ky * 3 + kx];

          rSum += data[pixelIdx] * kVal;
          gSum += data[pixelIdx + 1] * kVal;
          bSum += data[pixelIdx + 2] * kVal;
          kSum += Math.abs(kVal); // Use absolute value for normalization
        }
      }

      // Normalize if kernel sum is greater than 0
      if (kSum > 0) {
        rSum /= kSum;
        gSum /= kSum;
        bSum /= kSum;
      }

      result[(y * width + x) * 4] = clampPixel(rSum);     // R
      result[(y * width + x) * 4 + 1] = clampPixel(gSum); // G
      result[(y * width + x) * 4 + 2] = clampPixel(bSum); // B
      result[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]; // A remains unchanged
    }
  }

  return result;
}

// Helper function to apply unsharp mask specifically for character names
function applyUnsharpMaskForCharacterNames(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Create a copy of the original data
  const original = new Uint8ClampedArray(data);

  // Create a blurred version using a slightly larger radius for character names
  const blurred = new Uint8ClampedArray(data.length);
  const radius = 2; // Slightly larger radius for character names

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;
      let count = 0;

      for (let ry = -radius; ry <= radius; ry++) {
        for (let rx = -radius; rx <= radius; rx++) {
          const px = x + rx;
          const py = y + ry;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            rSum += original[idx];
            gSum += original[idx + 1];
            bSum += original[idx + 2];
            count++;
          }
        }
      }

      const idx = (y * width + x) * 4;
      blurred[idx] = rSum / count;       // R
      blurred[idx + 1] = gSum / count;   // G
      blurred[idx + 2] = bSum / count;   // B
      blurred[idx + 3] = original[idx + 3]; // A remains unchanged
    }
  }

  // Apply unsharp mask formula: output = original + amount*(original-blurred)
  const amount = 0.9; // Increased sharpening specifically for character names
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    // Only process RGB channels, keep alpha channel unchanged
    result[i] = clampPixel(original[i] + amount * (original[i] - blurred[i]));     // R
    result[i + 1] = clampPixel(original[i + 1] + amount * (original[i + 1] - blurred[i + 1])); // G
    result[i + 2] = clampPixel(original[i + 2] + amount * (original[i + 2] - blurred[i + 2])); // B
    result[i + 3] = original[i + 3]; // A remains unchanged
  }

  return result;
}

// Helper function to apply denoising for cleaner character name recognition
function applyDenoising(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Simple denoising algorithm to smooth out noise while preserving character names
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Calculate average of neighboring pixels (3x3 kernel)
      let rSum = 0, gSum = 0, bSum = 0;
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const nIdx = (ny * width + nx) * 4;

          rSum += data[nIdx];
          gSum += data[nIdx + 1];
          bSum += data[nIdx + 2];
          count++;
        }
      }

      result[idx] = rSum / count;     // R
      result[idx + 1] = gSum / count; // G
      result[idx + 2] = bSum / count; // B
      result[idx + 3] = data[idx + 3]; // A remains unchanged
    }
  }

  return result;
}

// Helper function to apply unsharp mask for edge enhancement
function applyUnsharpMask(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Create a copy of the original data
  const original = new Uint8ClampedArray(data);

  // Create a blurred version using a simple box blur
  const blurred = new Uint8ClampedArray(data.length);
  const radius = 1; // Small radius for subtle sharpening

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;
      let count = 0;

      for (let ry = -radius; ry <= radius; ry++) {
        for (let rx = -radius; rx <= radius; rx++) {
          const px = x + rx;
          const py = y + ry;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            rSum += original[idx];
            gSum += original[idx + 1];
            bSum += original[idx + 2];
            count++;
          }
        }
      }

      const idx = (y * width + x) * 4;
      blurred[idx] = rSum / count;       // R
      blurred[idx + 1] = gSum / count;   // G
      blurred[idx + 2] = bSum / count;   // B
      blurred[idx + 3] = original[idx + 3]; // A remains unchanged
    }
  }

  // Apply unsharp mask formula: output = original + amount*(original-blurred)
  const amount = 0.7; // Increased sharpening for Chinese characters
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    // Only process RGB channels, keep alpha channel unchanged
    result[i] = clampPixel(original[i] + amount * (original[i] - blurred[i]));     // R
    result[i + 1] = clampPixel(original[i + 1] + amount * (original[i + 1] - blurred[i + 1])); // G
    result[i + 2] = clampPixel(original[i + 2] + amount * (original[i + 2] - blurred[i + 2])); // B
    result[i + 3] = original[i + 3]; // A remains unchanged
  }

  return result;
}

// Helper function to apply adaptive threshold
function applyAdaptiveThreshold(data: Uint8ClampedArray, width: number, height: number): ImageData {
  // Convert to grayscale first if needed
  const grayscale = new Uint8ClampedArray(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    grayscale[idx] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Calculate local thresholds using a neighborhood approach
  const binary = new Uint8ClampedArray(data.length);
  const blockSize = 20; // Size of the local neighborhood

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const dataIdx = idx * 4;

      // Calculate local average in the neighborhood
      let sum = 0;
      let count = 0;

      for (let ry = Math.max(0, y - blockSize/2); ry <= Math.min(height - 1, y + blockSize/2); ry++) {
        for (let rx = Math.max(0, x - blockSize/2); rx <= Math.min(width - 1, x + blockSize/2); rx++) {
          const nIdx = ry * width + rx;
          sum += grayscale[nIdx];
          count++;
        }
      }

      const localAvg = sum / count;
      // Apply threshold: if pixel is brighter than local average, make it white, otherwise black
      const value = grayscale[idx] > localAvg * 0.9 ? 255 : 0; // 0.9 factor to make it slightly more sensitive

      binary[dataIdx] = value;     // R
      binary[dataIdx + 1] = value; // G
      binary[dataIdx + 2] = value; // B
      binary[dataIdx + 3] = data[dataIdx + 3]; // A remains unchanged
    }
  }

  return new ImageData(binary, width, height);
}

// Helper function to clamp pixel values between 0 and 255
function clampPixel(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 255);
}

/**
 * Detect characters in the image using Tesseract.js
 * @param imageUrl URL of the image to process
 * @returns Promise with OCR results
 */
export async function detectCharactersFromImage(imageUrl: string): Promise<OcrResult> {
  // Dynamically import Tesseract (to avoid bundling it unless needed)
  const tesseract = await import('tesseract.js');
  const { createWorker } = tesseract;

  // Create worker with English and Chinese language support using correct API
  const worker = await createWorker('chi_sim'); // Focus on Chinese characters first

  try {
    // Perform OCR
    const ret = await worker.recognize(imageUrl);
    const text = ret.data.text;

    // If the result is poor, try combined approach
    let finalText = text;
    if (!text || text.trim().length < 2) {
      await worker.terminate();

      const fallbackWorker = await createWorker('chi_sim+eng');
      const fallbackRet = await fallbackWorker.recognize(imageUrl);
      finalText = fallbackRet.data.text;
      await fallbackWorker.terminate();
    } else {
      await worker.terminate();
    }

    // Process recognized text to find character names
    const ocrResults = await processRecognizedText(finalText);

    return ocrResults;
  } finally {
    // Ensure worker is terminated in case of error
    try {
      await worker.terminate();
    } catch (e) {
      // Ignore termination errors
    }
  }
}

/**
 * Detect character names by analyzing character grid regions with enhanced focus on character names
 * @param imageUrl URL of the full screenshot
 * @returns Promise with OCR results
 */
export async function detectCharacterNamesFromGrid(imageUrl: string): Promise<OcrResult> {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // Detect UI layout
        const uiElements = detectUiLayout(img);

        // Extract character name regions
        const nameRegions = extractCharacterNameRegions(img, uiElements);

        // Process each region separately
        let allPotentialNames: string[] = [];

        // Read character data for reference
        let characterNameReference = [];
        try {
          const charactersDataModule = await import('../data/characters-wiki.json');
          const charactersData: any[] = Array.isArray(charactersDataModule.default)
            ? charactersDataModule.default
            : (charactersDataModule.default as any).characters || [];

          // Collect all possible character names for reference
          for (const char of charactersData) {
            if (char.nameCn) characterNameReference.push(char.nameCn);
            if (char.name) characterNameReference.push(char.name);
            if (char.aliases && Array.isArray(char.aliases)) {
              characterNameReference.push(...char.aliases);
            }
          }
        } catch (e) {
          console.error('Could not load character reference data:', e);
          // Proceed with default character name detection
        }

        for (const regionUrl of nameRegions) {
          try {
            // Preprocess the region specifically for character names
            const processedRegion = await preprocessCharacterNameRegion(regionUrl);

            // Try multiple OCR strategies to maximize character name recognition
            const tesseract = await import('tesseract.js');
            const { createWorker } = tesseract;

            // Strategy 1: Focus specifically on Chinese character names
            let bestResult = '';

            // First, try with Chinese character model focusing on character names
            const worker1 = await createWorker('chi_sim');
            await worker1.setParameters({
              tessedit_pageseg_mode: '8' as any, // Treat as single word/line for names
              tessedit_ocr_engine_mode: '1' as any, // LSTM only
              // Focus on Chinese characters that are common in character names
              'tessedit_char_whitelist': '\u4e00-\u9fff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u2f800-\u2fa1fABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·・—-',
              'preserve_interword_spaces': '1',
              // Improve accuracy for small text
              'chop_enable': '1',
              'tessedit_char_blacklist': '`~!@#$%^&*()_+=[]{}|;:,.<>?/',
            });

            const result1 = await worker1.recognize(processedRegion);
            await worker1.terminate();

            if (result1.data.text && result1.data.text.trim().length > bestResult.length) {
              bestResult = result1.data.text.trim();
            }

            // If first attempt wasn't good enough, try with additional parameters
            if (bestResult.length < 2) {
              const worker2 = await createWorker('chi_sim+eng');
              await worker2.setParameters({
                tessedit_pageseg_mode: '6' as any, // Single block
                tessedit_ocr_engine_mode: '1' as any, // LSTM only
                'tessedit_char_whitelist': '\u4e00-\u9fff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u2f800-\u2fa1fABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·・—-',
                'preserve_interword_spaces': '1',
                // Focus on character name patterns
                'textord_heavy_nr': '1',
                'textord_heavy_nr_fragments': '1',
                'textord_balance_factors': '1',
              });

              const result2 = await worker2.recognize(processedRegion);
              await worker2.terminate();

              if (result2.data.text && result2.data.text.trim().length > bestResult.length) {
                bestResult = result2.data.text.trim();
              }
            }

            // If we have a reasonable result, split and clean it
            if (bestResult) {
              const potentialNames = bestResult
                .split(/[\s\n\r\t,，、；;：:，。！？【】「」『』（）]/)
                .map(name => name.trim())
                .filter(name => name.length >= 1 && name.length <= 15); // Allow character names up to 15 chars

              allPotentialNames = allPotentialNames.concat(potentialNames);
            }
          } catch (regionError) {
            console.warn('Error processing region:', regionError);
            continue; // Continue with other regions
          }
        }

        // Process all extracted names
        const ocrResults = await processRecognizedText(allPotentialNames.join('\n'), characterNameReference);
        resolve(ocrResults);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

/**
 * Process the raw OCR text to extract character names
 * @param text Raw text from OCR
 * @param characterNameReference Optional reference list of known character names for better matching
 * @returns Promise with processed OCR results
 */
async function processRecognizedText(text: string, characterNameReference: string[] = []): Promise<OcrResult> {
  // Clean up the text
  const lines = text.split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Identify potential character names in the text
  const potentialNames: string[] = [];

  // More sophisticated pattern matching for character names
  for (const line of lines) {
    // Look for patterns that might indicate character names
    // Split by common separators but preserve potential names
    // Updated to better handle Chinese punctuation and mixed text
    const segments = line.split(/[,，、；;：:：【】\[\]「」""''（）\(\)]+/);

    for (const segment of segments) {
      // Enhanced cleaning - remove common non-name characters but keep alphabets and Chinese characters
      let cleanSegment = segment
        .replace(/[!@#$%^&*+_=\-|\\<>?\/]/g, '') // Remove special chars but keep numbers and dots
        .replace(/\s+/g, '') // Remove any remaining whitespace
        .trim();

      // Only consider strings that have some alphabetic or Chinese characters
      if (cleanSegment.match(/[\u4e00-\u9fa5a-zA-Z]/) && cleanSegment.length >= 1 && cleanSegment.length <= 15) {
        // Additional validation: check if it looks like a name
        // Skip very common non-name words
        const skipWords = ['level', 'lv', 'rank', 'ship', 'shipgirl', 'navy', 'stage', 'battle', 'expedition', 'all', 'off', 'the', 'and', 'for', 'are', 'but', 'not', 'you', 'get', 'had', 'him', 'his', 'her', 'has', 'was', 'one', 'out', 'day', 'by', 'etc', 'art', 'gif', 'yes', 'no', 'ok', 'hp', 'atk', 'def', 'acc', 'eva', 'spd', 'luck', 'crit', 'pen', 'res', 'rarity', 'type', 'faction', 'pos', 'owned', 'have', 'main', 'sub', 'skill', 'equip', 'equipped', 'status', 'stats', 'info', 'detail', 'details', 'data', 'value', 'cost', 'oil', 'ammo', 'steel', 'bauxite', 'time', 'build', 'repair', 'modernize', 'retrofit', 'upgrade', 'enhance', 'improve', 'develop', 'research', 'mission', 'quest', 'event', 'activity', 'campaign', 'operation', 'combat', 'fight', 'war', 'peace', 'alliance', 'enemy', 'formation', 'position', 'location', 'area', 'zone', 'map', 'route', 'path', 'way', 'method', 'strategy', 'tactic', 'technique', 'ability', 'power', 'strength', 'force', 'energy', 'mana', 'stamina', 'health', 'life', 'death', 'alive', 'dead', 'live', 'survive', 'win', 'lose', 'victory', 'defeat', 'success', 'failure', 'progress', 'complete', 'finish', 'done', 'ready', 'start', 'begin', 'end', 'stop', 'continue', 'pause', 'resume', 'restart', 'reload', 'refresh', 'update', 'change', 'modify', 'adjust', 'control', 'manage', 'lead', 'follow', 'guide', 'direct', 'assist', 'help', 'support', 'protect', 'defend', 'attack', 'damage', 'hurt', 'injure', 'heal', 'cure', 'recover', 'restore', 'repair', 'fix', 'solve', 'find', 'search', 'explore', 'discover', 'learn', 'study', 'teach', 'train', 'practice', 'exercise', 'work', 'job', 'task', 'duty', 'responsibility', 'role', 'purpose', 'goal', 'objective', 'target', 'aim', 'intention', 'plan', 'idea', 'thought', 'mind', 'brain', 'intellect', 'wisdom', 'knowledge', 'truth', 'false', 'real', 'fake', 'true', 'false', 'good', 'bad', 'better', 'worse', 'best', 'worst', 'nice', 'mean', 'kind', 'cruel', 'fair', 'unfair', 'just', 'unjust', 'right', 'wrong', 'correct', 'incorrect', 'accurate', 'inaccurate', 'precise', 'imprecise', 'exact', 'inexact', 'close', 'near', 'far', 'distant', 'remote', 'nearby', 'adjacent', 'next', 'previous', 'first', 'last', 'middle', 'center', 'central', 'side', 'edge', 'border', 'boundary', 'limit', 'extent', 'range', 'scope', 'scale', 'size', 'dimension', 'magnitude', 'measure', 'quantity', 'amount', 'number', 'count', 'total', 'sum', 'difference', 'increase', 'decrease', 'multiply', 'divide', 'add', 'subtract', 'calculate', 'compute', 'figure', 'determine', 'decide', 'choose', 'select', 'pick', 'grab', 'take', 'grab', 'catch', 'seize', 'hold', 'grasp', 'grip', 'clutch', 'cling', 'stick', 'attach', 'connect', 'link', 'tie', 'bind', 'fasten', 'secure', 'lock', 'close', 'shut', 'open', 'unlock', 'release', 'free', 'liberate', 'escape', 'flee', 'run', 'walk', 'move', 'travel', 'go', 'come', 'arrive', 'depart', 'leave', 'stay', 'remain', 'continue', 'persist', 'last', 'endure', 'tolerate', 'bear', 'stand', 'support', 'carry', 'transport', 'deliver', 'send', 'receive', 'accept', 'give', 'offer', 'present', 'provide', 'supply', 'furnish', 'equip', 'arm', 'weapon', 'armor', 'shield', 'helmet', 'coat', 'suit', 'uniform', 'clothes', 'clothing', 'garment', 'apparel', 'dress', 'robe', 'gown', 'skirt', 'pants', 'shirt', 'blouse', 'jacket', 'coat', 'shoes', 'boots', 'sandals', 'slippers', 'socks', 'hat', 'cap', 'scarf', 'gloves', 'belt', 'tie', 'necktie', 'bow', 'bowtie', 'pin', 'brooch', 'jewelry', 'ring', 'necklace', 'earrings', 'bracelet', 'watch', 'clock', 'time', 'hour', 'minute', 'second', 'day', 'night', 'morning', 'afternoon', 'evening', 'dawn', 'dusk', 'sunrise', 'sunset', 'season', 'spring', 'summer', 'autumn', 'winter', 'weather', 'rain', 'snow', 'sun', 'cloud', 'wind', 'storm', 'lightning', 'thunder', 'earthquake', 'flood', 'fire', 'water', 'air', 'earth', 'fire', 'metal', 'wood', 'nature', 'animal', 'bird', 'fish', 'insect', 'plant', 'tree', 'flower', 'grass', 'leaf', 'root', 'seed', 'fruit', 'vegetable', 'food', 'drink', 'beverage', 'water', 'juice', 'milk', 'tea', 'coffee', 'wine', 'beer', 'alcohol', 'bread', 'rice', 'meat', 'vegetable', 'soup', 'salad', 'dessert', 'sweet', 'sour', 'bitter', 'spicy', 'hot', 'cold', 'warm', 'cool', 'temperature', 'heat', 'coldness', 'color', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'silver', 'gold', 'shape', 'round', 'square', 'triangle', 'circle', 'rectangle', 'oval', 'diamond', 'star', 'heart', 'spade', 'club'];

        if (!skipWords.some(skipWord => cleanSegment.toLowerCase().includes(skipWord) || skipWord.includes(cleanSegment.toLowerCase()))) {
          potentialNames.push(cleanSegment);
        }
      }
    }
  }

  // Attempt to match recognized text with character database
  const charactersDataModule = await import('../data/characters-wiki.json');
  const charactersData: any[] = Array.isArray(charactersDataModule.default)
    ? charactersDataModule.default
    : (charactersDataModule.default as any).characters || [];

  // Convert to proper Character objects
  const characters: Character[] = charactersData.map(char => ({
    id: char.id,
    name: char.name,
    nameCn: char.nameCn,
    rarity: char.rarity,
    type: char.type,
    faction: char.faction,
    stats: char.stats,
    skills: char.skills,
    equipment: char.equipment,
    image: char.image,
    aliases: char.aliases
  }));

  const matchedCharacters: Character[] = [];
  const unrecognized: string[] = [];

  for (const potentialName of potentialNames) {
    // Find character by multiple matching strategies, prioritizing the character name reference
    let matchedChar = characters.find(
      char =>
        // Exact match first
        char.name.toLowerCase() === potentialName.toLowerCase() ||
        char.nameCn === potentialName ||
        (char.aliases && char.aliases.some((alias: string) => alias.toLowerCase() === potentialName.toLowerCase()))
    );

    // If no exact match and we have a character name reference, try to match against it
    if (!matchedChar && characterNameReference.length > 0) {
      // Check if potential name is in our reference list
      const referenceMatch = characterNameReference.find(refName =>
        refName.toLowerCase() === potentialName.toLowerCase() ||
        refName.toLowerCase().includes(potentialName.toLowerCase()) ||
        potentialName.toLowerCase().includes(refName.toLowerCase())
      );

      if (referenceMatch) {
        // Find the character that corresponds to this reference match
        matchedChar = characters.find(char =>
          char.name === referenceMatch ||
          char.nameCn === referenceMatch ||
          (char.aliases && char.aliases.includes(referenceMatch))
        );
      }
    }

    // If no match yet, try partial/fuzzy matching with higher priority for character names
    if (!matchedChar) {
      matchedChar = characters.find(
        char =>
          // Partial matches with higher confidence requirements
          char.name.toLowerCase().includes(potentialName.toLowerCase()) ||
          char.name.toLowerCase().startsWith(potentialName.toLowerCase()) ||
          char.nameCn.includes(potentialName) ||
          char.nameCn.startsWith(potentialName) ||
          (char.aliases && char.aliases.some((alias: string) =>
            alias.toLowerCase().includes(potentialName.toLowerCase()) ||
            alias.toLowerCase().startsWith(potentialName.toLowerCase())
          ))
      );
    }

    // As a last resort, try reverse match (potentialName contains character name)
    if (!matchedChar) {
      matchedChar = characters.find(
        char =>
          potentialName.toLowerCase().includes(char.name.toLowerCase()) ||
          potentialName.includes(char.nameCn) ||
          (char.aliases && char.aliases.some((alias: string) =>
            potentialName.toLowerCase().includes(alias.toLowerCase())
          ))
      );
    }

    if (matchedChar) {
      // Avoid duplicates by checking if the character is already matched
      if (!matchedCharacters.some(c => c.id === matchedChar.id)) {
        matchedCharacters.push(matchedChar);
      }
    } else {
      if (!unrecognized.includes(potentialName) && potentialName.length > 0) {
        unrecognized.push(potentialName);
      }
    }
  }

  // Calculate confidence based on match rate and text quality
  const totalPotential = potentialNames.length;
  const matchRate = totalPotential > 0 ? matchedCharacters.length / totalPotential : 0;

  // Base confidence from match rate, adjusted based on number of matches
  let confidence = Math.min(100, Math.floor(matchRate * 100));

  // Boost confidence if we found some matches (suggesting good OCR quality)
  if (matchedCharacters.length > 0 && matchRate > 0) {
    const boostFactor = Math.min(1.5, 1 + (matchedCharacters.length * 0.1));
    confidence = Math.min(100, Math.floor(confidence * boostFactor));
  }

  return {
    characters: potentialNames,
    matchedCharacters,
    unrecognized,
    confidence
  };
}

/**
 * Main function to process a position screenshot
 * @param imageFile The screenshot file to process
 * @returns Promise with OCR results
 */
export async function processPositionScreenshot(imageFile: File): Promise<OcrResult> {
  // Convert file to data URL for processing
  const imageUrl = URL.createObjectURL(imageFile);

  try {
    // First, try the grid-based detection (for Azur Lane-style UIs)
    let results = await detectCharacterNamesFromGrid(imageUrl);

    // If grid-based detection didn't find good results (low confidence or no matches)
    // fall back to general OCR approach
    if (results.confidence < 30 || results.matchedCharacters.length === 0) {
      console.log("Grid-based detection had low confidence, trying general OCR...");

      // Fallback to general OCR processing that doesn't assume specific layout
      results = await detectCharactersFromImageGeneral(imageUrl);
    }

    return results;
  } finally {
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
  }
}

/**
 * General OCR function that works with any image without assuming specific layout
 * @param imageUrl URL of the image to process
 * @returns Promise with OCR results
 */
export async function detectCharactersFromImageGeneral(imageUrl: string): Promise<OcrResult> {
  // Dynamically import Tesseract (to avoid bundling it unless needed)
  const tesseract = await import('tesseract.js');
  const { createWorker } = tesseract;

  // Create worker with English and Chinese language support
  const worker = await createWorker('chi_sim+eng');

  try {
    // Set parameters optimized for general text detection in games
    await worker.setParameters({
      tessedit_pageseg_mode: '13' as any, // OSD and sparse text
      tessedit_ocr_engine_mode: '1' as any, // LSTM only
      'tessedit_char_whitelist': '\u4e00-\u9fff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u2f800-\u2fa1fABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·・—-',
      'preserve_interword_spaces': '1',
    });

    // Perform OCR on the full image
    const ret = await worker.recognize(imageUrl);
    const text = ret.data.text;

    // Process the recognized text
    const ocrResults = await processRecognizedText(text);

    return ocrResults;
  } finally {
    // Ensure worker is terminated
    await worker.terminate();
  }
}

/**
 * Alternative function using an online OCR service (like Google Vision or OCR.space)
 * This could be used if client-side OCR isn't accurate enough
 */
export async function processWithOnlineOcr(_imageFile: File): Promise<OcrResult> {
  // This would implement calling an external OCR service
  // For example: OCR.space, Google Cloud Vision, etc.
  console.warn('Online OCR processing not implemented yet');

  // Placeholder implementation - would connect to an actual service
  return {
    characters: [],
    matchedCharacters: [],
    unrecognized: [],
    confidence: 0
  };
}

/**
 * Process a position screenshot from a public URL (for demo/testing purposes)
 * This is mainly for loading the provided screenshot file in development
 */
export async function processPositionScreenshotFromUrl(imageUrl: string): Promise<OcrResult> {
  // First, try the grid-based detection (for Azur Lane-style UIs)
  let results = await detectCharacterNamesFromGrid(imageUrl);

  // If grid-based detection didn't find good results (low confidence or no matches)
  // fall back to general OCR approach
  if (results.confidence < 30 || results.matchedCharacters.length === 0) {
    console.log("Grid-based detection had low confidence, trying general OCR...");

    // Fallback to general OCR processing that doesn't assume specific layout
    results = await detectCharactersFromImageGeneral(imageUrl);
  }

  return results;
}