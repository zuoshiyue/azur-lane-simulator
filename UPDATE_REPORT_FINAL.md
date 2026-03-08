# 碧蓝航线阵容模拟器 - 数据更新报告

## 📊 爬取统计

**更新时间：** 2026-03-08 12:57 GMT+8  
**数据来源：** [B 站碧蓝航线 Wiki](https://wiki.biligame.com/blhx/)

### 角色数量

- **总计：** 556 个角色
- **数据大小：** 260.22 KB

### 阵营分布

| 阵营 | 角色数量 |
|------|---------|
| 白鹰 | 147 |
| 皇家 | 126 |
| 重樱 | 122 |
| 铁血 | 48 |
| 北方联合 | 26 |
| 维希教廷 | 24 |
| 撒丁帝国 | 23 |
| 东煌 | 19 |
| META | 17 |
| 自由鸢尾 | 4 |

### 数据字段

每个角色包含以下信息：
- ✅ 名称（英文 + 中文）
- ✅ 稀有度（1-6 星）
- ✅ 舰种（驱逐/轻巡/重巡/超巡/战列/战巡/航母/轻母/潜艇/维修/运输）
- ✅ 阵营
- ✅ 属性（耐久/火力/鱼雷/航空/装填/护甲/航速/幸运/防空/侦察）
- ✅ 技能（名称/描述/冷却时间/类型）
- ✅ 装备推荐（3 个装备槽位）

## 🚀 功能特性

### 1. 本地全量数据库
- 556+ 角色完整数据
- 支持离线使用
- 快速搜索和过滤

### 2. 前端搜索添加
- 🔍 实时搜索（支持中文名和英文名）
- 🎯 按阵营/舰种筛选
- ➕ 点击添加到角色池
- 📦 批量添加支持

### 3. 数据更新机制
```bash
# 手动更新角色数据
npm run crawl

# 或
node scripts/crawl-characters.js
```

### 4. 阵容模拟
- 🎮 拖拽组建阵容
- ⚡ 战力计算
- 💡 智能推荐
- 💾 本地存储

## 📁 文件结构

```
projects/azur-lane-simulator/
├── scripts/
│   └── crawl-characters.js    # 爬虫脚本
├── src/
│   └── data/
│       ├── characters-full.json  # 完整角色数据（556 个）
│       ├── characterData.ts      # TypeScript 导出
│       ├── characterDatabase.ts  # 数据库管理
│       ├── dataManager.ts        # 数据管理器
│       └── *.json                # 按阵营分类数据
├── public/
│   └── data/
│       └── characters.json       # 公共数据
└── dist/                         # 构建输出（GitHub Pages）
```

## 🌐 访问链接

**GitHub Pages:** https://zuoshiyue.github.io/azur-lane-simulator

**GitHub 仓库:** https://github.com/zuoshiyue/azur-lane-simulator

## 📝 使用说明

### 本地开发
```bash
cd projects/azur-lane-simulator
npm install
npm run dev
```

### 更新角色数据
```bash
npm run crawl
```

### 构建部署
```bash
npm run build
npm run deploy
```

## 🎯 下一步

1. ~~✅ 爬取全量角色数据~~
2. ~~✅ 生成本地数据库~~
3. ~~✅ 前端搜索添加功能~~
4. ~~✅ 数据更新机制~~
5. ~~✅ 构建部署~~
6. 🔄 添加角色立绘图片
7. 🔄 完善阵容推荐算法
8. 🔄 添加 PVP 对战模拟

## 📌 技术栈

- **前端框架:** React 19 + TypeScript
- **构建工具:** Vite 6
- **状态管理:** Zustand
- **UI 组件:** Tailwind CSS + Lucide Icons
- **拖拽库:** @dnd-kit
- **部署:** GitHub Pages

---

**数据版本:** 2.0.0  
**最后更新:** 2026-03-08  
**维护者:** 碧蓝海事局
