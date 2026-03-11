import React, { memo } from 'react';
import { Character } from '../types';
import { Anchor, Star, CheckCircle, PlusCircle } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, character: Character) => void;
  onClick?: (character: Character) => void;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  owned?: boolean;
  onToggleOwned?: (character: Character) => void;
  showOwnedToggle?: boolean;
}

// 自定义比较函数，避免不必要的重渲染
const areEqual = (prev: CharacterCardProps, next: CharacterCardProps) => {
  return (
    prev.character.id === next.character.id &&
    prev.draggable === next.draggable &&
    prev.compact === next.compact &&
    prev.selectable === next.selectable &&
    prev.selected === next.selected &&
    prev.owned === next.owned &&
    prev.showOwnedToggle === next.showOwnedToggle
  );
};

export const CharacterCard = memo<CharacterCardProps>(function CharacterCard({
  character,
  draggable = false,
  onDragStart,
  onClick,
  compact = false,
  selectable = false,
  selected = false,
  onSelect,
  owned = false,
  onToggleOwned,
  showOwnedToggle = false,
}) {
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
          if (!selectable && !showOwnedToggle) {
            onClick?.(character);
          }
        }}
        className={`bg-navy-primary rounded-lg p-3 transition-colors border ${
          selectable || showOwnedToggle ? 'cursor-default' : 'cursor-pointer hover:bg-navy-light'
        } ${selected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-navy-gold/20'} ${
          owned ? 'border-green-500 ring-1 ring-green-500/30' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              onClick={e => e.stopPropagation()}
              className="w-4 h-4 rounded bg-navy-light border-navy-gold/20 text-blue-600 focus:ring-blue-500"
            />
          )}
          {!selectable && !showOwnedToggle && (
            <div className={`w-2 h-2 rounded-full ${getTypeColor(character.type)}`} />
          )}
          {showOwnedToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleOwned?.(character);
              }}
              className={`p-1 rounded transition-colors ${
                owned 
                  ? 'text-green-400 hover:text-green-300' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title={owned ? '取消拥有' : '设为已拥有'}
            >
              {owned ? <CheckCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            </button>
          )}
          <div className="flex-1">
            <div className="font-medium text-sm text-white">{character.nameCn}</div>
            <div className="text-xs text-gray-300">{character.type} · {character.faction}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array(character.rarity).fill(0).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${getRarityColor(character.rarity)} fill-current`} />
              ))}
            </div>
            {owned && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, character)}
      onClick={() => {
        if (!showOwnedToggle) {
          onClick?.(character);
        }
      }}
      className={`bg-navy-primary rounded-xl p-4 cursor-pointer hover:bg-navy-light transition-all hover:scale-105 border border-navy-gold/20 shadow-lg ${
        owned ? 'border-green-500 ring-1 ring-green-500/30' : ''
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* 头像区域 */}
        <div className={`w-12 h-12 rounded-full ${getTypeColor(character.type)} flex items-center justify-center overflow-hidden flex-shrink-0`}>
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
          <Anchor className={`w-6 h-6 text-white ${character.image ? 'hidden' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-white">{character.nameCn}</h3>
            {owned && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          <p className="text-sm text-gray-400 text-xs">类型：{character.type} | 阵营：{character.faction}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex">
            {Array(character.rarity).fill(0).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${getRarityColor(character.rarity)} fill-current`} />
            ))}
          </div>
          {showOwnedToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleOwned?.(character);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg hover:shadow-xl ${
                owned
                  ? 'bg-green-600 text-white hover:bg-green-700 min-w-[80px]'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600 min-w-[80px]'
              }`}
              title={owned ? '取消拥有' : '设为已拥有'}
            >
              {owned ? '✓ 已拥有' : '+ 设为已拥有'}
            </button>
          )}
          <span className="text-xs text-gray-400">{character.faction}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-navy-light/50 rounded p-2">
          <span className="text-gray-400">类型</span>
          <div className="text-white font-medium">{character.type}</div>
        </div>
        <div className="bg-navy-light/50 rounded p-2">
          <span className="text-gray-400">装填</span>
          <div className="text-white font-medium">{character.stats.reload}</div>
        </div>
        <div className="bg-navy-light/50 rounded p-2">
          <span className="text-gray-400">火力</span>
          <div className="text-white font-medium">{character.stats.fire}</div>
        </div>
        <div className="bg-navy-light/50 rounded p-2">
          <span className="text-gray-400">航空</span>
          <div className="text-white font-medium">{character.stats.aviation}</div>
        </div>
      </div>

      {character.skills.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-1">技能</div>
          {character.skills.slice(0, 2).map((skill, i) => (
            <div key={i} className="text-xs text-white bg-navy-light/30 rounded px-2 py-1 mb-1">
              {skill.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}, areEqual);
