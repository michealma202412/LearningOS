# Learning OS - 教育学习系统

一个轻量级的学习操作系统，支持扫码学习、多媒体内容和艾宾浩斯复习周期。

## 🚀 快速开始

### 环境要求
- Windows 10/11
- Node.js 20+ （已通过 winget 自动安装）
- npm 10+

### 安装依赖

打开 PowerShell，进入项目目录：

```powershell
cd d:\001_temp\02_EduWeb
```

安装依赖：

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

### 启动开发服务器

```powershell
& "C:\Program Files\nodejs\node.exe" ".\node_modules\vite\bin\vite.js"
```

打开浏览器访问：[http://localhost:5173](http://localhost:5173)

### 运行测试

```powershell
& "C:\Program Files\nodejs\npm.cmd" test
```

---

## 📁 项目结构

```
src/
├── main.tsx                 # 应用入口
├── App.tsx                  # 路由及主应用
├── styles.css              # 全局样式
├── components/             # React 组件
│   ├── HomePage.tsx        # 首页
│   ├── SubjectPage.tsx     # 学科页面
│   ├── LearningPage.tsx    # 学习单元页面
│   └── NotFoundPage.tsx    # 404 页面
├── data/
│   └── learningData.ts     # 学习数据定义
└── __tests__/
    └── App.test.tsx        # 测试用例
```

---

## 🔗 URL 路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 - 选择学科 |
| `/learn/chinese` | 语文课程列表 |
| `/learn/math` | 数学课程列表 |
| `/learn/{subject}/{topic}/{page}` | 具体学习单元 |

### 示例
- `/learn/chinese/food-history/noodle` - 面条历史学习单元
- `/learn/math/addition/within-20` - 20以内加法

---

## 📚 学习单元结构

每个学习页面包含：

- **🎯 学习目标** - 本课程的学习目标
- **📖 内容** - 主要教学内容
- **🧠 记忆点** - 需要记忆的关键点
- **❓ 小测试** - 检测学习效果的问题
- **🔁 复习建议** - 艾宾浩斯复习周期（第1、3、7天）
- **QRCode** - 本页面的二维码，用于扫码学习

---

## 🔧 自定义学习内容

编辑 `src/data/learningData.ts` 添加新的学科或章节：

```typescript
{
  slug: 'english',
  title: '英语',
  topics: [
    {
      slug: 'alphabet',
      title: '字母表',
      pages: [
        {
          subjectSlug: 'english',
          topicSlug: 'alphabet',
          pageSlug: 'a-to-f',
          title: 'A to F',
          goals: ['学习 A-F 字母'],
          content: '...',
          memoryPoints: ['...'],
          quiz: ['...'],
          reviewPlan: ['...']
        }
      ]
    }
  ]
}
```

---

## 📦 依赖清单

| 包名 | 版本 | 用途 |
|------|------|------|
| vite | ^5.4.1 | 前端构建工具 |
| react | ^18.3.1 | UI 框架 |
| react-router-dom | ^6.14.1 | 路由管理 |
| qrcode | ^1.5.1 | 二维码生成 |
| vitest | ^4.1.4 | 单元测试框架 |
| jsdom | ^29.0.2 | DOM 测试环境 |
| @testing-library/react | ^14.0.0 | React 测试工具 |

---

## ✅ 测试覆盖

目前提供 3 个测试用例：
- ✓ 首页加载测试
- ✓ 学科页面加载测试
- ✓ 学习单元页面加载测试

运行 `npm test` 验证所有功能正常。

---

## 🎯 下一步

根据 `doc/plan.md` 的规划，后续可以：

1. 添加用户系统和学习记录
2. 接入 AI Agent 自动生成内容
3. 实现学习行为追踪
4. 集成电纸屏（e-ink）支持
5. 开发个性化学习路径推荐

---

## 📝 License

MIT

---

## 🔗 相关资源

- [Vite 文档](https://vitejs.dev/)
- [React Router 文档](https://reactrouter.com/)
- [Vitest 文档](https://vitest.dev/)
- [QRCode.js 文档](https://davidshimjs.github.io/qrcode.js/)
