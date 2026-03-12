import { Character } from '../types';
import { loadImageAsDataUrl } from './imageLoader';

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
  const amount = 0.5; // Amount of sharpening
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
  const worker = await createWorker('eng+chi_sim'); // Use string format for multiple languages

  try {
    // Perform OCR
    const ret = await worker.recognize(imageUrl);
    const text = ret.data.text;

    // Process recognized text to find character names
    const ocrResults = await processRecognizedText(text);

    return ocrResults;
  } finally {
    await worker.terminate(); // Free up resources
  }
}

/**
 * Process the raw OCR text to extract character names
 * @param text Raw text from OCR
 * @returns Promise with processed OCR results
 */
async function processRecognizedText(text: string): Promise<OcrResult> {
  // Clean up the text
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Identify potential character names in the text
  const potentialNames: string[] = [];

  // More sophisticated pattern matching for character names
  for (const line of lines) {
    // Look for patterns that might indicate character names
    // Split by common separators but preserve potential names
    const words = line.split(/[\s\n\r\t,，、；;：:]+/);

    for (const word of words) {
      // Enhanced cleaning - remove common non-name characters but keep alphabets and Chinese characters
      let cleanWord = word
        .replace(/[!@#$%^&*()_+\-=\[\]{}|\\:";<>?,.\/1234567890]/g, '') // Remove special chars and numbers
        .replace(/\s+/g, '') // Remove any remaining whitespace
        .trim();

      // Only consider strings that have some alphabetic or Chinese characters
      if (cleanWord.match(/[\u4e00-\u9fa5a-zA-Z]/) && cleanWord.length >= 2 && cleanWord.length <= 12) {
        // Additional validation: check if it looks like a name
        // Skip very common non-name words
        const skipWords = ['level', 'lv', 'rank', 'ship', 'shipgirl', 'navy', 'stage', 'battle', 'expedition'];
        if (!skipWords.some(skipWord => cleanWord.toLowerCase().includes(skipWord))) {
          potentialNames.push(cleanWord);
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
    // Find character by multiple matching strategies
    let matchedChar = characters.find(
      char =>
        // Exact match first
        char.name.toLowerCase() === potentialName.toLowerCase() ||
        char.nameCn === potentialName ||
        (char.aliases && char.aliases.some((alias: string) => alias.toLowerCase() === potentialName.toLowerCase()))
    );

    // If no exact match, try partial/fuzzy matching
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
      if (!unrecognized.includes(potentialName)) {
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
    // Preprocess image for better OCR results
    const processedImageUrl = await preprocessImage(imageUrl);

    // Detect characters using OCR
    const results = await detectCharactersFromImage(processedImageUrl);

    return results;
  } finally {
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
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
  // Load image as data URL to handle cross-origin issues
  const imageDataUrl = await loadImageAsDataUrl(imageUrl);

  // Preprocess image for better OCR results
  const processedImageUrl = await preprocessImage(imageDataUrl);

  // Detect characters using OCR
  const results = await detectCharactersFromImage(processedImageUrl);

  return results;
}