import React, { useState, useMemo, useEffect } from 'react';
import { Character } from '../types';
import { CharacterCard } from './CharacterCard';
import { Search, X, Plus, Check, Filter, Sparkles, Database } from 'lucide-react';
import { ShipType } from '../types';
import { characterDatabase } from '../data/characterDatabase';

interface CharacterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCharacter: (character: Character) => void;
  existingCharacterIds: string[];
}

export const CharacterSearchModal: React.FC<CharacterSearchModalProps> = ({
  isOpen,
  onClose,
  onAddCharacter,
  existingCharacterIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ShipType | '全部'>('全部');
  const [selectedFaction, setSelectedFaction] = useState<string>('全部');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 获取所有阵营和舰种
  const factions = useMemo(() => {
    return ['全部', ...characterDatabase.getAllFactions()];
  }, []);

  const types: (ShipType | '全部')[] = [
    '全部',
    ...characterDatabase.getAllTypes() as ShipType[],
  ];

  // 搜索和筛选
  const filteredCharacters = useMemo(() => {
    return characterDatabase.search({
      query: debouncedQuery,
      faction: selectedFaction === '全部' ? undefined : selectedFaction,
      type: selectedType === '全部' ? undefined : selectedType,
    });
  }, [debouncedQuery, selectedType, selectedFaction]);

  // 检查角色是否已存在
  const isCharacterExists = (id: string) => {
    return existingCharacterIds.includes(id);
  };

  // 添加角色
  const handleAddCharacter = (character: Character) => {
    if (!isCharacterExists(character.id)) {
      onAddCharacter(character);
    }
  };

  // 获取搜索建议
  const suggestions = useMemo(() => {
    if (!debouncedQuery) return [];
    return characterDatabase.getSuggestions(debouncedQuery, 5);
  }, [debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-azur-dark rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database className="w-6 h-6" />
              角色数据库
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              本地数据库包含 {characterDatabase.getStatistics().total} 个角色
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="p-4 bg-azur-dark/50 border-b border-azur">
          <div className="flex flex-wrap gap-3">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索角色名（中文或英文）..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-azur-dark border border-azur rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                autoFocus
              />
              
              {/* 搜索建议 */}
              {suggestions.length > 0 && debouncedQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-azur-dark border border-azur rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {suggestions.map((name, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSearchQuery(name)}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-azur hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 类型筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ShipType | '全部')}
                className="bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 阵营筛选 */}
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              className="bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
            >
              {factions.map(faction => (
                <option key={faction} value={faction}>{faction}</option>
              ))}
            </select>
          </div>

          {/* 结果统计 */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">
              找到 <span className="text-white font-bold">{filteredCharacters.length}</span> 个角色
            </span>
            <span className="text-gray-400">
              已拥有 <span className="text-green-400 font-bold">{existingCharacterIds.length}</span> 个角色
            </span>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredCharacters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Search className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">没有找到匹配的角色</p>
              <p className="text-sm mt-2">尝试其他搜索词或清除筛选条件</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('全部');
                  setSelectedFaction('全部');
                }}
                className="mt-4 text-blue-400 hover:text-blue-300"
              >
                清除筛选
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCharacters.map(char => {
                const exists = isCharacterExists(char.id);
                return (
                  <div key={char.id} className="relative group">
                    <CharacterCard character={char} compact />
                    <button
                      onClick={() => handleAddCharacter(char)}
                      disabled={exists}
                      className={`
                        absolute top-2 right-2 p-2 rounded-full transition-all shadow-lg
                        ${exists
                          ? 'bg-green-600/90 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-110'
                        }
                      `}
                      title={exists ? '已拥有' : '添加到角色池'}
                    >
                      {exists ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </button>
                    {exists && (
                      <div className="absolute top-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded shadow">
                        已拥有
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-4 bg-azur-dark/50 border-t border-azur flex justify-between items-center">
          <div className="text-xs text-gray-400">
            💡 提示：点击角色卡片右上角的 + 按钮快速添加
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
