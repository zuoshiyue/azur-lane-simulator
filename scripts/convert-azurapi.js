#!/usr/bin/env node
/**
 * AzurAPI 数据转换器
 * 将 AzurAPI 的 ships.json 格式转换为项目使用的格式
 * 
 * 使用方法:
 * 1. 下载 AzurAPI 数据：curl -o ships-raw.json https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json
 * 2. 运行转换：node scripts/convert-azurapi.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const AZURAPI_FILE = path.join(PROJECT_ROOT, 'public/data/ships-raw.json');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'public/data/characters.json');

// 阵营映射
const FACTION_MAP = {
  'Eagle Union': '白鹰',
  'Royal Navy': '皇家',
  'Sakura Empire': '重樱',
  'Iron Blood': '铁血',
  'Dragon Empery': '东煌',
  'Sardegna Empire': '撒丁帝国',
  'Iris Libre': '自由鸢尾',
  'Vichya Dominion': '维希教廷',
  'Northern Parliament': '北方联合',
  'META': 'META'
};

// 舰种映射
const TYPE_MAP = {
  'Destroyer': '驱逐',
  'Light Cruiser': '轻巡',
  'Heavy Cruiser': '重巡',
  'Super Cruiser': '超巡',
  'Battlecruiser': '战巡',
  'Battleship': '战列',
  'Aircraft Carrier': '航母',
  'Light Aircraft Carrier': '轻母',
  'Submarine': '潜艇'
};

// 稀有度映射
const RARITY_MAP = {
  1: 2, // 白 -> 蓝
  2: 3, // 蓝 -> 绿
  3: 4, // 紫 -> 紫
  4: 5, // 金 -> 金
  5: 6  // 彩 -> 彩
};

/**
 * 转换单个舰船数据
 */
function convertShip(ship, index) {
  return {
    id: `char_${String(index + 1).padStart(3, '0')}`,
    name: ship.name || ship.names?.cn || ship.names?.en || 'Unknown',
    nameCn: ship.names?.cn || ship.name || 'Unknown',
    nameEn: ship.names?.en || ship.name || 'Unknown',
    nameJp: ship.names?.jp || ship.name || 'Unknown',
    faction: FACTION_MAP[ship.faction] || ship.faction || '其他',
    type: TYPE_MAP[ship.type] || ship.type || '未知',
    rarity: RARITY_MAP[ship.rarity] || 3,
    stats: {
      hp: ship.stats?.hp?.max || ship.stats?.hp?.base || 0,
      fire: ship.stats?.firepower?.max || ship.stats?.firepower?.base || 0,
      torpedo: ship.stats?.torpedo?.max || ship.stats?.torpedo?.base || 0,
      aviation: ship.stats?.aviation?.max || ship.stats?.aviation?.base || 0,
      reload: ship.stats?.reload?.max || ship.stats?.reload?.base || 0,
      armor: ship.stats?.armor || '中型',
      speed: ship.stats?.speed || 30,
      luck: ship.stats?.luck || 50,
      antiAir: ship.stats?.antiair?.max || ship.stats?.antiair?.base || 0,
      detection: ship.stats?.detection?.max || ship.stats?.detection?.base || 0
    },
    skills: (ship.skills || []).map((skill, i) => ({
      id: `skill_${i + 1}`,
      name: skill.name || `技能${i + 1}`,
      description: skill.description || '',
      type: 'passive'
    })),
    equipment: (ship.equipment || []).map((eq, i) => ({
      slot: i + 1,
      type: eq.type || '未知',
      efficiency: eq.efficiency || 100
    })),
    // 可选字段
    portraits: ship.portraits || [],
    skins: ship.skins || [],
    voiceLines: ship.voiceLines || [],
    buildTime: ship.buildTime || null,
    dropLocations: ship.dropLocations || [],
    retrofit: ship.retrofit || null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * 主转换函数
 */
async function convert() {
  console.log('🔄 AzurAPI 数据转换器');
  console.log('📥 输入文件:', AZURAPI_FILE);
  console.log('📤 输出文件:', OUTPUT_FILE);
  console.log('');
  
  // 检查输入文件
  if (!fs.existsSync(AZURAPI_FILE)) {
    console.error('❌ 错误：未找到 AzurAPI 数据文件');
    console.log('请先下载数据：curl -o public/data/ships-raw.json https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json');
    return;
  }
  
  // 读取数据
  console.log('📖 读取 AzurAPI 数据...');
  const rawData = JSON.parse(fs.readFileSync(AZURAPI_FILE, 'utf-8'));
  
  // AzurAPI 数据可能是数组或对象
  const shipsArray = Array.isArray(rawData) ? rawData : Object.values(rawData);
  
  console.log(`📊 原始数据：${shipsArray.length} 个舰船`);
  
  // 转换数据
  console.log('🔄 转换数据格式...');
  const convertedShips = shipsArray.map((ship, index) => convertShip(ship, index));
  
  // 保存数据
  console.log('💾 保存数据...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(convertedShips, null, 2), 'utf-8');
  
  const fileSize = fs.statSync(OUTPUT_FILE).size;
  console.log(`✅ 转换完成！`);
  console.log(`📦 输出文件：${OUTPUT_FILE}`);
  console.log(`📊 角色数量：${convertedShips.length}`);
  console.log(`📦 文件大小：${(fileSize / 1024).toFixed(2)} KB`);
  
  // 统计
  const stats = {
    byFaction: {},
    byType: {}
  };
  
  convertedShips.forEach(ship => {
    stats.byFaction[ship.faction] = (stats.byFaction[ship.faction] || 0) + 1;
    stats.byType[ship.type] = (stats.byType[ship.type] || 0) + 1;
  });
  
  console.log('\n📊 统计:');
  console.log('  按阵营:');
  Object.entries(stats.byFaction).forEach(([faction, count]) => {
    console.log(`    ${faction}: ${count} 个`);
  });
  
  return { total: convertedShips.length, file: OUTPUT_FILE };
}

// 执行
convert().catch(console.error);
