export interface Character {
  id: string;
  name: string;
  nameCn: string;
  rarity: number; // 1-6
  type: ShipType;
  faction: string;
  stats: Stats;
  skills: Skill[];
  equipment: EquipmentSlot[];
  image?: string;
  aliases?: string[]; // 别称/昵称（如“鲨”、“花园”等）
}

export type ShipType =
  | '驱逐' | '轻巡' | '重巡' | '超巡'
  | '战列' | '战巡' | '航母' | '轻母'
  | '潜艇' | '维修' | '运输' | '巡洋' | 'META'
  | '潜母' | '航战' | '重炮' | '风帆';

// 编队类型
export type FleetType = 'surface' | 'submarine';

// 编队槽位类型
export type FleetSlotType = '先锋' | '主力' | '潜艇';

// 舰种对应的槽位类型
export const TYPE_TO_SLOT: Record<ShipType, FleetSlotType> = {
  '驱逐': '先锋',
  '轻巡': '先锋',
  '重巡': '先锋',
  '超巡': '先锋',
  '运输': '先锋',
  '战列': '主力',
  '战巡': '主力',
  '航母': '主力',
  '轻母': '主力',
  '维修': '主力',
  '潜艇': '潜艇',
  '巡洋': '主力',
  'META': '主力',
  '潜母': '潜艇',
  '航战': '主力',
  '重炮': '主力',
  '风帆': '主力',
};

export interface Stats {
  hp: number;
  fire: number;
  torpedo: number;
  aviation: number;
  reload: number;
  armor: string;
  speed: number;
  luck: number;
  antiAir: number;
  detection: number;
}

export interface Skill {
  name: string;
  description: string;
  cooldown?: number;
  type: 'passive' | 'active';
}

export interface EquipmentSlot {
  slot: number;
  type: string;
  efficiency: number;
}

export interface Fleet {
  id: string;
  name: string;
  characters: (Character | null)[]; // 6 positions, null = empty
  createdAt: number;
}

export interface FleetRecommendation {
  fleet: Fleet;
  reason: string;
  power: number;
}
