# LearningOS 开发计划

## 📋 系统定位

**LearningOS** 是一个**学习行为系统 + 内容生产平台**
- 核心价值：产生和记录学习行为，支持内容创作与发布
- 采用本地优先策略（第一阶段无需云端）
- 循序渐进的功能升级路线

---

## 🎯 总体架构

在现有 LearningOS 仓库基础上，分为两个子系统：

```
LearningOS/
├── docs/                    # 原有内容系统（静态页面，保持不动）
│   ├── learn/              # 学习内容目录
│   └── public/
│       └── audio/          # 音频文件存储
│
├── app/                     # 👈 新增：学习应用核心（动态功能）
│   ├── index.html           # 看板页（今日复习）
│   ├── recorder.html        # 录音页
│   ├── editor.html          # 文章编辑器（语音输入）
│   ├── folder.html          # 文件夹页
│   └── js/
│       ├── db.js            # IndexedDB 数据操作
│       ├── recorder.js      # 浏览器录音 API
│       ├── speech.js        # 语音识别（Speech Recognition）
│       ├── scheduler.js     # 艾宾浩斯复习调度
│       ├── exporter.js      # Markdown 导出
│       ├── folder.js        # 文件夹逻辑
│       └── app.js           # UI 渲染和交互
│
└── public/
    └── qrcodes/             # 全局二维码资源
```

---

## 🚀 分阶段开发计划

### **第一阶段：最小可行版本（MVP）✅ 已完成**

目标：建立"录音 → 存储 → 复习"的完整闭环

#### ✅ 已完成功能

**1. 数据库模块（db.js）**
- ✅ IndexedDB 存储音频数据
- ✅ saveAudio / getAllAudios / updateAudio / deleteAudio
- ✅ 按文件夹查询 / 获取所有文件夹列表

**2. 录音模块（recorder.js）**
- ✅ MediaRecorder API 封装
- ✅ 开始/停止录音
- ✅ 音频 Blob 处理

**3. 调度模块（scheduler.js）**
- ✅ 艾宾浩斯复习算法 [0, 1, 3, 7] 天
- ✅ createReviews / isToday / getTodayFolder

**4. 应用逻辑模块（app.js）**
- ✅ renderTodayList - 今日待复习项目展示
- ✅ 按文件夹分组显示
- ✅ 标记完成功能

**5. 前端页面**
- ✅ recorder.html - 录音页面
- ✅ index.html - 看板页面
- ✅ folder.html - 文件夹详情页

**6. 增强功能**
- ✅ URL 参数支持 (?folder=YYYY-MM-DD)
- ✅ 日期切换功能
- ✅ 统计面板（录音数、完成率等）
- ✅ 删除功能
- ✅ 二维码集成指南

---

### **第二阶段：内容生产系统（当前阶段）**

目标：增加语音转文字、文章管理、Markdown 导出功能

#### 阶段2.1：语音输入编辑器

**新建文件：`app/editor.html`**

功能需求：
- [ ] 语音识别输入（Speech Recognition API）
- [ ] 文本编辑区域
- [ ] 开始/停止语音输入按钮
- [ ] 手动编辑支持

**技术实现：**
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recog = new SpeechRecognition()
recog.lang = "zh-CN"
recog.continuous = true
recog.onresult = (event) => { /* 处理识别结果 */ }
```

**注意事项：**
- ⚠️ Chrome 浏览器支持最好
- ⚠️ iOS Safari 支持有限
- ⚠️ 需要用户授权麦克风

---

#### 阶段2.2：文章数据结构扩展

**修改文件：`app/js/db.js`**

功能需求：
- [ ] 扩展数据存储支持文章类型
- [ ] saveArticle 函数
- [ ] getAllArticles 函数
- [ ] 按文件夹获取文章

**数据结构设计：**
```javascript
// 音频对象
{
  id: "timestamp",
  type: "audio",
  blob: Blob,
  folder: "2026-04-20",
  createdAt: timestamp,
  reviews: [...]
}

// 文章对象
{
  id: "timestamp",
  type: "article",
  content: "文章内容",
  folder: "2026-04-20",
  createdAt: timestamp
}
```

---

#### 阶段2.3：文章保存功能

**修改文件：`app/editor.html`**

功能需求：
- [ ] 标题输入框
- [ ] 学习目标输入（多行）
- [ ] 正文编辑区
- [ ] 记忆点输入
- [ ] 小测试输入
- [ ] 保存按钮
- [ ] 自动关联当前文件夹

**UI 布局：**
```html
<h3>标题</h3>
<input id="title" />

<h3>学习目标（每行一个）</h3>
<textarea id="goals"></textarea>

<h3>正文</h3>
<textarea id="content" rows="10"></textarea>

<h3>记忆点</h3>
<textarea id="memory"></textarea>

<h3>小测试</h3>
<textarea id="quiz"></textarea>

<button id="save">💾 保存文章</button>
<button id="export">📤 导出 Markdown</button>
```

---

#### 阶段2.4：Markdown 导出模块

**新建文件：`app/js/exporter.js`**

功能需求：
- [ ] generateMarkdown - 生成标准 Markdown
- [ ] downloadMarkdown - 下载 .md 文件
- [ ] buildFilename - 生成规范文件名
- [ ] exportAll - 一键导出（文章 + 音频）

**Markdown 模板：**
```markdown
# {{title}}

## 🎯 学习目标
{{goals}}

## 📖 内容
{{content}}

## 🔊 音频
{{audioSection}}

## 🧠 记忆点
{{memory}}

## ❓ 小测试
{{quiz}}

## 🔁 复习建议
- 第1天：学习
- 第3天：复习
- 第7天：复习
```

**导出流程：**
1. 获取同文件夹下的所有音频
2. 重命名音频为 `{slug}-audio-{n}.webm`
3. 下载所有音频文件
4. 生成 Markdown（包含音频引用）
5. 下载 Markdown 文件
6. 提示建议路径

---

#### 阶段2.5：看板支持文章显示

**修改文件：`app/js/app.js`**

功能需求：
- [ ] renderTodayList 支持文章类型
- [ ] 文章预览显示（前50字符）
- [ ] 点击可查看完整文章
- [ ] 音频和文章混合显示

**代码逻辑：**
```javascript
if (item.type === "audio") {
  // 显示音频播放器
} else if (item.type === "article") {
  // 显示文章预览
  const preview = item.content.slice(0, 50) + "..."
}
```

---

#### 阶段2.6：文章查看页面

**新建文件：`app/article.html`**

功能需求：
- [ ] 从 URL 参数获取文章 ID
- [ ] 显示完整文章内容
- [ ] 显示关联音频
- [ ] 返回文件夹链接
- [ ] 重新编辑按钮

**URL 格式：**
```
/app/article.html?id=1234567890
```

---

### **第三阶段：发布系统集成**

目标：实现从 app 到 docs 的内容发布流程

#### 阶段3.1：导出优化

**增强功能：**
- [ ] 自动创建文件夹结构提示
- [ ] 批量导出（整个文件夹）
- [ ] 导出历史记录
- [ ] 复制到剪贴板功能

**建议路径生成：**
```javascript
const suggestedPath = `/docs/learn/${folder}/${filename}`
alert(`请将文件放入：${suggestedPath}`)
```

---

#### 阶段3.2：音频文件管理

**功能需求：**
- [ ] 音频文件统一导出到 `/docs/public/audio/`
- [ ] 音频命名规范化
- [ ] Markdown 中正确引用路径
- [ ] 音频文件去重检查

**路径规范：**
```
/docs/learn/2026-04-20/article.md
/docs/public/audio/article-audio-1.webm
```

---

#### 阶段3.3：发布检查清单

**自动生成发布清单：**
```markdown
## 发布检查清单

- [ ] Markdown 文件已放入: /docs/learn/YYYY-MM-DD/
- [ ] 音频文件已放入: /docs/public/audio/
- [ ] 音频路径在 Markdown 中正确引用
- [ ] 运行 git add .
- [ ] 运行 git commit -m "add: 文章标题"
- [ ] 运行 git push
```

---

### **第四阶段：高级功能（产品化）**

目标：提升用户体验，增加智能化功能

#### 阶段4.1：AI 辅助写作

**功能需求：**
- [ ] 语音转文字后 AI 整理
- [ ] 自动生成文章大纲
- [ ] 智能提取记忆点
- [ ] 自动生成小测试题

**技术方案：**
- 接入 OpenAI API（需后端代理）
- 或使用本地 LLM（如 Ollama）

---

#### 阶段4.2：一键发布到 GitHub

**功能需求：**
- [ ] GitHub OAuth 登录
- [ ] 直接 push 到仓库
- [ ] 自动创建 Pull Request
- [ ] 发布状态反馈

**技术挑战：**
- ⚠️ 需要处理 Token 安全
- ⚠️ 需要 GitHub API 集成
- ⚠️ 建议通过后端代理实现

---

#### 阶段4.3：学习数据分析

**功能需求：**
- [ ] 连续打卡统计
- [ ] 学习时长统计
- [ ] 复习完成率图表
- [ ] 周/月学习报告

**可视化方案：**
- 使用 Chart.js 或 ECharts
- 生成本地 HTML 报告

---

#### 阶段4.4：云同步功能

**功能需求：**
- [ ] 用户账户系统
- [ ] 数据云端备份
- [ ] 多设备同步
- [ ] 离线优先策略

**技术方案：**
- Supabase（PostgreSQL + Auth）
- Cloudflare R2（文件存储）

---

## 📅 开发时间表

| 阶段 | 预计时间 | 主要交付物 |
|------|---------|-----------|
| 第一阶段（已完成） | ✅ | 录音、存储、复习闭环 |
| 阶段2.1-2.2 | 1-2天 | 语音编辑器、数据结构扩展 |
| 阶段2.3-2.4 | 1-2天 | 文章保存、Markdown 导出 |
| 阶段2.5-2.6 | 1天 | 看板支持文章、文章查看页 |
| 阶段3.1-3.3 | 1-2天 | 发布系统优化、检查清单 |
| 第四阶段 | 待定 | AI、云同步等高级功能 |

---

## 🎯 优先级排序

### P0 - 立即实施（核心功能）
1. ✅ 第一阶段（已完成）
2. 阶段2.1 - 语音输入编辑器
3. 阶段2.4 - Markdown 导出模块
4. 阶段2.2 - 文章数据结构扩展

### P1 - 短期实施（重要功能）
5. 阶段2.3 - 文章保存功能
6. 阶段2.5 - 看板支持文章
7. 阶段3.1 - 导出优化

### P2 - 中期实施（增强功能）
8. 阶段2.6 - 文章查看页面
9. 阶段3.2 - 音频文件管理
10. 阶段3.3 - 发布检查清单

### P3 - 长期规划（产品化）
11. 阶段4.1 - AI 辅助写作
12. 阶段4.3 - 学习数据分析
13. 阶段4.2 - 一键发布到 GitHub
14. 阶段4.4 - 云同步功能

---

## 🔧 技术栈总结

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | HTML5 + Vanilla JS | 轻量、无依赖、易维护 |
| **存储** | IndexedDB | 浏览器原生，支持大文件 |
| **录音** | MediaRecorder API | W3C 标准 |
| **语音识别** | Web Speech API | 浏览器内置（Chrome 最佳） |
| **复习算法** | 艾宾浩斯 [0,1,3,7] | 科学验证的间隔 |
| **导出** | Blob API | 客户端文件生成 |
| **部署** | GitHub Pages | 静态托管 |

---

## ⚠️ 已知限制与解决方案

| 限制 | 影响 | 解决方案 |
|------|------|----------|
| Speech API iOS 支持差 | iPhone 用户无法语音输入 | 提示使用 Chrome 或手动输入 |
| 浏览器不能直接写 GitHub | 无法完全自动化发布 | 提供清晰的发布流程和检查清单 |
| IndexedDB 无云同步 | 数据仅限本地 | 计划第四阶段引入云同步 |
| 麦克风权限要求 localhost | 不能用 file:// 协议 | 强制使用 npm run dev 启动 |

---

## 📝 下一步行动

### 立即开始（今天）

1. **创建 `app/editor.html`** - 语音输入编辑器
2. **创建 `app/js/speech.js`** - 语音识别封装
3. **创建 `app/js/exporter.js`** - Markdown 导出模块
4. **扩展 `app/js/db.js`** - 支持文章类型

### 本周完成

5. 实现文章保存功能
6. 实现一键导出（文章 + 音频）
7. 更新看板支持文章显示
8. 编写使用文档

### 下周完成

9. 创建文章查看页面
10. 优化导出流程
11. 添加发布检查清单
12. 测试完整流程

---

## 🎓 成功标准

### 第一阶段（已完成）✅
- ✅ 可以录音并保存到本地
- ✅ 可以看到今日待复习项目
- ✅ 可以标记复习完成
- ✅ 支持文件夹管理和二维码

### 第二阶段目标
- ✅ 可以通过语音输入写文章
- ✅ 可以保存文章到本地
- ✅ 可以一键导出标准 Markdown
- ✅ 导出的 Markdown 可直接用于发布

### 第三阶段目标
- ✅ 导出流程清晰明确
- ✅ 音频和文章正确关联
- ✅ 发布检查清单完善
- ✅ 用户可独立完成发布

---

## 💡 关键设计原则

1. **本地优先** - 所有功能先在本地可用
2. **渐进增强** - 从简单到复杂逐步迭代
3. **桥接而非合并** - app（动态）和 docs（静态）保持独立但互通
4. **用户可控** - 导出而非自动发布，保证安全性
5. **可扩展性** - 数据结构预留扩展空间

---

**最后更新**: 2026-04-21  
**版本**: 2.0 规划  
**状态**: 第二阶段开发中
