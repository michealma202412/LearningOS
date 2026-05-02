/**
 * LearningOS 移动端主应用
 * 
 * 采用底部 Tab 导航设计：
 * - 记录（默认首页）
 * - 文件
 * - 复习
 * - 扫码
 */

import { useState, useEffect } from 'react';
import RecordPage from './mobile/features/record/RecordPage';
import FilesPage from './mobile/features/files/FilesPage';
import ReviewPage from './mobile/features/review/ReviewPage';
import ScannerPage from './mobile/features/scanner/ScannerPage';
import { initDB } from './mobile/core/db/sqlite';

type TabType = 'record' | 'files' | 'review' | 'scanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('record');
  const [dbInitialized, setDbInitialized] = useState(false);

  // 初始化数据库
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        setDbInitialized(true);
        console.log('✅ 数据库初始化完成');
      } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        alert('数据库初始化失败，部分功能可能不可用');
        setDbInitialized(true); // 仍然允许使用，但提示用户
      }
    };

    initialize();
  }, []);

  if (!dbInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>⏳ 初始化中...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        paddingBottom: '70px', // 为底部导航留空间
      }}
    >
      {/* 页面内容区域 */}
      {activeTab === 'record' && <RecordPage />}
      {activeTab === 'files' && <FilesPage />}
      {activeTab === 'review' && <ReviewPage />}
      {activeTab === 'scanner' && <ScannerPage />}

      {/* 底部导航栏 */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {/* 记录 Tab */}
        <button
          onClick={() => setActiveTab('record')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'record' ? '#667eea' : '#999',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            transition: 'color 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>📝</span>
          <span style={{ fontWeight: activeTab === 'record' ? 'bold' : 'normal' }}>
            记录
          </span>
        </button>

        {/* 文件 Tab */}
        <button
          onClick={() => setActiveTab('files')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'files' ? '#667eea' : '#999',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            transition: 'color 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>📁</span>
          <span style={{ fontWeight: activeTab === 'files' ? 'bold' : 'normal' }}>
            文件
          </span>
        </button>

        {/* 复习 Tab */}
        <button
          onClick={() => setActiveTab('review')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'review' ? '#667eea' : '#999',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            transition: 'color 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>🔄</span>
          <span style={{ fontWeight: activeTab === 'review' ? 'bold' : 'normal' }}>
            复习
          </span>
        </button>

        {/* 扫码 Tab */}
        <button
          onClick={() => setActiveTab('scanner')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'scanner' ? '#667eea' : '#999',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            transition: 'color 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>📷</span>
          <span style={{ fontWeight: activeTab === 'scanner' ? 'bold' : 'normal' }}>
            扫码
          </span>
        </button>
      </nav>
    </div>
  );
}
