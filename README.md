# 数学三角函数表网站

一个功能强大的数学三角函数计算网站，支持分数形式和小数点后20位精度显示。

## ✨ 功能特性

### 1. 交互式计算器
- 支持输入角度或数学表达式
- 提供数学符号快捷按钮（π、°、sin、cos、tan等）
- 实时计算并显示结果

### 2. 双模式结果显示
- **分数值**: 使用 KaTeX 渲染精确的数学分数形式
- **小数值**: 显示小数点后20位的高精度结果

### 3. 常用三角函数表
- 包含 0°、30°、45°、60°、90°、180°、270°、360° 的完整三角函数值
- 点击表格行可快速填充到计算器
- 显示角度、弧度、sin、cos、tan、cot、sec、csc 全部值

### 4. 支持的数学运算
- 三角函数: sin、cos、tan、cot、sec、csc
- 数学常量: π (pi)
- 角度/弧度转换: ° (deg)
- 运算符: +、-、×、÷、^、√
- 括号支持

## 🛠 技术栈

### 前端
- **React 18** + **TypeScript** - 现代前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量的 React 组件库
- **KaTeX** - 数学公式渲染引擎
- **Lucide React** - 图标库

### 后端
- **Python** + **FastAPI** - 高性能异步 Web 框架
- 提供 RESTful API 进行数学计算

### 运行时
- **Deno** - 现代 JavaScript/TypeScript 运行时
- 内置静态文件服务器
- 内置三角函数计算 API

## 📁 项目结构

```
/mnt/okcomputer/output/app/
├── src/                          # 前端源代码
│   ├── App.tsx                   # 主应用组件
│   ├── App.css                   # 应用样式
│   ├── main.tsx                  # 入口文件
│   └── ...
├── api/                          # 后端 API
│   ├── main.py                   # FastAPI 主文件
│   └── requirements.txt          # Python 依赖
├── dist/                         # 构建输出目录
├── server.ts                     # Deno 服务器
├── deno.json                     # Deno 配置文件
├── design.md                     # 设计文档
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 使用 Deno 运行完整服务

```zsh
# 进入项目目录
cd /mnt/okcomputer/output/app

# 安装依赖
npm install

# 构建前端
npm run build

# 启动 Deno 服务器
deno task start
```

服务器将在 http://localhost:8000 启动

## 📋 Deno 配置说明

### deno.json
```json
{
  "name": "math-trig-table",
  "version": "1.0.0",
  "tasks": {
    "dev": "deno run --allow-all --watch server.ts",
    "start": "deno run --allow-all server.ts",
    "build": "npm run build",
    "serve": "deno run --allow-all server.ts"
  },
  "imports": {
    "@std/http": "jsr:@std/http@^1.0.0",
    "@std/path": "jsr:@std/path@^1.0.0"
  }
}
```

### server.ts 功能
- 静态文件服务（dist 目录）
- API 路由处理
- 内置三角函数计算
- CORS 支持

## 🔌 API 接口

### POST /api/calculate
计算三角函数表达式

**请求体**:
```json
{
  "expression": "sin(30)"
}
```

**响应**:
```json
{
  "fraction": "\\frac{1}{2}",
  "decimal": "0.50000000000000000000"
}
```

### GET /api/health
健康检查

**响应**:
```json
{
  "status": "healthy",
  "service": "math-trig-api"
}
```

### GET /api/trig-table
获取常用三角函数表

**响应**:
```json
{
  "data": [
    { "angle": "0°", "rad": "0", "sin": "0", "cos": "1", "tan": "0", ... },
    ...
  ]
}
```

## 🎨 设计系统

### 色彩方案
- 背景色: `#1a1a1a` (深色)
- 主色: `#d4a373` (温暖金色)
- 次色: `#4a4a4a` (深灰)
- 强调色: `#e8c4a0` (浅金色)
- 文字色: `#f5f5f5` (浅灰白)

### 字体
- 标题: Space Grotesk
- 正文: Inter
- 数学公式: KaTeX_Main

### 动画
- 入场动画: fadeInUp (600ms, outQuart)
- 悬停效果: 颜色过渡 + 轻微上移
- 按钮点击: 缩放反馈

## 📝 使用示例

1. **计算 sin(30°)**:
   - 输入: `sin(30)`
   - 分数结果: 1/2
   - 小数结果: 0.50000000000000000000

2. **计算 cos(45°)**:
   - 输入: `cos(45)`
   - 分数结果: √2/2
   - 小数结果: 0.70710678118654752440

3. **计算 tan(60°)**:
   - 输入: `tan(60)`
   - 分数结果: √3
   - 小数结果: 1.73205080756887729353

4. **弧度计算**:
   - 输入: `sin(pi/4)`
   - 分数结果: √2/2
   - 小数结果: 0.70710678118654752440

## 🔧 构建部署

```zsh
# 构建前端
cd /mnt/okcomputer/output/app
npm run build

# 部署 dist 目录到静态服务器
```

## 📄 许可证

MIT License

---

**作者**: xiaoamo22333
**创建日期**: 2026年2月16日
