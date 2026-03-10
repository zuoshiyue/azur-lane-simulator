#!/usr/bin/env node
/**
 * 碧蓝航线 Wiki HTML 解析器
 * 从下载的 Wiki 图鉴页面提取全量角色数据
 *
 * 使用方法:
 * node scripts/parse-wiki-data.js
 */

import fs from 'fs';
import path from 'path';

// 稀有度映射
const RARITY_MAP = {
  '普通': 1,
  '稀有': 2,
  '精锐': 3,
  '超稀有': 4,
  '最高效率': 4,
  '决战方案': 5,
  '方案舰': 5,
  '最高方案': 5,
  '精英': 5,
  '传说': 6,
  '海上传奇': 6
};

// 阵营映射
const FACTION_MAP = {
  '白鹰': '白鹰',
  '皇家': '皇家',
  '重樱': '重樱',
  '铁血': '铁血',
  '东煌': '东煌',
  '自由鸢尾': '自由鸢尾',
  '维希教廷': '维希教廷',
  '北方联合': '北方联合',
  '撒丁帝国': '撒丁帝国',
  'META': 'META',
  '其他': '其他'
};

// 清理阵营名称
function cleanFaction(factionStr) {
  if (!factionStr) return '其他';
  // 移除括号内容
  let cleaned = factionStr.replace(/\(.*?\)/g, '').trim();
  // 处理逗号分隔的多个值，取第一个
  cleaned = cleaned.split(',')[0].trim();
  // 移除问号等无效字符
  cleaned = cleaned.replace(/[?*-]/g, '').trim();
  return FACTION_MAP[cleaned] || cleaned || '其他';
}

// 舰种映射
const SHIP_TYPE_MAP = {
  '驱逐': '驱逐',
  '轻巡': '轻巡',
  '重巡': '重巡',
  '超巡': '超巡',
  '战列': '战列',
  '战巡': '战巡',
  '航母': '航母',
  '轻母': '轻母',
  '轻航': '轻母',
  '潜艇': '潜艇',
  '潜母': '潜母',
  '潜航': '潜艇',
  '维修': '维修',
  '运输': '运输',
  '巡洋': '巡洋',
  '航战': '航战',
  '航巡': '巡洋',
  '重炮': '重炮',
  '风帆': '风帆',
  '风帆 S': '风帆',
  '风帆 V': '风帆',
  '风帆 M': '风帆'
};

// 清理舰种名称
function cleanShipType(typeStr) {
  if (!typeStr) return null;
  // 移除括号内容
  let cleaned = typeStr.replace(/\(.*?\)/g, '').trim();
  // 处理逗号分隔，取最后一个（通常是舰种）
  const parts = cleaned.split(',');
  cleaned = parts[parts.length - 1].trim();
  return cleaned;
}

// 位置映射
const POSITION_MAP = {
  '前排先锋': '先锋',
  '后排主力': '主力',
  '潜艇': '潜艇'
};

/**
 * 生成默认属性
 */
function generateDefaultStats(type, rarity) {
  const base = rarity * 100;
  const statsMap = {
    '驱逐': { hp: 300 + base, fire: 40, torpedo: 80, aviation: 0, reload: 60, armor: '轻型', speed: 45, luck: 40, antiAir: 50, detection: 50 },
    '轻巡': { hp: 500 + base, fire: 50, torpedo: 60, aviation: 0, reload: 55, armor: '轻型', speed: 40, luck: 40, antiAir: 55, detection: 55 },
    '重巡': { hp: 700 + base, fire: 65, torpedo: 50, aviation: 0, reload: 50, armor: '中型', speed: 35, luck: 40, antiAir: 60, detection: 50 },
    '超巡': { hp: 900 + base, fire: 75, torpedo: 45, aviation: 0, reload: 48, armor: '中型', speed: 33, luck: 40, antiAir: 65, detection: 50 },
    '战列': { hp: 1200 + base, fire: 90, torpedo: 0, aviation: 0, reload: 40, armor: '重型', speed: 28, luck: 40, antiAir: 70, detection: 45 },
    '战巡': { hp: 1000 + base, fire: 85, torpedo: 0, aviation: 0, reload: 42, armor: '中型', speed: 32, luck: 40, antiAir: 65, detection: 48 },
    '航母': { hp: 800 + base, fire: 40, torpedo: 0, aviation: 95, reload: 45, armor: '中型', speed: 30, luck: 40, antiAir: 75, detection: 55 },
    '轻母': { hp: 600 + base, fire: 35, torpedo: 0, aviation: 85, reload: 50, armor: '轻型', speed: 32, luck: 40, antiAir: 70, detection: 55 },
    '潜艇': { hp: 400 + base, fire: 30, torpedo: 90, aviation: 0, reload: 50, armor: '轻型', speed: 20, luck: 40, antiAir: 0, detection: 60 },
    '维修': { hp: 500 + base, fire: 30, torpedo: 0, aviation: 0, reload: 60, armor: '轻型', speed: 25, luck: 40, antiAir: 50, detection: 45 },
    '运输': { hp: 450 + base, fire: 25, torpedo: 20, aviation: 0, reload: 55, armor: '轻型', speed: 22, luck: 40, antiAir: 45, detection: 40 },
    '巡洋': { hp: 600 + base, fire: 55, torpedo: 40, aviation: 0, reload: 50, armor: '中型', speed: 35, luck: 40, antiAir: 55, detection: 50 },
    'META': { hp: 700 + base, fire: 70, torpedo: 50, aviation: 60, reload: 50, armor: '中型', speed: 35, luck: 50, antiAir: 65, detection: 55 },
    '潜母': { hp: 450 + base, fire: 35, torpedo: 85, aviation: 30, reload: 50, armor: '轻型', speed: 22, luck: 40, antiAir: 0, detection: 60 },
    '航战': { hp: 1100 + base, fire: 80, torpedo: 0, aviation: 50, reload: 40, armor: '重型', speed: 30, luck: 40, antiAir: 70, detection: 50 },
    '重炮': { hp: 800 + base, fire: 85, torpedo: 0, aviation: 0, reload: 45, armor: '中型', speed: 25, luck: 40, antiAir: 60, detection: 45 },
    '风帆': { hp: 500 + base, fire: 60, torpedo: 0, aviation: 0, reload: 50, armor: '中型', speed: 28, luck: 40, antiAir: 40, detection: 45 }
  };
  return statsMap[type] || statsMap['驱逐'];
}

/**
 * 生成默认装备
 */
function generateDefaultEquipment(type) {
  const equipmentMap = {
    '驱逐': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '鱼雷', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '轻巡': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '鱼雷', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '重巡': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '鱼雷', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '超巡': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '战列': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '战巡': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '航母': [
      { slot: 1, type: '轰炸机', efficiency: 100 },
      { slot: 2, type: '鱼雷机', efficiency: 100 },
      { slot: 3, type: '战斗机', efficiency: 100 }
    ],
    '轻母': [
      { slot: 1, type: '轰炸机', efficiency: 100 },
      { slot: 2, type: '鱼雷机', efficiency: 100 },
      { slot: 3, type: '战斗机', efficiency: 100 }
    ],
    '潜艇': [
      { slot: 1, type: '鱼雷', efficiency: 100 },
      { slot: 2, type: '鱼雷', efficiency: 100 },
      { slot: 3, type: '设备', efficiency: 100 }
    ],
    '维修': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '防空炮', efficiency: 100 },
      { slot: 3, type: '设备', efficiency: 100 }
    ],
    '运输': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '防空炮', efficiency: 100 },
      { slot: 3, type: '设备', efficiency: 100 }
    ],
    '巡洋': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '鱼雷', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    'META': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '潜母': [
      { slot: 1, type: '鱼雷', efficiency: 100 },
      { slot: 2, type: '鱼雷', efficiency: 100 },
      { slot: 3, type: '设备', efficiency: 100 }
    ],
    '航战': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '战斗机', efficiency: 100 }
    ],
    '重炮': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '防空炮', efficiency: 100 }
    ],
    '风帆': [
      { slot: 1, type: '主炮', efficiency: 100 },
      { slot: 2, type: '副炮', efficiency: 100 },
      { slot: 3, type: '设备', efficiency: 100 }
    ]
  };
  return equipmentMap[type] || equipmentMap['驱逐'];
}

/**
 * 从 HTML 提取角色名称和别称
 * 格式：<a href="..." title="长门">长门<br>鲨</a>
 * 头像：<img alt="长门头像.jpg" src=".../60px-长门头像.jpg">
 */
function extractCharacterName(html, cardHtml) {
  // 从卡片 HTML 中提取名称和别称
  const nameMatch = cardHtml.match(/title="([^"]+)">([^<]+)(<br>([^<]+))?/);
  if (nameMatch) {
    const formalName = nameMatch[2];
    const alias = nameMatch[4]; // 别称（如"鲨"）

    // 从头像 img 标签提取头像路径
    const imgMatch = cardHtml.match(/<img[^>]*alt="([^"]+头像\.jpg)"[^>]*src="([^"]+)"/);
    let avatar = null;
    if (imgMatch) {
      // 使用相对路径：avatars/xxx 头像.jpg
      const fileName = imgMatch[2].split('/').pop()?.replace('60px-', '') || imgMatch[1].replace('60px-', '');
      avatar = `avatars/${fileName}`;
    }

    return { name: formalName, alias: alias || null, avatar };
  }

  // 尝试从 img alt 提取
  const imgMatch = cardHtml.match(/alt="([^"]+\.jpg)"[^>]*>/);
  if (imgMatch) {
    return {
      name: imgMatch[1].replace('头像.jpg', '').replace('.jpg', ''),
      alias: null,
      avatar: null
    };
  }

  return { name: '', alias: null, avatar: null };
}

/**
 * 解析 HTML
 */
function parseHTML(htmlContent) {
  const characters = [];

  // 匹配角色卡片
  const cardRegex = /<div\s+class="jntj-1\s+divsort"\s+data-param0="([^"]*)"\s+data-param1="([^"]*)"\s+data-param2="([^"]*)"\s+data-param3="([^"]*)"\s+data-param4="([^"]*)"[^>]*>(.*?)<span\s+class="jntj-4"[^>]*>.*?<\/span>\s*<\/div>/gs;

  let match;
  let id = 1;

  while ((match = cardRegex.exec(htmlContent)) !== null) {
    const [, param0, param1, param2, param3, param4, cardBody] = match;

    // 解析 param1: "作战位置，，舰种" 或 "潜艇，风帆，XX"
    const parts = param1.split(',');
    let shipType;

    // 如果包含"风帆"，则第二个元素是舰种
    if (param1.includes('风帆')) {
      shipType = '风帆';
    } else {
      // 常规格式：取第三个元素（索引 2）
      shipType = cleanShipType(parts[2]);
    }

    // 提取名称、别称和头像
    const { name, alias, avatar } = extractCharacterName(htmlContent, match[0]);

    // 跳过空数据
    if (!name || !shipType) continue;

    // 标准化稀有度
    let rarityStr = param2.replace(/\(.*?\)/g, '').trim(); // 移除括号内容
    let rarityNum = RARITY_MAP[rarityStr] || 3;
    if (param2.includes('META')) rarityNum = 5;

    // 标准化阵营
    const faction = cleanFaction(param3);

    // 标准化舰种（风帆舰种在 SHIP_TYPE_MAP 中已映射为常规舰种）
    let type = SHIP_TYPE_MAP[shipType];

    // 如果还是没有映射的舰种，跳过
    if (!type) {
      console.log(`⚠️ 跳过未支持的舰种：${shipType} - ${name}`);
      continue;
    }

    // 构建别称数组
    const aliases = [];
    if (alias && alias !== name) {
      aliases.push(alias);
    }

    const character = {
      id: `char_${String(id).padStart(3, '0')}`,
      name: name,
      nameCn: name,
      rarity: rarityNum,
      type: type,
      faction: faction,
      stats: generateDefaultStats(type, rarityNum),
      skills: [],
      equipment: generateDefaultEquipment(type),
      aliases: aliases.length > 0 ? aliases : undefined,
      image: avatar || undefined
    };

    characters.push(character);
    id++;
  }

  return characters;
}

// 主函数
async function main() {
  console.log('🔍 开始解析碧蓝航线 Wiki HTML 文件...\n');

  // 查找 Wiki HTML 文件
  const dir = '/Users/lpf/Downloads';
  const files = fs.readdirSync(dir);
  const wikiFile = files.find(f => f.includes('舰娘图鉴') && f.endsWith('.html'));

  if (!wikiFile) {
    console.error('❌ 未找到舰娘图鉴 HTML 文件');
    process.exit(1);
  }

  const fullPath = path.join(dir, wikiFile);
  console.log(`📂 文件：${wikiFile}\n`);

  // 读取 HTML
  const html = fs.readFileSync(fullPath, 'utf8');
  console.log('📄 文件大小:', (html.length / 1024 / 1024).toFixed(2), 'MB');

  // 解析角色数据
  const characters = parseHTML(html);
  console.log(`\n✅ 成功解析 ${characters.length} 个角色\n`);

  // 统计信息
  const stats = {
    total: characters.length,
    byRarity: {},
    byFaction: {},
    byType: {}
  };

  characters.forEach(char => {
    stats.byRarity[char.rarity] = (stats.byRarity[char.rarity] || 0) + 1;
    stats.byFaction[char.faction] = (stats.byFaction[char.faction] || 0) + 1;
    stats.byType[char.type] = (stats.byType[char.type] || 0) + 1;
  });

  console.log('📊 稀有度分布:');
  Object.entries(stats.byRarity)
    .sort((a, b) => b[0] - a[0])
    .forEach(([rarity, count]) => {
      console.log(`   ${rarity}星：${count} 个`);
    });

  console.log('\n📊 阵营分布 (Top 10):');
  Object.entries(stats.byFaction)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([faction, count]) => {
      console.log(`   ${faction}: ${count} 个`);
    });

  console.log('\n📊 舰种分布:');
  Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 个`);
    });

  // 保存为 JSON 文件
  const outputPath = path.join(process.cwd(), 'src/data/characters-wiki.json');
  fs.writeFileSync(outputPath, JSON.stringify(characters, null, 2));
  console.log(`\n💾 数据已保存到：${outputPath}`);

  // 更新 public/data/characters.json
  const publicOutputPath = path.join(process.cwd(), 'public/data/characters.json');
  fs.writeFileSync(publicOutputPath, JSON.stringify(characters, null, 2));
  console.log(`💾 公开数据已更新：${publicOutputPath}`);

  // 复制头像文件
  console.log('\n📸 正在复制头像文件...');
  const wikiDir = path.dirname(fullPath);
  const filesDir = path.join(wikiDir, path.basename(wikiFile, '.html') + '_files');
  const avatarDestDir = path.join(process.cwd(), 'public', 'avatars');

  // 创建目标目录
  if (!fs.existsSync(avatarDestDir)) {
    fs.mkdirSync(avatarDestDir, { recursive: true });
  }

  // 复制头像文件
  let copiedCount = 0;
  const avatarFiles = fs.readdirSync(filesDir).filter(f => f.endsWith('头像.jpg'));
  avatarFiles.forEach(file => {
    const src = path.join(filesDir, file);
    // 移除 60px-前缀
    const destName = file.replace('60px-', '');
    const dest = path.join(avatarDestDir, destName);
    try {
      fs.copyFileSync(src, dest);
      copiedCount++;
    } catch (e) {
      // 忽略复制错误
    }
  });
  console.log(`✅ 已复制 ${copiedCount} 个头像文件到：public/avatars/`);

  // 询问是否更新 dataManager.ts
  console.log('\n✅ 解析完成！');
  console.log('\n⚠️  需要手动更新 src/data/dataManager.ts 将导入改为:');
  console.log('   import charactersData from "./characters-wiki.json";');
}

main();
