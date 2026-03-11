/**
 * 角色名称显示工具
 * 用于显示角色的中文名称和别称
 */

import { Character } from '../types';

export function formatCharacterName(character: Character): string {
  if (!character) return '';

  const name = character.nameCn || character.name || '';

  // 如果有别称，则在名称后面显示
  if (character.aliases && character.aliases.length > 0) {
    const aliasesStr = character.aliases.join('、');
    return `${name} (${aliasesStr})`;
  }

  return name;
}

// 在React组件中使用的格式化组件
export function CharacterNameDisplay({ character, className = "" }: { character: Character, className?: string }) {
  if (!character) return null;

  const displayName = formatCharacterName(character);

  // 如果有别称，将别称部分用不同样式突出显示
  if (character.aliases && character.aliases.length > 0) {
    const name = character.nameCn || character.name || '';
    const aliasesStr = character.aliases.join('、');

    return (
      <span className={className}>
        {name}
        <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-medium">
          {aliasesStr}
        </span>
      </span>
    );
  }

  return <span className={className}>{displayName}</span>;
}