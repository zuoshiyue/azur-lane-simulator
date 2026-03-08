# 碧蓝航线阵容模拟器 - 开发计划

## 技术栈选择
- **前端**: Vue 3 + Vite (轻量、快速)
- **UI 框架**: TailwindCSS + Headless UI
- **拖拽**: vue-draggable-plus (Vue 3 兼容的 dnd-kit)
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **爬虫**: Node.js + Cheerio + Puppeteer (如需 JS 渲染)

## 项目结构
```
azur-lane-simulator/
├── src/
│   ├── components/
│   │   ├── CharacterCard.vue      # 角色卡片
│   │   ├── FleetBuilder.vue       # 阵容构建器
│   │   ├── CharacterSearch.vue    # 角色搜索
│   │   ├── FleetPreview.vue       # 阵容预览
│   │   └── ExportModal.vue        # 导出弹窗
│   ├── views/
│   │   ├── Home.vue               # 首页
│   │   ├── Database.vue           # 角色数据库
│   │   ├── Simulator.vue          # 模拟器
│   │   └── Recommendation.vue     # 智能推荐
│   ├── stores/
│   │   ├── characters.js          # 角色数据
│   │   ├── fleet.js               # 阵容状态
│   │   └── user.js                # 用户数据
│   ├── utils/
│   │   ├── calculator.js          # 属性计算
│   │   ├── recommender.js         # 推荐算法
│   │   └── exporter.js            # 导出功能
│   ├── data/
│   │   └── characters.json        # 角色数据 (爬虫生成)
│   ├── App.vue
│   └── main.js
├── scripts/
│   └── crawler.js                 # 爬虫脚本
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Actions 部署
```

## 开发步骤

### Step 1: 项目初始化
```bash
npm create vite@latest . -- --template vue
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install pinia axios vue-draggable-plus
```

### Step 2: 爬虫脚本
- 目标：https://wiki.biligame.com/blhx/
- 获取角色列表、属性、技能、装备
- 输出 JSON 数据到 src/data/characters.json

### Step 3: 前端开发
1. 布局框架 (Header + Main + Footer)
2. 角色数据库页面 (搜索 + 筛选 + 详情)
3. 阵容模拟器 (拖放 + 实时计算)
4. 智能推荐页面
5. 导出功能

### Step 4: 推荐算法
- 基于舰种搭配 (前卫 + 驱逐 + 航母等)
- 基于技能协同 ( buff/debuff 组合)
- 基于用户练度过滤

### Step 5: 部署配置
- GitHub Actions 自动构建
- GitHub Pages 托管
- 自定义域名 (可选)

## 验收标准
- [ ] 角色数据库可查询所有舰船
- [ ] 拖放阵容构建流畅
- [ ] 属性计算准确
- [ ] 推荐算法合理
- [ ] 移动端适配良好
- [ ] GitHub Pages 可访问
