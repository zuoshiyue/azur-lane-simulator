/**
 * 本地角色模板库 - 备用数据源
 * 包含常见角色的预设数据
 */

import { Character } from '../types';

// 常见角色模板
export const CHARACTER_TEMPLATES: Partial<Character>[] = [
  {
    name: 'Enterprise',
    nameCn: '企业',
    rarity: 5,
    type: '航母',
    faction: '白鹰',
    stats: {
      hp: 6339,
      fire: 0,
      torpedo: 0,
      aviation: 435,
      reload: 134,
      armor: '中型',
      speed: 32,
      luck: 93,
      antiAir: 337,
      detection: 110,
    },
    skills: [
      {
        name: 'Lucky E',
        description: '空中支援时，有 40%（70%）概率造成 2 倍伤害，并使自己进入隐身状态，回避所有伤害，持续 8 秒',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 125 },
      { slot: 2, type: '轰炸机', efficiency: 125 },
      { slot: 3, type: '鱼雷机', efficiency: 125 },
    ],
  },
  {
    name: 'Belfast',
    nameCn: '贝尔法斯特',
    rarity: 5,
    type: '轻巡',
    faction: '皇家',
    stats: {
      hp: 5500,
      fire: 150,
      torpedo: 200,
      aviation: 0,
      reload: 160,
      armor: '轻型',
      speed: 32,
      luck: 65,
      antiAir: 180,
      detection: 150,
    },
    skills: [
      {
        name: '完美女仆',
        description: '装填提高 10%，战斗开始时使自身机动提高 20%',
        type: 'passive',
      },
      {
        name: '烟雾弹',
        description: '战斗开始 10 秒后生成烟雾屏障，持续 8 秒',
        type: 'active',
        cooldown: 20,
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 130 },
      { slot: 2, type: '鱼雷', efficiency: 120 },
      { slot: 3, type: '防空炮', efficiency: 110 },
    ],
  },
  {
    name: 'Akagi',
    nameCn: '赤城',
    rarity: 5,
    type: '航母',
    faction: '重樱',
    stats: {
      hp: 5800,
      fire: 0,
      torpedo: 0,
      aviation: 450,
      reload: 120,
      armor: '中型',
      speed: 31,
      luck: 60,
      antiAir: 300,
      detection: 100,
    },
    skills: [
      {
        name: '航空母舰赤城',
        description: '航空值提高 15%，每 20 秒触发一次空袭',
        type: 'passive',
      },
      {
        name: '双鹤之舞',
        description: '与加贺在同一舰队时，航空值额外提高 10%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 120 },
      { slot: 2, type: '轰炸机', efficiency: 115 },
      { slot: 3, type: '鱼雷机', efficiency: 110 },
    ],
  },
  {
    name: 'Kaga',
    nameCn: '加贺',
    rarity: 5,
    type: '航母',
    faction: '重樱',
    stats: {
      hp: 6500,
      fire: 0,
      torpedo: 0,
      aviation: 440,
      reload: 110,
      armor: '中型',
      speed: 30,
      luck: 55,
      antiAir: 310,
      detection: 95,
    },
    skills: [
      {
        name: '航空母舰加贺',
        description: '航空值提高 10%，空袭伤害提高 15%',
        type: 'passive',
      },
      {
        name: '双鹤之舞',
        description: '与赤城在同一舰队时，航空值额外提高 10%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 120 },
      { slot: 2, type: '轰炸机', efficiency: 115 },
      { slot: 3, type: '鱼雷机', efficiency: 110 },
    ],
  },
  {
    name: 'Yamato',
    nameCn: '大和',
    rarity: 6,
    type: '战列',
    faction: '重樱',
    stats: {
      hp: 10500,
      fire: 420,
      torpedo: 0,
      aviation: 0,
      reload: 100,
      armor: '重型',
      speed: 27,
      luck: 70,
      antiAir: 350,
      detection: 90,
    },
    skills: [
      {
        name: '大和级战列舰',
        description: '主炮开火时，有 30% 概率触发额外炮击',
        type: 'passive',
      },
      {
        name: '不屈之舰',
        description: '耐久低于 30% 时，免疫伤害 8 秒',
        type: 'active',
        cooldown: 60,
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 140 },
      { slot: 2, type: '主炮', efficiency: 140 },
      { slot: 3, type: '防空炮', efficiency: 120 },
    ],
  },
  {
    name: 'Musashi',
    nameCn: '武藏',
    rarity: 6,
    type: '战列',
    faction: '重樱',
    stats: {
      hp: 10800,
      fire: 430,
      torpedo: 0,
      aviation: 0,
      reload: 95,
      armor: '重型',
      speed: 27,
      luck: 65,
      antiAir: 360,
      detection: 85,
    },
    skills: [
      {
        name: '大和级战列舰',
        description: '主炮开火时，有 30% 概率触发额外炮击',
        type: 'passive',
      },
      {
        name: '钢铁之壁',
        description: '受到的伤害降低 15%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 140 },
      { slot: 2, type: '主炮', efficiency: 140 },
      { slot: 3, type: '防空炮', efficiency: 120 },
    ],
  },
  {
    name: 'Bismarck',
    nameCn: '俾斯麦',
    rarity: 5,
    type: '战列',
    faction: '铁血',
    stats: {
      hp: 9500,
      fire: 380,
      torpedo: 0,
      aviation: 0,
      reload: 105,
      armor: '重型',
      speed: 30,
      luck: 60,
      antiAir: 320,
      detection: 95,
    },
    skills: [
      {
        name: '铁血的荣耀',
        description: '火力提高 10%，装甲提高 5%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 135 },
      { slot: 2, type: '主炮', efficiency: 135 },
      { slot: 3, type: '防空炮', efficiency: 115 },
    ],
  },
  {
    name: 'Tirpitz',
    nameCn: '提尔比茨',
    rarity: 5,
    type: '战列',
    faction: '铁血',
    stats: {
      hp: 9800,
      fire: 390,
      torpedo: 0,
      aviation: 0,
      reload: 100,
      armor: '重型',
      speed: 30,
      luck: 55,
      antiAir: 330,
      detection: 90,
    },
    skills: [
      {
        name: '北方的孤独女王',
        description: '在场时，敌方舰队机动降低 5%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 135 },
      { slot: 2, type: '主炮', efficiency: 135 },
      { slot: 3, type: '防空炮', efficiency: 115 },
    ],
  },
  {
    name: 'Hood',
    nameCn: '胡德',
    rarity: 5,
    type: '战巡',
    faction: '皇家',
    stats: {
      hp: 8500,
      fire: 340,
      torpedo: 0,
      aviation: 0,
      reload: 115,
      armor: '中型',
      speed: 31,
      luck: 75,
      antiAir: 280,
      detection: 100,
    },
    skills: [
      {
        name: '皇家海军的荣耀',
        description: '对重樱阵营角色伤害提高 10%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 130 },
      { slot: 2, type: '主炮', efficiency: 130 },
      { slot: 3, type: '防空炮', efficiency: 110 },
    ],
  },
  {
    name: 'Warspite',
    nameCn: '厌战',
    rarity: 5,
    type: '战列',
    faction: '皇家',
    stats: {
      hp: 9200,
      fire: 370,
      torpedo: 0,
      aviation: 0,
      reload: 110,
      armor: '重型',
      speed: 28,
      luck: 80,
      antiAir: 310,
      detection: 105,
    },
    skills: [
      {
        name: '伊丽莎白的女王',
        description: '主炮暴击率提高 10%',
        type: 'passive',
      },
      {
        name: '老女士的愤怒',
        description: '对重型装甲敌人伤害提高 15%',
        type: 'passive',
      },
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 135 },
      { slot: 2, type: '主炮', efficiency: 135 },
      { slot: 3, type: '防空炮', efficiency: 115 },
    ],
  },
];

/**
 * 根据名称搜索模板
 */
export function searchTemplate(query: string): Partial<Character>[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return CHARACTER_TEMPLATES.filter(template => 
    template.nameCn?.includes(query) ||
    template.name?.toLowerCase().includes(normalizedQuery) ||
    template.faction?.includes(query)
  );
}

/**
 * 根据名称精确匹配模板
 */
export function findTemplateByName(name: string): Partial<Character> | null {
  const normalized = name.trim();
  
  return CHARACTER_TEMPLATES.find(template => 
    template.nameCn === normalized ||
    template.name === normalized
  ) || null;
}

/**
 * 获取所有模板名称
 */
export function getAllTemplateNames(): string[] {
  return CHARACTER_TEMPLATES.map(t => t.nameCn || t.name || '');
}
