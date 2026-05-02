# LearningOS iOS 快速启动指南

## 🚀 3步快速开始（需要 macOS）

```bash
# 1. 构建和同步
npm run build && npx cap sync ios

# 2. 打开 Xcode
npx cap open ios

# 3. 在 Xcode 中点击 ▶️ 运行
```

---

## 📋 前提条件检查清单

- [ ] macOS 电脑
- [ ] Xcode 已安装（Mac App Store）
- [ ] Apple ID 已登录
- [ ] iPhone 或 iOS 模拟器可用

---

## 🔧 关键配置

### 1. 权限配置（已完成 ✅）

已在 `ios/App/App/Info.plist` 中添加：
- ✅ NSMicrophoneUsageDescription - 麦克风权限
- ✅ NSCameraUsageDescription - 相机权限
- ✅ NSPhotoLibraryUsageDescription - 相册权限

### 2. 签名配置（需手动设置）

**Xcode 中操作**:
1. 选择 "App" Target
2. Signing & Capabilities 标签
3. Team → 选择你的 Apple ID
4. ✅ 勾选 "Automatically manage signing"

---

## 🎯 运行方式

### 方式 A: 模拟器（快速测试）
1. Xcode 顶部选择设备（如 iPhone 15 Pro）
2. 点击 ▶️ 运行
3. 等待编译完成（首次 5-10 分钟）

### 方式 B: 真机（推荐）
1. USB 连接 iPhone
2. iPhone 信任此电脑
3. Xcode 选择你的 iPhone
4. 点击 ▶️ 运行
5. iPhone 上信任开发者证书

---

## 🐛 常见问题速查

| 问题 | 解决方案 |
|------|---------|
| BUILD FAILED | `cd ios && pod install && cd ..` |
| 签名错误 | Xcode → Preferences → Accounts 添加 Apple ID |
| 麦克风无法使用 | 检查 Info.plist 权限 + iPhone 设置允许 |
| 应用闪退 | 查看 Xcode 控制台日志 |
| 真机不识别 | 重启 iPhone + 重新连接 USB |

---

## 📊 预期效果

| 指标 | Web版 | iOS版 |
|------|-------|-------|
| 启动时间 | >5秒 | <1.5秒 ⬇️70% |
| 录音稳定性 | ~70% | ~100% ⬆️43% |
| 后台录音 | ❌ | ✅ ➕ |
| 离线可用 | 部分 | 完全 ⬆️50% |

---

## 📞 调试命令

```bash
# 清理并重新构建
npx cap clean ios
npx cap sync ios

# 查看设备列表
xcrun simctl list devices

# 打开项目
npx cap open ios
```

---

## 📚 完整文档

详细步骤请查看: [IOS_DEPLOYMENT_GUIDE.md](./IOS_DEPLOYMENT_GUIDE.md)

---

**最后更新**: 2026-05-02  
**版本**: v0.2.0-mobile-alpha
