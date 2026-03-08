import React from 'react';
import { Character } from '../types';
import { Anchor, Star } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, character: Character) => void;
  onClick?: (character: Character) => void;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  draggable = false,
  onDragStart,
  onClick,
  compact = false,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const getRarityColor = (rarity: number) => {
    if (rarity >= 5) return 'text-yellow-400';
    if (rarity === 4) return 'text-purple-400';
    if (rarity === 3) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      '航母': 'bg-blue-500',
      '战列': 'bg-red-500',
      '轻巡': 'bg-green-500',
      '重巡': 'bg-orange-500',
      '驱逐': 'bg-purple-500',
      '潜艇': 'bg-indigo-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (compact) {
    return (
      <div
        draggable={draggable}
        onDragStart={(e) => onDragStart?.(e, character)}
        onClick={() => {
          if (!selectable) {
            onClick?.(character);
          }
        }}
        className={`bg-azur rounded-lg p-3 transition-colors border ${
          selectable ? 'cursor-default' : 'cursor-pointer hover:bg-azur-light'
        } ${selected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-azur-dark'}`}
      >
        <div className="flex items-center gap-2">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              onClick={e => e.stopPropagation()}
              className="w-4 h-4 rounded bg-azur-dark border-azur text-blue-600 focus:ring-blue-500"
            />
          )}
          {!selectable && (
            <div className={`w-2 h-2 rounded-full ${getTypeColor(character.type)}`} />
          )}
          <div className="flex-1">
            <div className="font-medium text-sm text-white">{character.nameCn}</div>
            <div className="text-xs text-gray-300">{character.type} · {character.faction}</div>
          </div>
          <div className="flex">
            {Array(character.rarity).fill(0).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${getRarityColor(character.rarity)} fill-current`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, character)}
      onClick={() => onClick?.(character)}
      className="bg-azur rounded-xl p-4 cursor-pointer hover:bg-azur-light transition-all hover:scale-105 border border-azur-dark shadow-lg"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full ${getTypeColor(character.type)} flex items-center justify-center`}>
          <Anchor className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white">{character.nameCn}</h3>
          <p className="text-sm text-gray-300">{character.name}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex">
            {Array(character.rarity).fill(0).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${getRarityColor(character.rarity)} fill-current`} />
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-1">{character.faction}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-azur-dark/50 rounded p-2">
          <span className="text-gray-400">类型</span>
          <div className="text-white font-medium">{character.type}</div>
        </div>
        <div className="bg-azur-dark/50 rounded p-2">
          <span className="text-gray-400">装填</span>
          <div className="text-white font-medium">{character.stats.reload}</div>
        </div>
        <div className="bg-azur-dark/50 rounded p-2">
          <span className="text-gray-400">火力</span>
          <div className="text-white font-medium">{character.stats.fire}</div>
        </div>
        <div className="bg-azur-dark/50 rounded p-2">
          <span className="text-gray-400">航空</span>
          <div className="text-white font-medium">{character.stats.aviation}</div>
        </div>
      </div>

      {character.skills.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-1">技能</div>
          {character.skills.slice(0, 2).map((skill, i) => (
            <div key={i} className="text-xs text-white bg-azur-dark/30 rounded px-2 py-1 mb-1">
              {skill.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
