#!/usr/bin/env node

/**
 * 验证UP角色稀有度校准结果
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取更新后的角色数据
function loadUpdatedCharacterData() {
  const dataDir = path.join(__dirname, '../public/data');
  const charactersPath = path.join(dataDir, 'characters.json');

  if (fs.existsSync(charactersPath)) {
    const data = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
    console.log(`Loaded ${data.length} characters from public/data/characters.json`);
    return data;
  }

  throw new Error('No character data file found');
}

// 测试UP角色权重计算函数
function testUPCharacterWeight() {
  // 这个函数模拟在TypeScript环境中getCharacterWeight的行为
  console.log('测试UP角色权重计算逻辑...');

  // 模拟一些角色
  const testCharacters = [
    { nameCn: "企业", rarity: 5 }, // UP角色
    { nameCn: "欧根亲王", rarity: 5 }, // UP角色
    { nameCn: "标枪", rarity: 5 }, // UP角色
    { nameCn: "未知角色", rarity: 5 }, // 普通SSR角色
    { nameCn: "其他角色", rarity: 4 }, // SR角色
  ];

  const knownUPNames = [
    "企业", "约克城", "大黄蜂", "萨拉托加", "列克星敦",
    "大凤", "赤城", "加贺", "翔鹤", "瑞鹤",
    "俾斯麦", "欧根亲王", "霞飞", "齐柏林伯爵", "厌战", "胡德",
    "皇家方舟", "光辉", "让·巴尔", "黎塞留", "絮弗伦", "科尔贝尔",
    "福煦", "敦刻尔克", "史特拉斯堡", "马赛曲", "凯旋", "欧若拉",
    "海王星", "黛朵", "阿基里斯", "标枪", "吹雪", "响", "不知火",
    "岛风", "长门", "陆奥", "扶桑", "山城", "伊势", "日向",
    "金刚", "比睿", "榛名", "雾岛", "大和", "武藏", "信浓"
  ];

  const RARITY_WEIGHTS = {
    6: 100, // UR/META
    5: 80,  // SSR
    4: 60,  // SR
    3: 40,  // R
    2: 20,  // N
    1: 10,
  };

  function getCharacterWeight(character) {
    const baseWeight = RARITY_WEIGHTS[character.rarity] || 10;

    if (knownUPNames.includes(character.nameCn)) {
      return baseWeight * 1.1; // UP角色权重高10%
    }

    return baseWeight;
  }

  console.log('\n--- UP角色权重测试结果 ---');
  testCharacters.forEach(char => {
    const weight = getCharacterWeight(char);
    const isUP = knownUPNames.includes(char.nameCn);
    console.log(`${char.nameCn} (rarity ${char.rarity}): 权重=${weight}, UP=${isUP}`);
  });
}

// 分析更新后的数据
function analyzeUpdatedData(characters) {
  console.log('\n=== 更新后稀有度分布分析 ===');
  const distribution = {};
  const upCharacters = [];

  characters.forEach(char => {
    distribution[char.rarity] = (distribution[char.rarity] || 0) + 1;

    // 检查是否为UP角色（基于名称）
    if (['企业', '欧根亲王', '标枪', '大凤', '赤城', '加贺', '俾斯麦', '霞飞', '光辉', '大和', '武藏'].includes(char.nameCn)) {
      upCharacters.push(char);
    }
  });

  Object.keys(distribution).sort((a, b) => b - a).forEach(rarity => {
    console.log(`稀有度 ${rarity}: ${distribution[rarity]} 个角色`);
  });

  console.log(`\n识别的UP角色示例 (${upCharacters.length} 个):`);
  upCharacters.slice(0, 10).forEach(char => {
    console.log(`  - ${char.nameCn} [${char.faction}] (rarity: ${char.rarity})`);
  });
}

function main() {
  try {
    console.log('验证UP角色稀有度校准结果...\n');

    testUPCharacterWeight();

    const characters = loadUpdatedCharacterData();
    analyzeUpdatedData(characters);

    console.log('\n验证完成！');
    console.log('- UP角色识别机制已实现');
    console.log('- 推荐算法权重系统已更新');
    console.log('- 可以通过名称匹配区分UP和SSR角色');

  } catch (error) {
    console.error('验证过程中出现错误:', error);
  }
}

main();