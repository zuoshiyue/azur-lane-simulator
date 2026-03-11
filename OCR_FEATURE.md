# OCR Position Screenshot Import Feature

This feature allows users to import their Azur Lane character collection by uploading a screenshot of their position/hangar screen.

## How It Works

1. Click the "识别截图" (Identify Screenshot) button in the Fleet Simulator
2. Upload your position/hangar screenshot containing character images/names
3. The system will use OCR (Optical Character Recognition) to identify character names in the image
4. Detected characters will be matched against the game's character database
5. Successfully identified characters can be imported to your collection

## Technical Implementation

The OCR functionality uses:

- **Tesseract.js**: Client-side OCR library for text recognition
- **Preprocessing**: Image enhancement to improve OCR accuracy
- **Character Matching**: Compares detected text against character database
- **Confidence Scoring**: Rates the accuracy of character identification

## Supported Formats

- JPG, PNG, and other common image formats
- Both Japanese and Chinese character names are supported
- Best results with clear, high-resolution screenshots

## Accuracy Tips

- Ensure text in the screenshot is clear and readable
- Use well-lit screenshots with good contrast
- Include full character names when possible
- Avoid blurry or low-resolution images

## Privacy Notice

All OCR processing happens locally in your browser - no images are uploaded to any server.