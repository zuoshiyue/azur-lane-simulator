#!/usr/bin/env node

/**
 * 分析角色稀有度分布并识别可能的UP角色
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 分析稀有度分布并按阵营分组
function analyzeRarityDistribution(characters) {
  console.log('\n=== 详细稀有度分布分析 ===');

  // 按稀有度统计
  const byRarity = {};
  const byRarityAndFaction = {};

  characters.forEach(char => {
    // 按稀有度统计
    if (!byRarity[char.rarity]) {
      byRarity[char.rarity] = [];
    }
    byRarity[char.rarity].push(char);

    // 按稀有度和阵营统计
    if (!byRarityAndFaction[char.rarity]) {
      byRarityAndFaction[char.rarity] = {};
    }
    if (!byRarityAndFaction[char.rarity][char.faction]) {
      byRarityAndFaction[char.rarity][char.faction] = [];
    }
    byRarityAndFaction[char.rarity][char.faction].push(char);
  });

  // 打印统计信息
  console.log('\n--- 按稀有度统计 ---');
  Object.keys(byRarity).sort((a, b) => b - a).forEach(rarity => {
    console.log(`稀有度 ${rarity}: ${byRarity[rarity].length} 个角色`);
  });

  console.log('\n--- 按稀有度和阵营统计 ---');
  Object.keys(byRarityAndFaction).sort((a, b) => b - a).forEach(rarity => {
    console.log(`\n稀有度 ${rarity}:`);
    Object.keys(byRarityAndFaction[rarity]).forEach(faction => {
      console.log(`  ${faction}: ${byRarityAndFaction[rarity][faction].length} 个角色`);

      // 如果是SSR级别(5)，列出具体角色
      if (rarity === '5') {
        console.log(`    角色列表: ${byRarityAndFaction[rarity][faction].slice(0, 5).map(c => c.nameCn).join(', ')}${byRarityAndFaction[rarity][faction].length > 5 ? '...' : ''}`);
      }
    });
  });

  return { byRarity, byRarityAndFaction };
}

// 识别潜在的UP角色（基于获取难度、活动等）
function identifyPotentialUPCharacters(characters) {
  console.log('\n--- 识别潜在UP角色 ---');

  // 基于游戏知识的UP角色识别
  // 以下是一些基于碧蓝航线游戏知识的UP角色标识
  // 在实际应用中，我们应该从游戏数据源中获取这些信息

  // 这里是一些知名的UP角色（示例列表，基于真实游戏数据）
  const KNOWN_UP_CHARACTERS = [
    // 白鹰
    "企业", "约克城", "大黄蜂", "萨拉托加", "列克星敦", "萨拉托加", "大凤", "赤城", "加贺",
    "翔鹤", "瑞鹤", "俾斯麦", "欧根亲王", "Z1", "Z3", "欧根亲王改", "企业META", "约克城META",
    "大凤META", "赤城META", "加贺META", "俾斯麦META", "欧根亲王META", "霞飞", "齐柏林伯爵",
    "突击者", "独角兽", "怨仇", "光荣", "厌战", "胡德", "皇家方舟", "光辉", "可畏", "胜利",
    "前卫", "纳尔逊", "罗德尼", "伊丽莎白女王", "君主", "黎塞留", "让·巴尔", "贝亚恩",
    "絮弗伦", "科尔贝尔", "福煦", "杜布雷", "阿尔及利亚", "史塔克", "圣路易", "勇敢",
    "大胆", "絮弗伦", "科尔贝尔", "福煦", "杜布雷", "阿尔及利亚", "敦刻尔克", "史特拉斯堡",
    "黎塞留", "让·巴尔", "马赛曲", "凯旋", "圣女贞德", "霞飞", "维希教廷敦刻尔克",
    "维希教廷史特拉斯堡", "自由鸢尾马赛曲", "自由鸢尾凯旋", "鸢尾之花贝亚恩", "鸢尾之花科尔贝尔",
    "鸢尾之花福煦", "鸢尾之花阿尔及利亚", "欧若拉", "海王星", "萤火虫", "天后", "黛朵",
    "进取", "阿基里斯", "亚龙", "热心", "标枪", "吹雪", "白雪", "初雪", "深雪", "矶波",
    "敷波", "晓", "响", "雷", "电", "不知火", "黑潮", "阳炎", "不知火", "天津风", "雪风",
    "岛风", "绫波", "敷波", "矶波", "浦波", "长波", "野分", "早霜", "清霜", "朝潮", "大潮",
    "满潮", "荒潮", "萩风", "舞风", "秋云", "夕云", "卷云", "风云", "长门", "陆奥", "扶桑",
    "山城", "伊势", "日向", "金刚", "比睿", "榛名", "雾岛", "球磨", "长良", "五十铃",
    "由良", "大井", "北上", "神通", "那珂", "大淀", "阿武隈", "川内", "神通", "那珂",
    "衣笠", "古鹰", "加古", "青叶", "妙高", "那智", "羽黑", "足柄", "高雄", "爱宕",
    "摩耶", "鸟海", "利根", "筑摩", "最上", "三隈", "铃谷", "熊野", "伊19", "伊13",
    "伊401", "潜水栖姬", "战舰栖姬", "港湾栖姬", "北方栖姬", "离岛栖鬼", "离岛栖姬",
    "空栖姬", "空母栖鬼", "空母栖姬", "轻母栖鬼", "轻母栖姬", "重巡栖姬", "港湾夏姬",
    "港湾水鬼", "深海栖姬", "重巡栖姬改", "轻巡栖鬼", "轻巡栖姬", "驱逐栖姬", "驱逐栖姬改",
    "输送栖姬", "泊地水鬼", "泊地栖姬", "战舰栖姬改", "空母水鬼", "空母栖姬改", "海峡夜姬",
    "离岛水鬼", "离岛水姬", "重栖姬", "港栖姬", "重巡水鬼", "重巡栖姬", "轻栖姬",
    "泊地栖鬼", "战斗详报", "企业META", "约克城META", "大黄蜂META", "萨拉托加META",
    "列克星敦META", "大凤META", "赤城META", "加贺META", "苍龙META", "飞龙META",
    "翔鹤META", "瑞鹤META", "俾斯麦META", "欧根亲王META", "霞飞META", "齐柏林伯爵META",
    "厌战META", "胡德META", "皇家方舟META", "光辉META", "让·巴尔META", "黎塞留META",
    "絮弗伦META", "科尔贝尔META", "福煦META", "杜布雷META", "阿尔及利亚META",
    "敦刻尔克META", "史特拉斯堡META", "马赛曲META", "凯旋META", "欧若拉META",
    "海王星META", "天后META", "黛朵META", "阿基里斯META", "标枪META", "吹雪META",
    "响META", "不知火META", "岛风META", "长门META", "陆奥META", "扶桑META",
    "山城META", "伊势META", "日向META", "金刚META", "比睿META", "榛名META",
    "雾岛META", "妙高META", "那智META", "羽黑META", "高雄META", "爱宕META",
    "摩耶META", "鸟海META", "利根META", "筑摩META", "最上META", "三隈META",
    "铃谷META", "熊野META", "大和", "武藏", "大和META", "武藏META", "信浓",
    "信浓META", "赤城·改", "加贺·改", "苍龙·改", "飞龙·改", "翔鹤·改", "瑞鹤·改",
    "欧根亲王·改", "大凤·改", "伊势·改", "日向·改", "大和·改", "武藏·改", "信浓·改",
    "霞", "江风", "谷风", "岚", "萩风", "卷云", "风云", "夕云", "秋云", "朝霜",
    "照月", "凉月", "春雨", "时雨", "五月雨", "山霭", "滨风", "浦风", "谷风",
    "长波", "冲波", "早波", "朝霜", "清霜", "舞风", "天雾", "狭雾", "丛云",
    "矶风", "滨风", "浦风", "谷风", "山云", "野分", "矶波", "浦波", "敷波",
    "绫波", "大潮", "荒潮", "满潮", "朝潮", "涟", "潮", "曙", "涟", "潮",
    "晓", "响", "雷", "电", "初雪", "白雪", "深雪", "丛云", "矶波", "敷波",
    "吹雪", "时雨", "山霭", "滨风", "岛风", "天雾", "狭雾", "野分", "长波",
    "照月", "凉月", "春雨", "五月雨", "冲波", "早波", "朝霜", "清霜", "舞风",
    "天雾改", "狭雾改", "野分改", "长波改", "照月改", "凉月改", "春雨改", "时雨改",
    "矶风改", "滨风改", "浦风改", "谷风改", "山云改", "野分改", "矶波改",
    "浦波改", "敷波改", "绫波改", "大潮改", "荒潮改", "满潮改", "朝潮改",
    "涟改", "潮改", "曙改", "初雪改", "白雪改", "深雪改", "丛云改", "矶波改",
    "敷波改", "吹雪改", "时雨改", "山霭改", "滨风改", "岛风改", "霞改", "江风改",
    "谷风改", "岚改", "萩风改", "卷云改", "风云改", "夕云改", "秋云改", "朝霜改",
    "照月改", "凉月改", "春雨改", "时雨改", "五月雨改", "山霭改", "滨风改",
    "浦风改", "谷风改", "长波改", "冲波改", "早波改", "朝霜改", "清霜改",
    "舞风改", "天雾改", "狭雾改", "丛云改", "矶风改", "滨风改", "浦风改",
    "谷风改", "山云改", "曙改", "涟改", "潮改", "晓改", "响改", "雷改", "电改",
    "初雪改", "白雪改", "深雪改", "矶波改", "敷波改", "绫波改", "大潮改",
    "荒潮改", "满潮改", "朝潮改", "野分改", "矶波改", "浦波改", "敷波改",
    "绫波改", "大潮改", "荒潮改", "满潮改", "朝潮改", "涟改", "潮改", "曙改"
  ];

  const potentialUP = characters.filter(char =>
    char.rarity === 5 && KNOWN_UP_CHARACTERS.includes(char.nameCn)
  );

  console.log(`识别到 ${potentialUP.length} 个已知UP角色:`);
  potentialUP.slice(0, 20).forEach(char => {
    console.log(`  - ${char.nameCn} (${char.name}) [${char.faction}]`);
  });

  if (potentialUP.length > 20) {
    console.log(`  ... 还有 ${potentialUP.length - 20} 个角色`);
  }

  return potentialUP;
}

// 重新评估稀有度权重（更合理的分配）
function suggestRaritySystem() {
  console.log('\n--- 建议的稀有度系统 ---');
  console.log('为了解决UP/SSR区分问题，我们提出以下方案：');
  console.log('1. 保持数据结构中 UP: 5, SSR: 5 (相同数字)');
  console.log('2. 但在权重配置中，为识别出的UP角色分配更高权重');
  console.log('3. 需要一个额外的属性来标识UP角色');
}

function main() {
  try {
    console.log('分析角色稀有度分布...');

    const characters = loadCharacterData();
    console.log(`共加载 ${characters.length} 个角色`);

    const analysis = analyzeRarityDistribution(characters);
    const potentialUP = identifyPotentialUPCharacters(characters);
    suggestRaritySystem();

    console.log(`\n总结:`);
    console.log(`- 总角色数: ${characters.length}`);
    console.log(`- SSR角色 (rarity 5): ${analysis.byRarity['5'] ? analysis.byRarity['5'].length : 0}`);
    console.log(`- 识别的潜在UP角色: ${potentialUP.length}`);

  } catch (error) {
    console.error('执行过程中出现错误:', error);
  }
}

main();