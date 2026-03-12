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
        canvas.width = img.width * 3;  // Increased scaling factor for better text recognition
        canvas.height = img.height * 3;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Apply transformations to improve OCR
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Increase contrast and brightness for text
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Adjust contrast and brightness
        const brightness = 30; // Range: -100 to 100
        const contrast = 30;   // Range: -100 to 100

        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          // Red
          data[i] = clamp(factor * (data[i] - 128) + 128 + brightness);
          // Green
          data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128 + brightness);
          // Blue
          data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128 + brightness);
          // Alpha stays the same
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

// Helper function to clamp values between 0 and 255
function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 255);
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

  // Create worker with English and Chinese language support
  const worker = await createWorker(['eng', 'chi_sim']);

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

  // This is a simplified version - in a real implementation, you'd have
  // more sophisticated pattern matching based on how characters appear in screenshots
  for (const line of lines) {
    // Look for patterns that might indicate character names
    // This would be adapted based on how characters are displayed in position screenshots
    const words = line.split(/[\s,，、]+/); // Split by whitespace and Chinese commas
    for (const word of words) {
      // Clean up the word - remove punctuation that might appear around names
      const cleanWord = word.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim();

      if (cleanWord.length >= 2 && cleanWord.length <= 8) { // Reasonable name length
        potentialNames.push(cleanWord);
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
    // Find character by name (Japanese) or Chinese name
    const matchedChar = characters.find(
      char =>
        char.name.includes(potentialName) ||
        char.nameCn.includes(potentialName) ||
        (char.aliases && char.aliases.some((alias: string) => alias.includes(potentialName))) ||
        // Also try fuzzy matching
        char.name.toLowerCase().includes(potentialName.toLowerCase()) ||
        char.nameCn.includes(potentialName)
    );

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

  // Calculate confidence based on match rate
  const totalPotential = potentialNames.length;
  const matchRate = totalPotential > 0 ? matchedCharacters.length / totalPotential : 0;
  const confidence = Math.min(100, Math.floor(matchRate * 100));

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