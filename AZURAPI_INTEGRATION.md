# AzurAPI 数据集成指南

## 概述

本项目已集成 AzurAPI 的碧蓝航线角色数据，支持全量角色查询和阵容模拟。

## 数据下载

### 方式 1：直接下载（推荐）

```bash
cd ~/.openclaw/workspace/projects/azur-lane-simulator/public/data
curl -L "https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json" -o ships.json
```

### 方式 2：使用镜像源

如果 GitHub Raw 访问慢，可以使用镜像：

```bash
curl -L "https://cdn.jsdelivr.net/gh/AzurAPI/azurapi-js-setup@master/ships.json" -o ships.json
```

### 方式 3：手动下载

1. 访问：https://github.com/AzurAPI/azurapi-js-setup/blob/master/ships.json
2. 点击 "Raw" 按钮
3. 右键保存为 `ships.json`
4. 放置到 `public/data/` 目录

## 数据转换

下载完成后，运行转换脚本：

```bash
cd ~/.openclaw/workspace/projects/azur-lane-simulator
node scripts/convert-azurapi-data.js
```

转换后的数据将保存到 `src/data/characters-azurapi.json`

## 数据格式说明

### AzurAPI 原始格式

```json
{
  "id": "Collab021",
  "names": {
    "cn": "22",
    "en": "22",
    "jp": "22"
  },
  "nationality": "Bilibili",
  "hullType": "Destroyer",
  "rarity": "Elite",
  "stats": {
    "level100": {
      "health": "1288",
      "firepower": "51",
      "torpedo": "193",
      "aviation": "0",
      "reload": "169",
      "antiair": "136",
      "accuracy": "178",
      "speed": "43",
      "armor": "Light",
      "luck": "22"
    }
  },
  "slots": [...],
  "skills": [...]
}
```

### 项目使用格式

```json
{
  "id": "azur_0001",
  "name": "22",
  "nameCn": "22",
  "rarity": 3,
  "type": "驱逐",
  "faction": "META",
  "stats": {
    "hp": 1288,
    "fire": 51,
    "torpedo": 193,
    "aviation": 0,
    "reload": 169,
    "armor": "轻型",
    "speed": 43,
    "luck": 22,
    "antiAir": 136,
    "detection": 178
  },
  "skills": [...],
  "equipment": [...],
  "image": "..."
}
```

## 字段映射

### 舰种映射

| AzurAPI | 本项目 |
|---------|--------|
| Destroyer | 驱逐 |
| Light Cruiser | 轻巡 |
| Heavy Cruiser | 重巡 |
| Super Cruiser | 超巡 |
| Battlecruiser | 战巡 |
| Battleship | 战列 |
| Aircraft Carrier | 航母 |
| Light Aircraft Carrier | 轻母 |
| Submarine | 潜艇 |
| Repair Ship | 维修 |
| Transport Ship | 运输 |

### 阵营映射

| AzurAPI | 本项目 |
|---------|--------|
| Eagle Union | 白鹰 |
| Royal Navy | 皇家 |
| Sakura Empire | 重樱 |
| Iron Blood | 铁血 |
| Dragon Empery | 东煌 |
| Iris Libre | 自由鸢尾 |
| Vichya Dominion | 维希教廷 |
| Northern Parliament | 北方联合 |
| Sardegna Empire | 撒丁帝国 |
| META | META |
| Bilibili | META |

### 稀有度映射

| AzurAPI | 本项目 | 星级 |
|---------|--------|------|
| Common | 1 | ★ |
| Rare | 2 | ★★ |
| Elite | 3 | ★★★ |
| Super Rare | 4 | ★★★★ |
| Ultra Rare | 5 | ★★★★★ |
| Priority | 5 | ★★★★★ |
| Decisive | 6 | ★★★★★★ |

## 使用示例

### 加载数据

```typescript
import { characterDataManager } from './data/characterDataManager';

// 加载所有角色
const characters = characterDataManager.getCharacters();

// 搜索角色
const result = characterDataManager.searchCharacters('企业');

// 按舰种筛选
const carriers = characterDataManager.filterByType('航母');

// 按阵营筛选
const eagleUnion = characterDataManager.filterByFaction('白鹰');

// 获取统计信息
const stats = characterDataManager.getStats();
console.log(`总角色数：${stats.total}`);
```

### 在组件中使用

```tsx
import React from 'react';
import { characterDataManager } from '../data/characterDataManager';

export const CharacterList: React.FC = () => {
  const characters = characterDataManager.getCharacters();
  
  return (
    <div>
      <h1>角色列表 ({characters.length})</h1>
      {characters.map(char => (
        <div key={char.id}>
          {char.nameCn} - {char.type} - {'★'.repeat(char.rarity)}
        </div>
      ))}
    </div>
  );
};
```

## 数据统计

运行转换脚本后，会输出详细的统计信息：

```
📊 数据统计:
总角色数：700+

按舰种分布:
  驱逐：150
  轻巡：100
  重巡：80
  航母：120
  ...

按阵营分布:
  白鹰：180
  皇家：160
  重樱：150
  铁血：140
  ...

按稀有度分布:
  ★★★: 200
  ★★★★: 250
  ★★★★★: 200
  ★★★★★★: 50
```

## 故障排除

### 问题：找不到 ships.json 文件

**解决：**
```bash
# 检查文件是否存在
ls -lh public/data/ships.json

# 重新下载
curl -L "https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json" -o public/data/ships.json
```

### 问题：转换失败

**解决：**
```bash
# 检查 Node.js 版本
node --version  # 需要 v16+

# 检查 JSON 格式
jq '.' public/data/ships.json | head -20

# 重新运行转换
node scripts/convert-azurapi-data.js
```

### 问题：数据不显示

**解决：**
1. 检查浏览器控制台是否有错误
2. 确认 `characters-azurapi.json` 已生成
3. 运行 `npm run build` 重新构建
4. 清除浏览器缓存

## 数据更新

AzurAPI 数据会不定期更新，建议定期同步：

```bash
# 每月更新一次
cd ~/.openclaw/workspace/projects/azur-lane-simulator/public/data
curl -L "https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json" -o ships.json
node ../scripts/convert-azurapi-data.js
npm run build
```

## 致谢

- 数据来源：[AzurAPI](https://github.com/AzurAPI/azurapi-js-setup)
- 游戏：[碧蓝航线](https://wiki.biligame.com/blhx/)

## 许可证

本项目使用的 AzurAPI 数据遵循其原始许可证。
