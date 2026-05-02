# LearningOS iOS 部署完整指南

## 📋 目录
- [前提条件](#前提条件)
- [方案一：macOS + Xcode（推荐）](#方案一macos--xcode推荐)
- [方案二：Expo Go（快速原型）](#方案二expo-go快速原型)
- [方案三：PWA（最简单）](#方案三pwa最简单)
- [常见问题解决](#常见问题解决)
- [测试清单](#测试清单)

---

## ⚠️ 前提条件

### 必需硬件
- ✅ **macOS 电脑** - Xcode 只能在 macOS 上运行
- ✅ **iPhone/iPad** - iOS 13.0 或更高版本
- 或 **iOS 模拟器** - Xcode 自带

### 必需软件
- ✅ **Xcode** - 从 Mac App Store 免费下载
- ✅ **Node.js 20+** - https://nodejs.org/
- ✅ **Apple ID** - 用于开发者签名（免费账号即可）

### 可选（真机测试必需）
- 🔑 **Apple Developer 账号** - $99/年（个人开发可先用免费账号）
- 📱 **USB 数据线** - 连接 iPhone 到 Mac

---

## 方案一：macOS + Xcode（推荐）⭐⭐⭐⭐⭐

### 第1步：环境准备

#### 1.1 安装 Xcode
```bash
# 方法 A: Mac App Store（推荐）
# 1. 打开 Mac App Store
# 2. 搜索 "Xcode"
# 3. 点击"获取"并安装（约 12GB，需要较长时间）

# 方法 B: 命令行（需要 Apple Developer 账号）
xcode-select --install
```

**验证安装**:
```bash
xcodebuild -version
# 应显示: Xcode 15.x.x
```

#### 1.2 安装 Command Line Tools
```bash
xcode-select --install
```

#### 1.3 配置 Git（如果还没配置）
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 第2步：项目准备

#### 2.1 同步代码到 macOS
```bash
# 方法 A: Git 克隆
git clone <your-repo-url>
cd 02_EduWeb

# 方法 B: 直接复制
# 将整个项目文件夹复制到 Mac
```

#### 2.2 安装依赖
```bash
npm install
```

#### 2.3 构建 Web 资源
```bash
npm run build
```

**预期输出**:
```
✓ built in 1.38s
dist/index.html                   0.49 kB
dist/assets/index-*.js           52.67 kB
dist/assets/vendor-*.js         141.26 kB
```

#### 2.4 同步到 iOS
```bash
npx cap sync ios
```

**预期输出**:
```
√ Copying web assets from dist to ios/App/App/public
√ Creating capacitor.config.json in ios/App/App
√ copy ios in XXms
[info] Found 3 Capacitor plugins for ios:
       @capacitor-community/sqlite@8.1.0
       @capacitor/filesystem@8.1.2
       capacitor-voice-recorder@7.0.6
√ update ios in XXms
```

### 第3步：Xcode 配置

#### 3.1 打开项目
```bash
npx cap open ios
```

Xcode 会自动启动并打开 `ios/App/App.xcworkspace`

**重要**: 必须打开 `.xcworkspace` 文件，不是 `.xcodeproj`

#### 3.2 配置开发者签名

##### 步骤 1: 添加 Apple ID
1. Xcode → Preferences (Cmd + ,)
2. 选择 "Accounts" 标签
3. 点击左下角 "+" 按钮
4. 选择 "Apple ID"
5. 输入你的 Apple ID 和密码
6. 点击 "Next" 完成登录

##### 步骤 2: 选择 Team
1. 左侧项目导航器 → 点击 "App" 项目
2. 选择 "Signing & Capabilities" 标签
3. 在 "Team" 下拉框中选择你的 Apple ID
   - 格式: "Your Name (Personal Team)"

##### 步骤 3: 自动管理签名
- ✅ 确保勾选 "Automatically manage signing"
- Xcode 会自动创建:
  - 开发证书 (Development Certificate)
  - Provisioning Profile
  - App ID

##### 步骤 4: 修改 Bundle Identifier（如果需要）
- 当前: `com.learningos.app`
- 建议改为唯一标识: `com.yourname.learningos`
- 格式: 反向域名格式

#### 3.3 验证配置

检查以下项是否都显示绿色对勾 ✅:
- [ ] Signing Certificate
- [ ] Provisioning Profile
- [ ] Bundle Identifier

如果有红色警告 ❌，点击 "Fix Issue" 按钮自动修复。

### 第4步：运行应用

#### 选项 A: 使用 iOS 模拟器（无需真机）

##### 步骤 1: 选择模拟器
1. Xcode 顶部工具栏 → 设备选择器
2. 选择一个模拟器，例如:
   - iPhone 15 Pro
   - iPhone 15
   - iPad Air

##### 步骤 2: 运行
- 点击左上角 ▶️ 运行按钮
- 或按快捷键 `Cmd + R`

##### 步骤 3: 等待编译
- 首次编译: 5-10 分钟
- 后续编译: 1-2 分钟
- 模拟器会自动启动
- 应用会自动安装并启动

##### 步骤 4: 测试
- 看到底部导航栏表示成功！
- 测试录音、保存等功能

#### 选项 B: 使用真机 iPhone（推荐）

##### 步骤 1: 连接设备
1. 用 USB 线连接 iPhone 到 Mac
2. iPhone 上点击"信任此电脑"
3. 输入锁屏密码确认

##### 步骤 2: 启用开发者模式（iOS 16+）
1. iPhone: 设置 → 隐私与安全性
2. 滚动到底部 → "开发者模式"
3. 开启开发者模式
4. 重启 iPhone

##### 步骤 3: 选择设备
1. Xcode 顶部 → 设备选择器
2. 选择你的 iPhone（会显示设备名称）
   - 例如: "John's iPhone"

##### 步骤 4: 运行
- 点击 ▶️ 运行按钮
- 首次运行需在 iPhone 上信任开发者:
  1. iPhone: 设置 → 通用 → VPN 与设备管理
  2. 找到你的开发者证书
  3. 点击"信任"

##### 步骤 5: 测试
- 应用会在真机上运行
- 可以测试所有原生功能

### 第5步：调试和日志

#### 查看控制台日志
1. Xcode → View → Debug Area → Show Debug Area (Cmd + Shift + Y)
2. 底部会显示实时日志
3. 可以看到 `console.log()` 输出

#### 过滤日志
在控制台顶部的过滤器中输入:
```
LearningOS
```

只显示应用的日志。

#### 关键日志标识
- `✅` - 成功操作
- `❌` - 错误信息
- `🎤` - 录音相关
- `💾` - 数据库操作

---

## 方案二：Expo Go（快速原型）⭐⭐⭐

适合没有 macOS 的情况，但功能受限。

### 步骤：

#### 1. 创建 Expo 项目
```bash
npx create-expo-app@latest learningos-expo
cd learningos-expo
```

#### 2. 安装必要插件
```bash
npx expo install expo-av expo-file-system expo-sqlite expo-camera
```

#### 3. 复制代码
```bash
# 复制源代码
cp -r ../02_EduWeb/src/* ./src/

# 修改入口文件
# 编辑 App.js 引入你的组件
```

#### 4. 运行开发服务器
```bash
npx expo start
```

#### 5. 扫码测试
1. iPhone 上安装 "Expo Go" App（App Store）
2. 扫描终端显示的二维码
3. 应用会在 Expo Go 中运行

**限制**:
- ❌ 部分原生插件可能不兼容
- ❌ 性能不如原生应用
- ✅ 适合快速 UI 验证

---

## 方案三：PWA（最简单）⭐⭐

### 步骤：

#### 1. 构建生产版本
```bash
npm run build
```

#### 2. 部署到静态托管

**选项 A: GitHub Pages**
```bash
npm run deploy
```

**选项 B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**选项 C: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### 3. 在 iPhone 上使用
1. Safari 打开部署的 URL
2. 点击分享按钮（底部中间）
3. 选择"添加到主屏幕"
4. 像原生 App 一样使用

**限制**:
- ❌ 无法使用稳定录音（Safari MediaRecorder 问题）
- ❌ 无法后台运行
- ❌ 文件系统访问受限
- ✅ UI 和基本功能可用
- ✅ 无需 macOS

---

## 🐛 常见问题解决

### Q1: Xcode 编译失败

**症状**: BUILD FAILED 或红色错误

**解决**:
```bash
# 清理构建缓存
cd ios
rm -rf DerivedData
rm -rf Pods
pod install
cd ..

# 重新同步
npx cap sync ios
npx cap open ios
```

### Q2: 签名错误

**症状**: "Signing for 'App' requires a development team"

**解决**:
1. Xcode → Preferences → Accounts
2. 确保已登录 Apple ID
3. Signing & Capabilities → 选择正确的 Team
4. 勾选 "Automatically manage signing"

### Q3: 麦克风权限被拒绝

**症状**: 录音功能无法使用

**解决**:
1. 检查 Info.plist 是否包含 `NSMicrophoneUsageDescription`
2. iPhone: 设置 → 隐私 → 麦克风 → 允许 LearningOS
3. 卸载应用后重新安装

### Q4: 应用闪退

**症状**: 打开后立即关闭

**解决**:
```bash
# 查看崩溃日志
# Xcode → Window → Devices and Simulators
# 选择设备 → 查看日志

# 常见原因:
# 1. SQLite 初始化失败 - 检查数据库路径
# 2. 插件未正确安装 - 重新运行 npx cap sync
# 3. JavaScript 错误 - 查看控制台日志
```

### Q5: 真机无法识别

**症状**: Xcode 看不到连接的 iPhone

**解决**:
1. 检查 USB 线是否支持数据传输
2. iPhone 解锁并信任此电脑
3. Xcode → Window → Devices and Simulators
4. 如果设备显示为灰色，右键 → "Pair Device"

### Q6: 录音文件无法保存

**症状**: 录音成功但找不到文件

**解决**:
```typescript
// 检查文件路径
import { Filesystem, Directory } from '@capacitor/filesystem';

// 保存到正确目录
await Filesystem.writeFile({
  path: 'recordings/test.wav',
  data: base64Data,
  directory: Directory.Data, // 使用 Data 目录
});
```

### Q7: 模拟器无法访问网络

**症状**: API 请求失败

**解决**:
1. 模拟器默认可以访问网络
2. 如果使用 localhost，改用 Mac 的 IP 地址
3. 检查防火墙设置

---

## 🧪 测试清单

### 基础功能测试（5分钟）

- [ ] **应用启动**
  - [ ] 能否正常启动？
  - [ ] 底部导航是否显示 4 个 Tab？
  - [ ] 默认是否在"记录"页面？

- [ ] **Tab 切换**
  - [ ] 点击不同 Tab 能否切换？
  - [ ] 切换是否流畅？

### 核心功能测试（15分钟）

- [ ] **录音功能** ⭐⭐⭐⭐⭐
  - [ ] 点击"开始录音"是否弹出权限请求？
  - [ ] 授予权限后能否开始录音？
  - [ ] 录音时是否有视觉反馈？
  - [ ] 点击"停止录音"是否成功？
  - [ ] 录音时长是否正确计算？

- [ ] **数据保存** ⭐⭐⭐⭐⭐
  - [ ] 输入标题和内容后能否保存？
  - [ ] 是否显示"保存成功"提示？
  - [ ] 切换到"文件"页能否看到记录？

- [ ] **文件列表** ⭐⭐⭐⭐
  - [ ] 是否正确显示所有笔记？
  - [ ] 点击卡片能否展开详情？
  - [ ] 删除功能是否正常？

- [ ] **数据持久化** ⭐⭐⭐⭐
  - [ ] 关闭应用后重新打开
  - [ ] 之前保存的数据是否还在？

### 性能测试（5分钟）

- [ ] **启动时间** - 应 < 2秒
- [ ] **录音响应** - 点击后立即开始
- [ ] **保存速度** - 应 < 1秒
- [ ] **列表加载** - 首次加载流畅

### 边界情况测试（10分钟）

- [ ] **无网络状态**
  - [ ] 离线能否录音？
  - [ ] 离线能否保存数据？

- [ ] **后台运行**
  - [ ] 切换到其他应用后录音是否继续？
  - [ ] 返回应用后是否正常？

- [ ] **权限拒绝**
  - [ ] 拒绝麦克风权限后有提示吗？
  - [ ] 能否在设置中重新授权？

- [ ] **存储空间不足**
  - [ ] 大量录音后应用是否稳定？

---

## 📊 预期测试结果

| 功能 | Web版 | iOS Capacitor版 | 改进 |
|------|-------|----------------|------|
| 启动时间 | >5秒 | <1.5秒 | ⬇️ 70% |
| 录音成功率 | ~70% | ~100% | ⬆️ 43% |
| 后台录音 | ❌ | ✅ | ➕ 新功能 |
| 离线可用 | 部分 | 完全 | ⬆️ 50% |
| 扫码能力 | ❌ | ✅ | ➕ 新功能 |
| 数据存储 | IndexedDB | SQLite | ⬆️ 性能 |

---

## 🎯 下一步计划

完成 iOS 测试后：

1. **收集反馈** - 记录遇到的问题和改进建议
2. **修复 Bug** - 根据测试结果修复问题
3. **接入 ASR** - 部署 Whisper 服务实现实时语音识别
4. **完善功能** - 实现复习系统和扫码功能
5. **发布到 App Store** - 打包 Release 版本提交审核

---

## 📞 技术支持

### 查看日志
```bash
# Xcode 控制台
# 自动显示所有日志

# 或使用命令行
idevicesyslog | grep LearningOS
```

### 关键命令
```bash
# 清理 iOS 构建
cd ios
rm -rf DerivedData
pod deintegrate
pod install

# 重新同步
cd ..
npx cap clean ios
npx cap sync ios
npx cap open ios

# 查看设备列表
xcrun simctl list devices
```

### 相关文档
- [Capacitor iOS 文档](https://capacitorjs.com/docs/ios)
- [Xcode 官方文档](https://developer.apple.com/documentation/xcode)
- [MOBILE_IMPLEMENTATION_GUIDE.md](./MOBILE_IMPLEMENTATION_GUIDE.md)
- [QUICK_MOBILE_TESTING.md](./QUICK_MOBILE_TESTING.md)

---

## 💡 温馨提示

### 首次 setup 时间预估
- 安装 Xcode: 30-60 分钟（取决于网速）
- 首次编译: 5-10 分钟
- 配置签名: 5 分钟
- **总计**: 约 1-1.5 小时

### 注意事项
1. **保持网络连接** - 下载依赖和证书需要联网
2. **预留足够磁盘空间** - Xcode + 项目约需 20GB
3. **备份重要数据** - 测试前备份 iPhone 数据
4. **使用最新系统** - 确保 macOS 和 iOS 都是最新版本

### 最佳实践
- ✅ 定期提交 Git 代码
- ✅ 每次修改后运行 `npx cap sync`
- ✅ 真机测试优先于模拟器
- ✅ 记录所有遇到的问题和解决方案

---

## 🎉 总结

### 已完成
✅ iOS 平台已添加  
✅ Info.plist 权限已配置  
✅ 原生插件已集成  
✅ Web 资源已构建  

### 待执行
⏳ 在 macOS 上安装 Xcode  
⏳ 配置开发者签名  
⏳ 编译并运行应用  
⏳ 真机测试验证  

**准备好开始在 iOS 上运行 LearningOS 了吗？** 🚀

按照上述步骤操作，你就能在 iPhone 上体验完整的 LearningOS 移动应用！
