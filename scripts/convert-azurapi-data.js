#!/usr/bin/env node
/**
 * AzurAPI 数据转换脚本
 * 将 AzurAPI 的 ships.json 转换为本项目使用的格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 舰船类型映射 (AzurAPI -> 本项目)
const HULL_TYPE_MAP = {
  'Destroyer': '驱逐',
  'Light Cruiser': '轻巡',
  'Heavy Cruiser': '重巡',
  'Super Cruiser': '超巡',
  'Battlecruiser': '战巡',
  'Battleship': '战列',
  'Aircraft Carrier': '航母',
  'Light Aircraft Carrier': '轻母',
  'Submarine': '潜艇',
  'Submarine Carrier': '潜艇',
  'Repair Ship': '维修',
  'Transport Ship': '运输'
};

// 阵营映射 (AzurAPI -> 本项目)
const FACTION_MAP = {
  'Bilibili': 'META',
  'Eagle Union': '白鹰',
  'Royal Navy': '皇家',
  'Sakura Empire': '重樱',
  'Iron Blood': '铁血',
  'Dragon Empery': '东煌',
  'Iris Libre': '自由鸢尾',
  'Vichya Dominion': '维希教廷',
  'Northern Parliament': '北方联合',
  'Sardegna Empire': '撒丁帝国',
  'META': 'META'
};

// 稀有度映射
const RARITY_MAP = {
  'Common': 1,
  'Rare': 2,
  'Elite': 3,
  'Super Rare': 4,
  'Ultra Rare': 5,
  'Priority': 5,
  'Decisive': 6,
  'SSR': 6
};

// 装甲类型映射
const ARMOR_MAP = {
  'Light': '轻型',
  'Medium': '中型',
  'Heavy': '重型'
};

/**
 * 转换单个角色数据
 */
function convertCharacter(ship, index) {
  try {
    // 提取中文名（优先）和英文名
    const nameCn = ship.names?.cn || ship.names?.en || ship.id;
    const nameEn = ship.names?.en || ship.id;
    
    // 转换舰种
    const type = HULL_TYPE_MAP[ship.hullType] || '驱逐';
    
    // 转换阵营
    const faction = FACTION_MAP[ship.nationality] || '其他';
    
    // 转换稀有度
    const rarity = RARITY_MAP[ship.rarity] || 3;
    
    // 提取属性（使用 level100 数据）
    const stats100 = ship.stats?.level100 || ship.stats?.baseStats || {};
    const stats = {
      hp: parseInt(stats100.health) || 100,
      fire: parseInt(stats100.firepower) || 10,
      torpedo: parseInt(stats100.torpedo) || 0,
      aviation: parseInt(stats100.aviation) || 0,
      reload: parseInt(stats100.reload) || 50,
      armor: ARMOR_MAP[stats100.armor] || '轻型',
      speed: parseInt(stats100.speed) || 30,
      luck: parseInt(stats100.luck) || 50,
      antiAir: parseInt(stats100.antiair) || 30,
      detection: parseInt(stats100.accuracy) || 50
    };
    
    // 转换技能
    const skills = (ship.skills || []).map(skill => ({
      name: skill.names?.cn || skill.names?.en || '未知技能',
      description: skill.description || '',
      type: skill.description?.includes('Every') || skill.description?.includes('每') ? 'active' : 'passive',
      cooldown: extractCooldown(skill.description)
    }));
    
    // 转换装备槽
    const equipment = (ship.slots || []).map((slot, idx) => ({
      slot: idx + 1,
      type: slot.type || '未知',
      efficiency: Math.round((slot.maxEfficiency + slot.minEfficiency) / 2) || 100
    }));
    
    return {
      id: `azur_${String(index + 1).padStart(4, '0')}`,
      name: nameEn,
      nameCn: nameCn,
      rarity,
      type,
      faction,
      stats,
      skills,
      equipment,
      image: ship.thumbnail || undefined
    };
  } catch (error) {
    console.error(`转换失败 [${ship.id}]:`, error.message);
    return null;
  }
}

/**
 * 从技能描述提取冷却时间
 */
function extractCooldown(description) {
  if (!description) return undefined;
  
  // 匹配 "Every 15 (10) times" 或 "每 15(10) 秒"
  const match = description.match(/(?:Every|每)\s*(\d+)\s*[\(\(](\d+)[\)\)]/);
  if (match) {
    return parseInt(match[2]); // 返回满级冷却
  }
  
  // 匹配 "cooldown" 或 "冷却"
  const cooldownMatch = description.match(/(\d+)\s*(?:秒|s)/);
  if (cooldownMatch) {
    return parseInt(cooldownMatch[1]);
  }
  
  return undefined;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始转换 AzurAPI 数据...\n');
  
  // 读取 AzurAPI 数据
  const inputPath = path.join(__dirname, '../../public/data/ships.json');
  const outputPath = path.join(__dirname, '../../src/data/characters-azurapi.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error('❌ 错误：未找到 ships.json 文件');
    console.log('请先运行：curl -o public/data/ships.json https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json');
    process.exit(1);
  }
  
  console.log('📖 读取 ships.json...');
  const ships = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`✓ 读取到 ${ships.length} 个角色\n`);
  
  // 转换数据
  console.log('🔄 转换数据格式...');
  const characters = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < ships.length; i++) {
    const converted = convertCharacter(ships[i], i);
    if (converted) {
      characters.push(converted);
      successCount++;
    } else {
      failCount++;
    }
    
    if ((i + 1) % 100 === 0) {
      process.stdout.write(`\r已处理 ${i + 1}/${ships.length}...`);
    }
  }
  
  console.log(`\r✓ 转换完成：成功 ${successCount} 个，失败 ${failCount} 个\n`);
  
  // 保存结果
  console.log('💾 保存到文件...');
  fs.writeFileSync(outputPath, JSON.stringify(characters, null, 2), 'utf-8');
  console.log(`✓ 已保存到：${outputPath}`);
  
  // 统计信息
  const stats = {
    total: characters.length,
    byType: {},
    byFaction: {},
    byRarity: {}
  };
  
  characters.forEach(char => {
    stats.byType[char.type] = (stats.byType[char.type] || 0) + 1;
    stats.byFaction[char.faction] = (stats.byFaction[char.faction] || 0) + 1;
    stats.byRarity[char.rarity] = (stats.byRarity[char.rarity] || 0) + 1;
  });
  
  console.log('\n📊 数据统计:');
  console.log(`总角色数：${stats.total}`);
  console.log('\n按舰种分布:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('\n按阵营分布:');
  Object.entries(stats.byFaction).forEach(([faction, count]) => {
    console.log(`  ${faction}: ${count}`);
  });
  console.log('\n按稀有度分布:');
  Object.entries(stats.byRarity).forEach(([rarity, count]) => {
    console.log(`  ${'★'.repeat(rarity)}: ${count}`);
  });
  
  console.log('\n✅ 转换完成！');
}

main().catch(console.error);
