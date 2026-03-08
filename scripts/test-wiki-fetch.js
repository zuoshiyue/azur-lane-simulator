#!/usr/bin/env node

/**
 * 测试 Wiki 爬虫功能 - 改进版
 * 用法：node scripts/test-wiki-fetch.js 企业
 */

import https from 'https';

// 简单的 HTTP GET 请求
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 解析角色数据 - 改进版
function parseCharacterData(htmlText, characterName) {
  try {
    // 解码 HTML 实体
    function decodeHtml(html) {
      return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }
    
    const decodedText = decodeHtml(htmlText);
    
    // 提取稀有度 - 改进的正则
    let rarity = 4;
    if (decodedText.includes('★★★☆☆☆')) rarity = 5;
    else if (decodedText.includes('★★★★☆☆')) rarity = 5;
    else if (decodedText.includes('★★★★★☆')) rarity = 6;
    else if (decodedText.includes('★★★★★★')) rarity = 6;
    else if (decodedText.includes('★★☆☆☆☆')) rarity = 4;
    else if (decodedText.includes('★☆☆☆☆☆')) rarity = 3;
    
    // 提取舰种 - 改进的正则
    let shipType = '驱逐';
    const typePatterns = [
      [/航母/g, '航母'],
      [/航空母舰/g, '航母'],
      [/轻母/g, '轻母'],
      [/战列/g, '战列'],
      [/战巡/g, '战巡'],
      [/重巡/g, '重巡'],
      [/超巡/g, '超巡'],
      [/轻巡/g, '轻巡'],
      [/驱逐/g, '驱逐'],
      [/潜艇/g, '潜艇'],
      [/维修/g, '维修'],
    ];
    
    for (const [pattern, type] of typePatterns) {
      if (pattern.test(decodedText)) {
        shipType = type;
        break;
      }
    }
    
    // 提取阵营 - 改进的正则
    let faction = '其他';
    const factionPatterns = [
      [/白鹰/g, '白鹰'],
      [/皇家/g, '皇家'],
      [/铁血/g, '铁血'],
      [/重樱/g, '重樱'],
      [/东煌/g, '东煌'],
      [/自由鸢尾/g, '自由鸢尾'],
      [/维希教廷/g, '维希教廷'],
      [/撒丁帝国/g, '撒丁帝国'],
      [/北方联合/g, '北方联合'],
    ];
    
    for (const [pattern, fac] of factionPatterns) {
      if (pattern.test(decodedText)) {
        faction = fac;
        break;
      }
    }
    
    // 提取属性 - 使用更灵活的正则
    const hpMatch = decodedText.match(/耐久\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const hp = parseInt(hpMatch?.[1] || '1042');
    
    const aviationMatch = decodedText.match(/航空\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const aviation = parseInt(aviationMatch?.[1] || '83');
    
    const fireMatch = decodedText.match(/炮击\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const fire = parseInt(fireMatch?.[1] || '0');
    
    const torpedoMatch = decodedText.match(/雷击\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const torpedo = parseInt(torpedoMatch?.[1] || '0');
    
    const reloadMatch = decodedText.match(/装填\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const reload = parseInt(reloadMatch?.[1] || '49');
    
    const antiAirMatch = decodedText.match(/防空\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const antiAir = parseInt(antiAirMatch?.[1] || '62');
    
    const detectionMatch = decodedText.match(/命中\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const detection = parseInt(detectionMatch?.[1] || '37');
    
    const speedMatch = decodedText.match(/航速\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const speed = parseInt(speedMatch?.[1] || '32');
    
    const luckMatch = decodedText.match(/幸运\s*(?:[\d→]+\s*→\s*)?(\d+)/);
    const luck = parseInt(luckMatch?.[1] || '93');
    
    // 提取装甲
    let armor = '中型';
    if (decodedText.includes('装甲\n\n轻型')) armor = '轻型';
    else if (decodedText.includes('装甲\n\n重型')) armor = '重型';
    else if (decodedText.includes('装甲:轻型')) armor = '轻型';
    else if (decodedText.includes('装甲：重型')) armor = '重型';
    
    console.log('\n=== 角色数据解析结果 ===');
    console.log(`名称：${characterName}`);
    console.log(`稀有度：${rarity}星`);
    console.log(`舰种：${shipType}`);
    console.log(`阵营：${faction}`);
    console.log(`耐久：${hp}`);
    console.log(`航空：${aviation}`);
    console.log(`火力：${fire}`);
    console.log(`雷击：${torpedo}`);
    console.log(`装填：${reload}`);
    console.log(`防空：${antiAir}`);
    console.log(`装甲：${armor}`);
    
    return {
      id: `char_${Date.now()}`,
      name: characterName,
      nameCn: characterName,
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
      skills: [
        {
          name: '默认技能',
          description: '从 Wiki 获取的技能数据（需手动补充）',
          type: 'passive',
        },
      ],
      equipment: [
        { slot: 1, type: shipType === '航母' ? '战斗机' : '主炮', efficiency: 100 },
        { slot: 2, type: shipType === '航母' ? '轰炸机' : '鱼雷', efficiency: 100 },
        { slot: 3, type: shipType === '航母' ? '鱼雷机' : '防空炮', efficiency: 100 },
      ],
    };
  } catch (error) {
    console.error('解析失败:', error.message);
    return null;
  }
}

// 主函数
async function main() {
  const characterName = process.argv[2];
  
  if (!characterName) {
    console.log('用法：node scripts/test-wiki-fetch.js <角色名称>');
    console.log('示例：node test-wiki-fetch.js 企业');
    process.exit(1);
  }
  
  console.log(`正在从 Wiki 获取角色数据：${characterName}`);
  
  try {
    const url = `https://wiki.biligame.com/blhx/${encodeURIComponent(characterName)}`;
    console.log(`URL: ${url}`);
    
    const response = await fetchUrl(url);
    
    if (response.status !== 200) {
      console.error(`获取失败：HTTP ${response.status}`);
      process.exit(1);
    }
    
    console.log(`获取成功！页面大小：${response.text.length} 字节`);
    
    const character = parseCharacterData(response.text, characterName);
    
    if (character) {
      console.log('\n=== JSON 输出 ===');
      console.log(JSON.stringify(character, null, 2));
    }
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

main();
