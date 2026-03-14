import React, { useState } from 'react';
import { Download, AlertTriangle, CheckCircle, X, FileText, Trash2 } from 'lucide-react';
import { processTextImport, getMatchStats, ParsedResult } from '../utils/textImportParser';
import dataManager from '../data/dataManager';
import { CharacterCard } from './CharacterCard';

interface TextImportPanelProps {
  onClose: () => void;
  onImportComplete: (characterIds: string[]) => void;
}

export const TextImportPanel: React.FC<TextImportPanelProps> = ({
  onClose,
  onImportComplete
}) => {
  const [inputText, setInputText] = useState('');
  const [parseResult, setParseResult] = useState<ParsedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    if (!inputText.trim()) {
      return;
    }

    setIsProcessing(true);
    const allCharacters = dataManager.getAllCharacters();
    const result = processTextImport(inputText, allCharacters);
    setParseResult(result);
    setIsProcessing(false);
  };

  const handleImportToCollection = () => {
    if (!parseResult) return;

    // 添加匹配的角色到用户收藏
    const addedCount = dataManager.batchAddOwned(
      parseResult.matchedCharacters.map(char => char.id)
    );

    // 通知父组件
    const importedCharacterIds = parseResult.matchedCharacters.map(char => char.id);
    onImportComplete(importedCharacterIds);

    console.log(`[文本导入] 成功导入 ${addedCount} 个角色`);
    if (parseResult.unmatchedNames.length > 0) {
      console.log(`[文本导入] 未匹配的名称 (${parseResult.unmatchedNames.length}):`,
        parseResult.unmatchedNames);
    }
  };

  const handleReset = () => {
    setInputText('');
    setParseResult(null);
  };

  const stats = parseResult ? getMatchStats(parseResult) : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-navy-dark to-navy-primary rounded-xl border border-navy-gold/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />
              文本导入持有角色
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-navy-light rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!parseResult && (
            <div className="space-y-4">
              <div className="bg-navy-light/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">使用说明</h3>
                <p className="text-gray-400 text-sm">
                  输入角色名称或昵称，支持以下分隔符：空格、换行、逗号 (,)、顿号 (、)
                </p>
                <div className="mt-3 p-3 bg-navy-dark/50 rounded-lg border border-navy-gold/20">
                  <p className="text-sm text-gray-400 font-mono">
                    示例：<br/>
                    企业 赤城 加贺<br/>
                    企业，赤城，加贺<br/>
                    企业、赤城、加贺
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  输入角色名称列表
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="在此输入角色名称，例如：&#10;企业 赤城 加贺 俾斯麦 企业"
                  className="w-full h-48 bg-navy-light border border-navy-gold/20 rounded-lg p-3 text-white font-sans text-sm focus:outline-none focus:border-navy-gold/40 resize-none"
                />
              </div>

              {inputText.trim() && (
                <div className="flex gap-3">
                  <button
                    onClick={handleParse}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-navy-gold hover:bg-opacity-80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        正在解析...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        解析文本
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-900/50 border border-blue-500/50 rounded-lg text-blue-300 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  正在解析文本中的角色名称...
                </div>
              )}
            </div>
          )}

          {parseResult && (
            <div className="space-y-6">
              {/* 统计信息 */}
              <div className="bg-navy-light/50 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      stats!.matchRate >= 80
                        ? 'bg-green-500/20 text-green-400'
                        : stats!.matchRate >= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stats!.matchRate >= 80 ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">解析完成</h3>
                      <p className="text-sm text-gray-400">
                        共 {stats!.totalNames} 个名称 |
                        匹配 {stats!.matchedCount} 个 |
                        未匹配 {stats!.unmatchedCount} 个 |
                        匹配率 {stats!.matchRate}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      重新输入
                    </button>
                    <button
                      onClick={handleImportToCollection}
                      disabled={parseResult.matchedCharacters.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        parseResult.matchedCharacters.length > 0
                          ? 'bg-gradient-to-r from-navy-gold to-ocean-light text-white hover:opacity-90'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      导入到角色库 ({parseResult.matchedCharacters.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* 匹配的角色 */}
              {parseResult.matchedCharacters.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    匹配到的角色 ({parseResult.matchedCharacters.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                    {parseResult.matchedCharacters.map((char, index) => (
                      <div key={`${char.id}-${index}`} className="bg-navy-light/30 rounded-lg p-2">
                        <CharacterCard character={char} compact />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 未匹配的名称 */}
              {parseResult.unmatchedNames.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    未匹配的名称 ({parseResult.unmatchedNames.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseResult.unmatchedNames.map((name, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-amber-300/80 text-sm">
                    这些名称未能匹配到角色数据库。请检查名称是否正确，或尝试使用角色的其他称呼。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
