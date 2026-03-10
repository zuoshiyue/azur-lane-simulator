/**
 * 智能推荐算法模块
 * 基于用户拥有情况、舰种搭配、阵营协同、强度评级、阵容平衡
 * 
 * 编队规则参考：https://wiki.biligame.com/blhx/%E7%BC%96%E9%98%9F
 * - 先锋编队：3 槽位（驱逐/轻巡/重巡/超巡/运输） + 主力编队：3 槽位（战列/战巡/航母/轻母/潜艇/维修）
 * - 先锋：坦位、保护位、三号位
 * - 主力：旗舰、上僚舰、下僚舰
 * - 潜艇编队：6 槽位（仅潜艇）
 * - 推荐编队：https://wiki.biligame.com/blhx/%E9%98%B5%E5%AE%B9%E6%8E%A8%E8%8D%90
 */

import { Character, Fleet, FleetRecommendation } from '../types';

// 舰种分类 - 先锋（前排）
const FRONT_ROW_TYPES = ['驱逐', '轻巡', '重巡', '超巡'];
const FRONT_ROW_SUPPORT_TYPES = ['运输'];

// 舰种分类 - 主力（后排）
const BACK_ROW_TYPES = ['战列', '战巡', '航母', '轻母'];
const BACK_ROW_SUPPORT_TYPES = ['维修'];

// 潜艇编队专用
const SUBMARINE_TYPES = ['潜艇'];

// 所有支持类型
const SUPPORT_TYPES = [...FRONT_ROW_SUPPORT_TYPES, ...BACK_ROW_SUPPORT_TYPES];

// 阵营协同加成
const FACTION_BONUS: Record<string, number> = {
  '白鹰': 1.15,
  '皇家': 1.12,
  '重樱': 1.10,
  '铁血': 1.10,
  '东煌': 1.08,
  '北方联合': 1.08,
  '撒丁帝国': 1.08,
  '自由鸢尾': 1.05,
  '维希教廷': 1.05,
};

// 稀有度权重
const RARITY_WEIGHTS: Record<number, number> = {
  6: 100, // META
  5: 80,  // SSR
  4: 60,  // SR
  3: 40,  // R
  2: 20,  // N
  1: 10,
};

// 舰种强度系数（不同舰种在不同位置的强度）
const TYPE_POWER_COEFFICIENTS: Record<string, number> = {
  '驱逐': 0.85,
  '轻巡': 0.90,
  '重巡': 0.95,
  '超巡': 1.00,
  '战列': 1.10,
  '战巡': 1.05,
  '航母': 1.15,
  '轻母': 1.00,
  '维修': 0.80,
  '运输': 0.70,
};

/**
 * 计算角色综合强度评分
 */
export function calculateCharacterPower(character: Character): number {
  const stats = character.stats;
  
  // 基础属性分
  let baseScore = 
    stats.hp * 0.5 +
    stats.fire * 1.2 +
    stats.torpedo * 1.3 +
    stats.aviation * 1.5 +
    stats.reload * 0.8 +
    stats.antiAir * 0.6 +
    stats.detection * 0.5;
  
  // 稀有度加成
  const rarityBonus = RARITY_WEIGHTS[character.rarity] || 10;
  
  // 舰种系数
  const typeCoefficient = TYPE_POWER_COEFFICIENTS[character.type] || 1.0;
  
  // 潜艇有特殊加成（水下作战）
  const isSubmarine = SUBMARINE_TYPES.includes(character.type);
  const subBonus = isSubmarine ? 1.15 : 1.0;
  
  // 综合评分
  const totalScore = (baseScore + rarityBonus) * typeCoefficient * subBonus;
  
  return Math.round(totalScore);
}

/**
 * 计算阵容战力
 */
export function calculateFleetPower(fleet: Fleet): number {
  let totalPower = 0;
  
  fleet.characters.forEach((char, index) => {
    if (char) {
      let power = calculateCharacterPower(char);
      
      // 位置加成（后排通常更重要）
      if (index >= 3) { // 后排
        power *= 1.1;
      }
      
      totalPower += power;
    }
  });
  
  return Math.round(totalPower);
}

/**
 * 计算阵营协同加成
 */
function calculateFactionSynergy(fleet: Fleet): { score: number; mainFaction: string } {
  const factionCount: Record<string, number> = {};
  
  fleet.characters.forEach(char => {
    if (char) {
      factionCount[char.faction] = (factionCount[char.faction] || 0) + 1;
    }
  });
  
  let mainFaction = '';
  let maxCount = 0;
  
  Object.entries(factionCount).forEach(([faction, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mainFaction = faction;
    }
  });
  
  // 纯阵营队获得最高加成
  const synergyMultiplier = FACTION_BONUS[mainFaction] || 1.0;
  const factionScore = maxCount === 6 ? synergyMultiplier : 1.0 + (maxCount / 6) * (synergyMultiplier - 1);
  
  return {
    score: factionScore,
    mainFaction
  };
}

/**
 * 检查阵容平衡性
 */
function checkFleetBalance(fleet: Fleet): { score: number; issues: string[] } {
  const issues: string[] = [];
  let balanceScore = 1.0;
  
  const frontRow = fleet.characters.slice(0, 3).filter(c => c !== null);
  const backRow = fleet.characters.slice(3, 6).filter(c => c !== null);
  
  // 检查前后排比例（理想 3:3）
  if (frontRow.length < 3) {
    issues.push(`先锋舰队不足 (${frontRow.length}/3)`);
    balanceScore -= 0.1 * (3 - frontRow.length);
  }
  
  if (backRow.length < 3) {
    issues.push(`主力舰队不足 (${backRow.length}/3)`);
    balanceScore -= 0.1 * (3 - backRow.length);
  }
  
  // 检查舰种多样性
  const frontTypes = new Set(frontRow.map(c => c?.type));
  const backTypes = new Set(backRow.map(c => c?.type));
  
  if (frontTypes.size === 1 && frontRow.length === 3) {
    issues.push('先锋舰队舰种单一');
    balanceScore -= 0.05;
  }
  
  if (backTypes.size === 1 && backRow.length === 3) {
    issues.push('主力舰队舰种单一');
    balanceScore -= 0.05;
  }
  
  return {
    score: Math.max(0.5, balanceScore),
    issues
  };
}

/**
 * 生成推荐理由
 */
function generateRecommendationReason(
  _fleet: Fleet,
  powerScore: number,
  factionInfo: { score: number; mainFaction: string },
  balanceInfo: { score: number; issues: string[] },
  mode: string
): string {
  const reasons: string[] = [];
  
  // 模式说明
  const modeNames: Record<string, string> = {
    'strongest': '最强阵容',
    'faction': '阵营队',
    'beginner': '新手友好',
    'custom': '自定义'
  };
  
  reasons.push(`【${modeNames[mode] || '推荐阵容'}】`);
  
  // 阵营加成
  if (factionInfo.score > 1.05) {
    reasons.push(`✨ ${factionInfo.mainFaction}阵营协同 (+${Math.round((factionInfo.score - 1) * 100)}%)`);
  }
  
  // 平衡性
  if (balanceInfo.score > 0.9) {
    reasons.push('⚖️ 阵容搭配平衡');
  }
  
  // 战力评分
  reasons.push(`💪 综合战力评分：${powerScore}`);
  
  // 问题提示
  if (balanceInfo.issues.length > 0) {
    reasons.push('⚠️ ' + balanceInfo.issues.join(', '));
  }
  
  return reasons.join(' · ');
}

/**
 * 智能推荐阵容
 * @param ownedCharacters 用户拥有的角色列表
 * @param mode 推荐模式：strongest | faction | beginner | custom
 * @param customOptions 自定义选项（用于 custom 模式）
 */
export function recommendFleet(
  ownedCharacters: Character[],
  mode: 'strongest' | 'faction' | 'beginner' | 'custom' = 'strongest',
  customOptions?: {
    preferredFaction?: string;
    preferredTypes?: string[];
    excludeSSR?: boolean;
  }
): FleetRecommendation[] {
  if (ownedCharacters.length === 0) {
    return [];
  }
  
  const recommendations: FleetRecommendation[] = [];
  
  // 筛选可用角色
  let availableChars = [...ownedCharacters];
  
  if (mode === 'beginner') {
    // 新手友好：排除高稀有度角色
    availableChars = availableChars.filter(c => c.rarity <= 4);
  } else if (mode === 'faction' && customOptions?.preferredFaction) {
    // 阵营队：优先指定阵营
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length >= 6) {
      availableChars = factionChars;
    }
  }
  
  // 计算每个角色的评分
  const scoredChars = availableChars.map(char => ({
    character: char,
    score: calculateCharacterPower(char),
    isFrontRow: FRONT_ROW_TYPES.includes(char.type) || FRONT_ROW_SUPPORT_TYPES.includes(char.type),
    isBackRow: BACK_ROW_TYPES.includes(char.type) || BACK_ROW_SUPPORT_TYPES.includes(char.type),
    isSubmarine: SUBMARINE_TYPES.includes(char.type),
  }));
  
  // 排序
  scoredChars.sort((a, b) => b.score - a.score);
  
  // 生成多个推荐阵容
  const maxRecommendations = Math.min(5, Math.floor(scoredChars.length / 6));
  
  for (let recIndex = 0; recIndex < maxRecommendations; recIndex++) {
    // 选择角色：3 前 +3 后
    const selectedFront: Character[] = [];
    const selectedBack: Character[] = [];
    const usedIds = new Set<string>();
    
    // 选择前排（3 个）
    for (const item of scoredChars) {
      if (selectedFront.length >= 3) break;
      if (usedIds.has(item.character.id)) continue;
      
      if (item.isFrontRow && !item.isBackRow) {
        selectedFront.push(item.character);
        usedIds.add(item.character.id);
      }
    }
    
    // 如果前排不足，用支援型补充
    if (selectedFront.length < 3) {
      for (const item of scoredChars) {
        if (selectedFront.length >= 3) break;
        if (usedIds.has(item.character.id)) continue;
        
        if (FRONT_ROW_SUPPORT_TYPES.includes(item.character.type) || BACK_ROW_SUPPORT_TYPES.includes(item.character.type)) {
          selectedFront.push(item.character);
          usedIds.add(item.character.id);
        }
      }
    }
    
    // 如果还不足，用任意角色补充
    if (selectedFront.length < 3) {
      for (const item of scoredChars) {
        if (selectedFront.length >= 3) break;
        if (usedIds.has(item.character.id)) continue;
        
        selectedFront.push(item.character);
        usedIds.add(item.character.id);
      }
    }
    
    // 选择后排（3 个）
    for (const item of scoredChars) {
      if (selectedBack.length >= 3) break;
      if (usedIds.has(item.character.id)) continue;
      
      if (item.isBackRow && !item.isFrontRow && !item.isSubmarine) {
        selectedBack.push(item.character);
        usedIds.add(item.character.id);
      }
    }
    
    // 如果后排不足，用支援型补充
    if (selectedBack.length < 3) {
      for (const item of scoredChars) {
        if (selectedBack.length >= 3) break;
        if (usedIds.has(item.character.id)) continue;
        
        if (BACK_ROW_SUPPORT_TYPES.includes(item.character.type)) {
          selectedBack.push(item.character);
          usedIds.add(item.character.id);
        }
      }
    }
    
    // 如果还不足，用任意角色补充
    if (selectedBack.length < 3) {
      for (const item of scoredChars) {
        if (selectedBack.length >= 3) break;
        if (usedIds.has(item.character.id)) continue;
        
        selectedBack.push(item.character);
        usedIds.add(item.character.id);
      }
    }
    
    // 组建阵容：前排 3 + 后排 3
    const fleetCharacters: (Character | null)[] = [
      ...selectedFront.slice(0, 3),
      ...selectedBack.slice(0, 3),
    ];
    
    // 填充空位
    while (fleetCharacters.length < 6) {
      fleetCharacters.push(null);
    }
    
    const fleet: Fleet = {
      id: `rec_${Date.now()}_${recIndex}`,
      name: `推荐阵容 #${recIndex + 1}`,
      characters: fleetCharacters,
      createdAt: Date.now(),
    };
    
    // 计算评分
    const powerScore = calculateFleetPower(fleet);
    const factionInfo = calculateFactionSynergy(fleet);
    const balanceInfo = checkFleetBalance(fleet);
    
    const finalScore = powerScore * factionInfo.score * balanceInfo.score;
    
    // 生成推荐理由
    const reason = generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, mode);
    
    recommendations.push({
      fleet,
      reason,
      power: finalScore,
    });
  }
  
  // 按评分排序
  recommendations.sort((a, b) => b.power - a.power);
  
  return recommendations;
}

/**
 * 获取指定阵营的推荐阵容
 */
export function recommendFactionFleet(
  ownedCharacters: Character[],
  faction: string
): FleetRecommendation | null {
  const factionChars = ownedCharacters.filter(c => c.faction === faction);
  
  if (factionChars.length < 6) {
    return null;
  }
  
  const recs = recommendFleet(factionChars, 'faction');
  return recs[0] || null;
}

/**
 * 获取最强阵容推荐
 */
export function recommendStrongestFleet(
  ownedCharacters: Character[]
): FleetRecommendation | null {
  const recs = recommendFleet(ownedCharacters, 'strongest');
  return recs[0] || null;
}

/**
 * 获取新手友好阵容推荐
 */
export function recommendBeginnerFleet(
  ownedCharacters: Character[]
): FleetRecommendation | null {
  const recs = recommendFleet(ownedCharacters, 'beginner');
  return recs[0] || null;
}
