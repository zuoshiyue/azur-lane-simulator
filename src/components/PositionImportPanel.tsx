import React, { useState, useRef } from 'react';
import { Upload, Download, AlertTriangle, CheckCircle, X, Image as ImageIcon, Target } from 'lucide-react';
import { processPositionScreenshot, OcrResult, processPositionScreenshotFromUrl } from '../utils/ocrHandler';
import dataManager from '../data/dataManager';
import { CharacterCard } from './CharacterCard';
import { getExistingPositionScreenshot, getTestScreenshotPath, getPossessionScreenshotPath } from '../utils/devUtils';

interface PositionImportPanelProps {
  onClose: () => void;
  onImportComplete: (characters: string[]) => void;
}

export const PositionImportPanel: React.FC<PositionImportPanelProps> = ({
  onClose,
  onImportComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择有效的图片文件 (jpg, png, etc.)');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    try {
      const result = await processPositionScreenshot(file);
      setOcrResult(result);
    } catch (error) {
      console.error('OCR processing failed:', error);
      setUploadError('处理图片时发生错误，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessExistingScreenshot = async () => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      const screenshotPath = await getExistingPositionScreenshot();
      const result = await processPositionScreenshotFromUrl(screenshotPath);
      setOcrResult(result);
    } catch (error) {
      console.error('Failed to process existing screenshot:', error);
      setUploadError('处理现有截图时发生错误，请确保文件存在');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessTestScreenshot = async () => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      const screenshotPath = await getTestScreenshotPath();
      const result = await processPositionScreenshotFromUrl(screenshotPath);
      setOcrResult(result);
    } catch (error) {
      console.error('Failed to process test screenshot (ScreenShot.png):', error);
      setUploadError('处理测试截图(ScreenShot.png)时发生错误，请确保文件存在');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPossessionScreenshot = async () => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      const screenshotPath = await getPossessionScreenshotPath();
      const result = await processPositionScreenshotFromUrl(screenshotPath);
      setOcrResult(result);
    } catch (error) {
      console.error('Failed to process possession screenshot (持仓截图.jpg):', error);
      setUploadError('处理持仓截图(持仓截图.jpg)时发生错误，请确保文件存在');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleImportToCollection = () => {
    if (!ocrResult) return;

    // Add matched characters to the user's collection
    ocrResult.matchedCharacters.forEach(char => {
      dataManager.addCharacter(char);
    });

    // Notify parent component about the import
    const importedCharacterIds = ocrResult.matchedCharacters.map(char => char.id);
    onImportComplete(importedCharacterIds);

    // Close the panel
    onClose();
  };

  const resetPanel = () => {
    setOcrResult(null);
    setUploadError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-navy-dark to-navy-primary rounded-xl border border-navy-gold/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6" />
              识别持仓截图
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-navy-light rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!ocrResult && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-navy-gold bg-navy-gold/10'
                  : 'border-navy-gold/30 bg-navy-light/30 hover:bg-navy-light/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-navy-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                上传持仓截图
              </h3>
              <p className="text-gray-400 mb-4">
                拖拽图片至此或点击上传您的持仓截图，系统将自动识别其中的角色
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG、PNG 等常见图片格式
              </p>

              {/* Button to process existing screenshot if available */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProcessExistingScreenshot();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  处理现有截图
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProcessTestScreenshot();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  title="测试专用截图，包含'确捷'等特定角色"
                >
                  <Target className="w-4 h-4" />
                  测试截图(ScreenShot.png)
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProcessPossessionScreenshot();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  title="持仓截图，用于批量识别角色"
                >
                  <Target className="w-4 h-4" />
                  持仓截图(持仓截图.jpg)
                </button>
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {uploadError}
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-900/50 border border-blue-500/50 rounded-lg text-blue-300 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  正在识别图片中的角色...
                </div>
              )}
            </div>
          )}

          {ocrResult && (
            <div className="space-y-6">
              <div className="bg-navy-light/50 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      ocrResult.confidence > 70
                        ? 'bg-green-500/20 text-green-400'
                        : ocrResult.confidence > 40
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ocrResult.confidence > 70 ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">识别完成</h3>
                      <p className="text-sm text-gray-400">
                        置信度: {ocrResult.confidence}% |
                        识别角色: {ocrResult.matchedCharacters.length} 个 |
                        未识别: {ocrResult.unrecognized.length} 个
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={resetPanel}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      重新上传
                    </button>
                    <button
                      onClick={handleImportToCollection}
                      disabled={ocrResult.matchedCharacters.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        ocrResult.matchedCharacters.length > 0
                          ? 'bg-gradient-to-r from-navy-gold to-ocean-light text-white hover:opacity-90'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      导入到角色库 ({ocrResult.matchedCharacters.length})
                    </button>
                  </div>
                </div>
              </div>

              {ocrResult.matchedCharacters.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    识别出的角色 ({ocrResult.matchedCharacters.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {ocrResult.matchedCharacters.map((char, index) => (
                      <div key={`${char.id}-${index}`} className="bg-navy-light/30 rounded-lg p-2">
                        <CharacterCard character={char} compact />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ocrResult.unrecognized.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    未识别的角色 ({ocrResult.unrecognized.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ocrResult.unrecognized.map((name, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-amber-300/80 text-sm">
                    这些文字被识别出来，但未能匹配到角色数据库。可能是截图质量问题或角色名称变体。
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};