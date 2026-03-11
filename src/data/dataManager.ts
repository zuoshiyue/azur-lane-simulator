/**
 * 数据管理器 - 提供应用层数据操作接口
 * 封装本地存储和数据库访问
 */

import charactersData from './characters-wiki.json';
import { Character, Fleet } from '../types';

// 类型转换
const characters: Character[] = Array.isArray(charactersData)
  ? charactersData
  : (charactersData as any).characters || [];

console.log(`[DataManager] 加载角色数据：${characters.length} 个`);

// 本地存储键
const STORAGE_KEYS = {
  OWNED_CHARACTERS: 'azur_lane_owned_characters',
  FLEETS: 'azur_lane_fleets',
};

/**
 * 数据管理器
 */
export const dataManager = {
  /**
   * 获取所有角色（完整数据库）
   */
  getAllCharacters(): Character[] {
    return characters;
  },

  /**
   * 获取角色列表（兼容旧接口）
   */
  getCharacters(): Character[] {
    return characters;
  },

  /**
   * 根据 ID 获取角色
   */
  getCharacterById(id: string): Character | undefined {
    return characters.find(c => c.id === id);
  },

  /**
   * 获取已拥有的角色 IDs
   */
  getOwnedCharacterIds(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OWNED_CHARACTERS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * 添加角色到已拥有列表
   */
  addCharacter(character: Character): void {
    const owned = this.getOwnedCharacterIds();
    if (!owned.includes(character.id)) {
      owned.push(character.id);
      localStorage.setItem(STORAGE_KEYS.OWNED_CHARACTERS, JSON.stringify(owned));
    }
  },

  /**
   * 更新角色
   */
  updateCharacter(character: Character): void {
    // 在完整数据库中查找并更新（实际应用中可能需要后端）
    console.log('更新角色:', character);
  },

  /**
   * 删除角色
   */
  deleteCharacter(characterId: string): void {
    const owned = this.getOwnedCharacterIds();
    const filtered = owned.filter(id => id !== characterId);
    localStorage.setItem(STORAGE_KEYS.OWNED_CHARACTERS, JSON.stringify(filtered));
  },

  /**
   * 批量添加角色到已拥有列表
   * @param characterIds 角色 ID 数组
   * @returns 实际添加的数量
   */
  batchAddOwned(characterIds: string[]): number {
    const owned = this.getOwnedCharacterIds();
    let addedCount = 0;

    characterIds.forEach(id => {
      if (!owned.includes(id)) {
        owned.push(id);
        addedCount++;
      }
    });

    localStorage.setItem(STORAGE_KEYS.OWNED_CHARACTERS, JSON.stringify(owned));
    return addedCount;
  },

  /**
   * 批量移除已拥有角色
   * @param characterIds 角色 ID 数组
   */
  batchRemoveOwned(characterIds: string[]): void {
    const owned = this.getOwnedCharacterIds();
    const filtered = owned.filter(id => !characterIds.includes(id));
    localStorage.setItem(STORAGE_KEYS.OWNED_CHARACTERS, JSON.stringify(filtered));
  },

  /**
   * 导入角色数据
   */
  importCharacters(newCharacters: Character[]): void {
    const owned = this.getOwnedCharacterIds();
    const newIds = newCharacters.map(c => c.id).filter(id => !owned.includes(id));
    const updated = [...owned, ...newIds];
    localStorage.setItem(STORAGE_KEYS.OWNED_CHARACTERS, JSON.stringify(updated));
  },

  /**
   * 获取所有阵容
   */
  getFleets(): Fleet[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FLEETS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * 创建阵容
   */
  createFleet(name: string): Fleet {
    const fleets = this.getFleets();
    const newFleet: Fleet = {
      id: `fleet_${Date.now()}`,
      name,
      characters: Array(6).fill(null),
      createdAt: Date.now(),
    };
    fleets.push(newFleet);
    localStorage.setItem(STORAGE_KEYS.FLEETS, JSON.stringify(fleets));
    return newFleet;
  },

  /**
   * 更新阵容
   */
  updateFleet(fleet: Fleet): void {
    const fleets = this.getFleets();
    const index = fleets.findIndex(f => f.id === fleet.id);
    if (index !== -1) {
      fleets[index] = fleet;
      localStorage.setItem(STORAGE_KEYS.FLEETS, JSON.stringify(fleets));
    }
  },

  /**
   * 删除阵容
   */
  deleteFleet(fleetId: string): void {
    const fleets = this.getFleets();
    const filtered = fleets.filter(f => f.id !== fleetId);
    localStorage.setItem(STORAGE_KEYS.FLEETS, JSON.stringify(filtered));
  },

  /**
   * 导出阵容为 JSON
   */
  exportFleet(fleet: Fleet): string {
    return JSON.stringify(fleet, null, 2);
  },

  /**
   * 计算阵容战力
   */
  calculatePower(fleet: Fleet): number {
    let power = 0;
    fleet.characters.forEach(char => {
      if (char) {
        const stats = char.stats;
        // 使用更平衡的计算方式，避免数值过大
        power += (stats.hp * 0.5) + stats.fire + (stats.torpedo * 1.2) + (stats.aviation * 1.2) + (stats.reload * 0.8);
        power += char.rarity * 35; // 调整稀有度权重至更合理的水平
      }
    });
    return Math.round(power); // 返回整数
  },

  /**
   * 导出已拥有角色为 JSON 格式
   */
  exportOwnedCharacters(): string {
    const owned = this.getOwnedCharacterIds();
    return JSON.stringify(owned, null, 2);
  },

  /**
   * 从 JSON 字符串导入已拥有角色
   * @param json JSON 格式的角色 ID 数组字符串
   * @returns 成功导入的角色数量
   */
  importOwnedCharacters(json: string): number {
    try {
      const importedIds = JSON.parse(json);
      if (!Array.isArray(importedIds)) {
        throw new Error('导入数据格式错误：应为角色 ID 数组');
      }

      const validIds = importedIds.filter(id => typeof id === 'string');
      const existingIds = this.getOwnedCharacterIds();

      // 过滤掉已存在的角色ID
      const newIds = validIds.filter(id => !existingIds.includes(id));

      if (newIds.length > 0) {
        const updatedIds = [...existingIds, ...newIds];
        localStorage.setItem(STORAGE_KEYS.OWNED_CHARACTERS, JSON.stringify(updatedIds));
      }

      // 触发存储事件，通知其他组件更新
      window.dispatchEvent(new Event('storage'));

      return newIds.length;
    } catch (error) {
      console.error('导入已拥有角色失败:', error);
      throw new Error(`导入失败: ${(error as Error).message}`);
    }
  },

  /**
   * 推荐阵容
   */
  recommendFleet(_type?: string, _characters?: Character[]): any {
    // 简单的阵容推荐逻辑
    return {
      fleet: null,
      reason: '根据角色属性和技能推荐',
      power: 0,
    };
  },
};

export default dataManager;
