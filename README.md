# 碧蓝航线阵容模拟器

一个功能完整的碧蓝航线角色数据库查询和阵容模拟器 Web 应用。

## ✨ 功能特性

### 🎮 核心功能
- **角色数据库查询** - 搜索、筛选、查看所有角色属性
- **拖拽式阵容模拟器** - 直观的角色拖拽组队体验
- **智能编队推荐** - 基于角色类型和属性的自动推荐
- **阵容导出分享** - 导出 JSON 格式阵容配置
- **实时战力计算** - 动态显示阵容总战力

### 📊 数据展示
- 角色基础属性（耐久、火力、鱼雷、航空等）
- 技能详情（主动/被动、冷却时间）
- 装备槽位和效率
- 稀有度和阵营分类

## 🚀 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: TailwindCSS 3
- **拖拽库**: @dnd-kit
- **图标**: Lucide React
- **部署**: GitHub Pages + GitHub Actions

## 📦 安装和使用

### 本地开发

```bash
# 克隆项目
git clone https://github.com/zuoshiyue/azur-lane-simulator.git
cd azur-lane-simulator

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建和部署

```bash
# 构建生产版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

### 数据爬虫（可选）

```bash
# 从 B 站 Wiki 爬取角色数据
npm run crawl
```

## 🎯 使用指南

### 阵容模拟
1. 切换到"阵容模拟"标签页
2. 从左侧角色池拖拽角色到右侧阵容槽位
3. 先锋舰队（前 3 个位置）和主力舰队（后 3 个位置）
4. 点击"智能推荐"获取系统推荐的阵容
5. 点击"导出阵容"保存为 JSON 文件

### 角色查询
1. 切换到"角色数据库"标签页
2. 使用搜索框输入角色名、类型或阵营
3. 使用筛选器按舰种和阵营过滤
4. 点击角色卡片查看详情
5. 切换网格/列表视图

## 📁 项目结构

```
azur-lane-simulator/
├── src/
│   ├── components/
│   │   ├── CharacterCard.tsx      # 角色卡片组件
│   │   ├── CharacterDatabase.tsx  # 角色数据库页面
│   │   ├── FleetSimulator.tsx     # 阵容模拟器页面
│   │   └── FleetSlot.tsx          # 阵容槽位组件
│   ├── data/
│   │   └── characterData.ts       # 数据管理和示例数据
│   ├── types.ts                    # TypeScript 类型定义
│   ├── App.tsx                     # 主应用组件
│   └── main.tsx                    # 入口文件
├── scripts/
│   └── crawler.js                  # Wiki 数据爬虫
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 部署配置
└── package.json
```

## 🌐 在线演示

访问：https://zuoshiyue.github.io/azur-lane-simulator

## 📝 数据来源

角色数据来源于 [B 站碧蓝航线 Wiki](https://wiki.biligame.com/blhx)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**注意**: 本项目仅供学习交流使用，所有游戏内容版权归《碧蓝航线》官方所有。
