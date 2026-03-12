/**
 * Development utility to access the existing screenshot file
 * This allows developers to test the OCR functionality with the provided screenshot
 */

// Define the path to the existing screenshot
export const EXISTING_SCREENSHOT_PATH = '/position_screenshot.jpg';
export const SCREENSHOT_PNG_PATH = '/ScreenShot.png';
export const POSSESSION_JPG_PATH = '/舰舱截图.jpg';

// 新增：测试图片路径
export const TEST_IMAGE_DIR = '/test_images/';
export const TEST_IMAGES = [
  '微信图片_20260312190703_375_108.jpg',
  '微信图片_20260312190705_376_108.jpg',
  '微信图片_20260312190707_377_108.jpg',
  '微信图片_20260312190708_378_108.jpg',
  '微信图片_20260312190710_379_108.jpg',
  '微信图片_20260312190712_380_108.jpg',
  '微信图片_20260312190714_381_108.jpg',
  '微信图片_20260312190716_382_108.jpg',
  '微信图片_20260312190717_383_108.jpg',
  '微信图片_20260312190719_384_108.jpg'
];

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
  // Return path to 舰舱截图.jpg in public folder
  return POSSESSION_JPG_PATH;
}

/**
 * Get test images from the 1111 folder
 */
export async function getTestImagePaths(): Promise<string[]> {
  return TEST_IMAGES.map(image => `${TEST_IMAGE_DIR}${image}`);
}

/**
 * Get a specific test image by index
 */
export async function getSpecificTestImagePath(index: number): Promise<string> {
  if (index < 0 || index >= TEST_IMAGES.length) {
    throw new Error(`Invalid test image index: ${index}. Valid range is 0-${TEST_IMAGES.length - 1}`);
  }
  return `${TEST_IMAGE_DIR}${TEST_IMAGES[index]}`;
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