import React, { useState, useMemo } from 'react';
import { Character } from '../types';
import { CharacterCard } from './CharacterCard';
import { Search, X, Plus, Check, Filter } from 'lucide-react';
import { ShipType } from '../types';

interface CharacterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCharacter: (character: Character) => void;
  existingCharacterIds: string[];
  allCharacters: Character[];
}

export const CharacterSearchModal: React.FC<CharacterSearchModalProps> = ({
  isOpen,
  onClose,
  onAddCharacter,
  existingCharacterIds,
  allCharacters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ShipType | '全部'>('全部');
  const [selectedFaction, setSelectedFaction] = useState<string>('全部');

  const types: (ShipType | '全部')[] = [
    '全部', '驱逐', '轻巡', '重巡', '超巡',
    '战列', '战巡', '航母', '轻母', '潜艇', '维修', '运输'
  ];

  const factions = useMemo(() => {
    const f = new Set(allCharacters.map(c => c.faction));
    return ['全部', ...Array.from(f)];
  }, [allCharacters]);

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter(char => {
      const matchSearch = searchQuery === '' ||
        char.nameCn.includes(searchQuery) ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.type.includes(searchQuery) ||
        char.faction.includes(searchQuery);

      const matchType = selectedType === '全部' || char.type === selectedType;
      const matchFaction = selectedFaction === '全部' || char.faction === selectedFaction;

      return matchSearch && matchType && matchFaction;
    });
  }, [allCharacters, searchQuery, selectedType, selectedFaction]);

  const isCharacterExists = (id: string) => {
    return existingCharacterIds.includes(id);
  };

  const handleAddCharacter = (character: Character) => {
    if (!isCharacterExists(character.id)) {
      onAddCharacter(character);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-azur-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-azur p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">添加角色</h2>
            <p className="text-gray-300 text-sm">搜索并添加角色到你的角色池</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-azur-dark/50 rounded-lg transition-colors"
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
                placeholder="搜索角色名、舰种、阵营..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-azur-dark border border-azur rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                autoFocus
              />
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
              <p>没有找到匹配的角色</p>
              <p className="text-sm mt-2">尝试其他搜索词或清除筛选条件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map(char => {
                const exists = isCharacterExists(char.id);
                return (
                  <div key={char.id} className="relative">
                    <CharacterCard character={char} compact />
                    <button
                      onClick={() => handleAddCharacter(char)}
                      disabled={exists}
                      className={`
                        absolute top-2 right-2 p-2 rounded-full transition-all
                        ${exists
                          ? 'bg-green-600/80 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        }
                      `}
                    >
                      {exists ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </button>
                    {exists && (
                      <div className="absolute top-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded">
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
        <div className="p-4 bg-azur-dark/50 border-t border-azur flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-azur hover:bg-azur-light text-white rounded-lg transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
