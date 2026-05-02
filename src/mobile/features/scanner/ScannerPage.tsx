/**
 * 扫码页面（移动端）
 * 
 * TODO: 实现二维码扫描功能
 * - 使用 @capacitor-community/barcode-scanner 插件
 * - 扫描二维码跳转到对应笔记
 * - 支持 learningos://note/{id} 协议
 */

import { useState } from 'react';

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string>('');

  const startScan = async () => {
    try {
      setScanning(true);
      
      // TODO: 集成 BarcodeScanner 插件
      // const status = await BarcodeScanner.checkPermission({ force: true });
      // if (!status.granted) {
      //   alert('需要相机权限');
      //   return;
      // }
      // const scanResult = await BarcodeScanner.startScan();
      // if (scanResult.hasContent) {
      //   setResult(scanResult.content);
      // }

      alert('扫码功能开发中...\n\n即将支持：\n- 扫描二维码快速打开笔记\n- 支持 learningos:// 协议跳转');
    } catch (error) {
      console.error('❌ 扫码失败:', error);
      alert('扫码失败');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>📷 扫码入口</h2>

      <p style={{ color: '#666', marginBottom: '30px' }}>
        扫描二维码快速打开对应的学习笔记
      </p>

      <button
        onClick={startScan}
        disabled={scanning}
        style={{
          background: scanning ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px 40px',
          borderRadius: '30px',
          fontSize: '18px',
          fontWeight: 'bold',
          border: 'none',
          cursor: scanning ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        }}
      >
        {scanning ? '扫描中...' : '开始扫码'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            background: '#f0f0f0',
            borderRadius: '8px',
          }}
        >
          <p>
            <strong>扫描结果：</strong>
          </p>
          <p>{result}</p>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '15px',
          background: '#f0f9ff',
          borderRadius: '8px',
          borderLeft: '4px solid #3b82f6',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e40af' }}>
          💡 使用场景：
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#1e40af',
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <li>扫描纸质笔记本上的二维码</li>
          <li>扫描电纸屏上的学习卡片</li>
          <li>快速跳转到指定笔记继续编辑</li>
        </ul>
      </div>
    </div>
  );
}
