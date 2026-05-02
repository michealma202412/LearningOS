/**
 * 文件列表页面（移动端）
 * 
 * 展示所有已保存的笔记记录，支持：
 * - 查看笔记详情
 * - 播放录音（如果有）
 * - 删除笔记
 */

import { useEffect, useState } from 'react';
import { getNotes, deleteNote } from '../../core/db/sqlite';

export default function FilesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  /**
   * 加载笔记列表
   */
  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error('❌ 加载笔记失败:', error);
      alert('加载失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除笔记
   */
  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条记录吗？此操作不可恢复。')) {
      try {
        await deleteNote(id);
        loadNotes(); // 重新加载列表
        
        // 如果删除的是展开的项，关闭展开状态
        if (expandedId === id) {
          setExpandedId(null);
        }
      } catch (error) {
        console.error('❌ 删除失败:', error);
        alert('删除失败：' + (error as Error).message);
      }
    }
  };

  /**
   * 切换展开/收起状态
   */
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>⏳ 加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📁 我的记录</h2>

      {/* 空状态提示 */}
      {notes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
          }}
        >
          <p style={{ fontSize: '48px', margin: '0 0 20px 0' }}>📝</p>
          <p style={{ fontSize: '16px' }}>暂无记录</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            点击底部「记录」按钮开始创建第一条笔记
          </p>
        </div>
      ) : (
        /* 笔记列表 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notes.map((note) => {
            const isExpanded = expandedId === note.id;

            return (
              <div
                key={note.id}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: isExpanded ? '2px solid #667eea' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* 笔记头部 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleExpand(note.id)}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937' }}>
                      {note.title || '无标题'}
                    </h3>
                    
                    {/* 预览内容（未展开时显示） */}
                    {!isExpanded && (
                      <p
                        style={{
                          margin: '0',
                          color: '#6b7280',
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {note.content.substring(0, 100)}
                        {note.content.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '20px',
                      padding: '5px',
                      marginLeft: '10px',
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>

                {/* 展开的内容区域 */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '15px',
                      paddingTop: '15px',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    {/* 完整内容 */}
                    <div
                      style={{
                        fontSize: '15px',
                        lineHeight: '1.6',
                        color: '#374151',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '15px',
                      }}
                    >
                      {note.content}
                    </div>

                    {/* 元信息 */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#9ca3af',
                      }}
                    >
                      <span>📅 {new Date(note.createdAt).toLocaleString()}</span>
                      {note.tags && <span>🏷️ {note.tags}</span>}
                    </div>

                    {/* 音频播放器（如果有） */}
                    {note.audio_path && (
                      <div style={{ marginTop: '15px' }}>
                        <audio controls style={{ width: '100%' }}>
                          <source src={`data:audio/wav;base64,...`} type="audio/wav" />
                          您的浏览器不支持音频播放
                        </audio>
                      </div>
                    )}
                  </div>
                )}

                {/* 展开/收起提示 */}
                {!isExpanded && (
                  <p
                    style={{
                      margin: '10px 0 0 0',
                      fontSize: '12px',
                      color: '#667eea',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleExpand(note.id)}
                  >
                    👆 点击查看详情
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
