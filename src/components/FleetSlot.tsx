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
      <div className="absolute top-2 left-2 text-xs text-gray-400">
        {slotType} {position}
      </div>
      
      {showTypeMismatch && (
        <div className="absolute top-2 right-2">
          <X className="w-3 h-3 text-red-400" />
        </div>
      )}

      {character ? (
        <div className="p-4 h-full">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-bold text-white">{character.nameCn}</div>
              <div className="text-xs text-gray-300">{character.type} · {character.faction}</div>
              <div className="text-xs text-blue-400 mt-0.5">
                {slotType}适用: {isValid ? '✓' : '✗'}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 text-xs mt-3">
            <div className="text-center bg-azur-dark/50 rounded p-1">
              <div className="text-gray-400 text-[10px]">HP</div>
              <div className="text-white font-medium">{character.stats.hp}</div>
            </div>
            <div className="text-center bg-azur-dark/50 rounded p-1">
              <div className="text-gray-400 text-[10px]">火力</div>
              <div className="text-white font-medium">{character.stats.fire}</div>
            </div>
            <div className="text-center bg-azur-dark/50 rounded p-1">
              <div className="text-gray-400 text-[10px]">航空</div>
              <div className="text-white font-medium">{character.stats.aviation}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Anchor className="w-8 h-8 mb-2 opacity-50" />
          <div className="text-sm">拖拽角色至此</div>
        </div>
      )}
    </div>
  );
};
