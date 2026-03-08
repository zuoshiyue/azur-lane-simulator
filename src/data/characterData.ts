import { Character, Fleet, FleetRecommendation, ShipType } from '../types';

// 碧蓝航线角色数据 - 来源于 B 站碧蓝航线 Wiki
const sampleCharacters: Character[] = [
  // === 白鹰阵营 ===
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
    id: 'char_007',
    name: 'Yorktown',
    nameCn: '约克城',
    rarity: 5,
    type: '航母',
    faction: '白鹰',
    stats: {
      hp: 1150,
      fire: 63,
      torpedo: 0,
      aviation: 93,
      reload: 52,
      armor: '中型',
      speed: 32,
      luck: 68,
      antiAir: 82,
      detection: 62
    },
    skills: [
      { name: '舰载机强化', description: '舰载机伤害提高 15%', type: 'passive' },
      { name: '空袭协调', description: '空袭冷却减少 10%', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 118 },
      { slot: 2, type: '轰炸机', efficiency: 113 },
      { slot: 3, type: '鱼雷机', efficiency: 108 }
    ]
  },
  {
    id: 'char_008',
    name: 'Washington',
    nameCn: '华盛顿',
    rarity: 5,
    type: '战列',
    faction: '白鹰',
    stats: {
      hp: 1550,
      fire: 98,
      torpedo: 0,
      aviation: 0,
      reload: 38,
      armor: '重型',
      speed: 28,
      luck: 62,
      antiAir: 88,
      detection: 52
    },
    skills: [
      { name: '主炮专家', description: '主炮伤害提高 18%', type: 'passive' },
      { name: '穿甲弹专精', description: '对重甲目标伤害提高 25%', type: 'active', cooldown: 25 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 145 },
      { slot: 2, type: '副炮', efficiency: 125 },
      { slot: 3, type: '防空炮', efficiency: 118 }
    ]
  },
  {
    id: 'char_009',
    name: 'North Carolina',
    nameCn: '北卡罗来纳',
    rarity: 5,
    type: '战列',
    faction: '白鹰',
    stats: {
      hp: 1500,
      fire: 96,
      torpedo: 0,
      aviation: 0,
      reload: 40,
      armor: '重型',
      speed: 27,
      luck: 60,
      antiAir: 86,
      detection: 50
    },
    skills: [
      { name: '火力覆盖', description: '主炮伤害提高 16%', type: 'passive' },
      { name: '防空强化', description: '防空值提高 20%', type: 'active', cooldown: 30 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 142 },
      { slot: 2, type: '副炮', efficiency: 122 },
      { slot: 3, type: '防空炮', efficiency: 116 }
    ]
  },
  {
    id: 'char_010',
    name: 'Cleveland',
    nameCn: '克利夫兰',
    rarity: 4,
    type: '轻巡',
    faction: '白鹰',
    stats: {
      hp: 750,
      fire: 58,
      torpedo: 55,
      aviation: 0,
      reload: 68,
      armor: '轻型',
      speed: 33,
      luck: 62,
      antiAir: 72,
      detection: 70
    },
    skills: [
      { name: '轻巡领航', description: '火力提高 12%', type: 'passive' },
      { name: '炮击支援', description: '主炮冷却减少', type: 'active', cooldown: 18 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 128 },
      { slot: 2, type: '鱼雷', efficiency: 118 },
      { slot: 3, type: '防空炮', efficiency: 108 }
    ]
  },
  {
    id: 'char_011',
    name: 'San Diego',
    nameCn: '圣地亚哥',
    rarity: 4,
    type: '轻巡',
    faction: '白鹰',
    stats: {
      hp: 780,
      fire: 52,
      torpedo: 50,
      aviation: 0,
      reload: 70,
      armor: '轻型',
      speed: 34,
      luck: 65,
      antiAir: 85,
      detection: 68
    },
    skills: [
      { name: '防空专精', description: '防空值提高 25%', type: 'passive' },
      { name: '防空掩护', description: '为舰队提供防空增益', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 125 },
      { slot: 2, type: '鱼雷', efficiency: 115 },
      { slot: 3, type: '防空炮', efficiency: 120 }
    ]
  },
  {
    id: 'char_012',
    name: 'Aylwin',
    nameCn: '艾尔温',
    rarity: 3,
    type: '驱逐',
    faction: '白鹰',
    stats: {
      hp: 380,
      fire: 32,
      torpedo: 70,
      aviation: 0,
      reload: 72,
      armor: '轻型',
      speed: 40,
      luck: 58,
      antiAir: 52,
      detection: 62
    },
    skills: [
      { name: '鱼雷连射', description: '鱼雷伤害提高 15%', type: 'passive' },
      { name: '烟雾弹', description: '生成烟雾屏障', type: 'active', cooldown: 15 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 108 },
      { slot: 2, type: '鱼雷', efficiency: 128 },
      { slot: 3, type: '防空炮', efficiency: 98 }
    ]
  },
  
  // === 皇家阵营 ===
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
    id: 'char_013',
    name: 'Queen Elizabeth',
    nameCn: '伊丽莎白女王',
    rarity: 5,
    type: '战列',
    faction: '皇家',
    stats: {
      hp: 1480,
      fire: 92,
      torpedo: 0,
      aviation: 0,
      reload: 42,
      armor: '重型',
      speed: 26,
      luck: 58,
      antiAir: 80,
      detection: 48
    },
    skills: [
      { name: '皇家荣耀', description: '皇家阵营角色火力提高 10%', type: 'passive' },
      { name: '主炮连射', description: '主炮冷却减少', type: 'active', cooldown: 25 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 138 },
      { slot: 2, type: '副炮', efficiency: 118 },
      { slot: 3, type: '防空炮', efficiency: 112 }
    ]
  },
  {
    id: 'char_014',
    name: 'Warspite',
    nameCn: '厌战',
    rarity: 5,
    type: '战列',
    faction: '皇家',
    stats: {
      hp: 1520,
      fire: 97,
      torpedo: 0,
      aviation: 0,
      reload: 39,
      armor: '重型',
      speed: 27,
      luck: 65,
      antiAir: 84,
      detection: 51
    },
    skills: [
      { name: '老女士的愤怒', description: '主炮伤害提高 20%', type: 'passive' },
      { name: '精准射击', description: '暴击率提高 15%', type: 'active', cooldown: 22 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 143 },
      { slot: 2, type: '副炮', efficiency: 123 },
      { slot: 3, type: '防空炮', efficiency: 117 }
    ]
  },
  {
    id: 'char_015',
    name: 'Hood',
    nameCn: '胡德',
    rarity: 5,
    type: '战巡',
    faction: '皇家',
    stats: {
      hp: 1350,
      fire: 88,
      torpedo: 0,
      aviation: 0,
      reload: 45,
      armor: '中型',
      speed: 30,
      luck: 62,
      antiAir: 78,
      detection: 55
    },
    skills: [
      { name: '皇家荣耀', description: '皇家阵营角色火力提高 8%', type: 'passive' },
      { name: '炮击支援', description: '主炮伤害提高 15%', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 135 },
      { slot: 2, type: '副炮', efficiency: 115 },
      { slot: 3, type: '防空炮', efficiency: 110 }
    ]
  },
  {
    id: 'char_016',
    name: 'Sheffield',
    nameCn: '谢菲尔德',
    rarity: 4,
    type: '轻巡',
    faction: '皇家',
    stats: {
      hp: 760,
      fire: 56,
      torpedo: 58,
      aviation: 0,
      reload: 66,
      armor: '轻型',
      speed: 32,
      luck: 63,
      antiAir: 68,
      detection: 72
    },
    skills: [
      { name: '忠誠女仆', description: '装填提高 8%', type: 'passive' },
      { name: '鱼雷连射', description: '鱼雷冷却减少', type: 'active', cooldown: 18 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 126 },
      { slot: 2, type: '鱼雷', efficiency: 116 },
      { slot: 3, type: '防空炮', efficiency: 106 }
    ]
  },
  {
    id: 'char_017',
    name: 'Edinburgh',
    nameCn: '爱丁堡',
    rarity: 4,
    type: '轻巡',
    faction: '皇家',
    stats: {
      hp: 770,
      fire: 57,
      torpedo: 59,
      aviation: 0,
      reload: 64,
      armor: '轻型',
      speed: 31,
      luck: 61,
      antiAir: 67,
      detection: 71
    },
    skills: [
      { name: '姐妹同心', description: '与谢菲尔德同队时火力提高', type: 'passive' },
      { name: '炮击强化', description: '主炮伤害提高 12%', type: 'active', cooldown: 18 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 127 },
      { slot: 2, type: '鱼雷', efficiency: 117 },
      { slot: 3, type: '防空炮', efficiency: 107 }
    ]
  },
  
  // === 重樱阵营 ===
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
  },
  {
    id: 'char_018',
    name: 'Yamato',
    nameCn: '大和',
    rarity: 6,
    type: '战列',
    faction: '重樱',
    stats: {
      hp: 1650,
      fire: 105,
      torpedo: 0,
      aviation: 0,
      reload: 36,
      armor: '重型',
      speed: 27,
      luck: 70,
      antiAir: 90,
      detection: 54
    },
    skills: [
      { name: '大舰巨炮', description: '主炮伤害提高 25%', type: 'passive' },
      { name: '主炮齐射', description: '主炮冷却大幅减少', type: 'active', cooldown: 30 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 150 },
      { slot: 2, type: '副炮', efficiency: 130 },
      { slot: 3, type: '防空炮', efficiency: 120 }
    ]
  },
  {
    id: 'char_019',
    name: 'Musashi',
    nameCn: '武藏',
    rarity: 6,
    type: '战列',
    faction: '重樱',
    stats: {
      hp: 1630,
      fire: 103,
      torpedo: 0,
      aviation: 0,
      reload: 37,
      armor: '重型',
      speed: 27,
      luck: 68,
      antiAir: 88,
      detection: 53
    },
    skills: [
      { name: '不沉战舰', description: '受到伤害减少 15%', type: 'passive' },
      { name: '主炮强化', description: '主炮伤害提高 22%', type: 'active', cooldown: 28 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 148 },
      { slot: 2, type: '副炮', efficiency: 128 },
      { slot: 3, type: '防空炮', efficiency: 118 }
    ]
  },
  {
    id: 'char_020',
    name: 'Shimakaze',
    nameCn: '岛风',
    rarity: 5,
    type: '驱逐',
    faction: '重樱',
    stats: {
      hp: 420,
      fire: 38,
      torpedo: 85,
      aviation: 0,
      reload: 75,
      armor: '轻型',
      speed: 42,
      luck: 65,
      antiAir: 58,
      detection: 68
    },
    skills: [
      { name: '鱼雷之王', description: '鱼雷伤害提高 30%', type: 'passive' },
      { name: '全弹发射', description: '鱼雷连射', type: 'active', cooldown: 12 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 112 },
      { slot: 2, type: '鱼雷', efficiency: 135 },
      { slot: 3, type: '防空炮', efficiency: 102 }
    ]
  },
  {
    id: 'char_021',
    name: 'Yukikaze',
    nameCn: '雪风',
    rarity: 5,
    type: '驱逐',
    faction: '重樱',
    stats: {
      hp: 410,
      fire: 36,
      torpedo: 80,
      aviation: 0,
      reload: 73,
      armor: '轻型',
      speed: 41,
      luck: 80,
      antiAir: 56,
      detection: 66
    },
    skills: [
      { name: '幸运 E', description: '闪避率提高 20%', type: 'passive' },
      { name: '鱼雷连射', description: '鱼雷冷却减少', type: 'active', cooldown: 14 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 110 },
      { slot: 2, type: '鱼雷', efficiency: 132 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ]
  },
  {
    id: 'char_022',
    name: 'Atago',
    nameCn: '爱宕',
    rarity: 5,
    type: '重巡',
    faction: '重樱',
    stats: {
      hp: 900,
      fire: 70,
      torpedo: 65,
      aviation: 0,
      reload: 60,
      armor: '中型',
      speed: 34,
      luck: 62,
      antiAir: 65,
      detection: 60
    },
    skills: [
      { name: '重巡领航', description: '重巡火力提高 12%', type: 'passive' },
      { name: '炮雷击战', description: '主炮和鱼雷伤害提高', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 132 },
      { slot: 2, type: '鱼雷', efficiency: 122 },
      { slot: 3, type: '防空炮', efficiency: 112 }
    ]
  },
  {
    id: 'char_023',
    name: 'Takao',
    nameCn: '高雄',
    rarity: 4,
    type: '重巡',
    faction: '重樱',
    stats: {
      hp: 870,
      fire: 68,
      torpedo: 63,
      aviation: 0,
      reload: 58,
      armor: '中型',
      speed: 33,
      luck: 60,
      antiAir: 63,
      detection: 58
    },
    skills: [
      { name: '炮击强化', description: '主炮伤害提高 10%', type: 'passive' },
      { name: '鱼雷连射', description: '鱼雷冷却减少', type: 'active', cooldown: 18 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 130 },
      { slot: 2, type: '鱼雷', efficiency: 120 },
      { slot: 3, type: '防空炮', efficiency: 110 }
    ]
  },
  
  // === 铁血阵营 ===
  {
    id: 'char_024',
    name: 'Bismarck',
    nameCn: '俾斯麦',
    rarity: 5,
    type: '战列',
    faction: '铁血',
    stats: {
      hp: 1530,
      fire: 99,
      torpedo: 0,
      aviation: 0,
      reload: 38,
      armor: '重型',
      speed: 29,
      luck: 64,
      antiAir: 87,
      detection: 52
    },
    skills: [
      { name: '铁血的荣耀', description: '主炮伤害提高 18%', type: 'passive' },
      { name: '主炮齐射', description: '主炮冷却减少', type: 'active', cooldown: 25 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 144 },
      { slot: 2, type: '副炮', efficiency: 124 },
      { slot: 3, type: '防空炮', efficiency: 118 }
    ]
  },
  {
    id: 'char_025',
    name: 'Tirpitz',
    nameCn: '提尔比茨',
    rarity: 5,
    type: '战列',
    faction: '铁血',
    stats: {
      hp: 1540,
      fire: 100,
      torpedo: 0,
      aviation: 0,
      reload: 37,
      armor: '重型',
      speed: 29,
      luck: 66,
      antiAir: 89,
      detection: 53
    },
    skills: [
      { name: '北方孤独女王', description: '主炮伤害提高 20%', type: 'passive' },
      { name: '穿甲弹专精', description: '对重甲伤害提高', type: 'active', cooldown: 26 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 146 },
      { slot: 2, type: '副炮', efficiency: 126 },
      { slot: 3, type: '防空炮', efficiency: 119 }
    ]
  },
  {
    id: 'char_026',
    name: 'Prinz Eugen',
    nameCn: '欧根亲王',
    rarity: 5,
    type: '重巡',
    faction: '铁血',
    stats: {
      hp: 920,
      fire: 72,
      torpedo: 68,
      aviation: 0,
      reload: 62,
      armor: '中型',
      speed: 35,
      luck: 68,
      antiAir: 68,
      detection: 62
    },
    skills: [
      { name: '幸运舰', description: '闪避率提高 15%', type: 'passive' },
      { name: '炮雷击强化', description: '主炮和鱼雷伤害提高', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '主炮', efficiency: 134 },
      { slot: 2, type: '鱼雷', efficiency: 124 },
      { slot: 3, type: '防空炮', efficiency: 114 }
    ]
  },
  {
    id: 'char_027',
    name: 'U-81',
    nameCn: 'U-81',
    rarity: 4,
    type: '潜艇',
    faction: '铁血',
    stats: {
      hp: 350,
      fire: 40,
      torpedo: 90,
      aviation: 0,
      reload: 55,
      armor: '轻型',
      speed: 20,
      luck: 62,
      antiAir: 30,
      detection: 70
    },
    skills: [
      { name: '狼群战术', description: '鱼雷伤害提高 25%', type: 'passive' },
      { name: '鱼雷连射', description: '鱼雷冷却减少', type: 'active', cooldown: 15 }
    ],
    equipment: [
      { slot: 1, type: '鱼雷', efficiency: 135 },
      { slot: 2, type: '鱼雷', efficiency: 135 },
      { slot: 3, type: '声呐', efficiency: 110 }
    ]
  },
  {
    id: 'char_028',
    name: 'Graf Zeppelin',
    nameCn: '齐柏林伯爵',
    rarity: 5,
    type: '航母',
    faction: '铁血',
    stats: {
      hp: 1120,
      fire: 64,
      torpedo: 0,
      aviation: 96,
      reload: 47,
      armor: '中型',
      speed: 32,
      luck: 59,
      antiAir: 76,
      detection: 57
    },
    skills: [
      { name: '航空舰队', description: '航空值提高 16%', type: 'passive' },
      { name: '空袭强化', description: '空袭伤害提高', type: 'active', cooldown: 20 }
    ],
    equipment: [
      { slot: 1, type: '战斗机', efficiency: 120 },
      { slot: 2, type: '轰炸机', efficiency: 116 },
      { slot: 3, type: '鱼雷机', efficiency: 110 }
    ]
  }
];

export class DataManager {
  private characters: Character[] = [];
  private fleets: Fleet[] = [];
  private allCharacters: Character[] = []; // 所有可用角色（包括从 Wiki 获取的）

  constructor() {
    this.loadFromStorage();
    if (this.characters.length === 0) {
      this.characters = sampleCharacters;
    }
    // 初始化所有角色
    this.allCharacters = [...sampleCharacters];
    this.loadAllCharactersFromStorage();
  }

  // 角色管理 - CRUD
  getCharacters(): Character[] {
    return this.characters;
  }

  getAllCharacters(): Character[] {
    return this.allCharacters;
  }

  getCharacterById(id: string): Character | undefined {
    return this.allCharacters.find(c => c.id === id);
  }

  // 增：添加单个角色
  addCharacter(character: Character): void {
    if (!this.allCharacters.find(c => c.id === character.id)) {
      this.allCharacters.push(character);
      this.saveAllCharactersToStorage();
    }
  }

  // 增：批量添加角色
  addCharacters(newCharacters: Character[]): void {
    newCharacters.forEach(char => {
      if (!this.allCharacters.find(c => c.id === char.id)) {
        this.allCharacters.push(char);
      }
    });
    this.saveAllCharactersToStorage();
  }

  // 获取已拥有角色 IDs（所有在 allCharacters 中的都算已拥有）
  getOwnedCharacterIds(): string[] {
    return this.allCharacters.map(c => c.id);
  }

  // 改：更新角色
  updateCharacter(character: Character): void {
    const index = this.allCharacters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      this.allCharacters[index] = character;
      this.saveAllCharactersToStorage();
    }
  }

  // 删：删除角色
  deleteCharacter(id: string): void {
    this.allCharacters = this.allCharacters.filter(c => c.id !== id);
    this.saveAllCharactersToStorage();
  }

  // 导入角色
  importCharacters(characters: Character[]): void {
    characters.forEach(char => {
      const existing = this.allCharacters.find(c => c.id === char.id);
      if (existing) {
        // 更新现有角色
        const index = this.allCharacters.findIndex(c => c.id === char.id);
        this.allCharacters[index] = char;
      } else {
        // 添加新角色
        this.allCharacters.push(char);
      }
    });
    this.saveAllCharactersToStorage();
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
  recommendFleet(mode: string, characters?: Character[]): FleetRecommendation[] {
    const recommendations: FleetRecommendation[] = [];
    const charList = characters || this.characters;
    
    // 简单推荐逻辑 - 按类型搭配
    const carriers = charList.filter(c => c.type === '航母');
    const battleships = charList.filter(c => c.type === '战列');
    const cruisers = charList.filter(c => c.type === '轻巡');
    const destroyers = charList.filter(c => c.type === '驱逐');

    if (carriers.length >= 2 && battleships.length >= 1 && cruisers.length >= 1 && destroyers.length >= 2) {
      const fleet: Fleet = {
        id: `fleet_rec_${Date.now()}`,
        name: `推荐阵容-${mode}`,
        characters: Array(6).fill(null),
        createdAt: Date.now()
      };
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

  // 本地存储 - 阵容
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

  // 本地存储 - 所有角色
  private saveAllCharactersToStorage(): void {
    try {
      localStorage.setItem('azur_all_characters', JSON.stringify(this.allCharacters));
    } catch (e) {
      console.error('保存失败:', e);
    }
  }

  private loadAllCharactersFromStorage(): void {
    try {
      const saved = localStorage.getItem('azur_all_characters');
      if (saved) {
        const loaded = JSON.parse(saved);
        // 合并加载的角色和示例角色
        loaded.forEach((char: Character) => {
          if (!this.allCharacters.find(c => c.id === char.id)) {
            this.allCharacters.push(char);
          }
        });
      }
    } catch (e) {
      console.error('加载失败:', e);
    }
  }
}

export const dataManager = new DataManager();
