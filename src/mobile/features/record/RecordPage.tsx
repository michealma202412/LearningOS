/**
 * 记录页面（移动端核心功能）
 * 
 * 提供智能语音记录功能，支持：
 * - 实时语音识别（流式 ASR）
 * - AI 自动整理内容
 * - 自动生成标题、标签、摘要
 * - 保存到本地 SQLite 数据库
 * - 音频文件与笔记绑定
 */

import { useState } from 'react';
import { useStreamingRecorder } from '../../hooks/useStreamingRecorder';
import { insertNote } from '../../core/db/sqlite';
import { AIEngine, ProcessedContent } from '../../core/engine/ai';
import { v4 as uuid } from 'uuid';

export default function RecordPage() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [enableAI, setEnableAI] = useState(true); // 是否启用 AI 处理

  const {
    isRecording,
    transcribedText,
    audioPath,
    isProcessing,
    start,
    stop,
    cancel,
    updateText,
  } = useStreamingRecorder({
    chunkInterval: 2000,
    enableRealtimeASR: true, // 启用实时 ASR
  });

  // 初始化 AI 引擎
  const aiEngine = new AIEngine({
    apiKey: process.env.OPENAI_API_KEY, // 从环境变量读取
  });

  /**
   * AI 处理内容
   */
  const handleAIProcess = async () => {
    if (!transcribedText.trim()) {
      alert('内容为空，无法处理');
      return;
    }

    setProcessing(true);

    try {
      console.log('🤖 开始 AI 处理...');
      const result: ProcessedContent = await aiEngine.processContent(transcribedText);

      // 自动填充标题和标签
      if (result.title) {
        setTitle(result.title);
      }
      
      if (result.keywords && result.keywords.length > 0) {
        setTags(result.keywords.join(','));
      }

      // 更新内容（使用格式化后的版本）
      if (result.formattedContent) {
        updateText(result.formattedContent);
      }

      console.log('✅ AI 处理完成:', result);
      alert(`✅ AI 处理完成！\n\n标题: ${result.title}\n分类: ${result.category}\n关键词: ${result.keywords.join(', ')}`);
    } catch (error) {
      console.error('❌ AI 处理失败:', error);
      alert('AI 处理失败，将使用原始内容');
    } finally {
      setProcessing(false);
    }
  };

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

      // 如果启用了 AI 且还没有标题，先进行 AI 处理
      if (enableAI && !title) {
        await handleAIProcess();
      }

      // 保存笔记，包含音频路径
      await insertNote({
        id,
        title: title || `记录 ${new Date().toLocaleTimeString()}`,
        content: transcribedText,
        audio_path: audioPath || '',
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📝 智能记录</h2>

      {/* AI 开关 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px',
        padding: '10px',
        background: '#f0f9ff',
        borderRadius: '8px',
      }}>
        <span style={{ fontSize: '14px', color: '#1e40af' }}>
          🤖 AI 自动整理
        </span>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
          <input
            type="checkbox"
            checked={enableAI}
            onChange={(e) => setEnableAI(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: enableAI ? '#10b981' : '#ccc',
            transition: '.4s',
            borderRadius: '26px',
          }}></span>
          <span style={{
            position: 'absolute',
            content: '""',
            height: '20px',
            width: '20px',
            left: enableAI ? '28px' : '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%',
          }}></span>
        </label>
      </div>

      {/* 标题输入 */}
      <input
        type="text"
        placeholder="标题（可手动输入或 AI 自动生成）"
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
          {isProcessing && ' （实时识别中）'}
        </p>
      )}

      {/* 实时文字显示区域 */}
      <textarea
        value={transcribedText}
        onChange={(e) => updateText(e.target.value)}
        placeholder="录音内容将实时显示在这里...&#10;&#10;提示：&#10;1. 点击「开始录音」后说话&#10;2. 文字会实时出现&#10;3. 说完后点击「停止录音」"
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

      {/* AI 处理按钮 */}
      {transcribedText && !isRecording && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            onClick={handleAIProcess}
            disabled={processing}
            style={{
              padding: '10px 25px',
              borderRadius: '20px',
              border: 'none',
              background: processing ? '#ccc' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.7 : 1,
            }}
          >
            {processing ? '🤖 处理中...' : '🤖 AI 智能整理'}
          </button>
        </div>
      )}

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
          <li>✅ 支持实时语音识别（说话时文字实时出现）</li>
          <li>✅ AI 自动生成标题、标签、摘要</li>
          <li>✅ 音频自动保存到本地文件系统</li>
          <li>✅ 音频与笔记自动关联</li>
          <li>💡 开启「AI 自动整理」可获得更好的体验</li>
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
