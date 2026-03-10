/**
 * 智能推荐算法模块
 * 基于用户拥有情况、舰种搭配、阵营协同、强度评级、阵容平衡
 * 
 * 编队规则参考：https://wiki.biligame.com/blhx/%E7%BC%96%E9%98%9F
 * - 先锋编队：3 槽位（驱逐/轻巡/重巡/超巡/运输）
 * - 主力编队：3 槽位（战列/战巡/航母/轻母/潜艇/维修）
 * - 潜艇编队：6 槽位（仅潜艇）
 * - 6种编队站位：先锋3（坦位/保护位/三号位）+主力3（旗舰/上僚舰/下僚舰）
 * - 推荐编队：https://wiki.biligame.com/blhx/%E9%98%B5%E5%AE%B9%E6%8E%A8%E8%8D%90
 */

import { Character, Fleet, FleetRecommendation, FleetType, FleetSlotType, TYPE_TO_SLOT } from '../types';
import {
  FRONT_ROW_POSITIONS,
  BACK_ROW_POSITIONS,
  STAGE_TEAM_TEMPLATES,
  SHIP_TIER_LIST
} from '../data/fleetGuideRules';

// 舰种分类 - 先锋（前排）
const FRONT_ROW_TYPES: FleetSlotType[] = ['先锋'];

// 舰种分类 - 主力（后排）
const BACK_ROW_TYPES: FleetSlotType[] = ['主力'];

// 潜艇编队专用
const SUBMARINE_TYPES: FleetSlotType[] = ['潜艇'];

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
export function calculateCharacterPower(character: Character, fleetType: FleetType = 'surface'): number {
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
  const isSubmarine = character.type === '潜艇';
  const subBonus = isSubmarine ? 1.15 : 1.0;
  
  // 检查角色是否适用于当前编队类型
  const slotType = TYPE_TO_SLOT[character.type];
  const isApplicable = 
    fleetType === 'surface' 
      ? slotType === '先锋' || slotType === '主力' || character.type === '维修'
      : slotType === '潜艇';
  
  const fleetTypeBonus = isApplicable ? 1.0 : 0.5;
  
  // 综合评分
  const totalScore = (baseScore + rarityBonus) * typeCoefficient * subBonus * fleetTypeBonus;
  
  return Math.round(totalScore);
}

/**
 * 计算阵容战力
 */
export function calculateFleetPower(fleet: Fleet, fleetType: FleetType = 'surface'): number {
  let totalPower = 0;
  
  fleet.characters.forEach((char, index) => {
    if (char) {
      let power = calculateCharacterPower(char, fleetType);
      
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
  mode: string,
  fleetType: FleetType = 'surface'
): string {
  const reasons: string[] = [];
  
  // 模式说明
  const modeNames: Record<string, string> = {
    'strongest': '最强阵容',
    'faction': '阵营队',
    'beginner': '新手友好',
    'custom': '自定义'
  };
  
  const fleetTypeNames: Record<FleetType, string> = {
    'surface': '水面编队',
    'submarine': '潜艇编队'
  };
  
  reasons.push(`【${modeNames[mode] || '推荐阵容'} - ${fleetTypeNames[fleetType]}】`);
  
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
 * @param fleetType 编队类型：surface（水面） | submarine（潜艇）
 * @param customOptions 自定义选项（用于 custom 模式）
 */
export function recommendFleet(
  ownedCharacters: Character[],
  mode: 'strongest' | 'faction' | 'beginner' | 'custom' = 'strongest',
  fleetType: FleetType = 'surface',
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
    score: calculateCharacterPower(char, fleetType),
    slotType: TYPE_TO_SLOT[char.type],
    isFrontRow: FRONT_ROW_TYPES.includes(TYPE_TO_SLOT[char.type]),
    isBackRow: BACK_ROW_TYPES.includes(TYPE_TO_SLOT[char.type]),
    isSubmarine: SUBMARINE_TYPES.includes(TYPE_TO_SLOT[char.type]),
  }));
  
  // 排序
  scoredChars.sort((a, b) => b.score - a.score);
  
  // 生成多个推荐阵容
  const maxRecommendations = Math.min(5, Math.floor(scoredChars.length / 6));
  
  for (let recIndex = 0; recIndex < maxRecommendations; recIndex++) {
    const selectedChars: Character[] = [];
    const usedIds = new Set<string>();
    
    if (fleetType === 'submarine') {
      // 潜艇编队：6个潜艇
      for (const item of scoredChars) {
        if (selectedChars.length >= 6) break;
        if (usedIds.has(item.character.id)) continue;
        
        if (item.isSubmarine) {
          selectedChars.push(item.character);
          usedIds.add(item.character.id);
        }
      }
    } else {
      // 水面编队：3先锋 + 3主力
      const selectedFront: Character[] = [];
      const selectedBack: Character[] = [];
      
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
          
          // 允许运输舰作为前排支援
          if (item.character.type === '运输') {
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
          
          // 允许维修舰作为后排支援
          if (item.character.type === '维修') {
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
      selectedChars.push(...selectedFront.slice(0, 3), ...selectedBack.slice(0, 3));
    }
    
    // 填充空位
    const fleetCharacters: (Character | null)[] = [...selectedChars];
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
    const powerScore = calculateFleetPower(fleet, fleetType);
    const factionInfo = calculateFactionSynergy(fleet);
    const balanceInfo = checkFleetBalance(fleet);
    
    const finalScore = powerScore * factionInfo.score * balanceInfo.score;
    
    // 生成推荐理由
    const reason = generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, mode, fleetType);
    
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

/**
 * 根据关卡推荐阵容（基于 28 法则攻略）
 */
export function recommendFleetByStage(
  ownedCharacters: Character[],
  stage: string
): FleetRecommendation | null {
  const template = STAGE_TEAM_TEMPLATES[stage];
  if (!template) return null;

  // 根据模板推荐角色
  const frontRowChars: Character[] = [];
  const backRowChars: Character[] = [];

  // 筛选可用角色
  const frontRowAvailable = ownedCharacters.filter(c => TYPE_TO_SLOT[c.type] === '先锋');
  const backRowAvailable = ownedCharacters.filter(c => TYPE_TO_SLOT[c.type] === '主力');

  // 为每个位置选择最佳角色
  template.frontRow.forEach((desiredType, index) => {
    const positionRule = FRONT_ROW_POSITIONS[(index + 1) as 1 | 2 | 3];
    const bestChar = findBestCharacter(frontRowAvailable, desiredType, positionRule?.priority);
    if (bestChar && !frontRowChars.includes(bestChar)) {
      frontRowChars.push(bestChar);
    }
  });

  template.backRow.forEach((desiredType, index) => {
    const positionRule = index === 0 ? BACK_ROW_POSITIONS.flagship :
                         index === 1 ? BACK_ROW_POSITIONS.upper :
                         BACK_ROW_POSITIONS.lower;
    const bestChar = findBestCharacter(backRowAvailable, desiredType, positionRule?.priority);
    if (bestChar && !backRowChars.includes(bestChar)) {
      backRowChars.push(bestChar);
    }
  });

  // 创建阵容
  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_${stage}_${Date.now()}`,
    name: template.name,
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);

  return {
    fleet,
    reason: `${template.name} - ${template.description}`,
    power
  };
}

/**
 * 根据强度榜推荐阵容
 */
export function recommendByTierList(
  ownedCharacters: Character[]
): FleetRecommendation | null {
  // 为每个角色添加强度评级
  const ratedChars = ownedCharacters.map(char => {
    let tierInfo = null;

    // 查找角色的强度评级
    for (const ships of Object.values(SHIP_TIER_LIST)) {
      const found = ships.find(s => char.name.includes(s.note.split(',')[0]));
      if (found) {
        tierInfo = found;
        break;
      }
    }

    return {
      char,
      tier: tierInfo?.tier || 'B',
      role: tierInfo?.role || char.type
    };
  });

  // 按强度排序
  const tierOrder = { 'S+': 4, 'S': 3, 'A': 2, 'B': 1, 'C': 0 };
  ratedChars.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier]);

  // 选择前 6 个角色组成阵容
  const top6 = ratedChars.slice(0, 6);
  const frontRow = top6.filter(r => TYPE_TO_SLOT[r.char.type] === '先锋');
  const backRow = top6.filter(r => TYPE_TO_SLOT[r.char.type] === '主力');

  const characters: (Character | null)[] = [
    ...(frontRow.slice(0, 3).map(r => r.char)),
    ...(backRow.slice(0, 3).map(r => r.char))
  ];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_tier_${Date.now()}`,
    name: '强度榜推荐',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const avgTier = top6.reduce((sum, r) => sum + tierOrder[r.tier], 0) / top6.length;

  return {
    fleet,
    reason: `平均强度等级：${avgTier >= 3 ? 'S 级' : avgTier >= 2 ? 'A 级' : 'B 级'}阵容`,
    power
  };
}

/**
 * 辅助函数：为位置选择最佳角色
 */
function findBestCharacter(
  candidates: Character[],
  desiredType: string,
  priorityTypes?: string[]
): Character | null {
  // 优先选择指定类型的角色
  let matched = candidates.filter(c => c.type === desiredType);

  if (matched.length === 0 && priorityTypes) {
    // 如果没有指定类型，按优先级选择
    for (const type of priorityTypes) {
      matched = candidates.filter(c => c.type === type);
      if (matched.length > 0) break;
    }
  }

  if (matched.length === 0) {
    // 仍然没有，选择任意可用角色
    matched = candidates;
  }

  if (matched.length === 0) return null;

  // 选择强度最高的
  return matched.reduce((best, current) => {
    return calculateCharacterPower(current) > calculateCharacterPower(best) ? current : best;
  });
}
