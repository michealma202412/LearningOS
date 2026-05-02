/**
 * 记录页面（移动端核心功能）
 * 
 * 提供快速语音记录功能，支持：
 * - 原生录音（稳定可靠）
 * - 实时文字显示
 * - 标题和标签编辑
 * - 保存到本地 SQLite 数据库
 */

import { useState } from 'react';
import { useStreamingRecorder } from '../../hooks/useStreamingRecorder';
import { insertNote } from '../../core/db/sqlite';
import { v4 as uuid } from 'uuid';

export default function RecordPage() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    isRecording,
    transcribedText,
    start,
    stop,
    cancel,
    updateText,
  } = useStreamingRecorder({
    chunkInterval: 2000,
  });

  /**
   * 保存笔记到数据库
   */
  const handleSave = async () => {
    if (!transcribedText.trim()) {
      alert('内容为空，无法保存');
      return;
    }

    setSaving(true);

    try {
      const id = uuid();

      await insertNote({
        id,
        title: title || `记录 ${new Date().toLocaleTimeString()}`,
        content: transcribedText,
        tags,
      });

      alert('✅ 保存成功！');

      // 清空表单
      setTitle('');
      setTags('');
      updateText('');
    } catch (error) {
      console.error('❌ 保存失败:', error);
      alert('❌ 保存失败：' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 取消当前录音
   */
  const handleCancel = () => {
    if (isRecording) {
      if (confirm('正在录音中，确定要取消吗？')) {
        cancel();
      }
    } else {
      cancel();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📝 快速记录</h2>

      {/* 标题输入 */}
      <input
        type="text"
        placeholder="标题（可选）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isRecording}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '16px',
          boxSizing: 'border-box',
        }}
      />

      {/* 标签输入 */}
      <input
        type="text"
        placeholder="标签（用逗号分隔，如：学习,数学）"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        disabled={isRecording}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '16px',
          boxSizing: 'border-box',
        }}
      />

      {/* 录音控制按钮 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {!isRecording ? (
          <button
            onClick={start}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '15px 40px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🎤 开始录音
          </button>
        ) : (
          <button
            onClick={stop}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '15px 40px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            ⏹️ 停止录音
          </button>
        )}
      </div>

      {/* 录音状态提示 */}
      {isRecording && (
        <p style={{ textAlign: 'center', color: '#f5576c', fontSize: '14px' }}>
          🔴 正在录音... 请说话
        </p>
      )}

      {/* 实时文字显示区域 */}
      <textarea
        value={transcribedText}
        onChange={(e) => updateText(e.target.value)}
        placeholder="录音内容将实时显示在这里...&#10;&#10;提示：&#10;1. 点击「开始录音」后说话&#10;2. 说完后点击「停止录音」&#10;3. 也可以直接在此编辑文字"
        disabled={isRecording}
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '15px',
          borderRadius: '8px',
          border: isRecording ? '2px solid #f5576c' : '1px solid #ddd',
          fontSize: '16px',
          lineHeight: '1.6',
          resize: 'vertical',
          boxSizing: 'border-box',
          backgroundColor: isRecording ? '#fff5f5' : 'white',
        }}
      />

      {/* 操作按钮组 */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={handleSave}
          disabled={!transcribedText.trim() || saving || isRecording}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background:
              !transcribedText.trim() || saving || isRecording
                ? '#ccc'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor:
              !transcribedText.trim() || saving || isRecording
                ? 'not-allowed'
                : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? '💾 保存中...' : '💾 保存'}
        </button>

        <button
          onClick={handleCancel}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          🗑️ 取消
        </button>
      </div>

      {/* 使用提示 */}
      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f0f9ff',
          borderRadius: '8px',
          borderLeft: '4px solid #3b82f6',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e40af' }}>
          💡 使用提示：
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '14px' }}>
          <li>点击「开始录音」后开始说话</li>
          <li>说完后点击「停止录音」保存音频</li>
          <li>录音过程中可以手动编辑文字</li>
          <li>支持后台录音（切换到其他应用仍继续录音）</li>
        </ul>
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
