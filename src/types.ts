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
}

export type ShipType = 
  | '驱逐' | '轻巡' | '重巡' | '超巡' 
  | '战列' | '战巡' | '航母' | '轻母' 
  | '潜艇' | '维修' | '运输' | '巡洋' | 'META';

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
