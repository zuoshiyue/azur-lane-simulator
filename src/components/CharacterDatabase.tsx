import React, { useState, useMemo } from 'react';
import dataManager from '../data/dataManager';
import { CharacterCard } from './CharacterCard';
import { Character, ShipType } from '../types';
import { Search, Filter, Grid, List } from 'lucide-react';

export const CharacterDatabase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ShipType | '全部'>('全部');
  const [selectedFaction, setSelectedFaction] = useState<string>('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const characters = dataManager.getCharacters();

  const factions = useMemo(() => {
    const f = new Set(characters.map(c => c.faction));
    return ['全部', ...Array.from(f)];
  }, [characters]);

  const types: (ShipType | '全部')[] = [
    '全部', '驱逐', '轻巡', '重巡', '超巡', 
    '战列', '战巡', '航母', '轻母', '潜艇', '维修', '运输'
  ];

  const filteredCharacters = useMemo(() => {
    return characters.filter(char => {
      const matchSearch = searchQuery === '' || 
        char.nameCn.includes(searchQuery) ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.type.includes(searchQuery) ||
        char.faction.includes(searchQuery);
      
      const matchType = selectedType === '全部' || char.type === selectedType;
      const matchFaction = selectedFaction === '全部' || char.faction === selectedFaction;
      
      return matchSearch && matchType && matchFaction;
    });
  }, [characters, searchQuery, selectedType, selectedFaction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-azur-dark to-azur p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">角色数据库</h1>
          <p className="text-gray-300">查询碧蓝航线所有角色属性、技能和装备</p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="bg-azur-dark/50 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索角色名、类型、阵营..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-azur-dark border border-azur rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
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

            {/* 视图切换 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-azur-dark text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-azur-dark text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 结果统计 */}
          <div className="mt-3 text-sm text-gray-400">
            找到 {filteredCharacters.length} 个角色
          </div>
        </div>

        {/* 角色列表 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCharacters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                onClick={setSelectedCharacter}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCharacters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                onClick={setSelectedCharacter}
                compact
              />
            ))}
          </div>
        )}

        {/* 角色详情弹窗 */}
        {selectedCharacter && (
          <CharacterDetailModal
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        )}
      </div>
    </div>
  );
};

// 角色详情弹窗组件
const CharacterDetailModal: React.FC<{
  character: Character;
  onClose: () => void;
}> = ({ character, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-azur-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-azur p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {character.nameCn}
              </h2>
              <p className="text-gray-400 text-xs">{character.type} · {character.faction}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoCard label="稀有度" value={'★'.repeat(character.rarity)} />
            <InfoCard label="类型" value={character.type} />
            <InfoCard label="阵营" value={character.faction} />
            <InfoCard label="装甲" value={character.stats.armor} />
          </div>

          {/* 属性 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">基础属性</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatBar label="耐久" value={character.stats.hp} max={2000} color="bg-red-500" />
              <StatBar label="火力" value={character.stats.fire} max={150} color="bg-orange-500" />
              <StatBar label="鱼雷" value={character.stats.torpedo} max={150} color="bg-blue-500" />
              <StatBar label="航空" value={character.stats.aviation} max={150} color="bg-green-500" />
              <StatBar label="装填" value={character.stats.reload} max={100} color="bg-purple-500" />
              <StatBar label="防空" value={character.stats.antiAir} max={150} color="bg-yellow-500" />
            </div>
          </div>

          {/* 技能 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">技能</h3>
            <div className="space-y-3">
              {character.skills.map((skill, i) => (
                <div key={i} className="bg-azur/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white">{skill.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      skill.type === 'active' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {skill.type === 'active' ? '主动' : '被动'}
                    </span>
                    {skill.cooldown && (
                      <span className="text-xs text-gray-400">
                        冷却：{skill.cooldown}s
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 装备 */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">装备槽</h3>
            <div className="space-y-2">
              {character.equipment.map((eq, i) => (
                <div key={i} className="flex items-center gap-3 bg-azur/30 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-azur flex items-center justify-center text-white font-bold">
                    {eq.slot}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{eq.type}</div>
                    <div className="text-xs text-gray-400">
                      效率：{eq.efficiency}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-azur/30 rounded-lg p-3 text-center">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-white font-bold">{value}</div>
  </div>
);

const StatBar: React.FC<{ 
  label: string; 
  value: number; 
  max: number; 
  color: string;
}> = ({ label, value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-azur-dark rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
