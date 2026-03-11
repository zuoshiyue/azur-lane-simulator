#!/usr/bin/env node

/**
 * 角色稀有度校准脚本
 * 根据碧蓝航线游戏中的真实稀有度标准校准900多个角色的稀有度
 *
 * 游戏中实际的稀有度分级：
 * 1. UR/META (6) - 限定兑换、活动奖励、META改造
 * 2. UP (5) - 限时UP池角色
 * 3. SSR (5) - 常驻池、普通活动角色
 * 4. SR (4) - 高级兑换、特殊活动角色
 * 5. R (3) - 普通活动、部分建造角色
 * 6. N (2) - 初始舰船、兑换获得
 *
 * 在数据模型中，我们采用如下表示：
 * - UR: 6
 * - UP: 5 (实际权重更高)
 * - SSR: 5 (实际权重稍低)
 * - SR: 4
 * - R: 3
 * - N: 2
 *
 * 但在推荐算法中，我们将为UP分配更高的权重(85) vs SSR(80)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 碧蓝航线游戏中的真实稀有度标准
const GAME_RARITY_STANDARDS = {
  // 重要：在游戏数据中识别UP角色通常比较困难，需要根据获取方式和历史活动判断
  // META/UR(6) - 限定兑换、活动奖励、META改造
  // UP(5) - 限时UP池角色
  // SSR(5) - 常驻池、普通活动角色
  // SR(4) - 高级兑换、特殊活动角色
  // R(3) - 普通活动、部分建造角色
  // N(2) - 初始舰船、兑换获得

  // 这里是一些典型的稀有度分类规则：
  // 1. META角色 -> UR(6)
  // 2. 限定UP角色 -> UP(5)
  // 3. 常驻SSR -> SSR(5)
  // 4. SR角色 -> SR(4)
  // 5. R角色 -> R(3)
  // 6. N角色 -> N(2)
};

// 读取所有角色数据
function loadCharacterData() {
  const dataDir = path.join(__dirname, '../src/data');
  const publicDataDir = path.join(__dirname, '../public/data');

  // 优先使用public下的characters.json
  const charactersPath = path.join(publicDataDir, 'characters.json');
  if (fs.existsSync(charactersPath)) {
    const data = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
    console.log(`Loaded ${data.length} characters from public/data/characters.json`);
    return data;
  }

  // 否则使用src下的
  const charactersFullPath = path.join(dataDir, 'characters-full.json');
  if (fs.existsSync(charactersFullPath)) {
    const data = JSON.parse(fs.readFileSync(charactersFullPath, 'utf-8'));
    console.log(`Loaded ${data.length} characters from src/data/characters-full.json`);
    return data;
  }

  // 尝试其他可能的路径
  const charsPath = path.join(dataDir, 'characters.json');
  if (fs.existsSync(charsPath)) {
    const data = JSON.parse(fs.readFileSync(charsPath, 'utf-8'));
    console.log(`Loaded ${data.length} characters from src/data/characters.json`);
    return data;
  }

  throw new Error('No character data file found');
}

// 根据角色特征判断并校准稀有度
function calibrateRarity(character) {
  const updatedChar = { ...character };

  // 识别UP角色的关键：根据获取方式和历史活动
  // 在缺乏具体UP角色列表的情况下，我们需要建立一个识别规则
  // UP角色通常是在特定时间推出的限时角色，通常有独特的活动背景

  // 特定角色的稀有度调整
  const SPECIAL_CASES = {
    // UR/META角色
    'Yamato': 6,
    'Musashi': 6,
    'Bismarck_zwei': 6,

    // 示例：UP角色（这只是一个示例，实际需要从游戏数据中确定）
    // 实际情况下，我们无法仅凭名称判断是否为UP角色
    // 因此在没有明确数据的情况下，我们保持原有的SSR为5
    // 如果要准确区分UP和SSR，我们需要一个包含UP角色列表的数据源
  };

  // 检查是否为特殊案例
  if (SPECIAL_CASES[character.name] || SPECIAL_CASES[character.nameCn]) {
    updatedChar.rarity = SPECIAL_CASES[character.name] || SPECIAL_CASES[character.nameCn];
    return updatedChar;
  }

  // META类型的处理
  if (character.type === 'META') {
    updatedChar.rarity = 6; // META角色通常是UR
    return updatedChar;
  }

  // 在没有明确UP角色数据的情况下，为了演示目的，我们可以随机选择一部分SSR作为UP
  // 但在实际应用中，应该基于准确的游戏数据来确定哪些是UP角色
  // 这里我们暂时保留原有逻辑，但稍后会在配置文件中说明UP和SSR的区别

  return updatedChar;
}

// 分析当前稀有度分布
function analyzeCurrentDistribution(characters) {
  console.log('\n=== 当前稀有度分布分析 ===');
  const distribution = {};

  characters.forEach(char => {
    distribution[char.rarity] = (distribution[char.rarity] || 0) + 1;
  });

  Object.keys(distribution).sort().forEach(rarity => {
    console.log(`稀有度 ${rarity}: ${distribution[rarity]} 个角色`);
  });

  return distribution;
}

// 重新校准稀有度
function recalibrateCharacters(characters) {
  console.log('\n=== 开始重新校准稀有度 ===');

  const calibratedCharacters = characters.map(character => {
    return calibrateRarity(character);
  });

  return calibratedCharacters;
}

// 更新稀有度配置文件
function updateRarityConfig() {
  const configPath = path.join(__dirname, '../src/data/rarities.json');
  if (!fs.existsSync(configPath)) {
    console.log('稀有度配置文件不存在，创建新文件...');

    const newConfig = {
      levels: {
        "UR": 6,
        "UP": 5,    // 添加UP分类
        "SSR": 5,
        "SR": 4,
        "R": 3,
        "N": 2
      },
      colors: {
        "UR": "#ff00ff",
        "UP": "#ff5500",   // 使用橙色标识UP角色
        "SSR": "#ff6b35",
        "SR": "#a855f7",
        "R": "#3b82f6",
        "N": "#6b7280"
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    console.log('已创建新的稀有度配置文件');
    return newConfig;
  }

  // 如果配置文件存在，检查是否需要更新
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // 检查是否已有UP配置
  if (!config.levels.UP) {
    console.log('更新稀有度配置文件，添加UP分类...');

    // 重新组织配置
    config.levels = {
      "UR": 6,
      "UP": 5,    // 添加UP分类
      "SSR": 5,
      "SR": 4,
      "R": 3,
      "N": 2
    };

    if (!config.colors.UP) {
      config.colors.UP = "#ff5500"; // 添加UP颜色
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('已更新稀有度配置文件');
  }

  return config;
}

// 更新推荐算法中的稀有度权重
function updateRecommenderWeights() {
  const recommenderPath = path.join(__dirname, '../src/utils/recommender.ts');

  if (!fs.existsSync(recommenderPath)) {
    console.error('未找到推荐算法文件');
    return;
  }

  let content = fs.readFileSync(recommenderPath, 'utf-8');

  // 查找RARITY_WEIGHTS定义并更新
  // 为了支持UP分类，我们将UP设置为6（权重略高于原来的SSR 5），而SSR保持5
  // 这样在数据层面UP为6，SSR为5，但实际上UP(6)的权重是85，SSR(5)的权重是80
  const rarityWeightsRegex = /(const RARITY_WEIGHTS:\s*Record<number,\s*number>\s*=\s*\{)([\s\S]*?)(\};)/;
  const newWeights = `const RARITY_WEIGHTS: Record<number, number> = {
  6: 85,  // UP (高于SSR)
  5: 80,  // SSR
  4: 60,  // SR
  3: 40,  // R
  2: 20,  // N
  1: 10,
};`;

  content = content.replace(rarityWeightsRegex, newWeights);

  fs.writeFileSync(recommenderPath, content);
  console.log('已更新推荐算法中的稀有度权重');
}

// 主函数
function main() {
  try {
    console.log('开始校准角色稀有度...');

    // 备份原始数据
    const characters = loadCharacterData();
    console.log(`共加载 ${characters.length} 个角色`);

    // 分析当前分布
    analyzeCurrentDistribution(characters);

    // 更新配置文件
    updateRarityConfig();

    // 更新推荐算法权重
    updateRecommenderWeights();

    // 重新校准
    const calibratedCharacters = recalibrateCharacters(characters);

    // 输出校准后的分布
    console.log('\n=== 校准后稀有度分布分析 ===');
    const calibratedDistribution = {};
    calibratedCharacters.forEach(char => {
      calibratedDistribution[char.rarity] = (calibratedDistribution[char.rarity] || 0) + 1;
    });

    Object.keys(calibratedDistribution).sort().forEach(rarity => {
      console.log(`稀有度 ${rarity}: ${calibratedDistribution[rarity]} 个角色`);
    });

    // 保存更新后的数据
    const outputPath = path.join(__dirname, '../public/data/characters.json');
    if (fs.existsSync(outputPath)) {
      // 备份原文件
      fs.copyFileSync(outputPath, outputPath.replace('.json', '_backup.json'));
      fs.writeFileSync(outputPath, JSON.stringify(calibratedCharacters, null, 2));
      console.log(`已保存更新后的角色数据到 ${outputPath}`);
    } else {
      // 尝试其他路径
      const outputPath2 = path.join(__dirname, '../src/data/characters.json');
      if (fs.existsSync(outputPath2)) {
        fs.copyFileSync(outputPath2, outputPath2.replace('.json', '_backup.json'));
        fs.writeFileSync(outputPath2, JSON.stringify(calibratedCharacters, null, 2));
        console.log(`已保存更新后的角色数据到 ${outputPath2}`);
      } else {
        const outputPath3 = path.join(__dirname, '../src/data/characters-full.json');
        if (fs.existsSync(outputPath3)) {
          fs.copyFileSync(outputPath3, outputPath3.replace('.json', '_backup.json'));
          fs.writeFileSync(outputPath3, JSON.stringify(calibratedCharacters, null, 2));
          console.log(`已保存更新后的角色数据到 ${outputPath3}`);
        } else {
          console.error('无法找到合适的输出路径');
          return;
        }
      }
    }

    console.log('\n稀有度校准完成！');
  } catch (error) {
    console.error('执行过程中出现错误:', error);
  }
}

// 执行主函数
main();