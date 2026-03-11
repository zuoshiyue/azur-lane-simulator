/**
 * 稀有度管理工具
 */

// 定义稀有度类型
type RarityLevel = 1 | 2 | 3 | 4 | 5 | 6;

// 稀有度配置
const RARITY_CONFIG: Record<RarityLevel, { name: string; nameZh: string; color: string; bgColor: string }> = {
  6: { name: 'UR', nameZh: '超稀有', color: 'text-purple-400', bgColor: 'bg-purple-500' },
  5: { name: 'SSR', nameZh: '精锐', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  4: { name: 'SR', nameZh: '稀有', color: 'text-purple-400', bgColor: 'bg-purple-400' },
  3: { name: 'R', nameZh: '普通', color: 'text-blue-400', bgColor: 'bg-blue-400' },
  2: { name: 'N', nameZh: '一般', color: 'text-gray-400', bgColor: 'bg-gray-500' },
  1: { name: 'N', nameZh: '一般', color: 'text-gray-400', bgColor: 'bg-gray-500' }
};

/**
 * 获取稀有度名称（英文）
 */
export function getRarityName(rarity: number): string {
  return (RARITY_CONFIG as Record<number, { name: string; nameZh: string; color: string; bgColor: string }>)[rarity]?.name || 'Unknown';
}

/**
 * 获取稀有度名称（中文）
 */
export function getRarityNameZh(rarity: number): string {
  return (RARITY_CONFIG as Record<number, { name: string; nameZh: string; color: string; bgColor: string }>)[rarity]?.nameZh || '未知';
}

/**
 * 获取稀有度颜色
 */
export function getRarityColor(rarity: number): string {
  return (RARITY_CONFIG as Record<number, { name: string; nameZh: string; color: string; bgColor: string }>)[rarity]?.color || 'text-gray-400';
}

/**
 * 获取稀有度背景色
 */
export function getRarityBgColor(rarity: number): string {
  return (RARITY_CONFIG as Record<number, { name: string; nameZh: string; color: string; bgColor: string }>)[rarity]?.bgColor || 'bg-gray-500';
}

/**
 * 获取星级表示
 */
export function getRarityStars(rarity: number): string {
  return '★'.repeat(rarity);
}