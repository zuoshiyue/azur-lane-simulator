#!/bin/bash
# AzurAPI 数据下载和集成脚本
# 使用方法：./scripts/fetch-and-convert.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/public/data"

echo "🚀 碧蓝航线 AzurAPI 数据集成脚本"
echo "================================"
echo ""

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p "$DATA_DIR"

# 下载数据
echo "📥 下载 AzurAPI 数据..."
echo "   源：https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json"
echo "   目标：$DATA_DIR/ships.json"
echo ""

# 尝试多种下载方式
download_success=false

# 方式 1：直接下载
if curl -L --connect-timeout 10 --max-time 120 \
  "https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json" \
  -o "$DATA_DIR/ships.json" 2>/dev/null; then
  if [ -s "$DATA_DIR/ships.json" ]; then
    download_success=true
    echo "✅ 下载成功（方式 1：GitHub Raw）"
  fi
fi

# 方式 2：使用 jsDelivr 镜像
if [ "$download_success" = false ]; then
  echo "⚠️  方式 1 失败，尝试镜像源..."
  if curl -L --connect-timeout 10 --max-time 120 \
    "https://cdn.jsdelivr.net/gh/AzurAPI/azurapi-js-setup@master/ships.json" \
    -o "$DATA_DIR/ships.json" 2>/dev/null; then
    if [ -s "$DATA_DIR/ships.json" ]; then
      download_success=true
      echo "✅ 下载成功（方式 2：jsDelivr 镜像）"
    fi
  fi
fi

# 检查下载结果
if [ "$download_success" = false ]; then
  echo "❌ 下载失败，请检查网络连接"
  echo ""
  echo "手动下载方法："
  echo "1. 访问：https://github.com/AzurAPI/azurapi-js-setup/blob/master/ships.json"
  echo "2. 点击 'Raw' 按钮"
  echo "3. 右键保存为 ships.json"
  echo "4. 放置到：$DATA_DIR/"
  exit 1
fi

# 显示文件大小
file_size=$(ls -lh "$DATA_DIR/ships.json" | awk '{print $5}')
echo "📊 文件大小：$file_size"
echo ""

# 转换数据
echo "🔄 转换数据格式..."
cd "$PROJECT_DIR"
node scripts/convert-azurapi-data.js

# 检查转换结果
if [ -f "$PROJECT_DIR/src/data/characters-azurapi.json" ]; then
  converted_size=$(ls -lh "$PROJECT_DIR/src/data/characters-azurapi.json" | awk '{print $5}')
  echo ""
  echo "✅ 转换完成！"
  echo "📄 输出文件：$PROJECT_DIR/src/data/characters-azurapi.json"
  echo "📊 文件大小：$converted_size"
else
  echo "❌ 转换失败"
  exit 1
fi

echo ""
echo "================================"
echo "✨ AzurAPI 数据集成完成！"
echo ""
echo "下一步："
echo "1. 运行开发服务器：npm run dev"
echo "2. 或构建生产版本：npm run build"
echo "3. 部署到 GitHub Pages: npm run deploy"
echo ""
