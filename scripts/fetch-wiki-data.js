#!/usr/bin/env node
/**
 * 碧蓝航线 Wiki 全量舰船数据爬虫
 * 使用 MediaWiki API + 页面解析
 * 
 * 由于 Wiki 启用了 Tencent Cloud EdgeOne 防护，
 * 我们采用以下策略：
 * 1. 使用已有的角色数据作为基础
 * 2. 尝试通过 API 获取结构化数据
 * 3. 合并更新到现有数据库
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT_ROOT, 'public/data/characters.json');
const PROGRESS_FILE = path.join(PROJECT_ROOT, 'scripts/crawl-progress.json');

// Wiki API 端点
const WIKI_API = 'https://wiki.biligame.com/blhx/api.php';

/**
 * 发送 HTTP 请求
 */
function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 从 MediaWiki API 获取页面列表
 */
async function fetchPageList(category, continueFrom = null) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'categorymembers',
    cmtitle: category,
    cmlimit: '500',
    cmsort: 'sortkey',
    cmdir: 'asc'
  });
  
  if (continueFrom) {
    params.append('cmcontinue', continueFrom);
  }
  
  const url = `${WIKI_API}?${params.toString()}`;
  console.log(`📡 请求：${url}`);
  
  try {
    const data = await fetchUrl(url);
    const json = JSON.parse(data);
    
    if (json.query && json.query.categorymembers) {
      return {
        members: json.query.categorymembers,
        continue: json.continue?.cmcontinue || null
      };
    }
    
    return { members: [], continue: null };
  } catch (error) {
    console.error(`❌ API 请求失败：${error.message}`);
    return { members: [], continue: null };
  }
}

/**
 * 获取页面内容
 */
async function fetchPageContent(title) {
  const params = new URLSearchParams({
    action: 'parse',
    format: 'json',
    page: title,
    prop: 'wikitext|text'
  });
  
  const url = `${WIKI_API}?${params.toString()}`;
  
  try {
    const data = await fetchUrl(url);
    const json = JSON.parse(data);
    
    if (json.parse) {
      return {
        title: json.parse.title,
        wikitext: json.parse.wikitext?.['*'] || '',
        html: json.parse.text?.['*'] || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ 获取页面 "${title}" 失败：${error.message}`);
    return null;
  }
}

/**
 * 从页面内容提取角色数据
 */
function extractCharacterData(wikitext, html) {
  const character = {};
  
  // 提取基本信息模板
  const infoBoxMatch = wikitext.match(/\{\{舰船信息\|([\s\S]*?)\}\}/);
  if (infoBoxMatch) {
    const infoContent = infoBoxMatch[1];
    
    // 提取字段
    const extractField = (fieldName) => {
      const regex = new RegExp(`${fieldName}\\s*=\\s*([^|\\n}]+)`, 'i');
      const match = infoContent.match(regex);
      return match ? match[1].trim() : null;
    };
    
    character.name = extractField('名称') || extractField('中文名');
    character.nameEn = extractField('英文名');
    character.nameJp = extractField('日文名');
    character.type = extractField('舰种');
    character.faction = extractField('阵营');
    character.rarity = extractField('稀有度');
    
    // 属性
    character.stats = {
      hp: parseInt(extractField('血量') || '0'),
      fire: parseInt(extractField('炮击') || '0'),
      torpedo: parseInt(extractField('雷击') || '0'),
      aviation: parseInt(extractField('航空') || '0'),
      reload: parseInt(extractField('装填') || '0'),
      luck: parseInt(extractField('幸运') || '0')
    };
    
    // 技能
    const skills = [];
    for (let i = 1; i <= 3; i++) {
      const skillName = extractField(`技能${i}名称`) || extractField(`技能名称${i}`);
      const skillDesc = extractField(`技能${i}描述`) || extractField(`技能描述${i}`);
      if (skillName) {
        skills.push({
          name: skillName,
          description: skillDesc || ''
        });
      }
    }
    character.skills = skills;
  }
  
  return character;
}

/**
 * 加载现有数据
 */
function loadExistingData() {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`📊 加载现有数据：${data.length} 个角色`);
    return data;
  }
  return [];
}

/**
 * 保存数据
 */
function saveData(characters) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2), 'utf-8');
  console.log(`💾 数据已保存到：${DATA_FILE}`);
  console.log(`📦 文件大小：${(fs.statSync(DATA_FILE).size / 1024).toFixed(2)} KB`);
}

/**
 * 保存进度
 */
function saveProgress(processed, total) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    timestamp: Date.now(),
    processed,
    total,
    percentage: ((processed / total) * 100).toFixed(2)
  }, null, 2));
}

/**
 * 主爬虫函数
 */
async function crawl() {
  console.log('🚀 碧蓝航线 Wiki 数据爬虫启动');
  console.log('📍 数据源:', WIKI_API);
  console.log('📁 输出文件:', DATA_FILE);
  console.log('');
  
  // 加载现有数据
  const existingData = loadExistingData();
  const existingMap = new Map(existingData.map(c => [c.name, c]));
  
  // 尝试从 API 获取角色分类
  console.log('📋 获取舰船分类列表...');
  
  const categories = [
    'Category:舰船',
    'Category:驱逐舰',
    'Category:轻巡洋舰',
    'Category:重巡洋舰',
    'Category:战列舰',
    'Category:航空母舰'
  ];
  
  const allPages = new Set();
  
  for (const category of categories) {
    console.log(`\n📂 处理分类：${category}`);
    let continueToken = null;
    let pageCount = 0;
    
    do {
      const result = await fetchPageList(category, continueToken);
      
      result.members.forEach(member => {
        if (member.ns === 0) { // 主命名空间
          allPages.add(member.title);
        }
      });
      
      pageCount += result.members.length;
      continueToken = result.continue;
      
      if (continueToken) {
        console.log(`  已获取 ${pageCount} 个页面，继续...`);
        await sleep(500); // 避免请求过快
      }
    } while (continueToken);
    
    console.log(`  ✅ 分类 "${category}" 获取 ${pageCount} 个页面`);
  }
  
  console.log(`\n📊 共获取 ${allPages.size} 个唯一页面`);
  
  // 爬取每个页面
  const updatedCharacters = [];
  let processedCount = 0;
  let successCount = 0;
  
  console.log('\n🔍 开始解析页面内容...');
  
  for (const title of allPages) {
    processedCount++;
    
    // 跳过非角色页面
    if (title.includes('/') || title.includes(' ')) {
      continue;
    }
    
    console.log(`  [${processedCount}/${allPages.size}] 处理：${title}`);
    
    try {
      const pageData = await fetchPageContent(title);
      
      if (pageData && pageData.wikitext) {
        const extracted = extractCharacterData(pageData.wikitext, pageData.html);
        
        if (extracted.name) {
          // 合并现有数据
          const existing = existingMap.get(extracted.name);
          const merged = {
            ...existing,
            ...extracted,
            updatedAt: Date.now()
          };
          
          updatedCharacters.push(merged);
          successCount++;
          
          console.log(`    ✅ 提取成功：${extracted.name} (${extracted.type || '未知'})`);
        }
      }
      
      // 每 10 个请求延迟一下
      if (processedCount % 10 === 0) {
        await sleep(1000);
        saveProgress(processedCount, allPages.size);
      }
    } catch (error) {
      console.error(`    ❌ 错误：${error.message}`);
    }
  }
  
  // 合并未更新的角色
  const updatedNames = new Set(updatedCharacters.map(c => c.name));
  existingData.forEach(char => {
    if (!updatedNames.has(char.name)) {
      updatedCharacters.push(char);
    }
  });
  
  // 保存结果
  console.log('\n💾 保存数据...');
  saveData(updatedCharacters);
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    totalCharacters: updatedCharacters.length,
    updatedCount: successCount,
    source: WIKI_API,
    outputFile: DATA_FILE,
    fileSize: fs.statSync(DATA_FILE).size
  };
  
  const reportFile = path.join(PROJECT_ROOT, 'scripts/crawl-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log('\n✅ 爬取完成！');
  console.log(`📊 总计：${updatedCharacters.length} 个角色`);
  console.log(`🔄 更新：${successCount} 个角色`);
  console.log(`📄 报告：${reportFile}`);
  
  return report;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 执行
crawl().catch(console.error);
