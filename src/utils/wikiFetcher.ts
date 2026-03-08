/**
 * 碧蓝航线 Wiki 数据爬虫工具
 * 从 B 站 Wiki 获取角色数据并转换为模拟器格式
 */

import { Character, ShipType } from '../types';

// 角色名称映射（中文名 -> Wiki 页面名）
const CHARACTER_PAGES: Record<string, string> = {
  '企业': '企业',
  '贝尔法斯特': '贝尔法斯特',
  '克利夫兰': '克利夫兰',
  '拉菲': '拉菲',
  '标枪': '标枪',
  '绫波': '绫波',
  'Z23': 'Z23',
  '赤城': '赤城',
  '加贺': '加贺',
  '欧根亲王': '欧根亲王',
  '俾斯麦': '俾斯麦',
  '提尔比茨': '提尔比茨',
  '大和': '大和',
  '武藏': '武藏',
  '长门': '长门',
  '陆奥': '陆奥',
  '翔鹤': '翔鹤',
  '瑞鹤': '瑞鹤',
  '大黄蜂': '大黄蜂',
  '约克城': '约克城',
  '萨拉托加': '萨拉托加',
  '列克星敦': '列克星敦 (CV-2)',
  '皇家方舟': '皇家方舟',
  '光荣': '光荣',
  '胡德': '胡德',
  '威尔士亲王': '威尔士亲王',
  '伊丽莎白女王': '伊丽莎白女王',
  '厌战': '厌战',
  '爱丁堡': '爱丁堡',
  '谢菲尔德': '谢菲尔德',
  '小天鹅': '小天鹅',
  '天后': '天后',
};

// 稀有度映射
const RARITY_MAP: Record<string, number> = {
  '★★★☆☆☆': 5,
  '★★★★☆☆': 6,
  '★★☆☆☆☆': 4,
  '★☆☆☆☆☆': 3,
  '★★★★★☆': 6,
  '★★★★★★': 6,
};

// 舰种映射
const SHIP_TYPE_MAP: Record<string, ShipType> = {
  '航母': '航母',
  '航空母舰': '航母',
  '轻母': '轻母',
  '轻型航母': '轻母',
  '战列': '战列',
  '战列舰': '战列',
  '战巡': '战巡',
  '巡洋战舰': '战巡',
  '重巡': '重巡',
  '重巡洋舰': '重巡',
  '超巡': '超巡',
  '大型巡洋舰': '超巡',
  '轻巡': '轻巡',
  '轻巡洋舰': '轻巡',
  '驱逐': '驱逐',
  '驱逐舰': '驱逐',
  '潜艇': '潜艇',
  '潜水艇': '潜艇',
  '潜航舰': '潜艇',
  '维修': '维修',
  '运输': '运输',
};

// 阵营映射
const FACTION_MAP: Record<string, string> = {
  '白鹰': '白鹰',
  '皇家': '皇家',
  '铁血': '铁血',
  '重樱': '重樱',
  '东煌': '东煌',
  '自由鸢尾': '自由鸢尾',
  '维希教廷': '维希教廷',
  '撒丁帝国': '撒丁帝国',
  '北方联合': '北方联合',
  '雄鹰联盟': '北方联合',
};

/**
 * 从 Wiki 页面文本中解析角色数据
 * @deprecated 当前使用本地模板库，Wiki 爬虫需要后端支持
 */
export function parseCharacterData(htmlText: string, characterName: string): Partial<Character> | null {
  try {
    // 提取基本信息
    const rarityMatch = htmlText.match(/稀有度\s*([^,\n]+)/);
    const typeMatch = htmlText.match(/类型\s*[^/]*\/blhx\/[^"]*([^"\n]+)/);
    const factionMatch = htmlText.match(/阵营\s*[^/]*\/blhx\/[^"]*([^"\n]+)/);

    // 提取属性数据
    const hpMatch = htmlText.match(/耐久\s*([\d→]+)\s*→\s*([\d]+)/);
    const armorMatch = htmlText.match(/装甲\s*(中型 | 轻型 | 重型)/);
    const reloadMatch = htmlText.match(/装填\s*([\d→]+)\s*→\s*([\d]+)/);
    const fireMatch = htmlText.match(/炮击\s*([\d→]+)\s*→\s*([\d]+)/);
    const torpedoMatch = htmlText.match(/雷击\s*([\d→]+)\s*→\s*([\d]+)/);
    const aviationMatch = htmlText.match(/航空\s*([\d→]+)\s*→\s*([\d]+)/);
    const speedMatch = htmlText.match(/航速\s*([\d]+)/);
    const luckMatch = htmlText.match(/幸运\s*([\d]+)/);
    const antiAirMatch = htmlText.match(/防空\s*([\d→]+)\s*→\s*([\d]+)/);
    const detectionMatch = htmlText.match(/命中\s*([\d→]+)\s*→\s*([\d]+)/);

    // 提取技能
    const skills: any[] = [];
    const skillSection = htmlText.match(/技能\s+([\s\S]+?)(?=立绘 | 配装 | 角色信息|$)/);
    if (skillSection) {
      const skillMatches = skillSection[1].matchAll(/(\S+)\s*\n\s*([\s\S]+?)(?=\n\s*\n|\n\s*\S+\s*\n|$)/g);
      for (const match of skillMatches) {
        if (match[1] && match[2]) {
          const skillName = match[1].trim();
          const skillDesc = match[2].trim().replace(/\n/g, ' ');
          if (skillName && skillDesc && skillName.length < 50) {
            const isCooldown = skillDesc.match(/(\d+)\s*秒/) || skillDesc.includes('CD') || skillDesc.includes('冷却');
            skills.push({
              name: skillName,
              description: skillDesc,
              type: isCooldown ? 'active' : 'passive',
              cooldown: isCooldown ? parseInt(skillDesc.match(/(\d+)/)?.[1] || '0') : undefined,
            });
          }
        }
      }
    }

    // 提取装备槽
    const equipment: any[] = [];
    const equipSection = htmlText.match(/满破装备\s+([\s\S]+?)(?=注 | 初始装备 | 装备说明)/);
    if (equipSection) {
      const lines = equipSection[1].split('\n').filter((line: string) => line.trim());
      let slotIndex = 1;
      for (const line of lines) {
        const slotMatch = line.match(/^(\d+)\s+(战斗机 | 轰炸机 | 鱼雷机 | 主炮 | 鱼雷 | 防空炮 | 设备 | 特殊兵装)/);
        if (slotMatch) {
          equipment.push({
            slot: slotIndex++,
            type: slotMatch[2],
            efficiency: 100,
          });
        }
      }
    }

    // 构建角色对象
    const rarityKey = rarityMatch?.[1]?.trim() || '';
    const typeKey = typeMatch?.[1]?.trim() || '';
    const factionKey = factionMatch?.[1]?.trim() || '';

    const character: Partial<Character> = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: characterName,
      nameCn: characterName,
      rarity: RARITY_MAP[rarityKey] || 4,
      type: SHIP_TYPE_MAP[typeKey] || '驱逐',
      faction: FACTION_MAP[factionKey] || '其他',
      stats: {
        hp: parseInt(hpMatch?.[2] || '500'),
        fire: parseInt(fireMatch?.[2] || '50'),
        torpedo: parseInt(torpedoMatch?.[2] || '0'),
        aviation: parseInt(aviationMatch?.[2] || '0'),
        reload: parseInt(reloadMatch?.[2] || '50'),
        armor: armorMatch?.[1] || '中型',
        speed: parseInt(speedMatch?.[1] || '30'),
        luck: parseInt(luckMatch?.[1] || '50'),
        antiAir: parseInt(antiAirMatch?.[2] || '50'),
        detection: parseInt(detectionMatch?.[2] || '50'),
      },
      skills: skills.length > 0 ? skills : [{
        name: '默认技能',
        description: '暂无技能数据',
        type: 'passive',
      }],
      equipment: equipment.length > 0 ? equipment : [
        { slot: 1, type: '主炮', efficiency: 100 },
        { slot: 2, type: '鱼雷', efficiency: 100 },
        { slot: 3, type: '防空炮', efficiency: 100 },
      ],
    };

    return character;
  } catch (error) {
    console.error('解析角色数据失败:', error);
    return null;
  }
}

/**
 * 从 Wiki 获取单个角色数据
 */
export async function fetchCharacterFromWiki(characterName: string): Promise<{ success: boolean; data?: Partial<Character>; error?: string; source: string }> {
  try {
    const pageName = CHARACTER_PAGES[characterName] || characterName;
    const url = `https://wiki.biligame.com/blhx/${encodeURIComponent(pageName)}`;
    
    console.log(`正在从 Wiki 获取角色数据：${characterName} (${url})`);
    
    // 注意：实际环境中需要使用后端代理或 web_fetch 工具
    // 这里返回一个示例实现
    throw new Error('Wiki 爬虫需要后端支持，当前使用本地模板库');
  } catch (error) {
    console.error('从 Wiki 获取角色数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      source: 'wiki',
    };
  }
}

/**
 * 批量获取角色数据
 */
export async function fetchCharactersFromWiki(characterNames: string[]): Promise<any[]> {
  const results = [];
  
  for (const name of characterNames) {
    const result = await fetchCharacterFromWiki(name);
    results.push(result);
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

/**
 * 搜索 Wiki 角色（简单实现）
 */
export async function searchWikiCharacters(query: string): Promise<{ success: boolean; data: any[] }> {
  // 简单实现：在预定义列表中搜索
  const matches = Object.keys(CHARACTER_PAGES).filter(name => 
    name.includes(query) || query.includes(name)
  );
  
  return {
    success: true,
    data: matches.map(name => ({
      name,
      pageName: CHARACTER_PAGES[name],
    })),
  };
}
