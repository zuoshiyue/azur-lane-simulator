#!/usr/bin/env node

/**
 * 修正角色稀有度分级方案
 * 重新调整稀有度系统，正确处理UP和SSR的关系
 * UP不是一种稀有度，而是指特定SSR角色在限时UP池中出现的状态
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义碧蓝航线游戏中的真实稀有度系统
// 1. UR/META (6) - 限定兑换、活动奖励、META改造
// 2. SSR (5) - 常驻池、普通活动角色
// 3. SR (4) - 高级兑换、特殊活动角色
// 4. R (3) - 普通活动、部分建造角色
// 5. N (2) - 初始舰船、兑换获得
//
// UP不是稀有度，而是指某些SSR角色在限时UP池中的状态

// 修正稀有度配置文件
function updateRarityConfigCorrectly() {
  const configPath = path.join(__dirname, '../src/data/rarities.json');

  const correctedConfig = {
    levels: {
      "UR": 6,    // UR/超稀有
      "SSR": 5,   // SSR/超稀有
      "SR": 4,    // SR/稀有
      "R": 3,     // R/高级
      "N": 2      // N/普通
    },
    colors: {
      "UR": "#ff00ff",    // 紫红色 - UR
      "SSR": "#ff6b35",   // 橙色 - SSR
      "SR": "#a855f7",    // 紫色 - SR
      "R": "#3b82f6",     // 蓝色 - R
      "N": "#6b7280"      // 灰色 - N
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(correctedConfig, null, 2));
  console.log('已更新稀有度配置文件，移除UP分类');
}

// 修正推荐算法权重
function updateRecommenderWeightsCorrectly() {
  const recommenderPath = path.join(__dirname, '../src/utils/recommender.ts');

  let content = fs.readFileSync(recommenderPath, 'utf-8');

  // 修正RARITY_WEIGHTS，移除UP相关的混淆
  const correctedWeights = `// 稀有度权重
const RARITY_WEIGHTS: Record<number, number> = {
  6: 100, // UR/META
  5: 80,  // SSR
  4: 60,  // SR
  3: 40,  // R
  2: 20,  // N
  1: 10,
};`;

  // 替换RARITY_WEIGHTS部分
  const rarityWeightsRegex = /(\/\/\s*稀有度权重[\s\S]*?const RARITY_WEIGHTS:\s*Record<number,\s*number>\s*=\s*\{)[\s\S]*?(\};)/;
  content = content.replace(rarityWeightsRegex, correctedWeights);

  // 移除UP相关函数（如果存在）
  content = content.replace(/\/\/\s*UP角色名称列表[\s\S]*?function getCharacterWeight[\s\S]*?}\n\n?/, '');

  // 确保rarityBonus使用正确的RARITY_WEIGHTS
  content = content.replace(
    /const rarityBonus = getCharacterWeight\(character\) \|\| 10;/g,
    'const rarityBonus = RARITY_WEIGHTS[character.rarity] || 10;'
  );

  fs.writeFileSync(recommenderPath, content);
  console.log('已修正推荐算法权重，移除UP混淆逻辑');
}

// 修正角色数据（还原为原始的SSR/UR分类）
function revertCharacterData() {
  // 从备份恢复角色数据
  const backupPath = path.join(__dirname, '../public/data/characters_backup_post_calibrate.json');
  const outputPath = path.join(__dirname, '../public/data/characters.json');

  if (fs.existsSync(backupPath)) {
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));
    console.log('已从备份恢复角色数据');
  } else {
    console.log('未找到备份文件，无法恢复角色数据');
  }
}

function main() {
  try {
    console.log('开始修正稀有度系统（移除UP分类误解）...');

    updateRarityConfigCorrectly();
    updateRecommenderWeightsCorrectly();
    revertCharacterData();

    console.log('\n稀有度系统已修正！');
    console.log('- UP不再被视为稀有度分类');
    console.log('- 稀有度系统恢复为 UR(6) > SSR(5) > SR(4) > R(3) > N(2)');
    console.log('- 推荐算法权重恢复正常');
    console.log('- UP是指特定SSR角色在限时UP池中出现的状态，不是稀有度');

  } catch (error) {
    console.error('修正过程中出现错误:', error);
  }
}

main();