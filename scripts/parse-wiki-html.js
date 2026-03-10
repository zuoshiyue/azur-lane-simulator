#!/usr/bin/env node
/**
 * 碧蓝航线 Wiki HTML 解析器
 * 从下载的 Wiki 图鉴页面提取全量角色数据
 *
 * 使用方法:
 * node scripts/parse-wiki-html.js <html 文件路径>
 */

import fs from 'fs';
import path from 'path';

// 获取 HTML 文件路径
const htmlFilePath = process.argv[2] || '/Users/lpf/Downloads/碧蓝航线舰娘图鉴_全舰娘技能属性_立绘大全_碧蓝航线 Wiki.html';

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

// 阵营映射（标准化）
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
  '潜艇': '潜艇',
  '潜航': '潜艇',
  '维修': '维修',
  '运输': '运输',
  '巡洋': '巡洋'
};

/**
 * 从 HTML 提取角色数据
 */
function parseWikiHTML(htmlContent) {
  const characters = [];

  // 匹配角色卡片 div 的正则表达式
  // 格式：<div class="jntj-1 divsort" data-param0="..." data-param1="..." ...>
  const cardRegex = /<div\s+class="jntj-1\s+divsort"[^>]*data-param0="([^"]*)"[^>]*data-param1="([^"]*)"[^>]*data-param2="([^"]*)"[^>]*data-param3="([^"]*)"[^>]*data-param4="([^"]*)"[^>]*>.*?<span\s+class="jntj-4"[^>]*>.*?<a\s+href="[^"]*"\s+title="([^"]+)">/gs;

  let match;
  let id = 1;

  while ((match = cardRegex.exec(htmlContent)) !== null) {
    const [, param0, param1, param2, param3, param4, name] = match;

    // 解析 param1: "作战位置，，舰种"
    const [position, , shipType] = param1.split(',');

    // 跳过 META 和空数据
    if (!name || !shipType) continue;

    // 标准化稀有度
    let rarityNum = RARITY_MAP[param2] || 3;
    if (param2.includes('META')) rarityNum = 5;

    // 标准化阵营
    const faction = FACTION_MAP[param3] || param3 || '其他';

    // 标准化舰种
    const type = SHIP_TYPE_MAP[shipType] || shipType;

    // 跳出不支持的舰种
    if (!type) continue;

    const character = {
      id: `char_${String(id).padStart(3, '0')}`,
      name: name, // 中文名作为 name
      nameCn: name,
      rarity: rarityNum,
      type: type,
      faction: faction,
      stats: generateDefaultStats(type, rarityNum),
      skills: [],
      equipment: generateDefaultEquipment(type)
    };

    characters.push(character);
    id++;
  }

  return characters;
}

/**
 * 生成默认属性（根据舰种和稀有度）
 */
function generateDefaultStats(type, rarity) {
  const base = rarity * 100;

  const statsMap = {
    '驱逐': { hp: 300 + base, fire: 40, torpedo: 80, aviation: 0, reload: 60, armor: '轻型', speed: 45, luck: 40, antiAir: 50, detection: 50 },
    '轻巡': { hp: 500 + base, fire: 50, torpedo: 60, aviation: 0, reload: 55, armor: '轻型', speed: 40, luck: 40, antiAir: 55, detection: 55 },
    '重巡': { hp: 700 + base, fire: 65, torpedo: 50, aviation: 0, reload: 50, armor: '中型', speed: 35, luck: 40, antiAir: 60, detection: 50 },
    '超巡': { hp: 900 + base, fire: 75, torpedo: 45, aviation: 0, reload: 48, armor: '中型', speed: 33, luck: 40, antiAir: 65, detection: 50 },
    '战列': { hp: 1200 + base, fire: 90, torpedo: 0, aviation: 0, reload: 40, armor: '重型', speed: 28, luck: 40, antiAir: 70, detection: 45 },
    '战巡': { hp: 1000 + base, fire: 85, torpedo: 0, aviation: 0, reload: 42, armor: '中型', speed: 32, luck: 40, autoAir: 65, detection: 48 },
    '航母': { hp: 800 + base, fire: 40, torpedo: 0, aviation: 95, reload: 45, armor: '中型', speed: 30, luck: 40, antiAir: 75, detection: 55 },
    '轻母': { hp: 600 + base, fire: 35, torpedo: 0, aviation: 85, reload: 50, armor: '轻型', speed: 32, luck: 40, antiAir: 70, detection: 55 },
    '潜艇': { hp: 400 + base, fire: 30, torpedo: 90, aviation: 0, reload: 50, armor: '轻型', speed: 20, luck: 40, antiAir: 0, detection: 60 },
    '维修': { hp: 500 + base, fire: 30, torpedo: 0, aviation: 0, reload: 60, armor: '轻型', speed: 25, luck: 40, antiAir: 50, detection: 45 },
    '运输': { hp: 450 + base, fire: 25, torpedo: 20, aviation: 0, reload: 55, armor: '轻型', speed: 22, luck: 40, antiAir: 45, detection: 40 },
    '巡洋': { hp: 600 + base, fire: 55, torpedo: 40, aviation: 0, reload: 50, armor: '中型', speed: 35, luck: 40, antiAir: 55, detection: 50 },
    'META': { hp: 700 + base, fire: 70, torpedo: 50, aviation: 60, reload: 50, armor: '中型', speed: 35, luck: 50, antiAir: 65, detection: 55 }
  };

  return statsMap[type] || statsMap['驱逐'];
}

/**
 * 生成默认装备配置
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
    ]
  };

  return equipmentMap[type] || equipmentMap['驱逐'];
}

// 主函数
async function main() {
  console.log('🔍 开始解析碧蓝航线 Wiki HTML 文件...\n');
  console.log(`📂 文件路径：${htmlFilePath}\n`);

  // 读取 HTML 文件
  let htmlContent;
  try {
    htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  } catch (error) {
    console.error(`❌ 读取文件失败：${error.message}`);
    console.log('\n使用方法：node scripts/parse-wiki-html.js <html 文件路径>');
    process.exit(1);
  }

  // 解析角色数据
  const characters = parseWikiHTML(htmlContent);

  console.log(`✅ 成功解析 ${characters.length} 个角色\n`);

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
  Object.entries(stats.byRarity).sort((a, b) => b[0] - a[0]).forEach(([rarity, count]) => {
    console.log(`   ${rarity}星：${count} 个`);
  });

  console.log('\n📊 阵营分布:');
  Object.entries(stats.byFaction).sort((a, b) => b[1] - a[1]).forEach(([faction, count]) => {
    console.log(`   ${faction}: ${count} 个`);
  });

  console.log('\n📊 舰种分布:');
  Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} 个`);
  });

  // 保存为 JSON 文件
  const outputPath = path.join(process.cwd(), 'src/data/characters-wiki.json');
  fs.writeFileSync(outputPath, JSON.stringify(characters, null, 2));

  console.log(`\n💾 数据已保存到：${outputPath}`);

  // 同时更新 public/data/characters.json
  const publicOutputPath = path.join(process.cwd(), 'public/data/characters.json');
  fs.writeFileSync(publicOutputPath, JSON.stringify(characters, null, 2));

  console.log(`💾 公开数据已更新：${publicOutputPath}`);
}

main();
