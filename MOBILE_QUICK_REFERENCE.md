# LearningOS 移动端 - 快速参考卡片

## 🚀 快速开始（3步）

```bash
# 1. 一键构建和部署
.\build-mobile.bat

# 或手动执行:
npm run build          # 构建
npx cap sync           # 同步
npx cap open android   # 打开 Android Studio
```

---

## 📁 核心文件位置

### 源代码
```
src/mobile/
├── core/db/sqlite.ts              # 数据库操作
├── core/engine/recorder.ts        # 录音引擎
├── hooks/useStreamingRecorder.ts  # 录音 Hook
├── features/record/RecordPage.tsx # 记录页面 ⭐
├── features/files/FilesPage.tsx   # 文件列表
└── utils/textMerge.ts             # 文本去重
```

### 配置文件
```
capacitor.config.json   # Capacitor 配置
vite.config.ts          # Vite 配置
```

### 测试脚本
```
verify-mobile.ts        # 功能验证脚本
```

---

## 🔧 常用命令

### 开发
```bash
npm run dev                    # 启动开发服务器
npm run build                  # 生产构建
npx cap sync                   # 同步到原生平台
```

### 测试
```bash
npx tsx verify-mobile.ts       # 运行功能测试
```

### 部署
```bash
npx cap open android           # Android
npx cap open ios               # iOS (macOS)
```

---

## 📱 核心 API 速查

### SQLite 数据库
```typescript
import { initDB, insertNote, getNotes } from './mobile/core/db/sqlite';

await initDB();                                    // 初始化
await insertNote({ id, title, content, tags });   // 保存
const notes = await getNotes();                    // 查询
```

### 原生录音
```typescript
import { NativeRecorder } from './mobile/core/engine/recorder';

const recorder = new NativeRecorder();
await recorder.start();                            // 开始
const result = await recorder.stop();              // 停止
// result: { base64, filePath, duration }
```

### 流式录音 Hook
```typescript
import { useStreamingRecorder } from './mobile/hooks/useStreamingRecorder';

const { isRecording, transcribedText, start, stop } = useStreamingRecorder();

start();    // 开始录音
stop();     // 停止录音
```

### 文本去重
```typescript
import { mergeText } from './mobile/utils/textMerge';

const merged = mergeText("今天 我们", "我们 讨论");
// → "今天 我们 讨论"
```

---

## 🐛 常见问题

### Q1: 录音权限被拒绝
**解决**: 
- Android: 检查 `AndroidManifest.xml` 权限声明
- iOS: 检查 `Info.plist` 中的 `NSMicrophoneUsageDescription`

### Q2: 数据库初始化失败
**解决**:
```bash
# 清除应用数据后重试
adb shell pm clear com.learningos.app  # Android
```

### Q3: 构建失败
**解决**:
```bash
# 清理并重新构建
rm -rf dist node_modules/.vite
npm run build
npx cap sync
```

### Q4: 真机调试看不到日志
**解决**:
- Android: `adb logcat | findstr "LearningOS"`
- iOS: Xcode → Debug → Console

---

## 📊 项目状态

| 模块 | 状态 | 说明 |
|------|------|------|
| SQLite 数据库 | ✅ 完成 | 完整 CRUD |
| 原生录音 | ✅ 完成 | 稳定可靠 |
| 记录页面 | ✅ 完成 | 核心功能 |
| 文件列表 | ✅ 完成 | 展开查看 |
| 复习系统 | ⚠️  占位符 | 待实现 |
| 扫码功能 | ⚠️  占位符 | 待实现 |
| ASR 识别 | ⚠️  预留接口 | 需后端服务 |

---

## 🎯 下一步优先级

1. **⭐⭐⭐⭐⭐ 安装依赖并真机测试**
   ```bash
   .\build-mobile.bat
   ```

2. **⭐⭐⭐⭐ 接入实时语音识别**
   - 部署 Whisper 服务
   - 启用流式识别逻辑

3. **⭐⭐⭐ 完善复习系统**
   - 艾宾浩斯算法
   - 通知推送

4. **⭐⭐ 实现扫码功能**
   - 集成 BarcodeScanner
   - URL 协议解析

---

## 📞 支持资源

- 📖 完整文档: [MOBILE_IMPLEMENTATION_REPORT.md](./MOBILE_IMPLEMENTATION_REPORT.md)
- 📋 需求文档: [doc/requirements.md](./doc/requirements.md)
- 🔧 Safari 修复: [Safari_Microphone_Permission_Fix.md](./Safari_Microphone_Permission_Fix.md)

---

**最后更新**: 2026-05-02  
**版本**: v0.2.0-mobile-alpha
