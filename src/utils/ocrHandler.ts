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
        canvas.width = img.width * 8;  // Higher scaling for small text
        canvas.height = img.height * 8;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image at high resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Specialized preprocessing for text regions
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Enhance contrast specifically for text
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast for better text visibility
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Convert to grayscale first
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Apply contrast adjustment
          const factor = 1.5; // Adjust contrast
          const adjusted = ((gray - 128) * factor) + 128;
          const finalValue = Math.min(255, Math.max(0, adjusted));

          // Apply to RGB channels
          data[i] = finalValue;     // R
          data[i + 1] = finalValue; // G
          data[i + 2] = finalValue; // B
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
 * Detect character names by analyzing character grid regions
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

        for (const regionUrl of nameRegions) {
          try {
            // Preprocess the region specifically for character names
            const processedRegion = await preprocessCharacterNameRegion(regionUrl);

            // OCR the region with focus on Chinese characters
            const tesseract = await import('tesseract.js');
            const { createWorker } = tesseract;

            const worker = await createWorker('chi_sim+eng');

            // Configure parameters to improve Chinese character recognition
            await worker.setParameters({
              tessedit_pageseg_mode: '6' as any, // Assume a single uniform block of text
              tessedit_ocr_engine_mode: '1' as any, // LSTM only
              // Additional parameters to improve Chinese character recognition
              'tessedit_char_whitelist': '\u4e00-\u9fff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u2f800-\u2fa1fABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
              'preserve_interword_spaces': '1',
            });

            const result = await worker.recognize(processedRegion);
            const regionText = result.data.text.trim();

            // Split potential names and clean them
            if (regionText) {
              const potentialNames = regionText
                .split(/[\s\n\r\t,，、；;：:，。！？【】「」『』（）]/)
                .map(name => name.trim())
                .filter(name => name.length >= 1 && name.length <= 12); // Allow single Chinese characters

              allPotentialNames = allPotentialNames.concat(potentialNames);
            }

            await worker.terminate();
          } catch (regionError) {
            console.warn('Error processing region:', regionError);
            continue; // Continue with other regions
          }
        }

        // Process all extracted names
        const ocrResults = await processRecognizedText(allPotentialNames.join('\n'));
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
 * @returns Promise with processed OCR results
 */
async function processRecognizedText(text: string): Promise<OcrResult> {
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
        .replace(/[!@#$%^&*+_=\-|\\<>?\/0-9]/g, '') // Remove special chars but keep Chinese/English
        .replace(/\s+/g, '') // Remove any remaining whitespace
        .trim();

      // Only consider strings that have some alphabetic or Chinese characters
      if (cleanSegment.match(/[\u4e00-\u9fa5a-zA-Z]/) && cleanSegment.length >= 1 && cleanSegment.length <= 12) {
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
    // Use grid-based detection for better results
    const results = await detectCharacterNamesFromGrid(imageUrl);

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
  // Use grid-based detection for better results
  const results = await detectCharacterNamesFromGrid(imageUrl);

  return results;
}