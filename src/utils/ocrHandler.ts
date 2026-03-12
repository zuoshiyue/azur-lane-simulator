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
        canvas.width = img.width * 4;  // Increased scaling factor for better text recognition
        canvas.height = img.height * 4;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Apply transformations to improve OCR
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to grayscale first for better text recognition
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;     // Red
          data[i + 1] = gray; // Green
          data[i + 2] = gray; // Blue
        }

        // Apply threshold to make text more defined
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const newValue = avg > 128 ? 255 : 0;
          data[i] = newValue;     // Red
          data[i + 1] = newValue; // Green
          data[i + 2] = newValue; // Blue
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
    // Set specific parameters to improve text recognition accuracy
    await worker.setParameters({
      // Page segmentation mode - single block of text (SINGLE_BLOCK = '6')
      tessedit_pageseg_mode: '6' as any,
      // OCR engine mode - LSTM only (better for printed text)
      tessedit_ocr_engine_mode: '1' as any,
      // Text orientation
      user_defined_dpi: '300' as any,
    });

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