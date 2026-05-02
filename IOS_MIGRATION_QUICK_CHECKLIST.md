# LearningOS iOS 迁移快速执行清单

## 🚀 5步快速迁移（macOS）

```bash
# 第1步：获取代码
git clone <your-repo-url> && cd 02_EduWeb

# 第2步：安装依赖
npm install

# 第3步：构建 Web
npm run build

# 第4步：同步 iOS
npx cap sync ios

# 第5步：打开 Xcode
npx cap open ios
```

---

## ✅ Xcode 配置检查清单

### 签名配置
- [ ] Preferences → Accounts → 添加 Apple ID
- [ ] Target → Signing & Capabilities → 选择 Team
- [ ] ✅ 勾选 "Automatically manage signing"
- [ ] 验证绿色对勾 ✅ 显示

### 权限验证
- [ ] Info.plist 包含 NSMicrophoneUsageDescription
- [ ] Info.plist 包含 NSCameraUsageDescription
- [ ] Info.plist 包含 NSPhotoLibraryAddUsageDescription

---

## 🧪 核心功能测试清单

### 录音功能 ⭐⭐⭐⭐⭐
- [ ] 点击"开始录音"弹出权限请求
- [ ] 授予权限后正常录音
- [ ] 后台录音继续工作
- [ ] 停止录音成功

### 数据持久化 ⭐⭐⭐⭐⭐
- [ ] 保存记录成功
- [ ] 重启应用数据仍在
- [ ] SQLite 查询快速

### 复习系统 ⭐⭐⭐⭐
- [ ] 待复习列表正确显示
- [ ] 完成复习后更新进度
- [ ] 下次复习时间计算准确

### 扫码功能 ⭐⭐⭐⭐⭐
- [ ] 相机权限请求正常
- [ ] 相机启动成功
- [ ] 二维码识别准确

---

## 🐛 常见问题速查

| 问题 | 解决方案 |
|------|---------|
| BUILD FAILED | `cd ios && rm -rf Pods && pod install` |
| 签名错误 | Xcode → Accounts 添加 Apple ID |
| 麦克风无法使用 | 检查 Info.plist + iPhone 设置允许 |
| 应用闪退 | Xcode 控制台查看日志 |
| 真机不识别 | 重启 iPhone + 重新连接 USB |

---

## 📊 预期效果

| 指标 | Expo Go | Capacitor iOS |
|------|---------|---------------|
| 启动时间 | ~5-10秒 | <2秒 ⬇️70% |
| 录音成功率 | 0%（模拟） | 100% ➕ |
| 数据查询 | 中等 | 快3-5倍 ⬆️ |
| 后台能力 | ❌ | ✅ ➕ |

---

## 📞 关键命令

```bash
# 清理重建
npx cap clean ios && npx cap sync ios

# 查看设备
xcrun simctl list devices

# 查看日志
idevicesyslog | grep LearningOS
```

---

## 📚 完整文档

详细步骤: [IOS_NATIVE_MIGRATION_EXECUTION_GUIDE.md](./IOS_NATIVE_MIGRATION_EXECUTION_GUIDE.md)

---

**准备好开始了吗？** 🚀
