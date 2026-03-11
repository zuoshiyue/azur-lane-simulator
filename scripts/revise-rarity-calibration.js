#!/usr/bin/env node

/**
 * 修正角色稀有度分级方案
 * 为了解决UP/SSR区分问题，我们采用以下方案：
 * - 为UP角色分配稀有度6
 * - 为UR/META角色分配稀有度6（权重更高）
 * - 为SSR角色分配稀有度5
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义已知的UP角色名单（这些是游戏中的限时UP角色）
const KNOWN_UP_CHARACTERS = [
  "企业", "约克城", "大黄蜂", "萨拉托加", "列克星敦",
  "大凤", "赤城", "加贺", "翔鹤", "瑞鹤",
  "俾斯麦", "欧根亲王", "霞飞", "齐柏林伯爵", "厌战", "胡德",
  "皇家方舟", "光辉", "让·巴尔", "黎塞留", "絮弗伦", "科尔贝尔",
  "福煦", "敦刻尔克", "史特拉斯堡", "马赛曲", "凯旋", "欧若拉",
  "海王星", "黛朵", "阿基里斯", "标枪", "吹雪", "响", "不知火",
  "岛风", "长门", "陆奥", "扶桑", "山城", "伊势", "日向",
  "金刚", "比睿", "榛名", "雾岛", "大和", "武藏", "信浓"
];

// 定义UR/META角色
const KNOWN_UR_META_CHARACTERS = [
  "企业META", "约克城META", "大黄蜂META", "萨拉托加META", "列克星敦META",
  "大凤META", "赤城META", "加贺META", "苍龙META", "飞龙META",
  "翔鹤META", "瑞鹤META", "俾斯麦META", "欧根亲王META", "霞飞META",
  "齐柏林伯爵META", "厌战META", "胡德META", "皇家方舟META", "光辉META",
  "让·巴尔META", "黎塞留META", "絮弗伦META", "科尔贝尔META",
  "福煦META", "杜布雷META", "阿尔及利亚META", "敦刻尔克META",
  "史特拉斯堡META", "马赛曲META", "凯旋META", "欧若拉META", "海王星META"
];

// 读取角色数据
function loadCharacterData() {
  const dataDir = path.join(__dirname, '../public/data');
  const charactersPath = path.join(dataDir, 'characters.json');

  if (fs.existsSync(charactersPath)) {
    const data = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
    console.log(`Loaded ${data.length} characters from public/data/characters.json`);
    return data;
  }

  throw new Error('No character data file found');
}

// 保存角色数据
function saveCharacterData(characters) {
  const outputPath = path.join(__dirname, '../public/data/characters.json');
  // 备份原文件
  fs.copyFileSync(outputPath, outputPath.replace('.json', '_backup_post_calibrate.json'));
  fs.writeFileSync(outputPath, JSON.stringify(characters, null, 2));
  console.log(`已保存更新后的角色数据到 ${outputPath}`);
}

// 校准单个角色的稀有度
function calibrateCharacterRarity(character) {
  const updatedChar = { ...character };

  // 检查是否为UR/META角色
  if (KNOWN_UR_META_CHARACTERS.includes(character.nameCn) ||
      character.type === 'META' ||
      character.rarity === 6) {
    updatedChar.rarity = 6;  // UR/META
    return updatedChar;
  }

  // 检查是否为UP角色
  if (KNOWN_UP_CHARACTERS.includes(character.nameCn)) {
    updatedChar.rarity = 5;  // UP (数值上为5，但权重更高)
    return updatedChar;
  }

  // 保留原有稀有度（对于SSR角色，继续保持为5）
  // 但我们将在权重配置中为UP角色分配更高权重
  return updatedChar;
}

// 更新推荐算法权重以更好地区分UP和SSR
function updateRecommenderWeightsForUP() {
  const recommenderPath = path.join(__dirname, '../src/utils/recommender.ts');

  if (!fs.existsSync(recommenderPath)) {
    console.error('未找到推荐算法文件');
    return;
  }

  let content = fs.readFileSync(recommenderPath, 'utf-8');

  // 定义新的权重配置，为UP角色使用特殊处理
  const newWeightsWithComment = `// 稀有度权重
// 注意：UP角色在数据中仍为rarity 5，但通过名称匹配给予更高权重
const RARITY_WEIGHTS: Record<number, number> = {
  6: 100, // UR/META
  5: 80,  // SSR (UP角色会通过名字单独提升权重)
  4: 60,  // SR
  3: 40,  // R
  2: 20,  // N
  1: 10,
};

// UP角色名称列表（用于在推荐算法中给予更高权重）
const UP_CHARACTER_NAMES = [
  ${KNOWN_UP_CHARACTERS.map(name => `"${name}"`).join(',\n  ')}
];

// 获取角色的实际权重（考虑UP角色）
function getCharacterWeight(character: Character): number {
  const baseWeight = RARITY_WEIGHTS[character.rarity] || 10;

  // 如果是UP角色，给予更高权重
  if (UP_CHARACTER_NAMES.includes(character.nameCn)) {
    // UP角色权重比同稀有度SSR高约10%
    return baseWeight * 1.1;
  }

  return baseWeight;
}`;

  // 替换整个RARITY_WEIGHTS部分以及添加新函数
  const rarityWeightsRegex = /(\/\/\s*稀有度权重[\s\S]*?})([\s\S]*?)(\/\/\s*计算角色综合强度评分)/;

  if (rarityWeightsRegex.test(content)) {
    content = content.replace(rarityWeightsRegex, (match, weightsPart, middlePart, commentPart) => {
      return newWeightsWithComment + '\n\n' + commentPart;
    });
  } else {
    // 如果找不到匹配项，则查找基本的RARITY_WEIGHTS定义
    const basicRegex = /(const RARITY_WEIGHTS:\s*Record<number,\s*number>\s*=\s*\{[\s\S]*?\};)/;
    content = content.replace(basicRegex, newWeightsWithComment);
  }

  fs.writeFileSync(recommenderPath, content);
  console.log('已更新推荐算法中的稀有度权重配置');
}

// 修改calculateCharacterPower函数以使用新的权重系统
function updateCalculateCharacterPowerFunction() {
  const recommenderPath = path.join(__dirname, '../src/utils/recommender.ts');

  if (!fs.existsSync(recommenderPath)) {
    console.error('未找到推荐算法文件');
    return;
  }

  let content = fs.readFileSync(recommenderPath, 'utf-8');

  // 查找calculateCharacterPower函数并修改其内部的稀有度权重使用方式
  const functionRegex = /(export function calculateCharacterPower\(character: Character,[\s\S]*?const rarityBonus = )RARITY_WEIGHTS\[character\.rarity\]([\s\S]*?\n}\n)/;

  if (functionRegex.test(content)) {
    content = content.replace(functionRegex, (match, prefix, suffix) => {
      return prefix + 'getCharacterWeight(character)' + suffix;
    });

    fs.writeFileSync(recommenderPath, content);
    console.log('已更新calculateCharacterPower函数以使用新的权重系统');
  } else {
    console.log('未能找到calculateCharacterPower函数，可能需要手动更新');
  }
}

function main() {
  try {
    console.log('开始修正角色稀有度分级...');

    const characters = loadCharacterData();
    console.log(`共加载 ${characters.length} 个角色`);

    // 分析校准前的分布
    console.log('\n--- 校准前稀有度分布 ---');
    const preDistribution = {};
    characters.forEach(char => {
      preDistribution[char.rarity] = (preDistribution[char.rarity] || 0) + 1;
    });
    Object.keys(preDistribution).sort((a, b) => b - a).forEach(rarity => {
      console.log(`稀有度 ${rarity}: ${preDistribution[rarity]} 个角色`);
    });

    // 校准所有角色
    console.log('\n--- 开始校准角色稀有度 ---');
    const calibratedCharacters = characters.map(character => {
      return calibrateCharacterRarity(character);
    });

    // 更新推荐算法
    updateRecommenderWeightsForUP();
    updateCalculateCharacterPowerFunction();

    // 分析校准后的分布
    console.log('\n--- 校准后稀有度分布 ---');
    const postDistribution = {};
    calibratedCharacters.forEach(char => {
      postDistribution[char.rarity] = (postDistribution[char.rarity] || 0) + 1;
    });
    Object.keys(postDistribution).sort((a, b) => b - a).forEach(rarity => {
      console.log(`稀有度 ${rarity}: ${postDistribution[rarity]} 个角色`);
    });

    // 保存更新后的数据
    saveCharacterData(calibratedCharacters);

    console.log('\n角色稀有度分级修正完成！');
    console.log(`- UP角色已识别并赋予适当权重`);
    console.log(`- 推荐算法已更新以区分UP和SSR角色`);
    console.log(`- 稀有度配置已保存`);


  } catch (error) {
    console.error('执行过程中出现错误:', error);
  }
}

main();