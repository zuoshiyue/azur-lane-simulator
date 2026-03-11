/**
 * Development utility to access the existing screenshot file
 * This allows developers to test the OCR functionality with the provided screenshot
 */

// Define the path to the existing screenshot
export const EXISTING_SCREENSHOT_PATH = '/position_screenshot.jpg';

/**
 * Get the existing screenshot file from public folder
 * @returns Promise with the screenshot URL
 */
export async function getExistingPositionScreenshot(): Promise<string> {
  // Return the path to the screenshot in the public folder
  return EXISTING_SCREENSHOT_PATH;
}

/**
 * Load the screenshot for OCR processing in development
 * This is a workaround for accessing files directly during development
 */
export async function loadDevelopmentScreenshot(): Promise<string> {
  // Return the path to the screenshot in the public folder
  return EXISTING_SCREENSHOT_PATH;
}

/**
 * Check if we're in development mode and can access the screenshot
 */
export function isDevelopmentMode(): boolean {
  // This will work in both browser and Node environments
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
}