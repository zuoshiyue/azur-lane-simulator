#!/usr/bin/env node
/**
 * 碧蓝航线攻略 Wiki HTML 解析器
 * 从井号碧蓝榜合集和 28 法则攻略篇提取数据
 *
 * 使用方法:
 * node scripts/parse-guide-data.js
 */

import fs from 'fs';
import path from 'path';

const DOWNLOADS_DIR = '/Users/lpf/Downloads';

/**
 * 提取井号碧蓝榜合集数据
 */
function parseTierListHTML(htmlContent) {
  const tierData = {
    shipPowerTier: [],    // PVE 用舰船综合性能强度榜
    awakeningTier: [],    // 认知觉醒榜
    otherTiers: []        // 其他榜单
  };

  // 匹配强度榜表格
  const tierRegex = /<table[^>]*class="wikitable"[^>]*>[\s\S]*?<\/table>/gi;
  const tables = htmlContent.matchAll(tierRegex);

  for (const table of tables) {
    const tableContent = table[0];

    // 提取表格标题
    const titleMatch = tableContent.match(/<caption[^>]*>([\s\S]*?)<\/caption>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // 提取行数据
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [...tableContent.matchAll(rowRegex)];

    const tierEntries = [];

    for (let i = 1; i < rows.length; i++) { // 跳过表头
      const cells = [...rows[i][1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];

      if (cells.length >= 2) {
        const tier = cells[0][1].replace(/<[^>]+>/g, '').trim();
        const ships = cells[1][1].replace(/<[^>]+>/g, '').trim();
        const note = cells[2] ? cells[2][1].replace(/<[^>]+>/g, '').trim() : '';

        // 解析舰船列表（通常用顿号或逗号分隔）
        const shipList = ships.split(/[,,]/).map(s => s.trim()).filter(s => s);

        tierEntries.push({
          tier,
          ships: shipList,
          note,
          category: title
        });
      }
    }

    if (tierEntries.length > 0) {
      if (title.includes('PVE') || title.includes('综合性能')) {
        tierData.shipPowerTier.push(...tierEntries);
      } else if (title.includes('认知觉醒')) {
        tierData.awakeningTier.push(...tierEntries);
      } else {
        tierData.otherTiers.push(...tierEntries);
      }
    }
  }

  return tierData;
}

/**
 * 提取 28 法则攻略篇数据
 */
function parseGuideHTML(htmlContent) {
  const guideData = {
    frontRowPositions: {},     // 前排位置规则
    backRowPositions: {},      // 后排位置规则
    stageTemplates: {},        // 关卡推荐配队
    lowOilTeams: {},           // 低耗油队
    trainingPriority: {},      // 养成顺序
    equipmentRules: {}         // 装备选择规则
  };

  // 提取所有章节标题和内容
  const sectionRegex = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>[\s\S]*?(?=<h[2-4]|$)/gi;
  const sections = [...htmlContent.matchAll(sectionRegex)];

  for (const section of sections) {
    const title = section[1].replace(/<[^>]+>/g, '').trim();
    const content = section[0];

    // 前排/后排位置规则
    if (title.includes('前排') || title.includes('承伤') || title.includes('保护')) {
      const positionMatch = content.match(/<table[^>]*>[\s\S]*?<\/table>/i);
      if (positionMatch) {
        guideData.frontRowPositions = parsePositionTable(positionMatch[0]);
      }
    }

    // 关卡推荐配队
    if (title.includes('关卡') || title.includes('道中') || title.includes('BOSS')) {
      guideData.stageTemplates = parseStageTemplates(content);
    }

    // 低耗油队
    if (title.includes('低耗') || title.includes('油耗')) {
      guideData.lowOilTeams = parseLowOilTeams(content);
    }

    // 装备选择
    if (title.includes('装备')) {
      guideData.equipmentRules = parseEquipmentRules(content);
    }
  }

  return guideData;
}

/**
 * 解析位置表格
 */
function parsePositionTable(tableHtml) {
  const positions = {};
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [...tableHtml.matchAll(rowRegex)];

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i][1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];

    if (cells.length >= 2) {
      const positionName = cells[0][1].replace(/<[^>]+>/g, '').trim();
      const description = cells[1][1].replace(/<[^>]+>/g, '').trim();
      const priority = cells[2] ? cells[2][1].replace(/<[^>]+>/g, '').split(/[,,]/).map(s => s.trim()).filter(s => s) : [];

      positions[positionName] = {
        name: positionName,
        description,
        priority
      };
    }
  }

  return positions;
}

/**
 * 解析关卡推荐配队
 */
function parseStageTemplates(content) {
  const templates = {};
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
  const tables = [...content.matchAll(tableRegex)];

  for (const table of tables) {
    const tableContent = table[0];
    const rows = [...tableContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

    for (let i = 1; i < rows.length; i++) {
      const cells = [...rows[i][1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];

      if (cells.length >= 3) {
        const stageName = cells[0][1].replace(/<[^>]+>/g, '').trim();
        const backRow = cells[1][1].replace(/<[^>]+>/g, '').split(/[,,]/).map(s => s.trim()).filter(s => s);
        const frontRow = cells[2][1].replace(/<[^>]+>/g, '').split(/[,,]/).map(s => s.trim()).filter(s => s);
        const description = cells[3] ? cells[3][1].replace(/<[^>]+>/g, '').trim() : '';

        templates[stageName] = {
          name: stageName,
          backRow,
          frontRow,
          description
        };
      }
    }
  }

  return templates;
}

/**
 * 解析低耗油队配置
 */
function parseLowOilTeams(content) {
  const teams = {};
  const teamRegex = /(\d+ 油队)[\s\S]*?(?=(?:\d+ 油队)|$)/gi;
  const teams_match = [...content.matchAll(teamRegex)];

  for (const team of teams_match) {
    const teamName = team[1];
    const teamContent = team[0];

    const backRowMatch = teamContent.match(/后排 [：:]\s*([^\n,]+)/i);
    const frontRowMatch = teamContent.match(/前排 [：:]\s*([^\n,]+)/i);
    const descMatch = teamContent.match(/说明 [：:]\s*([^\n]+)/i);

    teams[teamName] = {
      name: teamName,
      oil: parseInt(teamName),
      backRow: backRowMatch ? backRowMatch[1].split(/[,,]/).map(s => s.trim()).filter(s => s) : [],
      frontRow: frontRowMatch ? frontRowMatch[1].split(/[,,]/).map(s => s.trim()).filter(s => s) : [],
      description: descMatch ? descMatch[1] : ''
    };
  }

  return teams;
}

/**
 * 解析装备选择规则
 */
function parseEquipmentRules(content) {
  const rules = {
    mainGunSelection: {},
    equipmentPriority: []
  };

  // 主炮选择规则
  const gunRuleMatch = content.match(/主炮.*?(?:选择 | 推荐)[\s\S]*?(?=<h|设备|$)/i);
  if (gunRuleMatch) {
    const gunRules = gunRuleMatch[0].matchAll(/(驱逐 | 轻巡 | 重巡 | 战列).*?[：:]\s*([^\n]+)/gi);
    for (const rule of gunRules) {
      rules.mainGunSelection[rule[1]] = rule[2].trim();
    }
  }

  // 装备优先级列表
  const priorityMatch = content.matchAll(/(主炮 | 鱼雷 | 飞机 | 设备 | 防空炮)[^，,]*[，,]/gi);
  rules.equipmentPriority = [...priorityMatch].map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i);

  return rules;
}

// 主函数
async function main() {
  console.log('🔍 开始解析攻略 Wiki HTML 文件...\n');

  // 1. 解析井号碧蓝榜合集
  const tierListFile = path.join(DOWNLOADS_DIR, '井号碧蓝榜合集 - 碧蓝航线 WIKI_BWIKI_哔哩哔哩.html');
  if (fs.existsSync(tierListFile)) {
    console.log('📊 解析：井号碧蓝榜合集');
    const tierListHtml = fs.readFileSync(tierListFile, 'utf8');
    const tierData = parseTierListHTML(tierListHtml);

    console.log(`   - PVE 强度榜：${tierData.shipPowerTier.length} 条记录`);
    console.log(`   - 认知觉醒榜：${tierData.awakeningTier.length} 条记录`);
    console.log(`   - 其他榜单：${tierData.otherTiers.length} 条记录`);

    // 保存榜单数据
    const tierDataPath = path.join(process.cwd(), 'src/data/shipTierList.json');
    fs.writeFileSync(tierDataPath, JSON.stringify(tierData, null, 2));
    console.log(`   💾 数据已保存到：${tierDataPath}\n`);
  } else {
    console.log('❌ 未找到井号碧蓝榜合集文件\n');
  }

  // 2. 解析 28 法则攻略篇
  const guideFile = path.join(DOWNLOADS_DIR, '照做就行——28 法则下的碧蓝航线攻略执行篇 - 碧蓝航线 WIKI_BWIKI_哔哩哔哩.html');
  if (fs.existsSync(guideFile)) {
    console.log('📚 解析：28 法则下的碧蓝航线攻略执行篇');
    const guideHtml = fs.readFileSync(guideFile, 'utf8');
    const guideData = parseGuideHTML(guideHtml);

    console.log(`   - 前排位置：${Object.keys(guideData.frontRowPositions).length} 个`);
    console.log(`   - 后排位置：${Object.keys(guideData.backRowPositions).length} 个`);
    console.log(`   - 关卡模板：${Object.keys(guideData.stageTemplates).length} 个`);
    console.log(`   - 低耗队伍：${Object.keys(guideData.lowOilTeams).length} 个`);

    // 保存攻略数据
    const guideDataPath = path.join(process.cwd(), 'src/data/fleetGuideData.json');
    fs.writeFileSync(guideDataPath, JSON.stringify(guideData, null, 2));
    console.log(`   💾 数据已保存到：${guideDataPath}\n`);
  } else {
    console.log('❌ 未找到 28 法则攻略文件\n');
  }

  console.log('✅ 攻略数据解析完成！');
  console.log('\n💡 提示：需要手动更新 fleetGuideRules.ts 以使用新解析的数据');
}

main();
