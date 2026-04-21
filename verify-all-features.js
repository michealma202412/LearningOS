/**
 * LearningOS 全功能验证脚本
 * 用于验证所有已实现的功能模块
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath)
  if (exists) {
    log(colors.green, `✅ ${description}: ${filePath}`)
    return true
  } else {
    log(colors.red, `❌ ${description}: ${filePath} (不存在)`)
    return false
  }
}

function checkFunctionExists(filePath, functionName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const regex = new RegExp(`(export\\s+(async\\s+)?function\\s+${functionName}|${functionName}\\s*=)`)
    if (regex.test(content)) {
      log(colors.green, `   ✓ 函数 ${functionName}() 存在`)
      return true
    } else {
      log(colors.red, `   ✗ 函数 ${functionName}() 不存在`)
      return false
    }
  } catch (error) {
    log(colors.red, `   ✗ 检查失败: ${error.message}`)
    return false
  }
}

function checkContent(filePath, pattern, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    if (pattern.test(content)) {
      log(colors.green, `   ✓ ${description}`)
      return true
    } else {
      log(colors.yellow, `   ⚠ ${description} (未找到)`)
      return false
    }
  } catch (error) {
    log(colors.red, `   ✗ 检查失败: ${error.message}`)
    return false
  }
}

console.log('\n' + '='.repeat(70))
log(colors.cyan, '🧪 LearningOS 全功能验证测试')
console.log('='.repeat(70) + '\n')

let totalTests = 0
let passedTests = 0

// ==========================================
// 第一阶段：文件结构验证
// ==========================================
log(colors.blue, '\n📁 第一阶段：文件结构验证\n')

const requiredFiles = [
  ['app/index.html', '看板页面'],
  ['app/recorder.html', '录音页面'],
  ['app/editor.html', '文章编辑器'],
  ['app/folder.html', '文件夹详情页'],
  ['app/article.html', '文章查看页'],
  ['app/js/db.js', '数据库模块'],
  ['app/js/recorder.js', '录音模块'],
  ['app/js/speech.js', '语音识别模块'],
  ['app/js/scheduler.js', '调度模块'],
  ['app/js/exporter.js', '导出模块'],
  ['app/js/app.js', '应用逻辑']
]

requiredFiles.forEach(([file, desc]) => {
  totalTests++
  if (checkFile(path.join(__dirname, file), desc)) {
    passedTests++
  }
})

// ==========================================
// 第二阶段：数据库功能验证
// ==========================================
log(colors.blue, '\n💾 第二阶段：数据库功能验证\n')

const dbPath = path.join(__dirname, 'app/js/db.js')
totalTests++
if (fs.existsSync(dbPath)) {
  passedTests++
  
  const dbFunctions = [
    'openDB',
    'saveAudio',
    'saveArticle',
    'getAllAudios',
    'getAllArticles',
    'getAllItems',
    'getItemsByFolder',
    'getArticlesByFolder',
    'getAudiosByFolder',
    'updateItem',
    'deleteItem',
    'getAllFolders',
    'initDB'
  ]
  
  dbFunctions.forEach(func => {
    totalTests++
    if (checkFunctionExists(dbPath, func)) {
      passedTests++
    }
  })
  
  // 检查store名称
  totalTests++
  checkContent(dbPath, /STORE\s*=\s*["']items["']/, 'Store名称为 "items"')
  
  // 检查数据库版本
  totalTests++
  checkContent(dbPath, /indexedDB\.open\(DB_NAME,\s*2\)/, '数据库版本为 v2')
}

// ==========================================
// 第三阶段：导出功能验证
// ==========================================
log(colors.blue, '\n📤 第三阶段：导出功能验证\n')

const exporterPath = path.join(__dirname, 'app/js/exporter.js')
totalTests++
if (fs.existsSync(exporterPath)) {
  passedTests++
  
  const exporterFunctions = [
    'exportAll',
    'downloadMarkdown',
    'exportFolder'
  ]
  
  exporterFunctions.forEach(func => {
    totalTests++
    if (checkFunctionExists(exporterPath, func)) {
      passedTests++
    }
  })
  
  // 检查关键功能
  totalTests++
  checkContent(exporterPath, /slugify/, '文件名规范化函数')
  
  totalTests++
  checkContent(exporterPath, /formatList/, '列表格式化函数')
  
  totalTests++
  checkContent(exporterPath, /docs\/public\/audio/, '音频路径规范')
  
  totalTests++
  checkContent(exporterPath, /docs\/learn/, 'Markdown路径规范')
}

// ==========================================
// 第四阶段：文章查看页面验证
// ==========================================
log(colors.blue, '\n📄 第四阶段：文章查看页面验证\n')

const articlePath = path.join(__dirname, 'app/article.html')
totalTests++
if (fs.existsSync(articlePath)) {
  passedTests++
  
  const articleContent = fs.readFileSync(articlePath, 'utf8')
  
  // 检查关键元素
  const checks = [
    [/id="titlePreview"/, '标题显示区域'],
    [/id="contentPreview"/, '正文显示区域'],
    [/id="goalsPreview"/, '学习目标显示区域'],
    [/id="memoryPreview"/, '记忆点显示区域'],
    [/id="quizPreview"/, '小测试显示区域'],
    [/id="audioSection"/, '音频播放区域'],
    [/article\.html\?id=/, 'URL参数获取文章ID'],
    [/backLink/, '返回文件夹链接'],
    [/editBtn/, '编辑文章按钮'],
    [/exportBtn/, '导出Markdown按钮'],
    [/import.*exporter/, '导入导出模块']
  ]
  
  checks.forEach(([pattern, desc]) => {
    totalTests++
    if (checkContent(articlePath, pattern, desc)) {
      passedTests++
    }
  })
}

// ==========================================
// 第五阶段：看板文章支持验证
// ==========================================
log(colors.blue, '\n📊 第五阶段：看板文章支持验证\n')

const appPath = path.join(__dirname, 'app/js/app.js')
totalTests++
if (fs.existsSync(appPath)) {
  passedTests++
  
  const appContent = fs.readFileSync(appPath, 'utf8')
  
  const checks = [
    [/item\.type === ["']article["']/, '文章类型判断'],
    [/article\.html\?id=/, '文章查看链接'],
    [/contentPreview|content\.substring/, '文章内容预览'],
    [/renderTodayList/, '今日列表渲染函数']
  ]
  
  checks.forEach(([pattern, desc]) => {
    totalTests++
    if (checkContent(appPath, pattern, desc)) {
      passedTests++
    }
  })
}

// ==========================================
// 第六阶段：文件夹页面验证
// ==========================================
log(colors.blue, '\n📁 第六阶段：文件夹页面验证\n')

const folderPath = path.join(__dirname, 'app/folder.html')
totalTests++
if (fs.existsSync(folderPath)) {
  passedTests++
  
  const folderContent = fs.readFileSync(folderPath, 'utf8')
  
  const checks = [
    [/deleteItem/, '使用统一的删除函数'],
    [/article\.html\?id=/, '文章查看链接'],
    [/renderArticleList/, '文章列表渲染'],
    [/renderAudioList/, '音频列表渲染'],
    [/calculateFolderStats/, '文件夹统计计算'],
    [/audio\.reviews/, '音频复习进度处理']
  ]
  
  checks.forEach(([pattern, desc]) => {
    totalTests++
    if (checkContent(folderPath, pattern, desc)) {
      passedTests++
    }
  })
}

// ==========================================
// 第七阶段：语音输入验证
// ==========================================
log(colors.blue, '\n🎤 第七阶段：语音输入验证\n')

const editorPath = path.join(__dirname, 'app/editor.html')
totalTests++
if (fs.existsSync(editorPath)) {
  passedTests++
  
  const editorContent = fs.readFileSync(editorPath, 'utf8')
  
  const checks = [
    [/SpeechRecognition|webkitSpeechRecognition/, '语音识别API'],
    [/saveArticle/, '文章保存功能'],
    [/exportAll/, '导出功能'],
    [/id="title"/, '标题输入框'],
    [/id="content"/, '正文输入框'],
    [/id="goals"/, '学习目标输入框'],
    [/id="memory"/, '记忆点输入框'],
    [/id="quiz"/, '小测试输入框']
  ]
  
  checks.forEach(([pattern, desc]) => {
    totalTests++
    if (checkContent(editorPath, pattern, desc)) {
      passedTests++
    }
  })
}

// ==========================================
// 第八阶段：调度算法验证
// ==========================================
log(colors.blue, '\n📅 第八阶段：调度算法验证\n')

const schedulerPath = path.join(__dirname, 'app/js/scheduler.js')
totalTests++
if (fs.existsSync(schedulerPath)) {
  passedTests++
  
  const schedulerContent = fs.readFileSync(schedulerPath, 'utf8')
  
  const checks = [
    [/\[0,\s*1,\s*3,\s*7\]/, '艾宾浩斯间隔 [0,1,3,7]'],
    [/createReviews/, '创建复习计划函数'],
    [/isToday/, '判断今日函数'],
    [/getTodayFolder/, '获取今日文件夹函数'],
    [/calculateFolderStats/, '文件夹统计函数']
  ]
  
  checks.forEach(([pattern, desc]) => {
    totalTests++
    if (checkContent(schedulerPath, pattern, desc)) {
      passedTests++
    }
  })
}

// ==========================================
// 总结
// ==========================================
console.log('\n' + '='.repeat(70))
log(colors.cyan, '📊 测试总结')
console.log('='.repeat(70))

const passRate = ((passedTests / totalTests) * 100).toFixed(1)

console.log(`\n总测试数: ${totalTests}`)
log(passedTests === totalTests ? colors.green : colors.yellow, 
    `通过测试: ${passedTests}/${totalTests} (${passRate}%)`)

if (passedTests === totalTests) {
  log(colors.green, '\n🎉 所有测试通过！代码结构完整。')
} else {
  log(colors.yellow, `\n⚠️  有 ${totalTests - passedTests} 个测试未通过，请检查上述标记。`)
}

console.log('\n' + '='.repeat(70))
log(colors.blue, '📝 下一步建议')
console.log('='.repeat(70))

console.log(`
1. ✅ 代码结构验证完成
2. 🔄 需要在浏览器中进行端到端功能测试
3. 📋 访问以下页面进行手动测试：
   - http://localhost:5173/LearningOS/app/index.html (看板)
   - http://localhost:5173/LearningOS/app/recorder.html (录音)
   - http://localhost:5173/LearningOS/app/editor.html (文章编辑)
   - http://localhost:5173/LearningOS/app/folder.html?date=2026-04-21 (文件夹)
   
4. 🐛 重点关注：
   - folder.html 是否能正常加载（之前有加载问题）
   - 语音识别在Chrome中是否工作
   - 导出功能是否正确生成Markdown和音频文件
   
5. 📖 查看详细测试报告：
   - doc/TEST_VERIFICATION_REPORT.md
`)

console.log('='.repeat(70) + '\n')

// 退出码
process.exit(passedTests === totalTests ? 0 : 1)