/**
 * 扩展的智能推荐算法模块
 * 基于用户拥有情况、舰种搭配、阵营协同、强度评级、阵容平衡
 * 新增多种配队策略：道中队、困难BOSS队、练级1拖5、N拖M等
 */

import { Character, Fleet, FleetRecommendation, FleetType, TYPE_TO_SLOT } from '../types';

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

// 稀有度权重（调整后的校准分级）
const RARITY_WEIGHTS: Record<number, number> = {
  6: 85,  // UR
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
    'custom': '自定义',
    'midway': '道中队',
    'boss': '困难BOSS队',
    'grinding': '练级队',
    'one_pull_five': '1拖5',
    'n_pull_m': 'N拖M',
    'anti_air': '防空队',
    'sub_hunter': '反潜队',
    'fast_move': '高速队',
    'tank': '肉盾队'
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
  reasons.push(`💪 综合战力评分：${Math.round(powerScore)}`);

  // 问题提示
  if (balanceInfo.issues.length > 0) {
    reasons.push('⚠️ ' + balanceInfo.issues.join(', '));
  }

  return reasons.join(' · ');
}

/**
 * 道中队 - 针对前期清怪，优先选择高机动和适合前排的角色
 */
export function recommendMidwayFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 道中队：优先高机动、生存能力强的角色
  // 前排：优先驱逐、轻巡等机动性强的单位
  // 后排：选择能稳定输出的角色
  const frontRowChars = availableChars
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋')
    .sort((a, b) => {
      // 优先级：驱逐 > 轻巡 > 其他前排单位
      const aPriority = a.type === '驱逐' ? 3 : a.type === '轻巡' ? 2 : 1;
      const bPriority = b.type === '驱逐' ? 3 : b.type === '轻巡' ? 2 : 1;
      return bPriority - aPriority || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface');
    })
    .slice(0, 3);

  const backRowChars = availableChars
    .filter(c => TYPE_TO_SLOT[c.type] === '主力')
    .sort((a, b) => calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'))
    .slice(0, 3);

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_midway_${Date.now()}`,
    name: '道中队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'midway', 'surface'),
    power: finalScore
  };
}

/**
 * 困难BOSS队 - 专为挑战高难度关卡设计，注重火力和续航
 */
export function recommendBossFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // BOSS队：优先高火力、高生存的角色
  // 前排：重巡、超巡、驱逐等高输出或高生存单位
  // 后排：战列、战巡、航母等主力输出单位
  const frontRowChars = availableChars
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋')
    .sort((a, b) => {
      // 优先级：重巡/超巡 > 驱逐 > 轻巡 > 其他
      const aPriority = ['重巡', '超巡'].includes(a.type) ? 4 :
                       a.type === '驱逐' ? 3 :
                       a.type === '轻巡' ? 2 : 1;
      const bPriority = ['重巡', '超巡'].includes(b.type) ? 4 :
                       b.type === '驱逐' ? 3 :
                       b.type === '轻巡' ? 2 : 1;
      return bPriority - aPriority || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface');
    })
    .slice(0, 3);

  const backRowChars = availableChars
    .filter(c => TYPE_TO_SLOT[c.type] === '主力')
    .sort((a, b) => {
      // 优先级：战列/战巡 > 航母 > 轻母/维修 > 其他
      const aPriority = ['战列', '战巡'].includes(a.type) ? 4 :
                       a.type === '航母' ? 3 :
                       ['轻母', '维修'].includes(a.type) ? 2 : 1;
      const bPriority = ['战列', '战巡'].includes(b.type) ? 4 :
                       b.type === '航母' ? 3 :
                       ['轻母', '维修'].includes(b.type) ? 2 : 1;
      return bPriority - aPriority || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface');
    })
    .slice(0, 3);

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_boss_${Date.now()}`,
    name: '困难BOSS队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'boss', 'surface'),
    power: finalScore
  };
}

/**
 * 练级队 - 适合日常刷图升级，注重效率和续航
 */
export function recommendGrindingFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 练级队：平衡的输出和生存能力，考虑燃油弹药消耗
  // 前排：有一定生存和输出能力的单位
  // 后排：稳定输出的单位，适当考虑维修单位
  const frontRowChars = availableChars
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋')
    .sort((a, b) => calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'))
    .slice(0, 3);

  const backRowChars = availableChars
    .filter(c => TYPE_TO_SLOT[c.type] === '主力')
    .sort((a, b) => calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'))
    .slice(0, 3);

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_grinding_${Date.now()}`,
    name: '练级队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'grinding', 'surface'),
    power: finalScore
  };
}

/**
 * 1拖5 - 1个强力角色带动5个辅助/肉盾角色
 */
export function recommendOnePullFiveFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 1拖5：1个最高战力的角色，其余选择功能性角色
  const sortedChars = availableChars
    .sort((a, b) => calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'));

  // 第一个是最强角色
  const mainChar = sortedChars[0];

  if (!mainChar) return null;

  // 选择功能性辅助角色
  const supportChars = availableChars
    .filter(c => c.id !== mainChar.id) // 排除主力
    .sort((a, b) => {
      // 优先级：前排肉盾/后排辅助
      const aPriority = ['驱逐', '轻巡', '维修', '轻母'].includes(a.type) ? 2 : 1;
      const bPriority = ['驱逐', '轻巡', '维修', '轻母'].includes(b.type) ? 2 : 1;
      return bPriority - aPriority;
    })
    .slice(0, 5);

  // 确定主力角色的位置
  const mainPosition = Math.floor(Math.random() * 6); // 随机选择一个位置给主力

  const characters: (Character | null)[] = [null, null, null, null, null, null];
  characters[mainPosition] = mainChar;

  // 填充辅助角色
  let supportIndex = 0;
  for (let i = 0; i < 6; i++) {
    if (i !== mainPosition && supportIndex < supportChars.length) {
      characters[i] = supportChars[supportIndex++];
    }
  }

  const fleet: Fleet = {
    id: `fleet_1p5_${Date.now()}`,
    name: '1拖5队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'one_pull_five', 'surface'),
    power: finalScore
  };
}

/**
 * N拖M - N个主力带动M个辅助（N+M=6）
 */
export function recommendNPullMFleet(
  ownedCharacters: Character[],
  n: number = 2, // 主力数量
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0 || n <= 0 || n >= 6) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  const sortedChars = availableChars
    .sort((a, b) => calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'));

  const m = 6 - n; // 辅助数量
  const mainChars = sortedChars.slice(0, n);
  const supportChars = sortedChars.slice(n, n + m);

  // 将主力和辅助角色混合
  const allChars = [...mainChars, ...supportChars];
  // 简单打乱数组以增加多样性
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  const characters: (Character | null)[] = allChars.slice(0, 6);
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_np${n}m${m}_${Date.now()}`,
    name: `${n}拖${m}队`,
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'n_pull_m', 'surface'),
    power: finalScore
  };
}

/**
 * 防空队 - 专门针对高对空要求的关卡
 */
export function recommendAntiAirFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 防空队：优先高对空值的角色
  const sortedByAntiAir = availableChars
    .sort((a, b) => b.stats.antiAir - a.stats.antiAir || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'));

  // 前排：高对空的驱逐、轻巡等
  const frontRowChars = sortedByAntiAir
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋')
    .slice(0, 3);

  // 后排：高对空的战列、战巡、航母等
  const backRowChars = sortedByAntiAir
    .filter(c => TYPE_TO_SLOT[c.type] === '主力')
    .slice(0, 3);

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_anti_air_${Date.now()}`,
    name: '防空队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'anti_air', 'surface'),
    power: finalScore
  };
}

/**
 * 反潜队 - 专门对付潜艇敌人
 */
export function recommendSubHunterFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 反潜队：优先高索敌、高对潜值的角色（驱逐、轻巡、重巡）
  const sortedByDetection = availableChars
    .sort((a, b) => b.stats.detection - a.stats.detection || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'));

  // 前排：高索敌的驱逐、轻巡、重巡（反潜主力）
  const frontRowChars = sortedByDetection
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋' && ['驱逐', '轻巡', '重巡'].includes(c.type))
    .slice(0, 3);

  // 后排：如果有航母或战列也可以加入
  const backRowChars = sortedByDetection
    .filter(c => TYPE_TO_SLOT[c.type] === '主力')
    .slice(0, 3);

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_sub_hunter_${Date.now()}`,
    name: '反潜队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'sub_hunter', 'surface'),
    power: finalScore
  };
}

/**
 * 高速队 - 所有角色都是高航速单位，适应某些机制要求
 */
export function recommendFastMoveFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 高速队：优先高航速的角色
  const sortedBySpeed = availableChars
    .sort((a, b) => b.stats.speed - a.stats.speed || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'));

  // 选择航速较高的前排单位
  const frontRowChars = sortedBySpeed
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋' && c.stats.speed >= 30) // 假设30以上为高速
    .slice(0, 3);

  // 如果高速前排不足，补充普通前排
  if (frontRowChars.length < 3) {
    const remainingFront = sortedBySpeed
      .filter(c => TYPE_TO_SLOT[c.type] === '先锋' && !frontRowChars.some(fc => fc.id === c.id))
      .slice(0, 3 - frontRowChars.length);
    frontRowChars.push(...remainingFront);
  }

  // 选择航速较高的后排单位
  const backRowChars = sortedBySpeed
    .filter(c => TYPE_TO_SLOT[c.type] === '主力' && c.stats.speed >= 25) // 假设25以上为高速
    .slice(0, 3);

  // 如果高速后排不足，补充普通后排
  if (backRowChars.length < 3) {
    const remainingBack = sortedBySpeed
      .filter(c => TYPE_TO_SLOT[c.type] === '主力' && !backRowChars.some(bc => bc.id === c.id))
      .slice(0, 3 - backRowChars.length);
    backRowChars.push(...remainingBack);
  }

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_fast_move_${Date.now()}`,
    name: '高速队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'fast_move', 'surface'),
    power: finalScore
  };
}

/**
 * 肉盾队 - 专注防御和生存能力
 */
export function recommendTankFleet(
  ownedCharacters: Character[],
  customOptions?: {
    preferredFaction?: string;
    occupiedCharacterIds?: string[];
  }
): FleetRecommendation | null {
  if (ownedCharacters.length === 0) return null;

  let availableChars = [...ownedCharacters];

  // 过滤被占用的角色
  if (customOptions?.occupiedCharacterIds && customOptions.occupiedCharacterIds.length > 0) {
    availableChars = availableChars.filter(char => !customOptions.occupiedCharacterIds!.includes(char.id));
  }

  // 如果指定了阵营，优先该阵营
  if (customOptions?.preferredFaction) {
    const factionChars = availableChars.filter(c => c.faction === customOptions.preferredFaction);
    if (factionChars.length > 0) {
      availableChars = factionChars;
    }
  }

  // 肉盾队：优先高HP、装甲的角色
  const sortedBySurvivability = availableChars
    .sort((a, b) => b.stats.hp - a.stats.hp || calculateCharacterPower(b, 'surface') - calculateCharacterPower(a, 'surface'));

  // 前排：高HP、适合肉盾的驱逐、轻巡、重巡、战巡
  const frontRowChars = sortedBySurvivability
    .filter(c => TYPE_TO_SLOT[c.type] === '先锋')
    .slice(0, 3);

  // 后排：可以选择战列、战巡等高耐久单位
  const backRowChars = sortedBySurvivability
    .filter(c => TYPE_TO_SLOT[c.type] === '主力')
    .slice(0, 3);

  const characters: (Character | null)[] = [...frontRowChars, ...backRowChars];
  while (characters.length < 6) {
    characters.push(null);
  }

  const fleet: Fleet = {
    id: `fleet_tank_${Date.now()}`,
    name: '肉盾队',
    characters,
    createdAt: Date.now()
  };

  const power = calculateFleetPower(fleet);
  const factionInfo = calculateFactionSynergy(fleet);
  const balanceInfo = checkFleetBalance(fleet);
  const finalScore = power * factionInfo.score * balanceInfo.score;

  return {
    fleet,
    reason: generateRecommendationReason(fleet, finalScore, factionInfo, balanceInfo, 'tank', 'surface'),
    power: finalScore
  };
}

/**
 * 智能推荐阵容 - 扩展版本
 * @param ownedCharacters 用户拥有的角色列表
 * @param mode 推荐模式：原有模式 + 新增模式
 * @param fleetType 编队类型：surface（水面） | submarine（潜艇）
 * @param customOptions 自定义选项（用于 custom 模式）
 */
export function recommendFleetExtended(
  ownedCharacters: Character[],
  mode: 'strongest' | 'faction' | 'beginner' | 'custom' |
        'midway' | 'boss' | 'grinding' | 'one_pull_five' | 'n_pull_m' |
        'anti_air' | 'sub_hunter' | 'fast_move' | 'tank' = 'strongest',
  customOptions?: {
    preferredFaction?: string;
    preferredTypes?: string[];
    excludeSSR?: boolean;
    occupiedCharacterIds?: string[]; // 新增：被占用的角色ID
    nValue?: number; // 用于N拖M模式
  }
): FleetRecommendation[] {
  if (ownedCharacters.length === 0) {
    return [];
  }

  // 根据模式选择适当的推荐策略
  switch (mode) {
    case 'midway':
      const midwayResult = recommendMidwayFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return midwayResult ? [midwayResult] : [];

    case 'boss':
      const bossResult = recommendBossFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return bossResult ? [bossResult] : [];

    case 'grinding':
      const grindingResult = recommendGrindingFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return grindingResult ? [grindingResult] : [];

    case 'one_pull_five':
      const opfResult = recommendOnePullFiveFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return opfResult ? [opfResult] : [];

    case 'n_pull_m':
      const npmResult = recommendNPullMFleet(ownedCharacters, customOptions?.nValue || 2, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return npmResult ? [npmResult] : [];

    case 'anti_air':
      const aaResult = recommendAntiAirFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return aaResult ? [aaResult] : [];

    case 'sub_hunter':
      const shResult = recommendSubHunterFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return shResult ? [shResult] : [];

    case 'fast_move':
      const fmResult = recommendFastMoveFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return fmResult ? [fmResult] : [];

    case 'tank':
      const tankResult = recommendTankFleet(ownedCharacters, {
        preferredFaction: customOptions?.preferredFaction,
        occupiedCharacterIds: customOptions?.occupiedCharacterIds
      });
      return tankResult ? [tankResult] : [];

    default:
      // 对于原始模式，调用原有的 recommendFleet 函数
      return []; // This should be replaced with the original logic if needed
  }
}