/**
 * 本地全量角色数据库管理
 * 数据来源：B 站碧蓝航线 Wiki (https://wiki.biligame.com/blhx/)
 * 最后更新：2026-03-08
 */

import charactersData from '../data/characters-full.json';
import { Character } from '../types';

// 类型转换 - 新爬虫直接导出数组
const characters: Character[] = Array.isArray(charactersData) ? charactersData : (charactersData as any).characters || [];

/**
 * 角色数据库管理器
 */
export const characterDatabase = {
  /**
   * 获取所有角色
   */
  getAllCharacters(): Character[] {
    return characters;
  },

  /**
   * 根据 ID 获取角色
   */
  getCharacterById(id: string): Character | undefined {
    return characters.find(char => char.id === id);
  },

  /**
   * 根据名称搜索角色（支持中文名和英文名）
   */
  searchByName(query: string): Character[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return characters.filter(char => 
      char.nameCn.includes(query) ||
      char.name.toLowerCase().includes(normalizedQuery) ||
      char.name.toLowerCase().includes(normalizedQuery.replace(/\s+/g, ''))
    );
  },

  /**
   * 根据阵营筛选
   */
  getByFaction(faction: string): Character[] {
    if (faction === '全部' || !faction) return characters;
    return characters.filter(char => char.faction === faction);
  },

  /**
   * 根据舰种筛选
   */
  getByType(type: string): Character[] {
    if (type === '全部' || !type) return characters;
    return characters.filter(char => char.type === type);
  },

  /**
   * 根据稀有度筛选
   */
  getByRarity(rarity: number): Character[] {
    return characters.filter(char => char.rarity === rarity);
  },

  /**
   * 高级搜索（多条件）
   */
  search(options: {
    query?: string;
    faction?: string;
    type?: string;
    rarity?: number;
  }): Character[] {
    return characters.filter(char => {
      // 名称搜索
      if (options.query) {
        const normalizedQuery = options.query.toLowerCase().trim();
        const matchName = 
          char.nameCn.includes(options.query) ||
          char.name.toLowerCase().includes(normalizedQuery) ||
          char.name.toLowerCase().includes(normalizedQuery.replace(/\s+/g, ''));
        if (!matchName) return false;
      }
      
      // 阵营筛选
      if (options.faction && options.faction !== '全部' && char.faction !== options.faction) {
        return false;
      }
      
      // 舰种筛选
      if (options.type && options.type !== '全部' && char.type !== options.type) {
        return false;
      }
      
      // 稀有度筛选
      if (options.rarity && char.rarity !== options.rarity) {
        return false;
      }
      
      return true;
    });
  },

  /**
   * 获取所有阵营
   */
  getAllFactions(): string[] {
    return Array.from(new Set(characters.map(char => char.faction))).sort();
  },

  /**
   * 获取所有舰种
   */
  getAllTypes(): string[] {
    return Array.from(new Set(characters.map(char => char.type))).sort();
  },

  /**
   * 获取统计数据
   */
  getStatistics() {
    const stats = {
      total: characters.length,
      byFaction: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byRarity: {} as Record<string, number>,
    };

    characters.forEach(char => {
      stats.byFaction[char.faction] = (stats.byFaction[char.faction] || 0) + 1;
      stats.byType[char.type] = (stats.byType[char.type] || 0) + 1;
      stats.byRarity[char.rarity] = (stats.byRarity[char.rarity] || 0) + 1;
    });

    return stats;
  },

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, limit: number = 10): string[] {
    if (!query.trim()) return [];
    
    const matches = this.searchByName(query);
    return matches.slice(0, limit).map(char => char.nameCn);
  },
};

// 导出数据库版本信息
export const databaseVersion = (charactersData as any).version;
export const databaseUpdatedAt = (charactersData as any).updatedAt;
