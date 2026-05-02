import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 学习记录类型定义
interface Record {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  reviewCount: number;
  lastReviewAt?: number;
}

// 底部导航 Tab 类型
type TabType = 'record' | 'files' | 'review' | 'scanner';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // 展开状态管理
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  
  // 二维码模态框
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCodeText, setQrCodeText] = useState('');

  // 加载数据
  useEffect(() => {
    loadRecords();
  }, []);

  // 保存数据到 AsyncStorage
  useEffect(() => {
    saveRecords();
  }, [records]);

  const loadRecords = async () => {
    try {
      const stored = await AsyncStorage.getItem('learningos_records');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveRecords = async () => {
    try {
      await AsyncStorage.setItem('learningos_records', JSON.stringify(records));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  const handleStartRecording = () => {
    Alert.alert(
      'Expo Go 原型演示',
      '在完整版本中，这里会启动原生录音功能。\n\n请使用 Xcode + Capacitor 方案获得完整功能。',
      [{ text: '确定' }]
    );
    setIsRecording(true);
    
    // 模拟录音 3 秒后停止
    setTimeout(() => {
      setIsRecording(false);
      setContent('这是模拟的语音识别文本内容...\n\n你可以在这里编辑和完善笔记内容。');
    }, 3000);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }
    
    const newRecord: Record = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim() || '（无内容）',
      createdAt: Date.now(),
      reviewCount: 0,
    };
    
    setRecords([newRecord, ...records]);
    setTitle('');
    setContent('');
    Alert.alert('成功', '保存成功！');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => setRecords(records.filter(r => r.id !== id))
        }
      ]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  const generateQRCode = (record: Record) => {
    setQrCodeText(`learningos://record/${record.id}`);
    setQrModalVisible(true);
  };

  const getDueReviews = () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return records.filter(record => {
      if (!record.lastReviewAt) return true; // 从未复习过
      const daysSinceLastReview = (now - record.lastReviewAt) / oneDay;
      const nextReviewDays = Math.pow(2, record.reviewCount); // 艾宾浩斯周期
      return daysSinceLastReview >= nextReviewDays;
    });
  };

  const handleReview = (id: string) => {
    setRecords(records.map(record => {
      if (record.id === id) {
        return {
          ...record,
          reviewCount: record.reviewCount + 1,
          lastReviewAt: Date.now(),
        };
      }
      return record;
    }));
    Alert.alert('完成', '复习完成！下次复习时间已更新。');
  };

  const renderRecordPage = () => (
    <View style={styles.recordSection}>
      <Text style={styles.sectionTitle}>📝 快速记录</Text>
      
      {/* 标题输入 */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>标题</Text>
        <TextInput
          style={styles.input}
          placeholder="输入标题..."
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* 录音按钮 */}
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={handleStartRecording}
        disabled={isRecording}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? '🔴 录音中...' : '🎤 开始录音'}
        </Text>
      </TouchableOpacity>

      {/* 文本显示/编辑 */}
      {content ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>识别文本</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="语音识别结果..."
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>
      ) : null}

      {/* 保存按钮 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>💾 保存记录</Text>
      </TouchableOpacity>

      {/* 提示信息 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>ℹ️ Expo Go 原型演示版本</Text>
        <Text style={styles.infoText}>• 录音功能为模拟演示</Text>
        <Text style={styles.infoText}>• 数据保存在本地存储</Text>
        <Text style={styles.infoText}>• 完整功能需 Capacitor 方案</Text>
      </View>
    </View>
  );

  const renderFilesPage = () => (
    <View style={styles.filesSection}>
      <Text style={styles.sectionTitle}>📁 文件列表 ({records.length})</Text>
      
      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暂无记录</Text>
          <Text style={styles.emptySubtext}>点击"记录"Tab 创建第一条记录</Text>
        </View>
      ) : (
        records.map(record => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <TouchableOpacity 
                style={styles.recordTitleContainer}
                onPress={() => toggleExpand(record.id)}
              >
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.expandIcon}>
                  {expandedRecordId === record.id ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              <View style={styles.recordActions}>
                <TouchableOpacity onPress={() => generateQRCode(record)}>
                  <Text style={styles.actionButton}>📱</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(record.id)}>
                  <Text style={styles.actionButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 展开区域 */}
            {expandedRecordId === record.id && (
              <View style={styles.expandedContent}>
                <Text style={styles.expandedText}>{record.content}</Text>
                <View style={styles.recordMeta}>
                  <Text style={styles.metaText}>
                    创建: {new Date(record.createdAt).toLocaleString('zh-CN')}
                  </Text>
                  <Text style={styles.metaText}>
                    复习: {record.reviewCount} 次
                  </Text>
                  {record.lastReviewAt && (
                    <Text style={styles.metaText}>
                      上次: {new Date(record.lastReviewAt).toLocaleDateString('zh-CN')}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderReviewPage = () => {
    const dueReviews = getDueReviews();
    
    return (
      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>🔄 复习计划 ({dueReviews.length})</Text>
        
        {dueReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🎉 暂无待复习内容</Text>
            <Text style={styles.emptySubtext}>所有记录都已复习完毕</Text>
          </View>
        ) : (
          dueReviews.map(record => {
            const nextReviewDays = Math.pow(2, record.reviewCount);
            return (
              <View key={record.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewTitle}>{record.title}</Text>
                  <Text style={styles.reviewBadge}>第 {record.reviewCount + 1} 次</Text>
                </View>
                <Text style={styles.reviewContent} numberOfLines={2}>
                  {record.content}
                </Text>
                <View style={styles.reviewFooter}>
                  <Text style={styles.reviewInfo}>
                    下次: {nextReviewDays} 天后
                  </Text>
                  <TouchableOpacity 
                    style={styles.reviewButton}
                    onPress={() => handleReview(record.id)}
                  >
                    <Text style={styles.reviewButtonText}>✅ 完成复习</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderScannerPage = () => (
    <View style={styles.scannerSection}>
      <Text style={styles.sectionTitle}>📷 扫码学习</Text>
      
      <View style={styles.scannerPlaceholder}>
        <Text style={styles.scannerIcon}>📷</Text>
        <Text style={styles.scannerText}>扫码功能演示</Text>
        <Text style={styles.scannerHint}>
          在完整版本中，这里会调用相机扫描二维码
        </Text>
        <Text style={styles.scannerHint}>
          扫描后可直接跳转到对应的学习记录
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>ℹ️ 扫码功能需要原生相机权限</Text>
        <Text style={styles.infoText}>• Expo Go 沙盒环境限制</Text>
        <Text style={styles.infoText}>• Capacitor 方案可完全支持</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* 顶部标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LearningOS</Text>
        <Text style={styles.headerSubtitle}>Expo Go 完整版原型</Text>
      </View>

      {/* 主内容区 */}
      <ScrollView style={styles.content}>
        {currentTab === 'record' && renderRecordPage()}
        {currentTab === 'files' && renderFilesPage()}
        {currentTab === 'review' && renderReviewPage()}
        {currentTab === 'scanner' && renderScannerPage()}
      </ScrollView>

      {/* 底部导航 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'record' && styles.activeTab]}
          onPress={() => setCurrentTab('record')}
        >
          <Text style={styles.tabIcon}>📝</Text>
          <Text style={styles.tabLabel}>记录</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'files' && styles.activeTab]}
          onPress={() => setCurrentTab('files')}
        >
          <Text style={styles.tabIcon}>📁</Text>
          <Text style={styles.tabLabel}>文件</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'review' && styles.activeTab]}
          onPress={() => setCurrentTab('review')}
        >
          <Text style={styles.tabIcon}>🔄</Text>
          <Text style={styles.tabLabel}>复习</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'scanner' && styles.activeTab]}
          onPress={() => setCurrentTab('scanner')}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={styles.tabLabel}>扫码</Text>
        </TouchableOpacity>
      </View>

      {/* 二维码模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQrModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>学习记录二维码</Text>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrIcon}>📱</Text>
              <Text style={styles.qrText}>{qrCodeText}</Text>
            </View>
            <Text style={styles.modalHint}>
              扫描此二维码可直接访问该记录
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  recordSection: {
    padding: 20,
  },
  filesSection: {
    padding: 20,
  },
  reviewSection: {
    padding: 20,
  },
  scannerSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingButton: {
    backgroundColor: '#f44336',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    fontSize: 20,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  expandedText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  recordMeta: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  reviewBadge: {
    fontSize: 12,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewInfo: {
    fontSize: 12,
    color: '#999',
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scannerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  scannerIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  scannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scannerHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#2196F3',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
