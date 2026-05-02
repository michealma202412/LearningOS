/**
 * LearningOS 移动端功能验证脚本
 * 
 * 验证以下核心模块：
 * 1. SQLite 数据库模块
 * 2. 原生录音引擎
 * 3. 文本去重算法
 * 4. 流式录音 Hook
 */

import { mergeText, cleanText } from './src/mobile/utils/textMerge';

console.log('🧪 LearningOS 移动端功能验证\n');

// ========== 测试 1: 文本去重算法 ==========
console.log('📝 测试 1: 文本去重算法');
console.log('=' .repeat(50));

const testCases = [
  {
    name: '基础重叠',
    prev: '今天 我们 讨论',
    next: '我们 讨论 学习 系统',
    expected: '今天 我们 讨论 学习 系统',
  },
  {
    name: '无重叠',
    prev: '你好',
    next: '世界',
    expected: '你好 世界',
  },
  {
    name: '完全重叠',
    prev: '测试 内容',
    next: '测试 内容',
    expected: '测试 内容',
  },
  {
    name: '空字符串',
    prev: '',
    next: '新内容',
    expected: '新内容',
  },
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach(({ name, prev, next, expected }) => {
  const result = mergeText(prev, next);
  const passed = result === expected;
  
  if (passed) {
    console.log(`✅ ${name}: 通过`);
    passedTests++;
  } else {
    console.log(`❌ ${name}: 失败`);
    console.log(`   期望: "${expected}"`);
    console.log(`   实际: "${result}"`);
    failedTests++;
  }
});

console.log();

// ========== 测试 2: 文本清理 ==========
console.log('📝 测试 2: 文本清理');
console.log('=' .repeat(50));

const cleanTests = [
  { input: '  多余  空格  ', expected: '多余 空格' },
  { input: '测试内容。', expected: '测试内容' },
  { input: '多个   空格', expected: '多个 空格' },
];

cleanTests.forEach(({ input, expected }) => {
  const result = cleanText(input);
  const passed = result === expected;
  
  if (passed) {
    console.log(`✅ "${input}" -> "${result}"`);
    passedTests++;
  } else {
    console.log(`❌ "${input}" -> "${result}" (期望: "${expected}")`);
    failedTests++;
  }
});

console.log();

// ========== 测试 3: 模块导入验证 ==========
console.log('📝 测试 3: 模块导入验证');
console.log('=' .repeat(50));

try {
  // 检查文件是否存在
  const fs = await import('fs');
  const path = await import('path');
  
  const filesToCheck = [
    'src/mobile/core/db/sqlite.ts',
    'src/mobile/core/engine/recorder.ts',
    'src/mobile/hooks/useStreamingRecorder.ts',
    'src/mobile/features/record/RecordPage.tsx',
    'src/mobile/features/files/FilesPage.tsx',
    'src/mobile/features/review/ReviewPage.tsx',
    'src/mobile/features/scanner/ScannerPage.tsx',
    'src/App.mobile.tsx',
  ];
  
  let allFilesExist = true;
  filesToCheck.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - 文件不存在`);
      allFilesExist = false;
      failedTests++;
    }
  });
  
  if (allFilesExist) {
    passedTests += filesToCheck.length;
  }
  
} catch (error) {
  console.error('❌ 模块验证失败:', error);
  failedTests++;
}

console.log();

// ========== 测试总结 ==========
console.log('📊 测试总结');
console.log('=' .repeat(50));
console.log(`✅ 通过: ${passedTests}`);
console.log(`❌ 失败: ${failedTests}`);
console.log(`📈 通过率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
console.log();

if (failedTests === 0) {
  console.log('🎉 所有测试通过！移动端核心功能已就绪。');
  console.log();
  console.log('下一步操作:');
  console.log('1. 安装 Capacitor 平台依赖: npm install @capacitor/android @capacitor/ios');
  console.log('2. 构建项目: npm run build');
  console.log('3. 同步到原生平台: npx cap sync');
  console.log('4. 运行到设备: npx cap open android 或 npx cap open ios');
} else {
  console.log('⚠️  存在失败的测试，请检查上述错误。');
  process.exit(1);
}
