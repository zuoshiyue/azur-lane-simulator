/**
 * 碧蓝航线 Wiki 数据爬虫
 * 目标：https://wiki.biligame.com/blhx/
 * 
 * 注意：实际使用时请遵守网站 robots.txt 和使用条款
 * 建议：优先使用官方 API 或手动整理数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟数据 - 实际项目中应替换为真实爬虫
const mockCharacters = [
  // 战列舰 (BB)
  {
    id: 'bb_001',
    name: '俾斯麦',
    nameEn: 'Bismarck',
    shipType: 'BB',
    shipTypeName: '战列舰',
    rarity: 'SSR',
    nation: '铁血的',
    stats: {
      hp: 1253,
      fire: 95,
      torpedo: 0,
      aviation: 0,
      reload: 52,
      armor: 'heavy',
      speed: 30,
      luck: 0,
      antiAir: 68,
      antiSub: 0
    },
    skills: [
      {
        name: '旗舰屏障',
        description: '自身受到致命伤害时，不会沉没，恢复最大血量 15% 的血量，每场战斗最多触发一次',
        cooldown: 0
      },
      {
        name: '高射炮指挥',
        description: '提高舰队中所有舰船的防空属性 10%',
        cooldown: 0
      }
    ],
    equipment: {
      main: ['双联装 380mm 主炮'],
      secondary: ['双联装 150mm 副炮'],
      antiAir: ['双联装 105mm 高射炮'],
      special: ['高性能火控雷达']
    },
    obtain: '建造',
    buildTime: '5:30:00'
  },
  {
    id: 'bb_002',
    name: '长门',
    nameEn: 'Nagato',
    shipType: 'BB',
    shipTypeName: '战列舰',
    rarity: 'SSR',
    nation: '重樱的',
    stats: {
      hp: 1138,
      fire: 102,
      torpedo: 0,
      aviation: 0,
      reload: 48,
      armor: 'heavy',
      speed: 25,
      luck: 0,
      antiAir: 65,
      antiSub: 0
    },
    skills: [
      {
        name: '炮击支援',
        description: '每 20 秒，有 30% 概率发动炮击支援，对敌方造成 150% 伤害',
        cooldown: 20
      }
    ],
    equipment: {
      main: ['三联装 410mm 主炮'],
      secondary: ['双联装 140mm 副炮'],
      antiAir: ['双联装 127mm 高射炮'],
      special: ['一式穿甲弹']
    },
    obtain: '建造',
    buildTime: '5:30:00'
  },
  // 航空母舰 (CV)
  {
    id: 'cv_001',
    name: '企业',
    nameEn: 'Enterprise',
    shipType: 'CV',
    shipTypeName: '航空母舰',
    rarity: 'SSR',
    nation: '白鹰的',
    stats: {
      hp: 1029,
      fire: 48,
      torpedo: 0,
      aviation: 125,
      reload: 55,
      armor: 'medium',
      speed: 33,
      luck: 0,
      antiAir: 85,
      antiSub: 0
    },
    skills: [
      {
        name: '航空先锋',
        description: '自身航空值提高 15%，舰载机起飞时间缩短 20%',
        cooldown: 0
      },
      {
        name: '命运之翼',
        description: '每 12 秒，有 40% 概率发动空袭，额外发射一轮舰载机',
        cooldown: 12
      }
    ],
    equipment: {
      main: ['F4F 野猫战斗机'],
      secondary: ['SBD 无畏俯冲轰炸机'],
      torpedo: ['TBF 复仇者鱼雷机'],
      special: ['舰载机液压弹射器']
    },
    obtain: '建造',
    buildTime: '4:20:00'
  },
  {
    id: 'cv_002',
    name: '赤城',
    nameEn: 'Akagi',
    shipType: 'CV',
    shipTypeName: '航空母舰',
    rarity: 'SSR',
    nation: '重樱的',
    stats: {
      hp: 968,
      fire: 45,
      torpedo: 0,
      aviation: 132,
      reload: 50,
      armor: 'medium',
      speed: 31,
      luck: 0,
      antiAir: 78,
      antiSub: 0
    },
    skills: [
      {
        name: '航空母舰赤城',
        description: '自身航空值提高 20%，但受到的伤害增加 10%',
        cooldown: 0
      }
    ],
    equipment: {
      main: ['零式舰战 21 型'],
      secondary: ['九九式舰爆'],
      torpedo: ['九七式舰攻'],
      special: ['航空甲板改装']
    },
    obtain: '建造',
    buildTime: '4:20:00'
  },
  // 驱逐 (DD)
  {
    id: 'dd_001',
    name: '拉菲',
    nameEn: 'Laffey',
    shipType: 'DD',
    shipTypeName: '驱逐舰',
    rarity: 'SSR',
    nation: '白鹰的',
    stats: {
      hp: 320,
      fire: 42,
      torpedo: 78,
      aviation: 0,
      reload: 75,
      armor: 'light',
      speed: 38,
      luck: 0,
      antiAir: 55,
      antiSub: 62
    },
    skills: [
      {
        name: '不屈的意志',
        description: '受到致命伤害时不会沉没，继续战斗 8 秒，每场战斗最多触发一次',
        cooldown: 0
      }
    ],
    equipment: {
      main: ['单装 127mm 主炮'],
      secondary: ['四联装 533mm 鱼雷'],
      antiAir: ['四联装 28mm 高射炮'],
      special: ['改进型锅炉']
    },
    obtain: '建造',
    buildTime: '0:27:00'
  },
  {
    id: 'dd_002',
    name: '岛风',
    nameEn: 'Shimakaze',
    shipType: 'DD',
    shipTypeName: '驱逐舰',
    rarity: 'SSR',
    nation: '重樱的',
    stats: {
      hp: 295,
      fire: 38,
      torpedo: 95,
      aviation: 0,
      reload: 72,
      armor: 'light',
      speed: 40,
      luck: 0,
      antiAir: 48,
      antiSub: 58
    },
    skills: [
      {
        name: '鱼雷全开',
        description: '鱼雷武器伤害提高 30%，装填时间缩短 20%',
        cooldown: 0
      }
    ],
    equipment: {
      main: ['单装 127mm 主炮'],
      secondary: ['五联装 610mm 鱼雷'],
      antiAir: ['双联装 25mm 高射炮'],
      special: ['强化型鱼雷发射管']
    },
    obtain: '建造',
    buildTime: '0:27:00'
  },
  // 轻巡 (CL)
  {
    id: 'cl_001',
    name: '贝尔法斯特',
    nameEn: 'Belfast',
    shipType: 'CL',
    shipTypeName: '轻巡洋舰',
    rarity: 'SSR',
    nation: '皇家女仆队的',
    stats: {
      hp: 589,
      fire: 52,
      torpedo: 65,
      aviation: 0,
      reload: 68,
      armor: 'medium',
      speed: 32,
      luck: 0,
      antiAir: 62,
      antiSub: 45
    },
    skills: [
      {
        name: '完美女仆',
        description: '每 20 秒，有 30% 概率发动支援，提高全队装填 10%',
        cooldown: 20
      }
    ],
    equipment: {
      main: ['三联装 152mm 主炮'],
      secondary: ['四联装 533mm 鱼雷'],
      antiAir: ['双联装 134mm 高射炮'],
      special: ['皇家女仆长徽章']
    },
    obtain: '建造',
    buildTime: '1:20:00'
  },
  // 重巡 (CA)
  {
    id: 'ca_001',
    name: '欧根亲王',
    nameEn: 'Prinz Eugen',
    shipType: 'CA',
    shipTypeName: '重巡洋舰',
    rarity: 'SSR',
    nation: '铁血的',
    stats: {
      hp: 725,
      fire: 68,
      torpedo: 55,
      aviation: 0,
      reload: 58,
      armor: 'medium',
      speed: 32,
      luck: 0,
      antiAir: 58,
      antiSub: 35
    },
    skills: [
      {
        name: '不沉的战舰',
        description: '受到致命伤害时不会沉没，继续战斗 10 秒，每场战斗最多触发一次',
        cooldown: 0
      }
    ],
    equipment: {
      main: ['三联装 203mm 主炮'],
      secondary: ['四联装 533mm 鱼雷'],
      antiAir: ['双联装 105mm 高射炮'],
      special: ['改进型火控']
    },
    obtain: '建造',
    buildTime: '1:20:00'
  },
  // 潜艇 (SS)
  {
    id: 'ss_001',
    name: 'U-47',
    nameEn: 'U-47',
    shipType: 'SS',
    shipTypeName: '潜艇',
    rarity: 'SR',
    nation: '铁血的',
    stats: {
      hp: 285,
      fire: 35,
      torpedo: 85,
      aviation: 0,
      reload: 45,
      armor: 'light',
      speed: 18,
      luck: 0,
      antiAir: 0,
      antiSub: 0
    },
    skills: [
      {
        name: '狼群战术',
        description: '鱼雷伤害提高 25%，对大型舰船额外造成 15% 伤害',
        cooldown: 0
      }
    ],
    equipment: {
      main: ['G7e 鱼雷'],
      secondary: ['G7a 鱼雷'],
      special: ['通气管']
    },
    obtain: '建造/活动',
    buildTime: '0:18:00'
  }
];

// 舰种类型映射
const shipTypeMap = {
  BB: '战列舰',
  BC: '战列巡洋舰',
  CA: '重巡洋舰',
  CV: '航空母舰',
  CVL: '轻型航空母舰',
  CL: '轻巡洋舰',
  DD: '驱逐舰',
  SS: '潜艇',
  SSV: '潜艇航母',
  BBV: '航空战列舰',
  AV: '水上飞机母舰',
  AR: '修理舰',
  AO: '补给舰',
  IX: '训练舰'
};

// 稀有度映射
const rarityMap = {
  SSR: 5,
  UR: 6,
  SR: 4,
  R: 3,
  N: 2
};

// 生成数据文件
function generateDataFiles() {
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  
  // 确保目录存在
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // 生成角色数据
  const charactersPath = path.join(dataDir, 'characters.json');
  fs.writeFileSync(charactersPath, JSON.stringify(mockCharacters, null, 2), 'utf-8');
  console.log(`✓ 生成角色数据：${charactersPath}`);
  
  // 生成舰种索引
  const shipTypeIndex = {};
  mockCharacters.forEach(char => {
    if (!shipTypeIndex[char.shipType]) {
      shipTypeIndex[char.shipType] = [];
    }
    shipTypeIndex[char.shipType].push(char.id);
  });
  
  const shipTypePath = path.join(dataDir, 'ship-types.json');
  fs.writeFileSync(shipTypePath, JSON.stringify({
    types: shipTypeMap,
    index: shipTypeIndex
  }, null, 2), 'utf-8');
  console.log(`✓ 生成舰种索引：${shipTypePath}`);
  
  // 生成稀有度数据
  const rarityPath = path.join(dataDir, 'rarities.json');
  fs.writeFileSync(rarityPath, JSON.stringify({
    levels: rarityMap,
    colors: {
      UR: '#ff00ff',
      SSR: '#ff6b35',
      SR: '#a855f7',
      R: '#3b82f6',
      N: '#6b7280'
    }
  }, null, 2), 'utf-8');
  console.log(`✓ 生成稀有度数据：${rarityPath}`);
  
  // 生成国家数据
  const nations = [...new Set(mockCharacters.map(c => c.nation))];
  const nationPath = path.join(dataDir, 'nations.json');
  fs.writeFileSync(nationPath, JSON.stringify({
    list: nations,
    index: nations.reduce((acc, n) => {
      acc[n] = mockCharacters.filter(c => c.nation === n).map(c => c.id);
      return acc;
    }, {})
  }, null, 2), 'utf-8');
  console.log(`✓ 生成国家数据：${nationPath}`);
  
  console.log('\n✅ 数据生成完成!');
  console.log(`共 ${mockCharacters.length} 个角色`);
  console.log(`舰种：${Object.keys(shipTypeIndex).length} 类`);
  console.log(`国家：${nations.length} 个`);
}

// 运行生成器
generateDataFiles();
