/**
 * LearningOS 功能验证脚本 (CommonJS版本)
 */

const fs = require('fs')
const path = require('path')

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
    log(colors.green, `✅ ${description}`)
    return true
  } else {
    log(colors.red, `❌ ${description} (不存在)`)
    return false
  }
}

function checkFunctionExists(filePath, functionName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const regex = new RegExp(`(export\\s+(async\\s+)?function\\s+${functionName}|${functionName}\\s*=)`)
    if (regex.test(content)) {
      log(colors.green, `   ✓ ${functionName}()`)
      return true
    } else {
      log(colors.red, `   ✗ ${functionName}() 不存在`)
      return false
    }
  } catch (error) {
    log(colors.red, `   ✗ 检查失败: ${error.message}`)
    return false
  }
}

console.log('\n' + '='.repeat(70))
log(colors.cyan, '🧪 LearningOS 功能验证测试')
console.log('='.repeat(70) + '\n')

let totalTests = 0
let passedTests = 0

// 测试文件存在
log(colors.blue, '\n📁 核心文件检查\n')

const files = [
  ['app/index.html', '看板页面'],
  ['app/recorder.html', '录音页面'],
  ['app/editor.html', '文章编辑器'],
  ['app/folder.html', '文件夹详情页'],
  ['app/article.html', '文章查看页'],
  ['app/js/db.js', '数据库模块'],
  ['app/js/exporter.js', '导出模块'],
  ['app/js/app.js', '应用逻辑'],
  ['app/js/scheduler.js', '调度模块']
]

files.forEach(([file, desc]) => {
  totalTests++
  if (checkFile(file, desc)) passedTests++
})

// 测试数据库函数
log(colors.blue, '\n💾 数据库函数检查\n')

const dbPath = 'app/js/db.js'
if (fs.existsSync(dbPath)) {
  const dbFunctions = [
    'openDB', 'saveAudio', 'saveArticle', 'getAllAudios', 
    'getAllArticles', 'deleteItem', 'initDB'
  ]
  
  dbFunctions.forEach(func => {
    totalTests++
    if (checkFunctionExists(dbPath, func)) passedTests++
  })
}

// 测试导出功能
log(colors.blue, '\n📤 导出功能检查\n')

const exporterPath = 'app/js/exporter.js'
if (fs.existsSync(exporterPath)) {
  const exporterFunctions = ['exportAll', 'downloadMarkdown', 'exportFolder']
  
  exporterFunctions.forEach(func => {
    totalTests++
    if (checkFunctionExists(exporterPath, func)) passedTests++
  })
}

// 总结
console.log('\n' + '='.repeat(70))
log(colors.cyan, '📊 测试结果')
console.log('='.repeat(70))

const passRate = ((passedTests / totalTests) * 100).toFixed(1)
console.log(`\n通过: ${passedTests}/${totalTests} (${passRate}%)\n`)

if (passedTests === totalTests) {
  log(colors.green, '🎉 所有测试通过！')
} else {
  log(colors.yellow, `⚠️  有 ${totalTests - passedTests} 项未通过`)
}

console.log('\n下一步：在浏览器中测试实际功能\n')
console.log('='.repeat(70) + '\n')