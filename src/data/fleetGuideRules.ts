/**
 * 碧蓝航线编队攻略规则
 * 数据来源：B 站碧蓝航线 WIKI - 28 法则下的碧蓝航线攻略执行篇
 * URL: https://wiki.biligame.com/blhx/
 */

// 前排位置规则
export const FRONT_ROW_POSITIONS = {
  '1': {
    name: '承伤位',
    description: '最肉的承伤船，承受主要伤害',
    priority: ['重巡', '超巡', '驱逐'] // 肉度优先级
  },
  '2': {
    name: '保护位',
    description: '相对最脆的辅助船',
    priority: ['维修', '运输', '轻巡'] // 辅助优先级
  },
  '3': {
    name: '副承伤位',
    description: '肉度、辅助居中的船',
    priority: ['轻巡', '驱逐', '重巡'] // 平衡优先级
  }
};

// 主力位置规则
export const BACK_ROW_POSITIONS = {
  'flagship': {
    name: '旗舰位',
    description: '主要输出核心',
    priority: ['战列', '战巡']
  },
  'upper': {
    name: '上僚舰',
    description: '副输出/辅助',
    priority: ['航母', '轻母']
  },
  'lower': {
    name: '下僚舰',
    description: '副输出/辅助',
    priority: ['航母', '轻母', '维修']
  }
};

// 关卡推荐配队模板
export const STAGE_TEAM_TEMPLATES: Record<string, {
  name: string;
  backRow: string[];
  frontRow: string[];
  description: string;
}> = {
  '13-13道中': {
    name: '13 图道中队',
    backRow: ['航母', '航母', '航母'], // 至少 1 个奶航母
    frontRow: ['重巡', '轻巡', '驱逐'], // 防空中高的前排
    description: '3 航母 +3 防空前排，快速清理道中'
  },
  '13-13boss': {
    name: '13 图 boss 队',
    backRow: ['战列', '航母', '航母'],
    frontRow: ['重巡', '任意', '任意'], // 柴郡/圣地亚哥优先
    description: '1 战列 +2 航母 + 功能性前排'
  },
  '14 图道中': {
    name: '14 图道中队',
    backRow: ['战列', '奶航母', '奶航母'],
    frontRow: ['重巡', '轻巡', '驱逐'],
    description: '1 战列 +2 奶航母 +3 前排'
  },
  '14 图 boss': {
    name: '14 图 boss 队',
    backRow: ['战列', '战列', '航母'],
    frontRow: ['重巡', '超巡', '轻巡'],
    description: '2 战列 +1 航母 +3 前排'
  },
  '大世界道中': {
    name: '大世界道中队',
    backRow: ['奶航母', '奶航母', '任意'],
    frontRow: ['任意', '任意', '任意'], // 练级位
    description: '独角兽改 + 另一预装填航母 +4 练级位'
  },
  '大世界航母队': {
    name: '大世界航母队',
    backRow: ['航母', '航母', '航母'],
    frontRow: ['重巡', '空袭引导', '海妈'],
    description: '前排肉 + 空袭引导/海妈 + 天狼星'
  },
  '大世界战列队': {
    name: '大世界战列队',
    backRow: ['战列', '战列', '战列'],
    frontRow: ['重巡', '超巡', '轻巡'],
    description: '三彩战列，彩船多了才有战斗力'
  }
};

// 低耗油队配置
export const LOW_OIL_TEAMS = {
  '5 油队': {
    name: '5 油队',
    oil: 5,
    backRow: ['白皮轻母 (100 级)'],
    frontRow: ['卡辛', '唐斯'],
    description: '最低油耗，适合刷图'
  },
  '6 油队': {
    name: '6 油队',
    oil: 6,
    backRow: ['黑暗界'],
    frontRow: ['卡辛', '唐斯'],
    description: '经典低耗配置'
  },
  '7 油队': {
    name: '7 油队',
    oil: 7,
    backRow: ['黑暗界'],
    frontRow: ['卡辛', '唐斯', '神风/旗风/追风'],
    description: '萌新推荐上限'
  }
};

// 低肝度配队原则
export const LOW_EFFORT_RULES = {
  '速刷原则': {
    description: '30s 内解决战斗',
    backRow: ['预装填航母', '预装填航母', '预装填航母'],
    frontRow: ['超巡', '驱逐', '轻巡'] // 虐菜强的
  },
  '推荐配置': {
    description: '天鹰 + 独角兽/英仙座 + 半预装填航母',
    backRow: ['天鹰', '独角兽', '独立/约克城 II'],
    frontRow: ['超巡', '驱逐', '轻巡']
  }
};

// 舰船强度评级（简化版，详细参考井号碧蓝榜合集）
export const SHIP_TIER_LIST: Record<string, {
  tier: 'S+' | 'S' | 'A' | 'B' | 'C';
  role: string;
  note: string;
}[]> = {
  // 主力舰（后排）
  '主力输出': [
    { tier: 'S+', role: '战列', note: '武藏、大和、新泽西' },
    { tier: 'S+', role: '航母', note: '信浓、白龙、翔鹤' },
    { tier: 'S', role: '战列', note: '俾斯麦、提尔比茨、胡滕' },
    { tier: 'S', role: '航母', note: '企业、约克城 II、半人马' },
    { tier: 'A', role: '战列', note: '威尔士亲王、厌战' },
    { tier: 'A', role: '航母', note: '光辉、独角兽、天鹰' }
  ],
  // 先锋舰（前排）
  '先锋承伤': [
    { tier: 'S+', role: '重巡', note: '吾妻、伊吹、柴郡' },
    { tier: 'S', role: '超巡', note: '斯托雷钦、喀琅施塔得' },
    { tier: 'S', role: '重巡', note: '欧根亲王、罗恩' },
    { tier: 'A', role: '轻巡', note: '海伦娜、圣地亚哥' },
    { tier: 'A', role: '驱逐', note: '岛风、夕立' }
  ],
  // 辅助舰
  '先锋辅助': [
    { tier: 'S+', role: '轻巡', note: '光辉 (奶)、独角兽 (奶)' },
    { tier: 'S', role: '轻巡', note: '天狼星、海妈' },
    { tier: 'S', role: '维修', note: '自由女神、明石' },
    { tier: 'A', role: '驱逐', note: '拉菲、标枪' }
  ],
  // 潜艇
  '潜艇': [
    { tier: 'S+', role: '潜艇', note: 'U-47、U-81' },
    { tier: 'S', role: '潜艇', note: 'U-522、U-1206' },
    { tier: 'A', role: '潜艇', note: 'U-73、U-96' }
  ]
};

// 全系统提升幅度
export const SYSTEM_IMPROVEMENTS = {
  '时间积累': [
    { name: '升级和突破', ratio: '1000%', priority: 1 },
    { name: '装备系统', ratio: '150%', priority: 2 },
    { name: '潜艇系统', ratio: '100%', priority: 3 },
    { name: '指挥喵 (猫)', ratio: '20%', priority: 4 },
    { name: '兵装', ratio: '10%', priority: 5 }
  ],
  '瞬时提升': [
    { name: '装备 +13', ratio: '50%', priority: 1 },
    { name: '双联科技', ratio: '30%', priority: 2 },
    { name: '调速', ratio: '30%', priority: 3 }
  ]
};

// 装备选择规则
export const EQUIPMENT_RULES = {
  '主炮选择': {
    '驱逐': '小于 140mm 主炮优先',
    '轻巡': '大于等于 140mm 小于 200mm',
    '重巡': '200mm 以上',
    '战列': '主炮优先，最重要',
    '副炮': '驱逐炮 > 轻巡炮 > 重巡炮'
  },
  '优先级排序': [
    '战列炮',
    '潜艇雷',
    '飞机 (主输出)',
    '设备 (前排肉/后排输出)',
    '重巡炮',
    '驱逐炮',
    '轻巡炮',
    '鱼雷 (副输出)',
    '防空炮 (防空压力大时重要)'
  ]
};

// 推荐养成顺序
export const TRAINING_PRIORITY = {
  '科研船': {
    '四期': '埃吉尔满破优先',
    '五期': '普利茅斯最强',
    '六期': '中等优先级',
    '建议': '不做前三期，只做四期科研'
  },
  '强度判断': {
    '必练': 'S+ 级、认知觉醒榜前列',
    '可练': 'S 级、A 级',
    '参考': 'PVE 用舰船综合性能强度榜 T2 以上'
  }
};
