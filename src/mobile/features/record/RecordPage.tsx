/**
 * 记录页面（移动端核心功能）
 * 
 * 提供多种输入方式：
 * - 🎤 语音+文字（实时识别）
 * - 🎵 仅音频（录音不转文字）
 * - ✍️ 仅文字（手动输入）
 * - 📷 拍照/添加图片
 * - 🎥 拍视频/添加视频
 * - AI 自动整理内容
 * - 保存到本地 SQLite 数据库
 */

import { useState, useRef } from 'react';
import { useStreamingRecorder } from '../../hooks/useStreamingRecorder';
import { insertNote } from '../../core/db/sqlite';
import { AIEngine, ProcessedContent } from '../../core/engine/ai';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuid } from 'uuid';

type InputMode = 'voice' | 'audio-only' | 'text-only' | 'photo' | 'video';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio';
  path: string;
  preview?: string; // base64 for preview
}

export default function RecordPage() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [enableAI, setEnableAI] = useState(true);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 语音录音 Hook
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
    enableRealtimeASR: inputMode === 'voice',
  });

  // 初始化 AI 引擎
  const aiEngine = new AIEngine({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * 切换输入模式
   */
  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    // 清空当前内容
    setContent('');
    setAttachments([]);
    if (isRecording) {
      cancel();
    }
  };

  /**
   * 拍照或选择图片
   */
  const handleTakePhoto = async () => {
    try {
      const result = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      const attachment: MediaAttachment = {
        type: 'image',
        path: result.path || '',
        preview: result.webPath,
      };

      setAttachments([...attachments, attachment]);
      
      // 如果是纯图片模式，自动填充标题
      if (inputMode === 'photo' && !title) {
        setTitle(`图片记录 ${new Date().toLocaleTimeString()}`);
      }
    } catch (error) {
      console.error('❌ 拍照失败:', error);
      alert('拍照失败：' + (error as Error).message);
    }
  };

  /**
   * 从相册选择图片
   */
  const handleSelectPhoto = async () => {
    try {
      const result = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      const attachment: MediaAttachment = {
        type: 'image',
        path: result.path || '',
        preview: result.webPath,
      };

      setAttachments([...attachments, attachment]);
    } catch (error) {
      console.error('❌ 选择图片失败:', error);
    }
  };

  /**
   * 录制或选择视频
   */
  const handleRecordVideo = async () => {
    try {
      // Capacitor Camera 插件也支持视频
      const result = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        // @ts-ignore - video 选项可能需要额外配置
        saveToGallery: true,
      });

      const attachment: MediaAttachment = {
        type: 'video',
        path: result.path || '',
        preview: result.webPath,
      };

      setAttachments([...attachments, attachment]);
      
      if (inputMode === 'video' && !title) {
        setTitle(`视频记录 ${new Date().toLocaleTimeString()}`);
      }
    } catch (error) {
      console.error('❌ 录制视频失败:', error);
      alert('录制视频失败：' + (error as Error).message);
    }
  };

  /**
   * 从文件选择器添加媒体
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        const attachment: MediaAttachment = {
          type,
          path: file.name,
          preview: e.target?.result as string,
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * AI 处理内容
   */
  const handleAIProcess = async () => {
    const textToProcess = content || transcribedText;
    
    if (!textToProcess.trim()) {
      alert('内容为空，无法处理');
      return;
    }

    setProcessing(true);

    try {
      console.log('🤖 开始 AI 处理...');
      const result: ProcessedContent = await aiEngine.processContent(textToProcess);

      if (result.title) setTitle(result.title);
      if (result.keywords && result.keywords.length > 0) {
        setTags(result.keywords.join(','));
      }
      if (result.formattedContent) {
        setContent(result.formattedContent);
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
    const finalContent = content || transcribedText;
    
    if (!finalContent.trim() && attachments.length === 0) {
      alert('请添加内容或附件');
      return;
    }

    setSaving(true);

    try {
      const id = uuid();

      // 如果启用了 AI 且还没有标题，先进行 AI 处理
      if (enableAI && !title && finalContent.trim()) {
        await handleAIProcess();
      }

      // 保存附件路径
      const attachmentPaths = attachments.map(att => att.path).join(',');

      // 保存笔记
      await insertNote({
        id,
        title: title || `${getModeLabel()} ${new Date().toLocaleTimeString()}`,
        content: finalContent,
        audio_path: audioPath || attachmentPaths,
        tags,
      });

      alert('✅ 保存成功！');

      // 清空表单
      setTitle('');
      setTags('');
      setContent('');
      setAttachments([]);
      updateText('');
    } catch (error) {
      console.error('❌ 保存失败:', error);
      alert('❌ 保存失败：' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 获取模式标签
   */
  const getModeLabel = () => {
    const labels: Record<InputMode, string> = {
      'voice': '语音记录',
      'audio-only': '音频记录',
      'text-only': '文字记录',
      'photo': '图片记录',
      'video': '视频记录',
    };
    return labels[inputMode];
  };

  /**
   * 取消操作
   */
  const handleCancel = () => {
    if (isRecording) {
      if (confirm('正在录音中，确定要取消吗？')) {
        cancel();
      }
    } else {
      cancel();
      setContent('');
      setAttachments([]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* 页面标题 */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📝 智能记录</h2>

      {/* 输入模式选择器 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '10px',
      }}>
        {[
          { mode: 'voice', icon: '🎤', label: '语音+文字' },
          { mode: 'audio-only', icon: '🎵', label: '仅音频' },
          { mode: 'text-only', icon: '✍️', label: '仅文字' },
          { mode: 'photo', icon: '📷', label: '拍照/图片' },
          { mode: 'video', icon: '🎥', label: '视频' },
        ].map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode as InputMode)}
            style={{
              flex: '1 0 auto',
              padding: '10px 15px',
              borderRadius: '20px',
              border: inputMode === mode ? '2px solid #667eea' : '1px solid #ddd',
              background: inputMode === mode ? '#667eea' : 'white',
              color: inputMode === mode ? 'white' : '#333',
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

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

      {/* 根据模式显示不同的输入区域 */}
      
      {/* 语音+文字模式 */}
      {inputMode === 'voice' && (
        <>
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
                }}
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
                  animation: 'pulse 1.5s infinite',
                }}
              >
                ⏹️ 停止录音
              </button>
            )}
          </div>

          {isRecording && (
            <p style={{ textAlign: 'center', color: '#f5576c', fontSize: '14px' }}>
              🔴 正在录音... 请说话
              {isProcessing && ' （实时识别中）'}
            </p>
          )}

          <textarea
            value={transcribedText}
            onChange={(e) => updateText(e.target.value)}
            placeholder="录音内容将实时显示在这里..."
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
            }}
          />
        </>
      )}

      {/* 仅音频模式 */}
      {inputMode === 'audio-only' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {!isRecording ? (
            <button
              onClick={start}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '20px 50px',
                borderRadius: '50%',
                fontSize: '48px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(245, 87, 108, 0.4)',
              }}
            >
              🎵
            </button>
          ) : (
            <button
              onClick={stop}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                padding: '20px 50px',
                borderRadius: '50%',
                fontSize: '48px',
                border: 'none',
                cursor: 'pointer',
                animation: 'pulse 1s infinite',
              }}
            >
              ⏹️
            </button>
          )}
          <p style={{ marginTop: '20px', color: '#666' }}>
            {isRecording ? '正在录音...' : '点击开始录音（不转文字）'}
          </p>
        </div>
      )}

      {/* 仅文字模式 */}
      {inputMode === 'text-only' && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在此输入文字内容..."
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            lineHeight: '1.6',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* 拍照/图片模式 */}
      {inputMode === 'photo' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              onClick={handleTakePhoto}
              style={{
                padding: '12px 25px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              📷 拍照
            </button>
            <button
              onClick={handleSelectPhoto}
              style={{
                padding: '12px 25px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                background: 'white',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              🖼️ 从相册选择
            </button>
          </div>

          {/* 图片预览 */}
          {attachments.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {attachments.filter(att => att.type === 'image').map((att, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={att.preview}
                    alt={`图片 ${index + 1}`}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="添加图片说明（可选）..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              marginTop: '20px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* 视频模式 */}
      {inputMode === 'video' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button
            onClick={handleRecordVideo}
            style={{
              padding: '15px 40px',
              borderRadius: '30px',
              border: 'none',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              marginBottom: '20px',
            }}
          >
            🎥 录制视频
          </button>

          {/* 视频预览 */}
          {attachments.filter(att => att.type === 'video').map((att, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <video
                src={att.preview}
                controls
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </div>
          ))}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="添加视频说明（可选）..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* AI 处理按钮 */}
      {(content || transcribedText) && !isRecording && (
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
          disabled={saving || (isRecording && inputMode === 'voice')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: saving || (isRecording && inputMode === 'voice') ? '#ccc' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: saving || (isRecording && inputMode === 'voice') ? 'not-allowed' : 'pointer',
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

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

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
          💡 当前模式：{getModeLabel()}
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '14px' }}>
          {inputMode === 'voice' && (
            <>
              <li>✅ 支持实时语音识别</li>
              <li>✅ AI 自动生成标题、标签</li>
            </>
          )}
          {inputMode === 'audio-only' && (
            <>
              <li>✅ 仅录制音频，不转文字</li>
              <li>✅ 适合会议记录、音乐等</li>
            </>
          )}
          {inputMode === 'text-only' && (
            <>
              <li>✅ 纯文字输入</li>
              <li>✅ 快速记录想法</li>
            </>
          )}
          {inputMode === 'photo' && (
            <>
              <li>✅ 拍照或从相册选择</li>
              <li>✅ 可添加图片说明</li>
            </>
          )}
          {inputMode === 'video' && (
            <>
              <li>✅ 录制或选择视频</li>
              <li>✅ 可添加视频说明</li>
            </>
          )}
        </ul>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
