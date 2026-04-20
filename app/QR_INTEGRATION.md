# LearningOS 二维码集成指南

## 🎯 概述

通过二维码，用户可以直接打开特定日期的录音页面或文件夹，无需手动输入日期。这在以下场景特别有用：

- 📚 在学习本上贴二维码，扫码快速开始录音
- 👨‍👩‍👧 家庭教育中，分享预定日期的学习任务
- 📱 Mobile-first 的学习体验

---

## 🔗 支持的二维码链接

### 1️⃣ 直接打开录音页面

**URL 模式**:
```
/app/recorder.html?folder=YYYY-MM-DD
```

**示例**:
```
https://yourdomain.com/app/recorder.html?folder=2026-04-20
```

**用途**: 扫码直接打开 2026-04-20 的录音页面

**生成步骤**:
1. 访问在线二维码生成器（如 qr-server.com）
2. 输入上述 URL
3. 下载二维码图片
4. 打印或贴在学习本上

---

### 2️⃣ 直接打开文件夹管理页面

**URL 模式**:
```
/app/folder.html?date=YYYY-MM-DD
```

**示例**:
```
https://yourdomain.com/app/folder.html?date=2026-04-20
```

**用途**: 扫码直接查看某日期的所有录音和统计

**生成步骤**:
1. 访问在线二维码生成器
2. 输入上述 URL
3. 下载二维码

---

## 📋 生成二维码的三种方式

### 方法1️⃣: 在线工具（推荐）

**工具**: https://qr-server.com/api/qr/

**用法**:
```bash
# 生成链接到 https://yourdomain.com/app/recorder.html?folder=2026-04-20 的二维码
https://qr-server.com/api/qr/?format=png&qr_code_size=300&margin=10&data=https://yourdomain.com/app/recorder.html?folder=2026-04-20
```

访问上述 URL 即可直接获得 PNG 格式的二维码。

### 方法2️⃣: 其他在线生成器

常见选择:
- 草料二维码: https://cli.im/
- 联图二维码: https://www.liantu.com/
- 微信二维码生成: https://www.wechat.com/

**步骤**:
1. 进入生成器网站
2. 粘贴 URL
3. 生成二维码
4. 下载保存

### 方法3️⃣: Node.js 批量生成（自动化）

如果你想自动生成系列二维码（比如一个月的），可以使用 Node.js：

```javascript
// 需要先安装: npm install qrcode

import QRCode from 'qrcode'

async function generateFolderQRCodes() {
  const baseUrl = 'https://yourdomain.com/app/recorder.html?folder='
  
  // 生成未来7天的二维码
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const folder = date.toISOString().slice(0, 10)
    
    const url = baseUrl + folder
    const filename = `qr_${folder}.png`
    
    await QRCode.toFile(filename, url, {
      width: 300,
      margin: 10,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    console.log(`✓ 生成: ${filename}`)
  }
}

generateFolderQRCodes()
```

---

## 🎨 二维码样式升级（可选）

### 添加 Logo 中心

某些二维码生成工具支持在中心插入 Logo：

```bash
# 使用 qr-server，带有中心图片
https://qr-server.com/api/qr/?format=png&data=https://yourdomain.com/app/recorder.html?folder=2026-04-20&size=300x300
```

### 自定义颜色

在线生成器通常支持自定义前景色和背景色：
- 前景色（二维码）: #667eea（LearningOS 主色）
- 背景色（底色）: #FFFFFF（白色）

---

## 📊 快速参考表

### 常见日期链接模板

| 日期 | 录音页面链接 | 文件夹页面链接 |
|------|-----------|-------------|
| 今天 | `/app/recorder.html?folder=2026-04-20` | `/app/folder.html?date=2026-04-20` |
| 明天 | `/app/recorder.html?folder=2026-04-21` | `/app/folder.html?date=2026-04-21` |
| 下周一 | `/app/recorder.html?folder=2026-04-27` | `/app/folder.html?date=2026-04-27` |

### 对应的完整 URL

```
https://yourdomain.com/app/recorder.html?folder=2026-04-20
https://yourdomain.com/app/folder.html?date=2026-04-20
```

---

## 💡 最佳实践

### 1️⃣ 学习本应用

**场景**: 学生有一本学习本，上面贴着每天的二维码

**实现方法**:
1. 计算学期内的每一天
2. 为每一天生成二维码
3. 打印在学习本上（每周/每周一天一个）

**代码模板**:
```javascript
// 生成 2026年4月20-30日的所有二维码
const startDate = new Date('2026-04-20')
const endDate = new Date('2026-04-30')

const dates = []
while (startDate <= endDate) {
  const folder = startDate.toISOString().slice(0, 10)
  dates.push(folder)
  startDate.setDate(startDate.getDate() + 1)
}

// 为每个日期生成二维码...
```

### 2️⃣ 家庭共享

**场景**: 家长为孩子分配每周的学习任务

**链接格式**:
```
recorder.html?folder=2026-04-21  # 周一要复习的内容
recorder.html?folder=2026-04-22  # 周二要复习的内容
...
```

### 3️⃣ 课堂应用

**场景**: 老师在课堂上出示二维码，让学生扫码继续复习

**步骤**:
1. 提前生成该课时的二维码
2. 在课堂上用投影仪显示
3. 学生扫码进入学习页面

---

## 🔒 安全考虑

### URL 参数验证

系统已内置验证，确保日期格式正确：

```javascript
// recorder.html 中的验证逻辑
const paramFolder = urlParams.get('folder')
if (paramFolder && /^\d{4}-\d{2}-\d{2}$/.test(paramFolder)) {
  // 有效的日期格式
  currentFolder = paramFolder
}
```

### 防止注入攻击

✅ 系统已防护：
- 只接受 `YYYY-MM-DD` 格式的日期
- 其他格式自动忽略并回到默认值
- 不存在的日期也可以安全打开（系统会创建新文件夹）

---

## 🚀 集成到现有系统

### 如果你已经有二维码系统

可以修改现有的二维码生成逻辑，增加 LearningOS 的链接：

```javascript
// 示例：在二维码库中添加学习应用快捷方式

const qrcodeItem = {
  id: 'learning_app',
  title: '今日学习',
  type: 'qrcode',
  content: {
    url: `https://yourdomain.com/app/recorder.html?folder=${getTodayFolder()}`,
    icon: '🎤',
    description: '打开今日录音页面'
  }
}
```

### 自动生成当周二维码

```javascript
// 生成本周7天的二维码
function generateWeekQRCodes() {
  const codes = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const folder = date.toISOString().slice(0, 10)
    
    codes.push({
      date: folder,
      recordUrl: `/app/recorder.html?folder=${folder}`,
      folderUrl: `/app/folder.html?date=${folder}`
    })
  }
  
  return codes
}
```

---

## 📱 移动设备体验

### iOS
- 系统内置二维码识别（相机应用）
- 扫一扫 → 自动打开链接
- 支持中文 URL

### Android
- 大部分手机内置二维码识别
- 部分需要安装 QR 扫描器应用
- 推荐应用：Google Lens、微信扫一扫

### 浏览器兼容性
- ✅ Chrome/Firefox/Safari 都支持 URL 参数
- ✅ 中文字符完全支持
- ✅ 响应式设计自适应屏幕

---

## 🎯 使用示例

### 示例1: 周日准备下周课程

```
周日晚上，你为孩子生成下周一到周五的学习链接：

周一: https://yourdomain.com/app/recorder.html?folder=2026-04-27
周二: https://yourdomain.com/app/recorder.html?folder=2026-04-28
周三: https://yourdomain.com/app/recorder.html?folder=2026-04-29
周四: https://yourdomain.com/app/recorder.html?folder=2026-04-30
周五: https://yourdomain.com/app/recorder.html?folder=2026-05-01

全部转换成二维码后，打印到学习日历上。
孩子每天扫一个二维码，快速进入该日期的学习。
```

### 示例2: 课后复习二维码墙

```
在教室里的复习区域，贴满过去7天的二维码。
学生可以扫不同日期的二维码，进行分散复习。
这样充分利用了艾宾浩斯遗忘曲线的复习计划。
```

### 示例3: 自动生成月度学习包

```javascript
// 为整个4月生成二维码包

async function generateMonthlyPackage() {
  const month = '2026-04'
  const qrcodes = []
  
  for (let day = 1; day <= 30; day++) {
    const folder = `${month}-${String(day).padStart(2, '0')}`
    const url = `https://yourdomain.com/app/recorder.html?folder=${folder}`
    
    // 使用在线 API 生成
    const qrUrl = `https://qr-server.com/api/qr/?data=${encodeURIComponent(url)}`
    
    qrcodes.push({
      date: folder,
      qrUrl: qrUrl
    })
  }
  
  return qrcodes
}
```

---

## 🔧 故障排除

### 二维码无法扫描

**原因**: 生成的 URL 过长或编码有误

**解决**:
1. 确保日期格式正确（YYYY-MM-DD）
2. 如果 URL 过长，使用短链接服务（bit.ly, tu.im）
3. 测试用手机直接访问 URL，确保有效

### 打开后显示错误

**原因**: 日期参数无效或浏览器不支持

**解决**:
1. 检查日期格式（必须是 YYYY-MM-DD）
2. 确保日期有效（如 2026-04-31 会形成无效日期）
3. 更新浏览器到最新版本

### 无法创建录音

**原因**: 浏览器未授予麦克风权限

**解决**:
1. 刷新页面，重新授权麦克风
2. 检查浏览器设置中的麦克风权限
3. 尝试在无痕浏览模式下打开

---

## 📊 二维码统计和分析（计划功能）

未来版本将支持：

- 📊 追踪二维码扫描次数
- 📈 分析学生的学习时间分布
- 🎯 根据扫描数据调整学习计划
- 📱 二维码点击率分析

---

**总结**: 

✅ 现在你的 LearningOS 系统已完全支持二维码集成  
✅ 任何标准的二维码生成器都可以工作  
✅ 结合艾宾浩斯算法，创造了强大的学习体验

**下一步**: 在物理学习环境中使用这些二维码，观察学习效果提升！
