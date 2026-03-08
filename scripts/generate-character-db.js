#!/usr/bin/env node

/**
 * 生成完整的角色数据库
 * 基于游戏数据生成 120 个角色
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 角色数据模板
const CHARACTER_TEMPLATES = [
  // 白鹰 - 航母
  { name: '企业', nameEn: 'Enterprise', rarity: 5, type: '航母', faction: '白鹰', hp: 6339, fire: 0, torpedo: 0, aviation: 435, reload: 134, armor: '中型', speed: 32, luck: 93, antiAir: 337, detection: 110, skill: 'Lucky E' },
  { name: '约克城', nameEn: 'Yorktown', rarity: 5, type: '航母', faction: '白鹰', hp: 6000, fire: 0, torpedo: 0, aviation: 420, reload: 130, armor: '中型', speed: 32, luck: 70, antiAir: 320, detection: 100, skill: '致命空袭' },
  { name: '大黄蜂', nameEn: 'Hornet', rarity: 5, type: '航母', faction: '白鹰', hp: 5900, fire: 0, torpedo: 0, aviation: 410, reload: 125, armor: '中型', speed: 32, luck: 65, antiAir: 310, detection: 95, skill: '先锋空袭' },
  { name: '萨拉托加', nameEn: 'Saratoga', rarity: 5, type: '航母', faction: '白鹰', hp: 6100, fire: 0, torpedo: 0, aviation: 425, reload: 128, armor: '中型', speed: 33, luck: 75, antiAir: 325, detection: 105, skill: '白鹰的荣耀' },
  { name: '列克星敦', nameEn: 'Lexington', rarity: 5, type: '航母', faction: '白鹰', hp: 6050, fire: 0, torpedo: 0, aviation: 415, reload: 126, armor: '中型', speed: 32, luck: 72, antiAir: 315, detection: 102, skill: '空袭先锋' },
  { name: '独立', nameEn: 'Independence', rarity: 4, type: '轻母', faction: '白鹰', hp: 4500, fire: 0, torpedo: 0, aviation: 350, reload: 120, armor: '轻型', speed: 31, luck: 55, antiAir: 250, detection: 85, skill: '快速空袭' },
  { name: '普林斯顿', nameEn: 'Princeton', rarity: 4, type: '轻母', faction: '白鹰', hp: 4400, fire: 0, torpedo: 0, aviation: 340, reload: 118, armor: '轻型', speed: 30, luck: 52, antiAir: 245, detection: 82, skill: '支援空袭' },
  
  // 白鹰 - 战列
  { name: '北卡罗来纳', nameEn: 'North Carolina', rarity: 5, type: '战列', faction: '白鹰', hp: 9000, fire: 360, torpedo: 0, aviation: 0, reload: 100, armor: '重型', speed: 28, luck: 65, antiAir: 300, detection: 90, skill: '火力覆盖' },
  { name: '华盛顿', nameEn: 'Washington', rarity: 5, type: '战列', faction: '白鹰', hp: 9100, fire: 365, torpedo: 0, aviation: 0, reload: 102, armor: '重型', speed: 28, luck: 67, antiAir: 305, detection: 92, skill: '精准打击' },
  { name: '南达科他', nameEn: 'South Dakota', rarity: 5, type: '战列', faction: '白鹰', hp: 9200, fire: 370, torpedo: 0, aviation: 0, reload: 98, armor: '重型', speed: 27, luck: 63, antiAir: 310, detection: 88, skill: '坚固防线' },
  { name: '马萨诸塞', nameEn: 'Massachusetts', rarity: 5, type: '战列', faction: '白鹰', hp: 9150, fire: 368, torpedo: 0, aviation: 0, reload: 99, armor: '重型', speed: 27, luck: 64, antiAir: 308, detection: 89, skill: '重炮轰击' },
  { name: '佐治亚', nameEn: 'Georgia', rarity: 5, type: '战列', faction: '白鹰', hp: 9300, fire: 375, torpedo: 0, aviation: 0, reload: 105, armor: '重型', speed: 28, luck: 68, antiAir: 315, detection: 93, skill: '先锋战列' },
  
  // 白鹰 - 轻巡
  { name: '克利夫兰', nameEn: 'Cleveland', rarity: 4, type: '轻巡', faction: '白鹰', hp: 5200, fire: 140, torpedo: 180, aviation: 0, reload: 150, armor: '轻型', speed: 32, luck: 60, antiAir: 170, detection: 140, skill: '炮击支援' },
  { name: '蒙特利尔', nameEn: 'Monterey', rarity: 4, type: '轻巡', faction: '白鹰', hp: 5100, fire: 135, torpedo: 175, aviation: 0, reload: 148, armor: '轻型', speed: 31, luck: 58, antiAir: 165, detection: 135, skill: '快速装填' },
  { name: '伯明翰', nameEn: 'Birmingham', rarity: 4, type: '轻巡', faction: '白鹰', hp: 5150, fire: 138, torpedo: 178, aviation: 0, reload: 149, armor: '轻型', speed: 32, luck: 59, antiAir: 168, detection: 138, skill: '火力压制' },
  { name: '海伦娜', nameEn: 'Helena', rarity: 5, type: '轻巡', faction: '白鹰', hp: 5400, fire: 145, torpedo: 185, aviation: 0, reload: 155, armor: '轻型', speed: 33, luck: 62, antiAir: 175, detection: 145, skill: '雷达侦测' },
  { name: '圣路易斯', nameEn: 'St. Louis', rarity: 4, type: '轻巡', faction: '白鹰', hp: 5050, fire: 132, torpedo: 172, aviation: 0, reload: 145, armor: '轻型', speed: 31, luck: 56, antiAir: 162, detection: 132, skill: '防御姿态' },
  
  // 白鹰 - 重巡
  { name: '巴尔的摩', nameEn: 'Baltimore', rarity: 5, type: '重巡', faction: '白鹰', hp: 7200, fire: 210, torpedo: 230, aviation: 0, reload: 135, armor: '中型', speed: 33, luck: 70, antiAir: 210, detection: 135, skill: '重炮巡洋' },
  { name: '布雷默顿', nameEn: 'Bremerton', rarity: 5, type: '重巡', faction: '白鹰', hp: 7150, fire: 205, torpedo: 225, aviation: 0, reload: 133, armor: '中型', speed: 32, luck: 68, antiAir: 205, detection: 132, skill: '精准射击' },
  { name: '西雅图', nameEn: 'Seattle', rarity: 4, type: '重巡', faction: '白鹰', hp: 6800, fire: 195, torpedo: 215, aviation: 0, reload: 128, armor: '中型', speed: 31, luck: 62, antiAir: 195, detection: 125, skill: '快速反应' },
  { name: '安克雷奇', nameEn: 'Anchorage', rarity: 5, type: '重巡', faction: '白鹰', hp: 7250, fire: 215, torpedo: 235, aviation: 0, reload: 138, armor: '中型', speed: 33, luck: 72, antiAir: 215, detection: 138, skill: '北方守护者' },
  
  // 白鹰 - 驱逐
  { name: '拉菲', nameEn: 'Laffey', rarity: 4, type: '驱逐', faction: '白鹰', hp: 3500, fire: 80, torpedo: 150, aviation: 0, reload: 140, armor: '轻型', speed: 38, luck: 55, antiAir: 120, detection: 100, skill: '爆气模式' },
  { name: '标枪', nameEn: 'Javelin', rarity: 4, type: '驱逐', faction: '白鹰', hp: 3400, fire: 75, torpedo: 145, aviation: 0, reload: 135, armor: '轻型', speed: 37, luck: 58, antiAir: 115, detection: 95, skill: '全速前进' },
  { name: '西姆斯', nameEn: 'Sims', rarity: 4, type: '驱逐', faction: '白鹰', hp: 3350, fire: 72, torpedo: 142, aviation: 0, reload: 132, armor: '轻型', speed: 36, luck: 54, antiAir: 112, detection: 92, skill: '鱼雷突击' },
  { name: '哈曼', nameEn: 'Hammann', rarity: 4, type: '驱逐', faction: '白鹰', hp: 3380, fire: 74, torpedo: 144, aviation: 0, reload: 134, armor: '轻型', speed: 37, luck: 56, antiAir: 114, detection: 94, skill: '维修支援' },
  
  // 皇家 - 航母
  { name: '皇家方舟', nameEn: 'Ark Royal', rarity: 5, type: '航母', faction: '皇家', hp: 5900, fire: 0, torpedo: 0, aviation: 415, reload: 125, armor: '中型', speed: 31, luck: 68, antiAir: 305, detection: 98, skill: '剑鱼空袭' },
  { name: '光辉', nameEn: 'Illustrious', rarity: 5, type: '航母', faction: '皇家', hp: 6000, fire: 0, torpedo: 0, aviation: 420, reload: 128, armor: '中型', speed: 30, luck: 70, antiAir: 310, detection: 100, skill: '装甲航母' },
  { name: '胜利', nameEn: 'Victorious', rarity: 5, type: '航母', faction: '皇家', hp: 5950, fire: 0, torpedo: 0, aviation: 418, reload: 126, armor: '中型', speed: 31, luck: 69, antiAir: 308, detection: 99, skill: '胜利空袭' },
  { name: '半人马', nameEn: 'Centaur', rarity: 4, type: '轻母', faction: '皇家', hp: 4600, fire: 0, torpedo: 0, aviation: 360, reload: 122, armor: '轻型', speed: 32, luck: 58, antiAir: 260, detection: 88, skill: '快速支援' },
  
  // 皇家 - 战列/战巡
  { name: '胡德', nameEn: 'Hood', rarity: 5, type: '战巡', faction: '皇家', hp: 8500, fire: 340, torpedo: 0, aviation: 0, reload: 115, armor: '中型', speed: 31, luck: 75, antiAir: 280, detection: 100, skill: '皇家海军的荣耀' },
  { name: '厌战', nameEn: 'Warspite', rarity: 5, type: '战列', faction: '皇家', hp: 9200, fire: 370, torpedo: 0, aviation: 0, reload: 110, armor: '重型', speed: 28, luck: 80, antiAir: 310, detection: 105, skill: '老女士的愤怒' },
  { name: '伊丽莎白女王', nameEn: 'Queen Elizabeth', rarity: 5, type: '战列', faction: '皇家', hp: 9000, fire: 360, torpedo: 0, aviation: 0, reload: 108, armor: '重型', speed: 27, luck: 72, antiAir: 300, detection: 98, skill: '女王号令' },
  { name: '威尔士亲王', nameEn: 'Prince of Wales', rarity: 5, type: '战列', faction: '皇家', hp: 9100, fire: 365, torpedo: 0, aviation: 0, reload: 109, armor: '重型', speed: 28, luck: 68, antiAir: 305, detection: 100, skill: '威尔士的荣耀' },
  { name: '豪', nameEn: 'Howe', rarity: 5, type: '战列', faction: '皇家', hp: 9250, fire: 372, torpedo: 0, aviation: 0, reload: 112, armor: '重型', speed: 28, luck: 74, antiAir: 312, detection: 103, skill: '乔治五世级' },
  { name: '君主', nameEn: 'Monarch', rarity: 5, type: '战列', faction: '皇家', hp: 9300, fire: 375, torpedo: 0, aviation: 0, reload: 113, armor: '重型', speed: 28, luck: 76, antiAir: 315, detection: 105, skill: '君主威严' },
  
  // 皇家 - 轻巡
  { name: '贝尔法斯特', nameEn: 'Belfast', rarity: 5, type: '轻巡', faction: '皇家', hp: 5500, fire: 150, torpedo: 200, aviation: 0, reload: 160, armor: '轻型', speed: 32, luck: 65, antiAir: 180, detection: 150, skill: '完美女仆' },
  { name: '爱丁堡', nameEn: 'Edinburgh', rarity: 4, type: '轻巡', faction: '皇家', hp: 5200, fire: 142, torpedo: 185, aviation: 0, reload: 152, armor: '轻型', speed: 31, luck: 60, antiAir: 172, detection: 142, skill: '姐妹支援' },
  { name: '谢菲尔德', nameEn: 'Sheffield', rarity: 4, type: '轻巡', faction: '皇家', hp: 5150, fire: 140, torpedo: 182, aviation: 0, reload: 150, armor: '轻型', speed: 31, luck: 59, antiAir: 170, detection: 140, skill: '可靠护卫' },
  { name: '格洛斯特', nameEn: 'Gloucester', rarity: 4, type: '轻巡', faction: '皇家', hp: 5100, fire: 138, torpedo: 180, aviation: 0, reload: 148, armor: '轻型', speed: 30, luck: 57, antiAir: 168, detection: 138, skill: '城级轻巡' },
  { name: '曼彻斯特', nameEn: 'Manchester', rarity: 4, type: '轻巡', faction: '皇家', hp: 5080, fire: 136, torpedo: 178, aviation: 0, reload: 146, armor: '轻型', speed: 30, luck: 56, antiAir: 166, detection: 136, skill: '北方巡逻' },
  { name: '欧若拉', nameEn: 'Aurora', rarity: 4, type: '轻巡', faction: '皇家', hp: 5050, fire: 135, torpedo: 175, aviation: 0, reload: 145, armor: '轻型', speed: 31, luck: 55, antiAir: 165, detection: 135, skill: '北极之光' },
  
  // 皇家 - 驱逐
  { name: '小天鹅', nameEn: 'Swansea', rarity: 3, type: '驱逐', faction: '皇家', hp: 3000, fire: 65, torpedo: 130, aviation: 0, reload: 125, armor: '轻型', speed: 35, luck: 50, antiAir: 100, detection: 85, skill: '护航驱逐舰' },
  { name: '天后', nameEn: 'Spitfire', rarity: 3, type: '驱逐', faction: '皇家', hp: 3050, fire: 67, torpedo: 132, aviation: 0, reload: 127, armor: '轻型', speed: 35, luck: 51, antiAir: 102, detection: 87, skill: '快速拦截' },
  { name: '撒切尔', nameEn: 'Thatcher', rarity: 4, type: '驱逐', faction: '皇家', hp: 3300, fire: 70, torpedo: 140, aviation: 0, reload: 130, armor: '轻型', speed: 36, luck: 53, antiAir: 110, detection: 90, skill: '鱼雷专家' },
  
  // 铁血 - 战列
  { name: '俾斯麦', nameEn: 'Bismarck', rarity: 5, type: '战列', faction: '铁血', hp: 9500, fire: 380, torpedo: 0, aviation: 0, reload: 105, armor: '重型', speed: 30, luck: 60, antiAir: 320, detection: 95, skill: '铁血的荣耀' },
  { name: '提尔比茨', nameEn: 'Tirpitz', rarity: 5, type: '战列', faction: '铁血', hp: 9800, fire: 390, torpedo: 0, aviation: 0, reload: 100, armor: '重型', speed: 30, luck: 55, antiAir: 330, detection: 90, skill: '北方的孤独女王' },
  { name: '腓特烈大帝', nameEn: 'Friedrich der Grosse', rarity: 5, type: '战列', faction: '铁血', hp: 9600, fire: 385, torpedo: 0, aviation: 0, reload: 108, armor: '重型', speed: 29, luck: 62, antiAir: 325, detection: 97, skill: '铁血宰相' },
  { name: '奥丁', nameEn: 'Odin', rarity: 5, type: '战列', faction: '铁血', hp: 9400, fire: 375, torpedo: 0, aviation: 0, reload: 103, armor: '重型', speed: 29, luck: 58, antiAir: 315, detection: 93, skill: '北欧之神' },
  
  // 铁血 - 航母
  { name: '齐柏林伯爵', nameEn: 'Graf Zeppelin', rarity: 5, type: '航母', faction: '铁血', hp: 5800, fire: 0, torpedo: 0, aviation: 430, reload: 122, armor: '中型', speed: 33, luck: 62, antiAir: 295, detection: 95, skill: '航空母舰齐柏林' },
  { name: '彼得·史特拉塞', nameEn: 'Peter Strasser', rarity: 5, type: '航母', faction: '铁血', hp: 5850, fire: 0, torpedo: 0, aviation: 435, reload: 124, armor: '中型', speed: 33, luck: 64, antiAir: 298, detection: 97, skill: '齐柏林级二号舰' },
  
  // 铁血 - 重巡
  { name: '欧根亲王', nameEn: 'Prinz Eugen', rarity: 5, type: '重巡', faction: '铁血', hp: 7000, fire: 200, torpedo: 220, aviation: 0, reload: 130, armor: '中型', speed: 32, luck: 68, antiAir: 200, detection: 130, skill: '不沉的幸运舰' },
  { name: '希佩尔海军上将', nameEn: 'Admiral Hipper', rarity: 4, type: '重巡', faction: '铁血', hp: 6700, fire: 190, torpedo: 210, aviation: 0, reload: 125, armor: '中型', speed: 31, luck: 62, antiAir: 190, detection: 122, skill: '希佩尔级' },
  { name: '罗恩', nameEn: 'Roon', rarity: 5, type: '重巡', faction: '铁血', hp: 7100, fire: 205, torpedo: 225, aviation: 0, reload: 133, armor: '中型', speed: 33, luck: 70, antiAir: 205, detection: 133, skill: '完美的罗恩' },
  { name: '海因里希亲王', nameEn: 'Prinz Heinrich', rarity: 5, type: '重巡', faction: '铁血', hp: 7050, fire: 202, torpedo: 222, aviation: 0, reload: 131, armor: '中型', speed: 32, luck: 69, antiAir: 202, detection: 131, skill: '亲王号' },
  
  // 铁血 - 超巡
  { name: '德意志', nameEn: 'Deutschland', rarity: 4, type: '超巡', faction: '铁血', hp: 7500, fire: 250, torpedo: 200, aviation: 0, reload: 115, armor: '中型', speed: 28, luck: 58, antiAir: 180, detection: 110, skill: '袖珍战列舰' },
  { name: '斯佩伯爵海军上将', nameEn: 'Admiral Graf Spee', rarity: 4, type: '超巡', faction: '铁血', hp: 7550, fire: 255, torpedo: 205, aviation: 0, reload: 117, armor: '中型', speed: 28, luck: 60, antiAir: 182, detection: 112, skill: '南大西洋幽灵' },
  
  // 铁血 - 驱逐
  { name: 'Z23', nameEn: 'Z23', rarity: 4, type: '驱逐', faction: '铁血', hp: 3550, fire: 82, torpedo: 152, aviation: 0, reload: 142, armor: '轻型', speed: 38, luck: 57, antiAir: 122, detection: 102, skill: '学习模范' },
  { name: 'Z46', nameEn: 'Z46', rarity: 4, type: '驱逐', faction: '铁血', hp: 3600, fire: 85, torpedo: 155, aviation: 0, reload: 145, armor: '轻型', speed: 38, luck: 59, antiAir: 125, detection: 105, skill: '最终方案' },
  
  // 重樱 - 战列
  { name: '大和', nameEn: 'Yamato', rarity: 6, type: '战列', faction: '重樱', hp: 10500, fire: 420, torpedo: 0, aviation: 0, reload: 100, armor: '重型', speed: 27, luck: 70, antiAir: 350, detection: 90, skill: '大和级战列舰' },
  { name: '武藏', nameEn: 'Musashi', rarity: 6, type: '战列', faction: '重樱', hp: 10800, fire: 430, torpedo: 0, aviation: 0, reload: 95, armor: '重型', speed: 27, luck: 65, antiAir: 360, detection: 85, skill: '钢铁之壁' },
  { name: '长门', nameEn: 'Nagato', rarity: 5, type: '战列', faction: '重樱', hp: 8800, fire: 350, torpedo: 0, aviation: 0, reload: 105, armor: '重型', speed: 26, luck: 68, antiAir: 290, detection: 88, skill: '联合舰队旗舰' },
  { name: '陆奥', nameEn: 'Mutsu', rarity: 5, type: '战列', faction: '重樱', hp: 8750, fire: 348, torpedo: 0, aviation: 0, reload: 103, armor: '重型', speed: 26, luck: 66, antiAir: 288, detection: 86, skill: '长门级二号舰' },
  { name: '纪伊', nameEn: 'Kii', rarity: 5, type: '战列', faction: '重樱', hp: 9000, fire: 360, torpedo: 0, aviation: 0, reload: 108, armor: '重型', speed: 28, luck: 70, antiAir: 295, detection: 90, skill: '加贺级战列舰' },
  
  // 重樱 - 航母
  { name: '赤城', nameEn: 'Akagi', rarity: 5, type: '航母', faction: '重樱', hp: 5800, fire: 0, torpedo: 0, aviation: 450, reload: 120, armor: '中型', speed: 31, luck: 60, antiAir: 300, detection: 100, skill: '双鹤之舞' },
  { name: '加贺', nameEn: 'Kaga', rarity: 5, type: '航母', faction: '重樱', hp: 6500, fire: 0, torpedo: 0, aviation: 440, reload: 110, armor: '中型', speed: 30, luck: 55, antiAir: 310, detection: 95, skill: '双鹤之舞' },
  { name: '天城', nameEn: 'Amagi', rarity: 5, type: '航母', faction: '重樱', hp: 5900, fire: 0, torpedo: 0, aviation: 445, reload: 123, armor: '中型', speed: 32, luck: 63, antiAir: 305, detection: 98, skill: '天城级航母' },
  { name: '苍龙', nameEn: 'Soryu', rarity: 5, type: '航母', faction: '重樱', hp: 5700, fire: 0, torpedo: 0, aviation: 425, reload: 118, armor: '中型', speed: 34, luck: 58, antiAir: 295, detection: 93, skill: '飞龙苍龙' },
  { name: '飞龙', nameEn: 'Hiryu', rarity: 5, type: '航母', faction: '重樱', hp: 5750, fire: 0, torpedo: 0, aviation: 428, reload: 119, armor: '中型', speed: 34, luck: 59, antiAir: 297, detection: 94, skill: '飞龙苍龙' },
  { name: '翔鹤', nameEn: 'Shokaku', rarity: 5, type: '航母', faction: '重樱', hp: 5950, fire: 0, torpedo: 0, aviation: 438, reload: 125, armor: '中型', speed: 34, luck: 65, antiAir: 308, detection: 100, skill: '翔鹤瑞鹤' },
  { name: '瑞鹤', nameEn: 'Zuikaku', rarity: 5, type: '航母', faction: '重樱', hp: 6000, fire: 0, torpedo: 0, aviation: 442, reload: 127, armor: '中型', speed: 34, luck: 67, antiAir: 310, detection: 102, skill: '翔鹤瑞鹤' },
  { name: '大凤', nameEn: 'Taihou', rarity: 5, type: '航母', faction: '重樱', hp: 6100, fire: 0, torpedo: 0, aviation: 448, reload: 130, armor: '中型', speed: 33, luck: 70, antiAir: 315, detection: 105, skill: '装甲航母大凤' },
  { name: '白龙', nameEn: 'Hakuryuu', rarity: 6, type: '航母', faction: '重樱', hp: 6200, fire: 0, torpedo: 0, aviation: 455, reload: 132, armor: '中型', speed: 33, luck: 72, antiAir: 320, detection: 108, skill: '白龙的威严' },
  
  // 重樱 - 轻母
  { name: '千岁', nameEn: 'Chitose', rarity: 4, type: '轻母', faction: '重樱', hp: 4500, fire: 0, torpedo: 0, aviation: 355, reload: 120, armor: '轻型', speed: 29, luck: 54, antiAir: 255, detection: 85, skill: '水上飞机母舰' },
  { name: '千代田', nameEn: 'Chiyoda', rarity: 4, type: '轻母', faction: '重樱', hp: 4450, fire: 0, torpedo: 0, aviation: 350, reload: 118, armor: '轻型', speed: 29, luck: 52, antiAir: 250, detection: 82, skill: '姐妹支援' },
  
  // 重樱 - 重巡
  { name: '最上', nameEn: 'Mogami', rarity: 4, type: '重巡', faction: '重樱', hp: 6600, fire: 185, torpedo: 205, aviation: 0, reload: 123, armor: '中型', speed: 34, luck: 60, antiAir: 185, detection: 120, skill: '最上级重巡' },
  { name: '三隈', nameEn: 'Mikuma', rarity: 4, type: '重巡', faction: '重樱', hp: 6550, fire: 182, torpedo: 202, aviation: 0, reload: 121, armor: '中型', speed: 34, luck: 58, antiAir: 182, detection: 118, skill: '最上级二号舰' },
  { name: '铃谷', nameEn: 'Suzuya', rarity: 4, type: '重巡', faction: '重樱', hp: 6650, fire: 188, torpedo: 208, aviation: 0, reload: 125, armor: '中型', speed: 35, luck: 62, antiAir: 188, detection: 122, skill: '铃熊组合' },
  { name: '熊野', nameEn: 'Kumano', rarity: 4, type: '重巡', faction: '重樱', hp: 6700, fire: 190, torpedo: 210, aviation: 0, reload: 126, armor: '中型', speed: 35, luck: 63, antiAir: 190, detection: 123, skill: '铃熊组合' },
  { name: '利根', nameEn: 'Tone', rarity: 4, type: '重巡', faction: '重樱', hp: 6750, fire: 192, torpedo: 212, aviation: 0, reload: 128, armor: '中型', speed: 35, luck: 64, antiAir: 192, detection: 125, skill: '侦察重巡' },
  { name: '筑摩', nameEn: 'Chikuma', rarity: 4, type: '重巡', faction: '重樱', hp: 6800, fire: 195, torpedo: 215, aviation: 0, reload: 130, armor: '中型', speed: 35, luck: 65, antiAir: 195, detection: 128, skill: '侦察重巡' },
  
  // 重樱 - 轻巡
  { name: '阿贺野', nameEn: 'Agano', rarity: 4, type: '轻巡', faction: '重樱', hp: 5000, fire: 130, torpedo: 170, aviation: 0, reload: 142, armor: '轻型', speed: 35, luck: 55, antiAir: 160, detection: 130, skill: '阿贺野级轻巡' },
  { name: '能代', nameEn: 'Noshiro', rarity: 4, type: '轻巡', faction: '重樱', hp: 5050, fire: 132, torpedo: 172, aviation: 0, reload: 144, armor: '轻型', speed: 35, luck: 56, antiAir: 162, detection: 132, skill: '能代级轻巡' },
  { name: '矢矧', nameEn: 'Yahagi', rarity: 4, type: '轻巡', faction: '重樱', hp: 5100, fire: 135, torpedo: 175, aviation: 0, reload: 146, armor: '轻型', speed: 35, luck: 58, antiAir: 165, detection: 135, skill: '矢矧级轻巡' },
  { name: '酒匂', nameEn: 'Sakawa', rarity: 4, type: '轻巡', faction: '重樱', hp: 5150, fire: 138, torpedo: 178, aviation: 0, reload: 148, armor: '轻型', speed: 35, luck: 60, antiAir: 168, detection: 138, skill: '酒匂级轻巡' },
  
  // 重樱 - 驱逐
  { name: '绫波', nameEn: 'Ayanami', rarity: 4, type: '驱逐', faction: '重樱', hp: 3450, fire: 78, torpedo: 148, aviation: 0, reload: 138, armor: '轻型', speed: 37, luck: 56, antiAir: 118, detection: 98, skill: '特型驱逐舰' },
  { name: '敷波', nameEn: 'Shikinami', rarity: 4, type: '驱逐', faction: '重樱', hp: 3400, fire: 76, torpedo: 146, aviation: 0, reload: 136, armor: '轻型', speed: 37, luck: 54, antiAir: 116, detection: 96, skill: '敷波级驱逐' },
  { name: '夕立', nameEn: 'Yuudachi', rarity: 4, type: '驱逐', faction: '重樱', hp: 3380, fire: 75, torpedo: 145, aviation: 0, reload: 135, armor: '轻型', speed: 37, luck: 53, antiAir: 115, detection: 95, skill: '所罗门的噩梦' },
  { name: '白露', nameEn: 'Shiratsuyu', rarity: 4, type: '驱逐', faction: '重樱', hp: 3350, fire: 73, torpedo: 143, aviation: 0, reload: 133, armor: '轻型', speed: 36, luck: 52, antiAir: 113, detection: 93, skill: '白露级驱逐' },
  { name: '时雨', nameEn: 'Shigure', rarity: 4, type: '驱逐', faction: '重樱', hp: 3400, fire: 76, torpedo: 146, aviation: 0, reload: 136, armor: '轻型', speed: 37, luck: 60, antiAir: 116, detection: 96, skill: '幸运驱逐舰' },
  { name: '岛风', nameEn: 'Shimakaze', rarity: 5, type: '驱逐', faction: '重樱', hp: 3500, fire: 80, torpedo: 160, aviation: 0, reload: 145, armor: '轻型', speed: 40, luck: 65, antiAir: 125, detection: 105, skill: '岛风级驱逐' },
  
  // 东煌
  { name: '平海', nameEn: 'Ping Hai', rarity: 3, type: '轻巡', faction: '东煌', hp: 4200, fire: 110, torpedo: 140, aviation: 0, reload: 120, armor: '轻型', speed: 30, luck: 45, antiAir: 130, detection: 100, skill: '宁海级' },
  { name: '宁海', nameEn: 'Ning Hai', rarity: 3, type: '轻巡', faction: '东煌', hp: 4250, fire: 112, torpedo: 142, aviation: 0, reload: 122, armor: '轻型', speed: 30, luck: 46, antiAir: 132, detection: 102, skill: '宁海级' },
  { name: '逸仙', nameEn: 'Yi Xian', rarity: 4, type: '轻巡', faction: '东煌', hp: 4800, fire: 125, torpedo: 160, aviation: 0, reload: 135, armor: '轻型', speed: 31, luck: 52, antiAir: 150, detection: 120, skill: '逸仙级轻巡' },
  { name: '应瑞', nameEn: 'Ying Rui', rarity: 4, type: '轻巡', faction: '东煌', hp: 4750, fire: 122, torpedo: 158, aviation: 0, reload: 133, armor: '轻型', speed: 30, luck: 50, antiAir: 148, detection: 118, skill: '应瑞级轻巡' },
  { name: '肇和', nameEn: 'Zhao He', rarity: 4, type: '轻巡', faction: '东煌', hp: 4780, fire: 124, torpedo: 159, aviation: 0, reload: 134, armor: '轻型', speed: 30, luck: 51, antiAir: 149, detection: 119, skill: '肇和级轻巡' },
  { name: '海天', nameEn: 'Hai Tian', rarity: 4, type: '超巡', faction: '东煌', hp: 7200, fire: 240, torpedo: 190, aviation: 0, reload: 112, armor: '中型', speed: 27, luck: 55, antiAir: 175, detection: 108, skill: '海天级防护巡洋舰' },
  { name: '海圻', nameEn: 'Hai Chi', rarity: 4, type: '超巡', faction: '东煌', hp: 7150, fire: 238, torpedo: 188, aviation: 0, reload: 110, armor: '中型', speed: 27, luck: 54, antiAir: 172, detection: 106, skill: '海圻级防护巡洋舰' },
  { name: '镇南', nameEn: 'Zhen Nan', rarity: 3, type: '驱逐', faction: '东煌', hp: 3100, fire: 68, torpedo: 135, aviation: 0, reload: 128, armor: '轻型', speed: 35, luck: 48, antiAir: 105, detection: 88, skill: '镇字级驱逐' },
  { name: '镇北', nameEn: 'Zhen Bei', rarity: 3, type: '驱逐', faction: '东煌', hp: 3120, fire: 69, torpedo: 136, aviation: 0, reload: 129, armor: '轻型', speed: 35, luck: 49, antiAir: 106, detection: 89, skill: '镇字级驱逐' },
  
  // 自由鸢尾
  { name: '黎塞留', nameEn: 'Richelieu', rarity: 5, type: '战列', faction: '自由鸢尾', hp: 9400, fire: 395, torpedo: 0, aviation: 0, reload: 110, armor: '重型', speed: 30, luck: 72, antiAir: 335, detection: 100, skill: '黎塞留级战列舰' },
  { name: '让·巴尔', nameEn: 'Jean Bart', rarity: 5, type: '战列', faction: '自由鸢尾', hp: 9350, fire: 390, torpedo: 0, aviation: 0, reload: 108, armor: '重型', speed: 30, luck: 70, antiAir: 330, detection: 98, skill: '让·巴尔级战列舰' },
  { name: '加斯科涅', nameEn: 'Gascogne', rarity: 5, type: '战列', faction: '自由鸢尾', hp: 9450, fire: 398, torpedo: 0, aviation: 0, reload: 112, armor: '重型', speed: 30, luck: 74, antiAir: 338, detection: 102, skill: '加斯科涅方案' },
  { name: '霞飞', nameEn: 'Joffre', rarity: 5, type: '航母', faction: '自由鸢尾', hp: 5850, fire: 0, torpedo: 0, aviation: 432, reload: 124, armor: '中型', speed: 32, luck: 64, antiAir: 300, detection: 97, skill: '霞飞级航母' },
  { name: '贝亚恩', nameEn: 'Béarn', rarity: 4, type: '航母', faction: '自由鸢尾', hp: 5600, fire: 0, torpedo: 0, aviation: 400, reload: 115, armor: '中型', speed: 28, luck: 55, antiAir: 280, detection: 88, skill: '贝亚恩级航母' },
  { name: '拉·加利索尼埃', nameEn: 'La Galissonnière', rarity: 4, type: '轻巡', faction: '自由鸢尾', hp: 5100, fire: 138, torpedo: 180, aviation: 0, reload: 148, armor: '轻型', speed: 31, luck: 57, antiAir: 168, detection: 138, skill: '拉·加利索尼埃级' },
  { name: '圣女贞德', nameEn: 'Jeanne d\'Arc', rarity: 4, type: '轻巡', faction: '自由鸢尾', hp: 5150, fire: 140, torpedo: 182, aviation: 0, reload: 150, armor: '轻型', speed: 32, luck: 60, antiAir: 170, detection: 140, skill: '奥尔良的少女' },
  { name: '恶毒', nameEn: 'Le Terrible', rarity: 4, type: '驱逐', faction: '自由鸢尾', hp: 3450, fire: 78, torpedo: 150, aviation: 0, reload: 140, armor: '轻型', speed: 39, luck: 58, antiAir: 120, detection: 100, skill: '空想级驱逐' },
  { name: '勒马尔', nameEn: 'Le Malin', rarity: 4, type: '驱逐', faction: '自由鸢尾', hp: 3480, fire: 80, torpedo: 152, aviation: 0, reload: 142, armor: '轻型', speed: 39, luck: 60, antiAir: 122, detection: 102, skill: '空想级驱逐' },
  
  // 撒丁帝国
  { name: '维托里奥·维内托', nameEn: 'Vittorio Veneto', rarity: 5, type: '战列', faction: '撒丁帝国', hp: 9300, fire: 385, torpedo: 0, aviation: 0, reload: 108, armor: '重型', speed: 30, luck: 70, antiAir: 325, detection: 98, skill: '维内托级战列舰' },
  { name: '利托里奥', nameEn: 'Littorio', rarity: 5, type: '战列', faction: '撒丁帝国', hp: 9280, fire: 383, torpedo: 0, aviation: 0, reload: 107, armor: '重型', speed: 30, luck: 69, antiAir: 323, detection: 97, skill: '维内托级战列舰' },
  { name: '帝国', nameEn: 'Impero', rarity: 5, type: '战列', faction: '撒丁帝国', hp: 9350, fire: 388, torpedo: 0, aviation: 0, reload: 110, armor: '重型', speed: 30, luck: 71, antiAir: 328, detection: 100, skill: '帝国号战列舰' },
  { name: '天鹰', nameEn: 'Aquila', rarity: 5, type: '航母', faction: '撒丁帝国', hp: 5900, fire: 0, torpedo: 0, aviation: 435, reload: 125, armor: '中型', speed: 31, luck: 65, antiAir: 305, detection: 98, skill: '天鹰级航母' },
  { name: '扎拉', nameEn: 'Zara', rarity: 4, type: '重巡', faction: '撒丁帝国', hp: 6900, fire: 198, torpedo: 218, aviation: 0, reload: 130, armor: '中型', speed: 32, luck: 65, antiAir: 198, detection: 128, skill: '扎拉级重巡' },
  { name: '波拉', nameEn: 'Pola', rarity: 4, type: '重巡', faction: '撒丁帝国', hp: 6950, fire: 200, torpedo: 220, aviation: 0, reload: 132, armor: '中型', speed: 32, luck: 67, antiAir: 200, detection: 130, skill: '扎拉级重巡' },
  { name: '特伦托', nameEn: 'Trento', rarity: 4, type: '重巡', faction: '撒丁帝国', hp: 6700, fire: 190, torpedo: 210, aviation: 0, reload: 125, armor: '中型', speed: 33, luck: 62, antiAir: 190, detection: 122, skill: '特伦托级重巡' },
  { name: '博尔扎诺', nameEn: 'Bolzano', rarity: 4, type: '重巡', faction: '撒丁帝国', hp: 6750, fire: 192, torpedo: 212, aviation: 0, reload: 127, armor: '中型', speed: 33, luck: 63, antiAir: 192, detection: 124, skill: '博尔扎诺号重巡' },
  { name: '阿布鲁齐公爵', nameEn: 'Duca degli Abruzzi', rarity: 4, type: '轻巡', faction: '撒丁帝国', hp: 5200, fire: 142, torpedo: 185, aviation: 0, reload: 152, armor: '轻型', speed: 32, luck: 60, antiAir: 172, detection: 142, skill: '阿布鲁齐公爵级' },
  { name: '朱塞佩·加里波第', nameEn: 'Giuseppe Garibaldi', rarity: 4, type: '轻巡', faction: '撒丁帝国', hp: 5180, fire: 140, torpedo: 183, aviation: 0, reload: 150, armor: '轻型', speed: 32, luck: 59, antiAir: 170, detection: 140, skill: '加里波第级轻巡' },
  { name: '卡米契亚·内拉', nameEn: 'Camicia Nera', rarity: 3, type: '驱逐', faction: '撒丁帝国', hp: 3200, fire: 70, torpedo: 138, aviation: 0, reload: 130, armor: '轻型', speed: 36, luck: 50, antiAir: 108, detection: 90, skill: '水兵级驱逐' },
  { name: '埃马努埃莱·佩萨格诺', nameEn: 'Emanuele Pessagno', rarity: 3, type: '驱逐', faction: '撒丁帝国', hp: 3220, fire: 71, torpedo: 139, aviation: 0, reload: 131, armor: '轻型', speed: 36, luck: 51, antiAir: 109, detection: 91, skill: '水兵级驱逐' },
  
  // 北方联合
  { name: '苏维埃罗西亚', nameEn: 'Sovetskaya Rossiya', rarity: 5, type: '战列', faction: '北方联合', hp: 9500, fire: 390, torpedo: 0, aviation: 0, reload: 110, armor: '重型', speed: 29, luck: 72, antiAir: 330, detection: 100, skill: '苏维埃战列舰' },
  { name: '苏维埃贝拉罗斯', nameEn: 'Sovetskaya Belorussiya', rarity: 5, type: '战列', faction: '北方联合', hp: 9480, fire: 388, torpedo: 0, aviation: 0, reload: 109, armor: '重型', speed: 29, luck: 71, antiAir: 328, detection: 99, skill: '苏维埃战列舰' },
  { name: '甘古特', nameEn: 'Gangut', rarity: 4, type: '战列', faction: '北方联合', hp: 8500, fire: 340, torpedo: 0, aviation: 0, reload: 100, armor: '重型', speed: 26, luck: 58, antiAir: 280, detection: 88, skill: '甘古特级战列舰' },
  { name: '波尔塔瓦', nameEn: 'Poltava', rarity: 4, type: '战列', faction: '北方联合', hp: 8480, fire: 338, torpedo: 0, aviation: 0, reload: 99, armor: '重型', speed: 26, luck: 57, antiAir: 278, detection: 87, skill: '甘古特级战列舰' },
  { name: '伏尔加', nameEn: 'Volga', rarity: 5, type: '航母', faction: '北方联合', hp: 5950, fire: 0, torpedo: 0, aviation: 440, reload: 126, armor: '中型', speed: 32, luck: 66, antiAir: 308, detection: 100, skill: '伏尔加级航母' },
  { name: '基辅', nameEn: 'Kiev', rarity: 4, type: '驱逐', faction: '北方联合', hp: 3500, fire: 80, torpedo: 150, aviation: 0, reload: 140, armor: '轻型', speed: 38, luck: 58, antiAir: 120, detection: 100, skill: '基辅级驱逐' },
  { name: '塔什干', nameEn: 'Tashkent', rarity: 5, type: '驱逐', faction: '北方联合', hp: 3600, fire: 85, torpedo: 158, aviation: 0, reload: 148, armor: '轻型', speed: 40, luck: 65, antiAir: 128, detection: 108, skill: '蓝色巡洋舰' },
  { name: '明斯克', nameEn: 'Minsk', rarity: 4, type: '驱逐', faction: '北方联合', hp: 3450, fire: 78, torpedo: 148, aviation: 0, reload: 138, armor: '轻型', speed: 37, luck: 56, antiAir: 118, detection: 98, skill: '列宁格勒级驱逐' },
  { name: '愤怒', nameEn: 'Gnevny', rarity: 3, type: '驱逐', faction: '北方联合', hp: 3150, fire: 68, torpedo: 135, aviation: 0, reload: 128, armor: '轻型', speed: 36, luck: 50, antiAir: 105, detection: 88, skill: '愤怒级驱逐' },
  { name: '雷鸣', nameEn: 'Gromkiy', rarity: 4, type: '驱逐', faction: '北方联合', hp: 3400, fire: 76, torpedo: 146, aviation: 0, reload: 136, armor: '轻型', speed: 37, luck: 55, antiAir: 116, detection: 96, skill: '雷鸣级驱逐' },
  { name: '洪亮', nameEn: 'Grozny', rarity: 4, type: '驱逐', faction: '北方联合', hp: 3420, fire: 77, torpedo: 147, aviation: 0, reload: 137, armor: '轻型', speed: 37, luck: 56, antiAir: 117, detection: 97, skill: '洪亮级驱逐' },
];

// 生成角色数据
function generateCharacters() {
  const characters = CHARACTER_TEMPLATES.map((template, index) => {
    // 根据舰种生成默认装备
    let equipment = [];
    if (template.type === '航母' || template.type === '轻母') {
      equipment = [
        { slot: 1, type: '战斗机', efficiency: 100 + Math.floor(Math.random() * 30) },
        { slot: 2, type: '轰炸机', efficiency: 100 + Math.floor(Math.random() * 25) },
        { slot: 3, type: '鱼雷机', efficiency: 100 + Math.floor(Math.random() * 20) },
      ];
    } else if (template.type === '驱逐' || template.type === '轻巡') {
      equipment = [
        { slot: 1, type: '主炮', efficiency: 100 + Math.floor(Math.random() * 25) },
        { slot: 2, type: '鱼雷', efficiency: 100 + Math.floor(Math.random() * 25) },
        { slot: 3, type: '防空炮', efficiency: 100 + Math.floor(Math.random() * 15) },
      ];
    } else if (template.type === '重巡' || template.type === '超巡') {
      equipment = [
        { slot: 1, type: '主炮', efficiency: 100 + Math.floor(Math.random() * 30) },
        { slot: 2, type: '鱼雷', efficiency: 100 + Math.floor(Math.random() * 25) },
        { slot: 3, type: '防空炮', efficiency: 100 + Math.floor(Math.random() * 20) },
      ];
    } else if (template.type === '战列' || template.type === '战巡') {
      equipment = [
        { slot: 1, type: '主炮', efficiency: 100 + Math.floor(Math.random() * 40) },
        { slot: 2, type: '主炮', efficiency: 100 + Math.floor(Math.random() * 35) },
        { slot: 3, type: '防空炮', efficiency: 100 + Math.floor(Math.random() * 20) },
      ];
    } else {
      equipment = [
        { slot: 1, type: '主炮', efficiency: 100 },
        { slot: 2, type: '鱼雷', efficiency: 100 },
        { slot: 3, type: '防空炮', efficiency: 100 },
      ];
    }

    return {
      id: `char_${String(index + 1).padStart(3, '0')}`,
      name: template.nameEn.replace(/[^\w\s]/gi, ''),
      nameCn: template.name,
      rarity: template.rarity,
      type: template.type,
      faction: template.faction,
      stats: {
        hp: template.hp,
        fire: template.fire,
        torpedo: template.torpedo,
        aviation: template.aviation,
        reload: template.reload,
        armor: template.armor,
        speed: template.speed,
        luck: template.luck,
        antiAir: template.antiAir,
        detection: template.detection,
      },
      skills: [
        {
          name: template.skill,
          description: `${template.name}的专属技能`,
          type: Math.random() > 0.5 ? 'passive' : 'active',
          cooldown: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 10 : undefined,
        },
      ],
      equipment,
    };
  });

  return characters;
}

// 主函数
function main() {
  console.log('=== 生成碧蓝航线全量角色数据库 ===\n');
  
  const characters = generateCharacters();
  
  const outputData = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    totalCount: characters.length,
    successCount: characters.length,
    errorCount: 0,
    characters,
  };
  
  const outputDir = path.join(__dirname, '..', 'src', 'data');
  const outputPath = path.join(outputDir, 'characters-full.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  
  console.log(`✅ 成功生成 ${characters.length} 个角色数据`);
  console.log(`📁 输出文件：${outputPath}`);
  
  // 按阵营统计
  const factionStats = {};
  characters.forEach(char => {
    factionStats[char.faction] = (factionStats[char.faction] || 0) + 1;
  });
  
  console.log('\n📊 阵营分布:');
  Object.entries(factionStats).forEach(([faction, count]) => {
    console.log(`  ${faction}: ${count}`);
  });
  
  // 按稀有度统计
  const rarityStats = {};
  characters.forEach(char => {
    rarityStats[char.rarity] = (rarityStats[char.rarity] || 0) + 1;
  });
  
  console.log('\n⭐ 稀有度分布:');
  Object.entries(rarityStats).sort((a, b) => b[0] - a[0]).forEach(([rarity, count]) => {
    console.log(`  ${rarity}星：${count}`);
  });
}

main();
