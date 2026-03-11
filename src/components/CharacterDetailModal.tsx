import React from 'react';
import { Character } from '../types';
import { X, Star, Sword, Shield, Zap, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

interface CharacterDetailModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  if (!isOpen) return null;

  const getRarityStars = (rarity: number) => {
    return Array(6).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rarity ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      '航母': 'bg-blue-500',
      '战列': 'bg-red-500',
      '轻巡': 'bg-green-500',
      '重巡': 'bg-orange-500',
      '驱逐': 'bg-purple-500',
      '潜艇': 'bg-indigo-500',
      '轻母': 'bg-blue-400',
      '战巡': 'bg-red-400',
      '超巡': 'bg-yellow-500',
      '维修': 'bg-gray-500',
      '运输': 'bg-amber-500',
      '巡洋': 'bg-teal-500',
      '航战': 'bg-cyan-500',
      '重炮': 'bg-rose-500',
      '风帆': 'bg-emerald-500',
      'META': 'bg-purple-600',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-navy-primary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-navy-gold/20 shadow-2xl shadow-navy-gold/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-6 bg-gradient-to-r from-navy-accent to-navy-primary border-b border-navy-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 角色头像 */}
            <div className={`w-20 h-20 rounded-full ${getTypeColor(character.type)} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
              {character.image ? (
                <img
                  src={character.image}
                  alt={character.nameCn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${character.image ? 'hidden' : ''}`}>
                <span className="text-white text-2xl font-bold">{character.nameCn.charAt(0)}</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{character.nameCn}</h2>
              <p className="text-gray-300">{character.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(character.type)} text-white`}>
                  {character.type}
                </span>
                <span className="px-2 py-1 rounded bg-metal-gray text-xs text-gray-300">
                  {character.faction}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 上一个/下一个按钮 */}
            {onPrevious && (
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className={`p-2 rounded-lg ${hasPrevious ? 'bg-navy-light text-white hover:bg-navy-primary' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                aria-label="上一个角色"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-navy-light text-white hover:bg-gray-700 transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>

            {onNext && (
              <button
                onClick={onNext}
                disabled={!hasNext}
                className={`p-2 rounded-lg ${hasNext ? 'bg-navy-light text-white hover:bg-navy-primary' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                aria-label="下一个角色"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基础信息 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  基础信息
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <span className="text-gray-300">稀有度</span>
                    <div className="flex items-center gap-1">
                      {getRarityStars(character.rarity)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <span className="text-gray-300">编号</span>
                    <span className="text-white">{character.id}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <span className="text-gray-300">类型</span>
                    <span className="text-white">{character.type}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <span className="text-gray-300">阵营</span>
                    <span className="text-white">{character.faction}</span>
                  </div>
                </div>
              </div>

              {/* 属性 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Sword className="w-5 h-5 text-red-400" />
                  属性
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">耐久</span>
                    </div>
                    <span className="text-white font-medium">{character.stats.hp}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">火力</span>
                    </div>
                    <span className="text-white font-medium">{character.stats.fire}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">装甲</span>
                    </div>
                    <span className="text-white font-medium">{character.stats.armor}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">装填</span>
                    </div>
                    <span className="text-white font-medium">{character.stats.reload}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">航空</span>
                    </div>
                    <span className="text-white font-medium">{character.stats.aviation}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-navy-light/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">雷击</span>
                    </div>
                    <span className="text-white font-medium">{character.stats.torpedo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 技能和装备 */}
            <div className="space-y-6">
              {/* 技能 */}
              {character.skills && character.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    技能
                  </h3>
                  <div className="space-y-3">
                    {character.skills.map((skill, index) => (
                      <div key={index} className="p-4 bg-navy-light/30 rounded-lg">
                        <h4 className="font-bold text-white mb-2">{skill.name}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 装备 */}
              {character.equipment && character.equipment.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Sword className="w-5 h-5 text-blue-400" />
                    装备
                  </h3>
                  <div className="space-y-3">
                    {character.equipment.map((eq, index) => (
                      <div key={index} className="p-3 bg-navy-light/30 rounded-lg">
                        <div className="font-medium text-white mb-1">{eq.type}</div>
                        <div className="text-gray-300 text-sm">
                          槽位: {eq.slot} | 效率: {eq.efficiency}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 别称 */}
              {character.aliases && character.aliases.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-400" />
                    别称
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {character.aliases.map((alias, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-navy-gold text-white text-sm rounded-full"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 bg-navy-light/30 border-t border-navy-gold/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};