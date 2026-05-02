# LearningOS 需求文档 v2.0

**最后更新**: 2026-05-02  
**版本**: v2.0 - 移动端完整需求与实现方案  
**状态**: 核心功能已完成，部分高级功能待实现

---

## 📋 目录

1. [项目概述](#项目概述)
2. [已完成功能](#已完成功能)
3. [待实现功能](#待实现功能)
4. [技术架构](#技术架构)
5. [实现方案](#实现方案)
6. [开发路线图](#开发路线图)

---

## 项目概述

### 核心理念

> **LearningOS 在手机上不是一个 App，而是一个"随时记录大脑"的按钮**

### 目标用户

- 学生、研究者、知识工作者
- 需要快速记录灵感和学习内容的人群
- 重视复习和知识沉淀的学习者

### 核心价值

1. **极速记录** - < 2秒开始记录
2. **智能整理** - AI 自动结构化笔记
3. **科学复习** - 艾宾浩斯遗忘曲线
4. **多端同步** - Web + iOS + Android
5. **离线优先** - 无网络也能使用

---

## ✅ 已完成功能

### 1. Web 版本（生产就绪）

#### 基础功能
- ✅ React 18 + TypeScript + Vite
- ✅ 响应式设计（支持桌面/平板/手机浏览器）
- ✅ IndexedDB 本地存储（idb库）
- ✅ GitHub Pages 部署

#### 核心功能
- ✅ 语音录音（Web MediaRecorder API）
- ✅ 文本编辑和完善
- ✅ 笔记保存和管理
- ✅ 文件列表展示
- ✅ 内联展开查看（符合"不切换原则"）
- ✅ 删除确认对话框

#### 复习系统
- ✅ 艾宾浩斯遗忘曲线算法
- ✅ 自动计算复习周期（1, 2, 4, 8, 16...天）
- ✅ 待复习列表筛选
- ✅ 复习进度追踪

#### 二维码功能
- ✅ 为每条笔记生成唯一二维码
- ✅ URL格式: `learningos://note/{id}`
- ✅ 模态框展示
- ✅ 首页快速访问入口

#### 用户认证
- ✅ GitHub OAuth 登录
- ✅ 用户名/密码注册登录
- ✅ 会话管理
- ✅ 权限控制

**代码位置**: `src/` 目录

---

### 2. Capacitor 移动端架构（代码完成，待真机测试）

#### 原生能力集成
- ✅ SQLite 数据库（@capacitor-community/sqlite）
- ✅ 原生录音引擎（capacitor-voice-recorder）
- ✅ 文件系统（@capacitor/filesystem）
- ✅ 扫码功能（@capacitor-community/barcode-scanner）
- ✅ 本地通知（@capacitor/local-notifications）

#### 移动端页面
- ✅ RecordPage - 快速记录页面
- ✅ FilesPage - 文件列表页面（内联展开）
- ✅ ReviewPage - 复习页面
- ✅ ScannerPage - 扫码页面

#### 平台配置
- ✅ iOS 项目配置（ios/App/）
- ✅ Android 项目配置（android/）
- ✅ Info.plist 权限配置（麦克风、相机、相册）
- ✅ capacitor.config.json 配置

**代码位置**: `src/mobile/`, `ios/`, `android/`

---

### 3. Expo Go 原型（验证完成）

#### 功能验证
- ✅ 四大核心页面 UI 验证
- ✅ AsyncStorage 数据持久化
- ✅ 艾宾浩斯复习算法验证
- ✅ 二维码生成功能
- ✅ 底部导航交互

#### 优势
- ✅ 无需 macOS 即可在 iOS/Android 测试
- ✅ 快速原型验证
- ✅ 跨平台支持

**代码位置**: `learningos-expo/`

---

## ⏳ 待实现功能

### 优先级 P0（核心功能，必须实现）

#### 1. 真实 ASR 服务集成 🔴🔴🔴

**现状**: 
- Web 版本使用浏览器内置 SpeechRecognition（仅 Chrome 支持）
- 移动端录音后无法转文字（仅保存音频）

**需求**:
- 部署 Whisper ASR 服务
- 实现流式语音识别
- 支持中文/英文混合识别
- 实时显示识别结果

**实现方案**:

```typescript
// 方案 A: 自建 Whisper 服务（推荐）
// 后端: FastAPI + OpenAI Whisper
// 前端: WebSocket 流式传输

// core/engine/asr.ts
export class ASREngine {
  private ws: WebSocket;
  
  async connect() {
    this.ws = new WebSocket('wss://your-domain.com/asr');
  }
  
  async transcribe(audioBlob: Blob): Promise<string> {
    return new Promise((resolve) => {
      this.ws.onmessage = (event) => {
        const result = JSON.parse(event.data);
        resolve(result.text);
      };
      
      this.ws.send(audioBlob);
    });
  }
}

// 方案 B: 使用第三方 API
// - Azure Speech Service
// - Google Cloud Speech-to-Text
// - 讯飞语音识别
```

**工作量**: 3-5 天  
**依赖**: 服务器部署、API Key

---

#### 2. iOS 真机测试和发布 🔴🔴🔴

**现状**:
- iOS 项目已配置
- 代码已就绪
- 未在真机上测试

**需求**:
- 在 macOS + Xcode 环境中编译
- 真机测试所有功能
- 修复发现的问题
- 准备 App Store 提交

**实现步骤**:

```bash
# 1. 在 macOS 上克隆代码
git clone https://github.com/michealma202412/LearningOS.git
cd LearningOS
git checkout mobile_version

# 2. 安装依赖并构建
npm install
npm run build

# 3. 同步到 iOS
npx cap sync ios

# 4. 打开 Xcode
npx cap open ios

# 5. 在 Xcode 中:
#    - 配置签名（Apple ID）
#    - 选择设备
#    - 点击运行
```

**测试清单**:
- [ ] 录音功能稳定（100% 成功率）
- [ ] 后台录音继续工作
- [ ] SQLite 数据持久化
- [ ] 扫码功能正常
- [ ] 启动时间 < 2秒
- [ ] 无崩溃和内存泄漏

**工作量**: 2-3 天（含环境配置）  
**依赖**: macOS 电脑、Xcode、Apple ID

---

#### 3. Android 真机测试和发布 🔴🔴🔴

**现状**:
- Android 项目已配置
- 未在真机上测试

**需求**:
- 在 Android Studio 中编译
- 真机测试所有功能
- 准备 Google Play 提交

**实现步骤**:

```bash
# 1. 同步到 Android
npx cap sync android

# 2. 打开 Android Studio
npx cap open android

# 3. 在 Android Studio 中:
#    - 配置 Gradle
#    - 选择设备/模拟器
#    - 点击运行
```

**工作量**: 1-2 天  
**依赖**: Android Studio、JDK

---

### 优先级 P1（重要功能，近期实现）

#### 4. GitHub 数据同步 🟡🟡

**现状**:
- 数据仅保存在本地
- 无云端备份
- 多设备无法同步

**需求**:
- 自动同步到 GitHub Gist/Repository
- 冲突解决策略
- 离线队列机制
- 手动触发同步

**实现方案**:

```typescript
// core/services/sync.service.ts
export class SyncService {
  private syncQueue: Array<{action: string, data: any}> = [];
  
  // 添加到同步队列
  async queueSync(action: string, data: any) {
    this.syncQueue.push({ action, data });
    
    if (navigator.onLine) {
      await this.flushQueue();
    }
  }
  
  // 执行同步
  async flushQueue() {
    for (const item of this.syncQueue) {
      await this.syncToGitHub(item);
    }
    this.syncQueue = [];
  }
  
  // 同步到 GitHub
  private async syncToGitHub(item: any) {
    const token = localStorage.getItem('github_token');
    
    await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [item.data.id + '.md']: {
            content: item.data.content
          }
        }
      })
    });
  }
}

// 监听网络状态
window.addEventListener('online', () => {
  syncService.flushQueue();
});
```

**工作量**: 5-7 天  
**依赖**: GitHub API、OAuth Token

---

#### 5. AI 智能整理 🟡🟡

**现状**:
- 录音后需手动编辑文本
- 无自动结构化

**需求**:
- AI 自动提取关键词
- 自动生成标题
- 自动分类标签
- 生成摘要

**实现方案**:

```typescript
// core/engine/ai.ts
export class AIEngine {
  async processNote(content: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个学习笔记整理助手。请从以下内容中提取：1.标题 2.关键词 3.分类 4.摘要'
          },
          {
            role: 'user',
            content: content
          }
        ]
      })
    });
    
    const result = await response.json();
    return this.parseAIResult(result.choices[0].message.content);
  }
  
  private parseAIResult(aiResponse: string) {
    // 解析 AI 返回的结构化数据
    return {
      title: '...',
      keywords: ['...'],
      category: '...',
      summary: '...'
    };
  }
}
```

**工作量**: 3-5 天  
**依赖**: OpenAI API Key、成本控制

---

#### 6. 复习通知推送 🟡🟡

**现状**:
- 复习需手动打开应用查看
- 无主动提醒

**需求**:
- 每日定时推送待复习内容
- 可配置推送时间
- 点击通知直接跳转到复习页面

**实现方案**:

```typescript
// core/services/notification.service.ts
import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  async scheduleDailyReview() {
    // 获取待复习内容
    const dueNotes = await reviewService.getDueReviews();
    
    if (dueNotes.length > 0) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '今日复习',
            body: `你有 ${dueNotes.length} 条笔记需要复习`,
            schedule: {
              every: 'day',
              hour: 9, // 每天上午9点
              minute: 0
            },
            extra: {
              type: 'review',
              count: dueNotes.length
            }
          }
        ]
      });
    }
  }
  
  // 监听通知点击
  setupNotificationHandler() {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      if (notification.extra?.type === 'review') {
        // 跳转到复习页面
        window.location.hash = '#/review';
      }
    });
  }
}
```

**工作量**: 2-3 天  
**依赖**: 本地通知插件

---

### 优先级 P2（增强功能，中期实现）

#### 7. 多设备同步 🟢

**现状**:
- 单设备使用
- 无跨设备同步

**需求**:
- 多设备数据实时同步
- 冲突检测和解决
- 增量同步优化流量

**实现方案**:
- 使用 CRDT（Conflict-free Replicated Data Type）
- WebSocket 实时同步
- 或采用现有方案如 Firebase、Supabase

**工作量**: 10-15 天  
**依赖**: 后端服务、CRDT 库

---

#### 8. 纸质笔记本集成 🟢

**现状**:
- 纯数字记录

**需求**:
- 扫描二维码关联纸质笔记
- 拍照存档
- OCR 文字识别

**实现方案**:
- 相机拍照功能
- Tesseract.js OCR
- 图片存储和管理

**工作量**: 7-10 天  
**依赖**: 相机权限、OCR 引擎

---

#### 9. 电纸屏适配 🟢

**现状**:
- 未针对电纸屏优化

**需求**:
- 高对比度主题
- 简化 UI
- 触控优化

**实现方案**:
- CSS 媒体查询检测电纸屏
- 黑白主题
- 大字体、大按钮

**工作量**: 3-5 天  

---

#### 10. 协作功能 🟢

**现状**:
- 单人使用

**需求**:
- 共享笔记
- 协作编辑
- 评论和讨论

**实现方案**:
- WebSocket 实时协作
- Yjs CRDT 库
- 权限管理

**工作量**: 15-20 天  
**依赖**: 后端服务、实时通信

---

### 优先级 P3（长期规划）

#### 11. 知识图谱 🟢🟢

**需求**:
- 可视化笔记关联
- 双向链接
- 思维导图

**工作量**: 20-30 天

---

#### 12. AI 学习助手 🟢🟢

**需求**:
- 基于笔记的智能问答
- 学习建议生成
- 知识点总结

**工作量**: 15-20 天  
**依赖**: LLM API、向量数据库

---

#### 13. 语音命令 🟢🟢

**需求**:
- "创建新笔记"
- "搜索XXX"
- "标记为重要"

**工作量**: 10-15 天  
**依赖**: 语音识别、NLP

---

## 🏗️ 技术架构

### 当前架构

```
┌─────────────────────────────────────┐
│         用户界面层 (UI)              │
│  ┌──────────┬──────────┬──────────┐ │
│  │   Web    │   iOS    │ Android  │ │
│  │ (React)  │(Capacitor)│(Capacitor)│ │
│  └──────────┴──────────┴──────────┘ │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│       业务能力层 (Services)          │
│  ┌────────┬────────┬─────────────┐  │
│  │ 录音   │ 存储   │ 复习算法     │  │
│  │ 服务   │ 服务   │ 服务         │  │
│  └────────┴────────┴─────────────┘  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│       数据持久层 (Storage)           │
│  ┌────────┬────────┬─────────────┐  │
│  │IndexedDB│ SQLite │ FileSystem │  │
│  │ (Web)  │(Mobile)│ (Mobile)    │  │
│  └────────┴────────┴─────────────┘  │
└─────────────────────────────────────┘
```

### 目标架构（含待实现功能）

```
┌─────────────────────────────────────┐
│         用户界面层 (UI)              │
│  ┌──────────┬──────────┬──────────┐ │
│  │   Web    │   iOS    │ Android  │ │
│  └──────────┴──────────┴──────────┘ │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│       业务能力层 (Services)          │
│  ┌────┬────┬────┬────┬────┬──────┐ │
│  │录音│存储│复习│同步│AI  │通知  │ │
│  │服务│服务│服务│服务│服务│服务  │ │
│  └────┴────┴────┴────┴────┴──────┘ │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│       数据持久层 (Storage)           │
│  ┌────────┬────────┬─────────────┐  │
│  │IndexedDB│ SQLite │  GitHub    │  │
│  │ (Web)  │(Mobile)│  (Cloud)    │  │
│  └────────┴────────┴─────────────┘  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│       外部服务层 (External)          │
│  ┌────┬────┬────┬────────────────┐  │
│  │ASR │LLM │OCR │  推送服务      │  │
│  │服务│服务│服务│                │  │
│  └────┴────┴────┴────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🛠️ 实现方案

### 方案 1: ASR 服务集成（P0）

#### 选项 A: 自建 Whisper 服务（推荐）

**优点**:
- 完全可控
- 无 API 调用限制
- 数据隐私好

**缺点**:
- 需要 GPU 服务器
- 维护成本高

**实施步骤**:

1. **服务器部署**
```bash
# 使用 Docker 部署 Whisper
docker pull ghcr.io/openai/whisper:latest

docker run -d \
  --name whisper-asr \
  -p 8000:8000 \
  -v /data/whisper:/app/models \
  ghcr.io/openai/whisper:latest
```

2. **FastAPI 接口**
```python
# app.py
from fastapi import FastAPI, UploadFile
import whisper

app = FastAPI()
model = whisper.load_model("base")

@app.post("/asr")
async def transcribe(audio: UploadFile):
    result = model.transcribe(audio.file.read())
    return {"text": result["text"]}
```

3. **前端集成**
```typescript
// src/mobile/core/engine/asr.ts
export async function transcribe(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');
  
  const response = await fetch('https://your-server.com/asr', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.text;
}
```

**成本**: 
- 服务器: $50-100/月（GPU）
- 带宽: $10-20/月

**工作量**: 3-5 天

---

#### 选项 B: 第三方 API

**推荐服务**:
- Azure Speech Service: $1/小时音频
- Google Cloud Speech-to-Text: $0.006/15秒
- 讯飞语音识别: ¥0.0025/次

**优点**:
- 无需维护
- 稳定性高
- 支持多语言

**缺点**:
- 持续成本高
- 数据上传云端
- API 调用限制

**实施步骤**:

```typescript
// 以 Azure 为例
export async function transcribeWithAzure(audioBlob: Blob): Promise<string> {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_REGION;
  
  const response = await fetch(
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=zh-CN`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'audio/wav',
      },
      body: audioBlob,
    }
  );
  
  const data = await response.json();
  return data.DisplayText;
}
```

**成本**: 
- 按使用量计费
- 预估: $20-50/月（中等使用量）

**工作量**: 1-2 天

---

### 方案 2: GitHub 数据同步（P1）

#### 架构设计

```
┌──────────────┐
│  本地 SQLite  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  同步队列     │ ← 离线时暂存
└──────┬───────┘
       │
       ↓ (在线时)
┌──────────────┐
│ GitHub Gist  │ ← 云端备份
└──────────────┘
```

#### 实施步骤

1. **创建同步服务**
```typescript
// src/mobile/core/services/sync.service.ts
export class SyncService {
  private queue: SyncItem[] = [];
  private isSyncing = false;
  
  // 添加同步任务
  async addToQueue(action: SyncAction, data: any) {
    this.queue.push({ action, data, timestamp: Date.now() });
    
    if (navigator.onLine && !this.isSyncing) {
      await this.processQueue();
    }
  }
  
  // 处理队列
  async processQueue() {
    if (this.isSyncing || this.queue.length === 0) return;
    
    this.isSyncing = true;
    
    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        await this.syncItem(item);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      // 失败的任务重新加入队列
      this.queue.unshift(item);
    } finally {
      this.isSyncing = false;
    }
  }
  
  // 同步单个项目
  private async syncItem(item: SyncItem) {
    const token = await SecureStorage.get('github_token');
    
    switch (item.action) {
      case 'CREATE':
        await this.createGist(item.data, token);
        break;
      case 'UPDATE':
        await this.updateGist(item.data, token);
        break;
      case 'DELETE':
        await this.deleteGist(item.data.id, token);
        break;
    }
  }
  
  // 创建 Gist
  private async createGist(note: Note, token: string) {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `LearningOS Note: ${note.title}`,
        public: false,
        files: {
          [`${note.id}.md`]: {
            content: this.formatNoteAsMarkdown(note)
          }
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create gist');
    }
    
    const gist = await response.json();
    // 保存 gist ID 到本地数据库
    await db.updateNote(note.id, { gistId: gist.id });
  }
}
```

2. **监听网络状态**
```typescript
// 网络恢复时自动同步
window.addEventListener('online', () => {
  syncService.processQueue();
});

// 定期同步（每5分钟）
setInterval(() => {
  if (navigator.onLine) {
    syncService.processQueue();
  }
}, 5 * 60 * 1000);
```

3. **冲突解决策略**
```typescript
// 简单策略：最后修改获胜
private resolveConflict(local: Note, remote: Note): Note {
  return local.updatedAt > remote.updatedAt ? local : remote;
}

// 复杂策略：三方合并（需要 OT/CRDT）
```

**工作量**: 5-7 天

---

### 方案 3: AI 智能整理（P1）

#### 使用 OpenAI GPT-4

**实施步骤**:

1. **AI 服务封装**
```typescript
// src/mobile/core/engine/ai.ts
export class AIEngine {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async processNote(content: string): Promise<ProcessedNote> {
    const prompt = `
你是一个学习笔记整理助手。请分析以下笔记内容，并提取：

1. 标题（简洁明了，不超过20字）
2. 关键词（3-5个，用逗号分隔）
3. 分类（从以下选择：数学、物理、化学、生物、计算机、语言、历史、其他）
4. 摘要（100字以内）
5. 重要性评分（1-5星）

笔记内容：
${content}

请以 JSON 格式返回，不要有其他文字。
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: '你是专业的学习笔记整理助手' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    const aiResult = JSON.parse(data.choices[0].message.content);
    
    return {
      title: aiResult.title,
      keywords: aiResult.keywords.split(',').map((k: string) => k.trim()),
      category: aiResult.category,
      summary: aiResult.summary,
      importance: aiResult.importance
    };
  }
  
  // 自动生成标签
  async generateTags(content: string): Promise<string[]> {
    // 类似上面的实现
  }
  
  // 智能搜索
  async semanticSearch(query: string, notes: Note[]): Promise<Note[]> {
    // 使用向量相似度搜索
  }
}
```

2. **自动触发 AI 处理**
```typescript
// 录音停止后自动处理
const stopRecording = async () => {
  const base64 = await recorder.stop();
  const text = await asrEngine.transcribe(base64);
  
  // 自动 AI 处理
  const processed = await aiEngine.processNote(text);
  
  // 保存增强的笔记
  await noteService.save({
    ...processed,
    originalContent: text,
    audio: base64
  });
};
```

3. **成本控制**
```typescript
// 估算成本
// GPT-4 Turbo: $0.01 / 1K tokens input, $0.03 / 1K tokens output
// 平均每次处理: 500 tokens input + 200 tokens output = $0.011

// 每日预算限制
const DAILY_BUDGET = 5.0; // $5/天
let dailyCost = 0;

async function checkBudget(cost: number) {
  if (dailyCost + cost > DAILY_BUDGET) {
    throw new Error('Daily AI budget exceeded');
  }
  dailyCost += cost;
}
```

**成本**: 
- GPT-4 Turbo: $0.01-0.02/次
- 预估: $30-60/月（100次/天）

**工作量**: 3-5 天

---

### 方案 4: 复习通知推送（P1）

#### 实施步骤

1. **通知服务**
```typescript
// src/mobile/core/services/notification.service.ts
import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  async initialize() {
    // 请求通知权限
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }
    
    // 设置通知监听
    this.setupListeners();
    
    return true;
  }
  
  private setupListeners() {
    // 监听通知点击
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
      
      if (notification.extra?.type === 'review') {
        // 跳转到复习页面
        window.location.hash = '#/review';
      }
    });
    
    // 监听通知点击操作
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      if (action.notification.extra?.type === 'review') {
        window.location.hash = '#/review';
      }
    });
  }
  
  // 安排每日复习通知
  async scheduleDailyReview(time: { hour: number; minute: number }) {
    const dueCount = await reviewService.getDueReviewCount();
    
    if (dueCount === 0) {
      return; // 没有待复习内容，不发送通知
    }
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '📚 今日复习',
          body: `你有 ${dueCount} 条笔记需要复习`,
          schedule: {
            every: 'day',
            hour: time.hour,
            minute: time.minute
          },
          extra: {
            type: 'review',
            count: dueCount
          },
          sound: 'default',
          badge: dueCount
        }
      ]
    });
  }
  
  // 取消通知
  async cancelDailyReview() {
    await LocalNotifications.cancelAll();
  }
  
  // 立即发送通知（测试用）
  async sendTestNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '测试通知',
          body: '这是一条测试通知',
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default'
        }
      ]
    });
  }
}
```

2. **用户设置**
```typescript
// 用户可配置通知时间
interface NotificationSettings {
  enabled: boolean;
  reviewTime: { hour: number; minute: number };
  sound: boolean;
  vibration: boolean;
}

// 保存到本地存储
async function saveNotificationSettings(settings: NotificationSettings) {
  await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
  
  if (settings.enabled) {
    await notificationService.scheduleDailyReview(settings.reviewTime);
  } else {
    await notificationService.cancelDailyReview();
  }
}
```

3. **设置页面 UI**
```tsx
// features/settings/NotificationSettings.tsx
export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reviewTime: { hour: 9, minute: 0 },
    sound: true,
    vibration: true
  });
  
  const handleSave = async () => {
    await saveNotificationSettings(settings);
    Alert.alert('设置已保存');
  };
  
  return (
    <View>
      <Switch
        value={settings.enabled}
        onValueChange={(value) => setSettings({...settings, enabled: value})}
      />
      <Text>启用每日复习提醒</Text>
      
      {/* 时间选择器 */}
      <TimePicker
        value={settings.reviewTime}
        onChange={(time) => setSettings({...settings, reviewTime: time})}
      />
      
      <Button onPress={handleSave}>保存设置</Button>
      <Button onPress={() => notificationService.sendTestNotification()}>
        发送测试通知
      </Button>
    </View>
  );
}
```

**工作量**: 2-3 天

---

## 🗺️ 开发路线图

### Phase 1: 移动端完善（2-3周）

**Week 1**: iOS 真机测试
- [ ] macOS 环境配置
- [ ] Xcode 编译和运行
- [ ] 真机测试所有功能
- [ ] 修复发现的问题

**Week 2**: Android 真机测试
- [ ] Android Studio 配置
- [ ] 真机测试
- [ ] 性能优化

**Week 3**: ASR 服务集成
- [ ] 选择 ASR 方案（自建/第三方）
- [ ] 部署和测试
- [ ] 前端集成

**交付物**: 
- ✅ iOS App（TestFlight）
- ✅ Android App（APK）
- ✅ 稳定的语音识别功能

---

### Phase 2: 云同步和 AI（3-4周）

**Week 4-5**: GitHub 同步
- [ ] 同步服务开发
- [ ] 冲突解决策略
- [ ] 离线队列机制
- [ ] 测试和优化

**Week 6-7**: AI 智能整理
- [ ] OpenAI API 集成
- [ ] 提示词工程优化
- [ ] 成本控制策略
- [ ] 用户体验优化

**Week 8**: 通知推送
- [ ] 本地通知集成
- [ ] 用户设置页面
- [ ] 测试和优化

**交付物**:
- ✅ 多设备数据同步
- ✅ AI 自动整理笔记
- ✅ 每日复习提醒

---

### Phase 3: 高级功能（4-6周）

**Week 9-10**: 多设备实时同步
- [ ] WebSocket 服务
- [ ] CRDT 集成
- [ ] 实时协作

**Week 11-12**: 纸质笔记本集成
- [ ] 相机拍照
- [ ] OCR 识别
- [ ] 图片管理

**Week 13-14**: 电纸屏适配
- [ ] 高对比度主题
- [ ] UI 优化
- [ ] 触控优化

**交付物**:
- ✅ 实时多设备同步
- ✅ 纸质笔记数字化
- ✅ 电纸屏完美支持

---

### Phase 4: 发布和优化（2-3周）

**Week 15**: App Store 提交
- [ ] 准备截图和描述
- [ ] 审核材料准备
- [ ] 提交审核

**Week 16**: Google Play 提交
- [ ] 准备素材
- [ ] 隐私政策
- [ ] 提交审核

**Week 17**: 用户反馈和优化
- [ ] 收集用户反馈
- [ ] Bug 修复
- [ ] 性能优化

**交付物**:
- ✅ App Store 上架
- ✅ Google Play 上架
- ✅ 稳定的生产版本

---

## 📊 资源需求

### 人力资源

| 角色 | 人数 | 职责 |
|------|------|------|
| 前端开发 | 1-2 | React、TypeScript、Capacitor |
| 后端开发 | 1 | ASR 服务、同步服务 |
| UI/UX 设计 | 1 | 移动端界面设计 |
| 测试工程师 | 1 | 真机测试、自动化测试 |

### 硬件资源

| 设备 | 数量 | 用途 |
|------|------|------|
| Mac mini/MacBook | 1 | iOS 开发和编译 |
| iPhone | 2-3 | 真机测试（不同型号） |
| Android 手机 | 2-3 | 真机测试（不同品牌） |
| GPU 服务器 | 1 | Whisper ASR 服务（可选） |

### 软件和服务

| 服务 | 费用/月 | 用途 |
|------|---------|------|
| Apple Developer | $99/年 | iOS App 发布 |
| Google Play | $25 一次性 | Android App 发布 |
| OpenAI API | $30-60 | AI 智能整理 |
| ASR 服务 | $20-100 | 语音识别（取决于方案） |
| 服务器（可选） | $50-100 | 自建 ASR/同步服务 |
| **总计** | **$150-300/月** | |

---

## ⚠️ 风险和挑战

### 技术风险

1. **ASR 准确性**
   - 风险: 中文识别准确率不够
   - 缓解: 多方案备选，持续优化模型

2. **同步冲突**
   - 风险: 多设备编辑同一笔记导致数据丢失
   - 缓解: 采用 CRDT 或 OT 算法

3. **性能问题**
   - 风险: 大量笔记时加载缓慢
   - 缓解: 分页加载、虚拟滚动、索引优化

### 业务风险

1. **成本控制**
   - 风险: AI 和 ASR API 费用超支
   - 缓解: 设置预算限制、缓存策略

2. **用户接受度**
   - 风险: 功能太复杂，用户不愿用
   - 缓解: 渐进式功能发布、用户调研

3. **竞争压力**
   - 风险: 已有成熟产品（Notion、Obsidian）
   - 缓解: 差异化定位（专注学习和复习）

---

## 📈 成功指标

### 技术指标

- [ ] 启动时间 < 2秒
- [ ] 录音成功率 > 99%
- [ ] ASR 准确率 > 90%（中文）
- [ ] 同步延迟 < 5秒
- [ ] App 崩溃率 < 0.1%

### 业务指标

- [ ] 日活跃用户（DAU）> 1000
- [ ] 用户留存率（7天）> 40%
- [ ] 平均每日笔记数 > 5
- [ ] 用户满意度 > 4.5/5
- [ ] App Store 评分 > 4.5

---

## 🎯 下一步行动

### 立即执行（本周）

1. **iOS 真机测试**
   ```bash
   # 在 macOS 上执行
   git clone https://github.com/michealma202412/LearningOS.git
   cd LearningOS
   git checkout mobile_version
   
   npm install
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **准备 ASR 方案决策**
   - 评估自建 vs 第三方 API
   - 成本对比分析
   - 技术可行性验证

3. **制定详细开发计划**
   - 分解任务到每周
   - 分配责任人
   - 设定里程碑

### 短期目标（1个月内）

- ✅ iOS App TestFlight 测试版
- ✅ Android APK 测试版
- ✅ ASR 服务上线
- ✅ GitHub 同步 MVP 版本

### 中期目标（3个月内）

- ✅ App Store 正式发布
- ✅ Google Play 正式发布
- ✅ AI 智能整理上线
- ✅ 1000+ 活跃用户

---

## 📞 联系方式

**项目地址**: https://github.com/michealma202412/LearningOS  
**问题反馈**: GitHub Issues  
**文档**: PROJECT_GUIDE.md

---

**最后更新**: 2026-05-02  
**版本**: v2.0  
**状态**: 核心功能已完成，待真机测试和高级功能开发
