#!/usr/bin/env node
/**
 * 使用 web_fetch 获取的 AzurAPI 数据样本进行转换演示
 * 由于网络限制，使用预获取的数据样本
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// AzurAPI 数据样本（从 web_fetch 获取）
const azurApiSample = [
  {
    "wikiUrl":"https://azurlane.koumakan.jp/wiki/22",
    "id":"Collab021",
    "_gid":1020001,
    "names":{"cn":"22","code":"BILI 22","jp":"22","kr":"22","en":"22"},
    "nationality":"Bilibili",
    "hullType":"Destroyer",
    "thumbnail":"https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/skins/Collab021/thumbnail.png",
    "rarity":"Elite",
    "stars":5,
    "stats":{
      "baseStats":{"health":"230","armor":"Light","reload":"66","luck":"22","firepower":"10","torpedo":"38","evasion":"60","speed":"43","antiair":"28","aviation":"0","oilConsumption":"2","accuracy":"67","antisubmarineWarfare":"47"},
      "level100":{"health":"1288","armor":"Light","reload":"169","luck":"22","firepower":"51","torpedo":"193","evasion":"181","speed":"43","antiair":"136","aviation":"0","oilConsumption":"9","accuracy":"178","antisubmarineWarfare":"178"}
    },
    "slots":[{"maxEfficiency":135,"minEfficiency":115,"type":"DD Guns","max":1},{"maxEfficiency":115,"minEfficiency":110,"type":"Torpedoes","max":2},{"maxEfficiency":95,"minEfficiency":90,"type":"Anti-Air Guns","max":1}],
    "skills":[
      {"icon":"https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/skills/Collab021/bilibili_mascot_girl_22.png","names":{"en":"Bilibili Mascot Girl - 22","cn":"bili 看板娘"},"description":"When sortied as the Vanguard Fleet Leader (First Slot) and paired with 33, increase Firepower, Reload by 10% (30%) and Evasion by 15% (35%) for both 22 and 33.","color":"gold"},
      {"icon":"https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/skills/Collab021/all_out_assault.png","names":{"en":"All Out Assault","cn":"专属弹幕 -22"},"description":"Every 15 (10) times the main gun is fired, trigger All out Assault - 22 Class I (II)","color":"pink"}
    ]
  }
];

// 映射表
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

const RARITY_MAP = {
  'Common': 1,
  'Rare': 2,
  'Elite': 3,
  'Super Rare': 4,
  'Ultra Rare': 5,
  'Priority': 5,
  'Decisive': 6
};

const ARMOR_MAP = {
  'Light': '轻型',
  'Medium': '中型',
  'Heavy': '重型'
};

function convertCharacter(ship, index) {
  const nameCn = ship.names?.cn || ship.names?.en || ship.id;
  const nameEn = ship.names?.en || ship.id;
  const type = HULL_TYPE_MAP[ship.hullType] || '驱逐';
  const faction = FACTION_MAP[ship.nationality] || '其他';
  const rarity = RARITY_MAP[ship.rarity] || 3;
  
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
  
  const skills = (ship.skills || []).map(skill => {
    const desc = skill.description || '';
    const cooldownMatch = desc.match(/Every\s*(\d+)\s*\((\d+)\)/);
    const cooldown = cooldownMatch ? parseInt(cooldownMatch[2]) : undefined;
    
    return {
      name: skill.names?.cn || skill.names?.en || '未知技能',
      description: desc,
      type: desc.includes('Every') || desc.includes('每') ? 'active' : 'passive',
      cooldown
    };
  });
  
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
}

// 转换样本数据
console.log('转换 AzurAPI 样本数据...');
const converted = azurApiSample.map((ship, i) => convertCharacter(ship, i));
console.log('转换结果:', JSON.stringify(converted, null, 2));
console.log('\n✅ 样本转换成功！完整数据需要 ships.json 文件。');
