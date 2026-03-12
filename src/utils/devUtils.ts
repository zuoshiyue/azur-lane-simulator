/**
 * Development utility to access the existing screenshot file
 * This allows developers to test the OCR functionality with the provided screenshot
 */

// Define the path to the existing screenshot
export const EXISTING_SCREENSHOT_PATH = '/position_screenshot.jpg';
export const SCREENSHOT_PNG_PATH = '/ScreenShot.png';
export const POSSESSION_JPG_PATH = '/持仓截图.jpg';

/**
 * Get the existing screenshot file from public folder
 * @returns Promise with the screenshot URL
 */
export async function getExistingPositionScreenshot(): Promise<string> {
  // Return the path to the screenshot in the public folder
  return EXISTING_SCREENSHOT_PATH;
}

/**
 * Get the specific screenshot for testing "确捷" recognition
 */
export async function getTestScreenshotPath(): Promise<string> {
  // Return path to ScreenShot.png in public folder
  return SCREENSHOT_PNG_PATH;
}

/**
 * Get the possession screenshot for bulk character recognition
 */
export async function getPossessionScreenshotPath(): Promise<string> {
  // Return path to 持仓截图.jpg in public folder
  return POSSESSION_JPG_PATH;
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