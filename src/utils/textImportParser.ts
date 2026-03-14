/**
 * 文本导入解析器 - 解析任意格式的角色名称文本并匹配到角色数据库
 * 支持分隔符：空格、制表符、换行、逗号、顿号
 */

import { Character } from '../types';

/**
 * 解析结果接口
 */
export interface ParsedResult {
  names: string[];           // 原始解析出的名称列表
  matchedCharacters: Character[];  // 匹配到数据库的角色
  unmatchedNames: string[];  // 未能匹配的名称
}

/**
 * 解析文本中的角色名称
 * 支持分隔符：空格、制表符、换行、逗号 (,，)、顿号 (、)
 */
export function parseCharacterNames(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  // 统一替换所有分隔符为换行符
  // 支持：空格、制表符、换行、英文逗号、中文逗号、顿号
  const normalized = text
    .replace(/[\s,,,\n\r]+/g, '\n')
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  // 去重（保留原始顺序）
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of normalized) {
    if (!seen.has(name)) {
      seen.add(name);
      unique.push(name);
    }
  }

  return unique;
}

/**
 * 匹配角色名称到角色数据库
 * 匹配优先级：精确匹配 > 部分匹配 > 模糊匹配
 */
export function matchCharacters(
  names: string[],
  characters: Character[]
): ParsedResult {
  const matchedCharacters: Character[] = [];
  const unmatchedNames: string[] = [];
  const matchedIds = new Set<string>();

  for (const name of names) {
    const character = findCharacterByName(name, characters);
    if (character && !matchedIds.has(character.id)) {
      matchedCharacters.push(character);
      matchedIds.add(character.id);
    } else if (!character) {
      unmatchedNames.push(name);
    }
  }

  return {
    names,
    matchedCharacters,
    unmatchedNames,
  };
}

/**
 * 根据名称查找角色
 * 匹配优先级：
 * 1. 精确匹配中文名
 * 2. 精确匹配英文名
 * 3. 精确匹配别称
 * 4. 部分匹配（名称包含）
 * 5. 别称部分匹配
 */
function findCharacterByName(name: string, characters: Character[]): Character | null {
  const trimmed = name.trim();

  // 1. 精确匹配中文名
  let match = characters.find(c => c.nameCn === trimmed);
  if (match) return match;

  // 2. 精确匹配英文名（不区分大小写）
  match = characters.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match;

  // 3. 精确匹配别称
  match = characters.find(c =>
    c.aliases?.some(alias => alias === trimmed)
  );
  if (match) return match;

  // 4. 部分匹配 - 中文名包含
  match = characters.find(c => c.nameCn.includes(trimmed));
  if (match) return match;

  // 5. 部分匹配 - 英文名包含
  match = characters.find(c => c.name.toLowerCase().includes(trimmed.toLowerCase()));
  if (match) return match;

  // 6. 别称包含匹配
  match = characters.find(c =>
    c.aliases?.some(alias => alias.includes(trimmed))
  );
  if (match) return match;

  // 7. 尝试去除空格后匹配（处理"赤城 "、" 加贺" 等情况）
  const noSpaceName = trimmed.replace(/\s+/g, '');
  if (noSpaceName !== trimmed) {
    match = characters.find(c =>
      c.nameCn === noSpaceName ||
      c.name.toLowerCase() === noSpaceName.toLowerCase() ||
      c.aliases?.some(alias => alias === noSpaceName)
    );
    if (match) return match;
  }

  return null;
}

/**
 * 完整的文本导入处理流程
 * @param text 输入的文本
 * @param allCharacters 完整角色数据库
 * @returns 解析和匹配结果
 */
export function processTextImport(
  text: string,
  allCharacters: Character[]
): ParsedResult {
  const names = parseCharacterNames(text);
  return matchCharacters(names, allCharacters);
}

/**
 * 获取匹配统计信息
 */
export function getMatchStats(result: ParsedResult): {
  totalNames: number;
  matchedCount: number;
  unmatchedCount: number;
  matchRate: number;
} {
  const totalNames = result.names.length;
  const matchedCount = result.matchedCharacters.length;
  const unmatchedCount = result.unmatchedNames.length;
  const matchRate = totalNames > 0 ? Math.round((matchedCount / totalNames) * 100) : 0;

  return {
    totalNames,
    matchedCount,
    unmatchedCount,
    matchRate,
  };
}
