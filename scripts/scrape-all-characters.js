#!/usr/bin/env node

/**
 * 碧蓝航线 Wiki 全量角色数据爬虫
 * 爬取所有角色数据并保存为 JSON 文件
 * 
 * 用法：node scripts/scrape-all-characters.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 角色列表 - 从 Wiki 舰船图鉴页面获取
// 这里预定义常见角色，实际可从图鉴页爬取完整列表
const CHARACTER_LIST = [
  // 白鹰
  { name: '企业', faction: '白鹰', type: '航母' },
  { name: '约克城', faction: '白鹰', type: '航母' },
  { name: '大黄蜂', faction: '白鹰', type: '航母' },
  { name: '萨拉托加', faction: '白鹰', type: '航母' },
  { name: '列克星敦', faction: '白鹰', type: '航母' },
  { name: '独立', faction: '白鹰', type: '轻母' },
  { name: '普林斯顿', faction: '白鹰', type: '轻母' },
  { name: '北卡罗来纳', faction: '白鹰', type: '战列' },
  { name: '华盛顿', faction: '白鹰', type: '战列' },
  { name: '南达科他', faction: '白鹰', type: '战列' },
  { name: '马萨诸塞', faction: '白鹰', type: '战列' },
  { name: '佐治亚', faction: '白鹰', type: '战列' },
  { name: '克利夫兰', faction: '白鹰', type: '轻巡' },
  { name: '蒙特利尔', faction: '白鹰', type: '轻巡' },
  { name: '伯明翰', faction: '白鹰', type: '轻巡' },
  { name: '海伦娜', faction: '白鹰', type: '轻巡' },
  { name: '圣路易斯', faction: '白鹰', type: '轻巡' },
  { name: '巴尔的摩', faction: '白鹰', type: '重巡' },
  { name: '布雷默顿', faction: '白鹰', type: '重巡' },
  { name: '西雅图', faction: '白鹰', type: '重巡' },
  { name: '安克雷奇', faction: '白鹰', type: '重巡' },
  { name: '拉菲', faction: '白鹰', type: '驱逐' },
  { name: '标枪', faction: '白鹰', type: '驱逐' },
  
  // 皇家
  { name: '贝尔法斯特', faction: '皇家', type: '轻巡' },
  { name: '爱丁堡', faction: '皇家', type: '轻巡' },
  { name: '谢菲尔德', faction: '皇家', type: '轻巡' },
  { name: '格洛斯特', faction: '皇家', type: '轻巡' },
  { name: '曼彻斯特', faction: '皇家', type: '轻巡' },
  { name: '胡德', faction: '皇家', type: '战巡' },
  { name: '厌战', faction: '皇家', type: '战列' },
  { name: '伊丽莎白女王', faction: '皇家', type: '战列' },
  { name: '威尔士亲王', faction: '皇家', type: '战列' },
  { name: '豪', faction: '皇家', type: '战列' },
  { name: '君主', faction: '皇家', type: '战列' },
  { name: '皇家方舟', faction: '皇家', type: '航母' },
  { name: '光辉', faction: '皇家', type: '航母' },
  { name: '胜利', faction: '皇家', type: '航母' },
  { name: '半人马', faction: '皇家', type: '轻母' },
  { name: '欧若拉', faction: '皇家', type: '轻巡' },
  { name: '小天鹅', faction: '皇家', type: '驱逐' },
  { name: '天后', faction: '皇家', type: '驱逐' },
  { name: '撒切尔', faction: '皇家', type: '驱逐' },
  
  // 铁血
  { name: '俾斯麦', faction: '铁血', type: '战列' },
  { name: '提尔比茨', faction: '铁血', type: '战列' },
  { name: '腓特烈大帝', faction: '铁血', type: '战列' },
  { name: '奥丁', faction: '铁血', type: '战列' },
  { name: '齐柏林伯爵', faction: '铁血', type: '航母' },
  { name: '彼得·史特拉塞', faction: '铁血', type: '航母' },
  { name: '欧根亲王', faction: '铁血', type: '重巡' },
  { name: '希佩尔海军上将', faction: '铁血', type: '重巡' },
  { name: '罗恩', faction: '铁血', type: '重巡' },
  { name: '海因里希亲王', faction: '铁血', type: '重巡' },
  { name: '德意志', faction: '铁血', type: '超巡' },
  { name: '斯佩伯爵海军上将', faction: '铁血', type: '超巡' },
  { name: 'Z23', faction: '铁血', type: '驱逐' },
  { name: 'Z46', faction: '铁血', type: '驱逐' },
  
  // 重樱
  { name: '大和', faction: '重樱', type: '战列' },
  { name: '武藏', faction: '重樱', type: '战列' },
  { name: '长门', faction: '重樱', type: '战列' },
  { name: '陆奥', faction: '重樱', type: '战列' },
  { name: '纪伊', faction: '重樱', type: '战列' },
  { name: '赤城', faction: '重樱', type: '航母' },
  { name: '加贺', faction: '重樱', type: '航母' },
  { name: '天城', faction: '重樱', type: '航母' },
  { name: '苍龙', faction: '重樱', type: '航母' },
  { name: '飞龙', faction: '重樱', type: '航母' },
  { name: '翔鹤', faction: '重樱', type: '航母' },
  { name: '瑞鹤', faction: '重樱', type: '航母' },
  { name: '大凤', faction: '重樱', type: '航母' },
  { name: '白龙', faction: '重樱', type: '航母' },
  { name: '千岁', faction: '重樱', type: '轻母' },
  { name: '千代田', faction: '重樱', type: '轻母' },
  { name: '最上', faction: '重樱', type: '重巡' },
  { name: '三隈', faction: '重樱', type: '重巡' },
  { name: '铃谷', faction: '重樱', type: '重巡' },
  { name: '熊野', faction: '重樱', type: '重巡' },
  { name: '利根', faction: '重樱', type: '重巡' },
  { name: '筑摩', faction: '重樱', type: '重巡' },
  { name: '阿贺野', faction: '重樱', type: '轻巡' },
  { name: '能代', faction: '重樱', type: '轻巡' },
  { name: '矢矧', faction: '重樱', type: '轻巡' },
  { name: '酒匂', faction: '重樱', type: '轻巡' },
  { name: '绫波', faction: '重樱', type: '驱逐' },
  { name: '敷波', faction: '重樱', type: '驱逐' },
  { name: '夕立', faction: '重樱', type: '驱逐' },
  { name: '白露', faction: '重樱', type: '驱逐' },
  { name: '时雨', faction: '重樱', type: '驱逐' },
  { name: '岛风', faction: '重樱', type: '驱逐' },
  
  // 东煌
  { name: '平海', faction: '东煌', type: '轻巡' },
  { name: '宁海', faction: '东煌', type: '轻巡' },
  { name: '逸仙', faction: '东煌', type: '轻巡' },
  { name: '应瑞', faction: '东煌', type: '轻巡' },
  { name: '肇和', faction: '东煌', type: '轻巡' },
  { name: '海天', faction: '东煌', type: '超巡' },
  { name: '海圻', faction: '东煌', type: '超巡' },
  { name: '镇南', faction: '东煌', type: '驱逐' },
  { name: '镇北', faction: '东煌', type: '驱逐' },
  
  // 自由鸢尾
  { name: '黎塞留', faction: '自由鸢尾', type: '战列' },
  { name: '让·巴尔', faction: '自由鸢尾', type: '战列' },
  { name: '加斯科涅', faction: '自由鸢尾', type: '战列' },
  { name: '霞飞', faction: '自由鸢尾', type: '航母' },
  { name: '贝亚恩', faction: '自由鸢尾', type: '航母' },
  { name: '拉·加利索尼埃', faction: '自由鸢尾', type: '轻巡' },
  { name: '圣女贞德', faction: '自由鸢尾', type: '轻巡' },
  { name: '恶毒', faction: '自由鸢尾', type: '驱逐' },
  { name: '勒马尔', faction: '自由鸢尾', type: '驱逐' },
  
  // 撒丁帝国
  { name: '维托里奥·维内托', faction: '撒丁帝国', type: '战列' },
  { name: '利托里奥', faction: '撒丁帝国', type: '战列' },
  { name: '帝国', faction: '撒丁帝国', type: '战列' },
  { name: '天鹰', faction: '撒丁帝国', type: '航母' },
  { name: '扎拉', faction: '撒丁帝国', type: '重巡' },
  { name: '波拉', faction: '撒丁帝国', type: '重巡' },
  { name: '特伦托', faction: '撒丁帝国', type: '重巡' },
  { name: '博尔扎诺', faction: '撒丁帝国', type: '重巡' },
  { name: '阿布鲁齐公爵', faction: '撒丁帝国', type: '轻巡' },
  { name: '朱塞佩·加里波第', faction: '撒丁帝国', type: '轻巡' },
  { name: '卡米契亚·内拉', faction: '撒丁帝国', type: '驱逐' },
  { name: '埃马努埃莱·佩萨格诺', faction: '撒丁帝国', type: '驱逐' },
  
  // 北方联合
  { name: '苏维埃罗西亚', faction: '北方联合', type: '战列' },
  { name: '苏维埃贝拉罗斯', faction: '北方联合', type: '战列' },
  { name: '甘古特', faction: '北方联合', type: '战列' },
  { name: '波尔塔瓦', faction: '北方联合', type: '战列' },
  { name: '伏尔加', faction: '北方联合', type: '航母' },
  { name: '基辅', faction: '北方联合', type: '驱逐' },
  { name: '塔什干', faction: '北方联合', type: '驱逐' },
  { name: '明斯克', faction: '北方联合', type: '驱逐' },
  { name: '愤怒', faction: '北方联合', type: '驱逐' },
  { name: '雷鸣', faction: '北方联合', type: '驱逐' },
  { name: '洪亮', faction: '北方联合', type: '驱逐' },
];

// 简单的 HTTP GET 请求
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          text: data,
          url: res.responseUrl,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 解码 HTML 实体
function decodeHtml(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// 解析角色数据
function parseCharacterData(htmlText, characterName, faction, type) {
  try {
    const decodedText = decodeHtml(htmlText);
    
    // 提取稀有度
    let rarity = 4;
    if (decodedText.includes('★★★★★★')) rarity = 6;
    else if (decodedText.includes('★★★★★☆')) rarity = 6;
    else if (decodedText.includes('★★★★☆☆')) rarity = 5;
    else if (decodedText.includes('★★★☆☆☆')) rarity = 5;
    else if (decodedText.includes('★★☆☆☆☆')) rarity = 4;
    else if (decodedText.includes('★☆☆☆☆☆')) rarity = 3;
    else if (decodedText.includes('☆☆☆☆☆☆')) rarity = 2;
    
    // 提取舰种（从页面内容）
    let shipType = type;
    if (decodedText.includes('航母') && !decodedText.includes('轻母')) shipType = '航母';
    else if (decodedText.includes('轻母')) shipType = '轻母';
    else if (decodedText.includes('战列')) shipType = '战列';
    else if (decodedText.includes('战巡')) shipType = '战巡';
    else if (decodedText.includes('重巡')) shipType = '重巡';
    else if (decodedText.includes('超巡')) shipType = '超巡';
    else if (decodedText.includes('轻巡')) shipType = '轻巡';
    else if (decodedText.includes('驱逐')) shipType = '驱逐';
    else if (decodedText.includes('潜艇')) shipType = '潜艇';
    else if (decodedText.includes('维修')) shipType = '维修';
    
    // 提取属性
    const hpMatch = decodedText.match(/耐久\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const hp = parseInt(hpMatch?.[1] || '1000');
    
    const aviationMatch = decodedText.match(/航空\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const aviation = parseInt(aviationMatch?.[1] || '0');
    
    const fireMatch = decodedText.match(/炮击\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const fire = parseInt(fireMatch?.[1] || '0');
    
    const torpedoMatch = decodedText.match(/雷击\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const torpedo = parseInt(torpedoMatch?.[1] || '0');
    
    const reloadMatch = decodedText.match(/装填\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const reload = parseInt(reloadMatch?.[1] || '50');
    
    const antiAirMatch = decodedText.match(/防空\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const antiAir = parseInt(antiAirMatch?.[1] || '50');
    
    const detectionMatch = decodedText.match(/命中\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const detection = parseInt(detectionMatch?.[1] || '50');
    
    const speedMatch = decodedText.match(/航速\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const speed = parseInt(speedMatch?.[1] || '30');
    
    const luckMatch = decodedText.match(/幸运\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const luck = parseInt(luckMatch?.[1] || '50');
    
    // 提取装甲
    let armor = '中型';
    if (decodedText.includes('装甲\n\n轻型') || decodedText.includes('装甲:轻型') || decodedText.includes('装甲：轻型')) armor = '轻型';
    else if (decodedText.includes('装甲\n\n重型') || decodedText.includes('装甲:重型') || decodedText.includes('装甲：重型')) armor = '重型';
    
    // 提取技能
    const skills = [];
    const skillSection = decodedText.match(/技能\s+([\s\S]+?)(?=立绘 | 配装 | 角色信息 | 获取时间|$)/i);
    if (skillSection) {
      const skillLines = skillSection[1].split('\n').filter(line => line.trim().length > 0);
      let currentSkill = null;
      
      for (const line of skillLines) {
        const trimmed = line.trim();
        // 技能名称通常是短行，不包含太多标点
        if (trimmed.length < 30 && !trimmed.includes('。') && !trimmed.includes('，') && !trimmed.includes('%')) {
          if (currentSkill) {
            skills.push(currentSkill);
          }
          currentSkill = {
            name: trimmed.replace(/[:：]$/, ''),
            description: '',
            type: 'passive',
          };
        } else if (currentSkill) {
          // 技能描述
          currentSkill.description += (currentSkill.description ? ' ' : '') + trimmed;
          // 判断是否为主动技能
          if (trimmed.includes('秒') || trimmed.includes('CD') || trimmed.includes('冷却')) {
            currentSkill.type = 'active';
            const cdMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*秒/);
            if (cdMatch) {
              currentSkill.cooldown = parseFloat(cdMatch[1]);
            }
          }
        }
      }
      if (currentSkill) {
        skills.push(currentSkill);
      }
    }
    
    // 提取装备槽
    const equipment = [];
    const equipSection = decodedText.match(/满破装备\s+([\s\S]+?)(?=注 | 初始装备 | 装备说明 | 技能|$)/i);
    if (equipSection) {
      const lines = equipSection[1].split('\n');
      let slotIndex = 1;
      for (const line of lines) {
        const slotMatch = line.match(/^(\d+)\s+(战斗机 | 轰炸机 | 鱼雷机 | 主炮 | 鱼雷 | 防空炮 | 设备 | 特殊兵装)/);
        if (slotMatch) {
          equipment.push({
            slot: slotIndex++,
            type: slotMatch[2],
            efficiency: 100,
          });
        }
      }
    }
    
    // 如果装备槽为空，根据舰种生成默认配置
    if (equipment.length === 0) {
      if (shipType === '航母' || shipType === '轻母') {
        equipment.push(
          { slot: 1, type: '战斗机', efficiency: 100 },
          { slot: 2, type: '轰炸机', efficiency: 100 },
          { slot: 3, type: '鱼雷机', efficiency: 100 },
        );
      } else if (shipType === '驱逐' || shipType === '轻巡') {
        equipment.push(
          { slot: 1, type: '主炮', efficiency: 100 },
          { slot: 2, type: '鱼雷', efficiency: 100 },
          { slot: 3, type: '防空炮', efficiency: 100 },
        );
      } else if (shipType === '重巡' || shipType === '超巡') {
        equipment.push(
          { slot: 1, type: '主炮', efficiency: 100 },
          { slot: 2, type: '鱼雷', efficiency: 100 },
          { slot: 3, type: '防空炮', efficiency: 100 },
        );
      } else if (shipType === '战列' || shipType === '战巡') {
        equipment.push(
          { slot: 1, type: '主炮', efficiency: 100 },
          { slot: 2, type: '主炮', efficiency: 100 },
          { slot: 3, type: '防空炮', efficiency: 100 },
        );
      } else {
        equipment.push(
          { slot: 1, type: '主炮', efficiency: 100 },
          { slot: 2, type: '鱼雷', efficiency: 100 },
          { slot: 3, type: '防空炮', efficiency: 100 },
        );
      }
    }
    
    // 如果技能为空，添加默认技能
    if (skills.length === 0) {
      skills.push({
        name: `${characterName}的技能`,
        description: '暂无详细技能数据',
        type: 'passive',
      });
    }
    
    return {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: characterName.replace(/\s+/g, ''),
      nameCn: characterName.replace(/\s+/g, ''),
      rarity,
      type: shipType,
      faction,
      stats: {
        hp,
        fire,
        torpedo,
        aviation,
        reload,
        armor,
        speed,
        luck,
        antiAir,
        detection,
      },
      skills,
      equipment,
    };
  } catch (error) {
    console.error(`解析 ${characterName} 失败:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('=== 碧蓝航线 Wiki 全量角色数据爬虫 ===\n');
  console.log(`开始时间：${new Date().toLocaleString('zh-CN')}`);
  console.log(`待爬取角色数量：${CHARACTER_LIST.length}\n`);
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < CHARACTER_LIST.length; i++) {
    const { name, faction, type } = CHARACTER_LIST[i];
    const url = `https://wiki.biligame.com/blhx/${encodeURIComponent(name)}`;
    
    console.log(`[${i + 1}/${CHARACTER_LIST.length}] 爬取：${name} (${faction}/${type})`);
    
    try {
      const response = await fetchUrl(url);
      
      if (response.status !== 200) {
        console.error(`  ❌ HTTP ${response.status}`);
        errors.push({ name, error: `HTTP ${response.status}` });
        continue;
      }
      
      const character = parseCharacterData(response.text, name, faction, type);
      
      if (character) {
        results.push(character);
        console.log(`  ✅ 成功 - 稀有度：${character.rarity}星`);
      } else {
        console.error(`  ❌ 解析失败`);
        errors.push({ name, error: '解析失败' });
      }
      
      // 避免请求过快，延迟 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ❌ 错误：${error.message}`);
      errors.push({ name, error: error.message });
    }
  }
  
  // 保存结果
  const outputDir = path.join(__dirname, '..', 'src', 'data');
  const outputPath = path.join(outputDir, 'characters-full.json');
  
  const outputData = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    totalCount: CHARACTER_LIST.length,
    successCount: results.length,
    errorCount: errors.length,
    characters: results,
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  
  console.log('\n=== 爬取完成 ===');
  console.log(`成功：${results.length}/${CHARACTER_LIST.length}`);
  console.log(`失败：${errors.length}`);
  console.log(`输出文件：${outputPath}`);
  
  if (errors.length > 0) {
    console.log('\n失败列表:');
    errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
  
  console.log(`\n完成时间：${new Date().toLocaleString('zh-CN')}`);
}

main().catch(console.error);
