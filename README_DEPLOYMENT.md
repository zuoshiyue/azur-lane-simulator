# 🚀 碧蓝航线阵容模拟器 - 快速启动指南

## ✅ 功能已完成

角色池 CRUD 功能已全部实现并构建成功！

### 新增功能
- ✅ 角色池管理页面
- ✅ 添加/编辑/删除角色
- ✅ 搜索筛选 + 统计信息
- ✅ 批量导入导出（JSON）
- ✅ 本地存储持久化

---

## 🌐 访问方式

### 方式 1：本地开发（推荐）

```bash
cd ~/.openclaw/workspace/projects/azur-lane-simulator
npm run dev
```

然后在浏览器访问：**http://localhost:5173**

### 方式 2：预览构建版本

```bash
cd ~/.openclaw/workspace/projects/azur-lane-simulator
npm run preview
```

### 方式 3：GitHub Pages（需手动部署）

由于网络原因，自动部署失败。请手动执行：

```bash
cd ~/.openclaw/workspace/projects/azur-lane-simulator
npm run deploy
```

部署成功后访问：
**https://zuoshiyue.github.io/azur-lane-simulator**

---

## 📖 使用说明

### 1. 进入角色池管理
- 点击顶部导航栏的 **"角色池管理"** 按钮（数据库图标）

### 2. 添加新角色
- 点击右上角 **"添加角色"** 蓝色按钮
- 填写完整信息：
  - 基本信息：英文名、中文名、稀有度、舰种、阵营
  - 基础属性：耐久、火力、鱼雷等 10 项属性
  - 技能：可添加多个，支持主动/被动
  - 装备槽：自定义槽位和效率
- 点击 **"添加角色"** 保存

### 3. 编辑角色
- 在角色卡片上悬停
- 点击右上角 **✏️ 编辑图标**
- 修改后保存

### 4. 删除角色
- **单个删除**: 悬停卡片 → 点击 🗑️ 删除图标
- **批量删除**: 勾选多个角色 → 点击底部红色"删除"按钮

### 5. 搜索筛选
- 搜索框：输入角色名、类型、阵营
- 筛选器：选择舰种、阵营
- 视图切换：网格/列表

### 6. 导入导出
- **导出**: 点击"导出" → 自动下载 JSON 文件
- **导入**: 点击"导入" → 选择 JSON 文件 → 自动合并

---

## 📊 统计面板

角色池管理页面顶部显示：
- 总角色数
- SSR (6★) 数量 - 黄色
- SR (5★) 数量 - 紫色
- R (4★) 数量 - 蓝色
- N (3★) 数量 - 灰色
- 筛选结果数 - 绿色

---

## 💾 数据存储

所有数据保存在浏览器 localStorage：
- `azur_all_characters` - 所有角色数据
- `azur_fleets` - 阵容数据

**注意**: 清除浏览器缓存会丢失数据，建议定期导出备份！

---

## 📁 项目位置

```
~/.openclaw/workspace/projects/azur-lane-simulator/
├── src/
│   ├── components/
│   │   ├── CharacterPoolManager.tsx  ← 新增
│   │   ├── CharacterForm.tsx         ← 新增
│   │   ├── CharacterCard.tsx         ← 已更新
│   │   ├── CharacterDatabase.tsx
│   │   └── FleetSimulator.tsx
│   ├── data/
│   │   └── characterData.ts          ← 已更新
│   └── App.tsx                       ← 已更新
├── dist/                              ← 构建输出
└── UPDATE_REPORT.md                   ← 详细报告
```

---

## 🎨 界面预览

### 角色池管理页面
- 顶部：操作按钮 + 统计卡片
- 中部：搜索筛选栏
- 底部：角色卡片网格

### 角色表单弹窗
- 分块设计，滚动查看
- 底部：取消 | 保存 按钮

---

## 🔧 故障排除

### 本地开发无法启动
```bash
# 重新安装依赖
npm install

# 清理缓存
npm run clean

# 重新启动
npm run dev
```

### 构建失败
```bash
# 检查 TypeScript 错误
npx tsc --noEmit

# 重新构建
npm run build
```

### 部署失败
```bash
# 检查 git 配置
git remote -v

# 手动推送
cd dist
git init
git add .
git commit -m "Deploy"
git push -f git@github.com:zuoshiyue/azur-lane-simulator.git main:gh-pages
```

---

## 📞 技术支持

查看详细更新报告：`UPDATE_REPORT.md`

**更新时间**: 2026-03-08  
**版本**: v1.1.0
