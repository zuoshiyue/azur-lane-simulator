import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Character, FleetSlotType, TYPE_TO_SLOT } from '../types';
import { Anchor, X } from 'lucide-react';

interface FleetSlotProps {
  id: string;
  position: number;
  slotType: FleetSlotType;
  fleetType: 'surface' | 'submarine';
  character: Character | null;
  onRemove: () => void;
  onClick?: () => void;
}

export const FleetSlot: React.FC<FleetSlotProps> = ({
  id,
  position,
  slotType,
  fleetType,
  character,
  onRemove,
  onClick
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  // 检查角色是否适用于当前槽位
  const isValidCharacter = (char: Character): boolean => {
    const charSlotType = TYPE_TO_SLOT[char.type];

    // 潜艇编队：只能放潜艇
    if (fleetType === 'submarine') {
      return charSlotType === '潜艇';
    }

    // 水面编队：先锋槽放先锋，主力槽放主力
    if (slotType === '先锋') {
      return charSlotType === '先锋' || char.type === '运输';
    } else if (slotType === '主力') {
      return charSlotType === '主力' || char.type === '维修';
    }

    return true;
  };

  const isValid = character ? isValidCharacter(character) : true;
  const showTypeMismatch = character && !isValid;

  // 获取类型颜色
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
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`
        relative rounded-xl border-2 transition-all min-h-[180px]
        ${character
          ? 'border-navy-gold/20 bg-navy-light/20'
          : isOver
            ? 'border-blue-400 bg-blue-500/20'
            : 'border-gray-600 bg-gray-800/30'
        }
        ${showTypeMismatch ? 'border-red-500 bg-red-900/20' : ''}
      `}
    >
      <div className="absolute top-1 left-1 text-xs text-gray-400 z-10 bg-black/30 px-1 rounded">
        {slotType} {position}
      </div>

      {showTypeMismatch && (
        <div className="absolute top-1 right-1 z-10">
          <X className="w-3 h-3 text-red-400" />
        </div>
      )}

      {character ? (
        <div className="p-3 h-full flex flex-col pt-6"> {/* 增加pt-6来避免顶部信息遮挡 */}
          <div className="flex items-center justify-between mb-2 flex-1 min-h-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* 头像区域 */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getTypeColor(character.type)}`}>
                {character.image ? (
                  <img
                    src={character.image}
                    alt={character.nameCn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 头像加载失败时显示锚图标
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Anchor className={`w-5 h-5 text-white ${character.image ? 'hidden' : ''}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate">
                  {character.nameCn}
                  {character.aliases && character.aliases.length > 0 && (
                    <span className="block text-xs px-1.5 py-0.5 bg-purple-900 text-purple-200 rounded-full mt-1">
                      {character.aliases.join('、')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-300 truncate">{character.type} · {character.faction}</div>
                <div className="text-xs text-blue-400">
                  {slotType}适用: {isValid ? '✓' : '✗'}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 text-xs flex-grow min-h-0">
            <div className="text-center bg-azur-dark/50 rounded p-1 flex flex-col justify-center">
              <div className="text-gray-400 text-[10px]">HP</div>
              <div className="text-white font-medium">{character.stats.hp}</div>
            </div>
            <div className="text-center bg-azur-dark/50 rounded p-1 flex flex-col justify-center">
              <div className="text-gray-400 text-[10px]">火力</div>
              <div className="text-white font-medium">{character.stats.fire}</div>
            </div>
            <div className="text-center bg-azur-dark/50 rounded p-1 flex flex-col justify-center">
              <div className="text-gray-400 text-[10px]">航空</div>
              <div className="text-white font-medium">{character.stats.aviation}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="h-5"></div> {/* 为位置标签留出空间 */}
          <div className="flex flex-col items-center justify-center h-full -mt-5">
            <Anchor className="w-8 h-8 mb-2 opacity-50" />
            <div className="text-sm">拖拽角色至此</div>
          </div>
        </div>
      )}
    </div>
  );
};
