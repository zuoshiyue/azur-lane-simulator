import { Character, Fleet, FleetRecommendation, ShipType } from '../types';

// 示例数据 - 实际应从爬虫获取
const sampleCharacters: Character[] = [
  {
    id: 'char_001',
    name: 'Enterprise',
    nameCn: '企业',
    rarity: 5,
    type: '航母',
    faction: '白鹰',
    stats: {
      hp: 1200,
      fire: 65,
      torpedo: 0,
      aviation: 95,
      reload: 50,
      armor: '中型',
      speed: 33,
      luck: 70,
      antiAir: 80,
      detection: 60
    },
    skills: [
      { name: '航空先锋', description: '航空值提高 15%', type: 'passive' },
      { name: '致命空袭', description: '空袭伤害提高 20%', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 120 },
      { slot: 2, type: '轰炸机', efficiency: 115 },
      { slot: 3, type: '鱼雷机', efficiency: 110 }
    ]
  },
  {
    id: 'char_002',
    name: 'Belfast',
    nameCn: '贝尔法斯特',
    rarity: 5,
    type: '轻巡',
    faction: '皇家',
    stats: {
      hp: 800,
      fire: 55,
      torpedo: 60,
      aviation: 0,
      reload: 65,
      armor: '轻型',
      speed: 32,
      luck: 65,
      antiAir: 70,
      detection: 75
    },
    skills: [
      { name: '完美女仆', description: '装填提高 10%', type: 'passive' },
      { name: '烟雾弹', description: '生成烟雾屏障', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 130 },
      { slot: 2, type: '鱼雷', efficiency: 120 },
      { slot: 3, type: '防空炮', efficiency: 110 }
    ]
  },
  {
    id: 'char_003',
    name: 'Akagi',
    nameCn: '赤城',
    rarity: 5,
    type: '航母',
    faction: '重樱',
    stats: {
      hp: 1100,
      fire: 60,
      torpedo: 0,
      aviation: 100,
      reload: 45,
      armor: '中型',
      speed: 31,
      luck: 60,
      antiAir: 75,
      detection: 55
    },
    skills: [
      { name: '航空母舰', description: '航空值提高 20%', type: 'passive' },
      { name: '空袭支援', description: '空袭冷却减少', type: 'active', cooldown: 18 }
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 125 },
      { slot: 2, type: '轰炸机', efficiency: 120 },
      { slot: 3, type: '鱼雷机', efficiency: 115 }
    ]
  },
  {
    id: 'char_004',
    name: 'Prince of Wales',
    nameCn: '威尔士亲王',
    rarity: 5,
    type: '战列',
    faction: '皇家',
    stats: {
      hp: 1500,
      fire: 95,
      torpedo: 0,
      aviation: 0,
      reload: 40,
      armor: '重型',
      speed: 28,
      luck: 55,
      antiAir: 85,
      detection: 50
    },
    skills: [
      { name: '主炮强化', description: '主炮伤害提高 15%', type: 'passive' },
      { name: '穿甲弹', description: '对重甲伤害提高', type: 'active', cooldown: 25 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 140 },
      { slot: 2, type: '副炮', efficiency: 120 },
      { slot: 3, type: '防空炮', efficiency: 115 }
    ]
  },
  {
    id: 'char_005',
    name: 'Javelin',
    nameCn: '拉菲',
    rarity: 4,
    type: '驱逐',
    faction: '皇家',
    stats: {
      hp: 400,
      fire: 35,
      torpedo: 75,
      aviation: 0,
      reload: 70,
      armor: '轻型',
      speed: 38,
      luck: 60,
      antiAir: 55,
      detection: 65
    },
    skills: [
      { name: '鱼雷专精', description: '鱼雷伤害提高 20%', type: 'passive' },
      { name: '烟雾弹', description: '生成烟雾', type: 'active', cooldown: 15 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 110 },
      { slot: 2, type: '鱼雷', efficiency: 130 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ]
  },
  {
    id: 'char_006',
    name: 'Kaga',
    nameCn: '加贺',
    rarity: 5,
    type: '航母',
    faction: '重樱',
    stats: {
      hp: 1150,
      fire: 62,
      torpedo: 0,
      aviation: 98,
      reload: 48,
      armor: '中型',
      speed: 30,
      luck: 58,
      antiAir: 78,
      detection: 58
    },
    skills: [
      { name: '航空强化', description: '航空值提高 18%', type: 'passive' },
      { name: '舰载机强化', description: '舰载机伤害提高', type: 'active', cooldown: 22 }
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 122 },
      { slot: 2, type: '轰炸机', efficiency: 118 },
      { slot: 3, type: '鱼雷机', efficiency: 112 }
    ]
  }
];

export class DataManager {
  private characters: Character[] = [];
  private fleets: Fleet[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.characters.length === 0) {
      this.characters = sampleCharacters;
    }
  }

  // 角色管理
  getCharacters(): Character[] {
    return this.characters;
  }

  getCharacterById(id: string): Character | undefined {
    return this.characters.find(c => c.id === id);
  }

  searchCharacters(query: string): Character[] {
    const q = query.toLowerCase();
    return this.characters.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.nameCn.includes(query) ||
      c.type.includes(query) ||
      c.faction.includes(query)
    );
  }

  filterByType(type: ShipType): Character[] {
    return this.characters.filter(c => c.type === type);
  }

  filterByFaction(faction: string): Character[] {
    return this.characters.filter(c => c.faction === faction);
  }

  // 阵容管理
  createFleet(name: string): Fleet {
    const fleet: Fleet = {
      id: `fleet_${Date.now()}`,
      name,
      characters: Array(6).fill(null),
      createdAt: Date.now()
    };
    this.fleets.push(fleet);
    this.saveToStorage();
    return fleet;
  }

  updateFleet(fleet: Fleet): void {
    const index = this.fleets.findIndex(f => f.id === fleet.id);
    if (index !== -1) {
      this.fleets[index] = fleet;
      this.saveToStorage();
    }
  }

  deleteFleet(fleetId: string): void {
    this.fleets = this.fleets.filter(f => f.id !== fleetId);
    this.saveToStorage();
  }

  getFleets(): Fleet[] {
    return this.fleets;
  }

  // 智能推荐
  recommendFleet(mode: string): FleetRecommendation[] {
    const recommendations: FleetRecommendation[] = [];
    
    // 简单推荐逻辑 - 按类型搭配
    const carriers = this.filterByType('航母');
    const battleships = this.filterByType('战列');
    const cruisers = this.filterByType('轻巡');
    const destroyers = this.filterByType('驱逐');

    if (carriers.length >= 2 && battleships.length >= 1 && cruisers.length >= 1 && destroyers.length >= 2) {
      const fleet = this.createFleet(`推荐阵容-${mode}`);
      fleet.characters[0] = carriers[0];
      fleet.characters[1] = carriers[1];
      fleet.characters[2] = battleships[0];
      fleet.characters[3] = cruisers[0];
      fleet.characters[4] = destroyers[0];
      fleet.characters[5] = destroyers[1];
      
      recommendations.push({
        fleet,
        reason: '标准航母编队：2 航母 +1 战列 +1 轻巡 +2 驱逐',
        power: this.calculatePower(fleet)
      });
    }

    return recommendations.sort((a, b) => b.power - a.power);
  }

  calculatePower(fleet: Fleet): number {
    let power = 0;
    fleet.characters.forEach((char: any) => {
      if (char) {
        power += char.stats.hp + 
                 char.stats.fire + 
                 char.stats.torpedo + 
                 char.stats.aviation +
                 char.stats.reload;
      }
    });
    return power;
  }

  // 导出/导入
  exportFleet(fleet: Fleet): string {
    return JSON.stringify(fleet, null, 2);
  }

  importFleet(json: string): Fleet | null {
    try {
      const fleet = JSON.parse(json);
      if (fleet.id && fleet.name && fleet.characters) {
        this.fleets.push(fleet);
        this.saveToStorage();
        return fleet;
      }
    } catch (e) {
      console.error('导入失败:', e);
    }
    return null;
  }

  // 本地存储
  private saveToStorage(): void {
    try {
      localStorage.setItem('azur_fleets', JSON.stringify(this.fleets));
    } catch (e) {
      console.error('保存失败:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('azur_fleets');
      if (saved) {
        this.fleets = JSON.parse(saved);
      }
    } catch (e) {
      console.error('加载失败:', e);
    }
  }
}

export const dataManager = new DataManager();
