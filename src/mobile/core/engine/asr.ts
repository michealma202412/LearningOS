/**
 * LearningOS ASR 引擎（移动端）
 * 
 * 实现流式语音识别：
 * - WebSocket 连接 ASR 服务
 * - 实时发送音频分片
 * - 实时接收识别结果
 * - 文本去重拼接
 */

import { mergeText } from '../../utils/textMerge';

export interface ASRConfig {
  serverUrl: string;        // ASR 服务器地址
  apiKey?: string;          // API Key（可选）
  language?: string;        // 语言设置，默认 zh-CN
  chunkDuration?: number;   // 分片时长（毫秒），默认 2000
}

export interface ASRResult {
  text: string;             // 识别文本
  isFinal: boolean;         // 是否为最终结果
  confidence?: number;      // 置信度
}

export class ASREngine {
  private ws: WebSocket | null = null;
  private config: ASRConfig;
  private isConnected = false;
  private onResultCallback?: (result: ASRResult) => void;

  constructor(config: ASRConfig) {
    this.config = {
      serverUrl: config.serverUrl,
      apiKey: config.apiKey,
      language: config.language || 'zh-CN',
      chunkDuration: config.chunkDuration || 2000,
    };
  }

  /**
   * 连接到 ASR 服务器
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('✅ ASR 已连接');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl);

        this.ws.onopen = () => {
          console.log('✅ ASR WebSocket 已连接');
          this.isConnected = true;

          // 发送配置信息
          this.ws?.send(JSON.stringify({
            type: 'config',
            language: this.config.language,
            apiKey: this.config.apiKey,
          }));

          resolve();
        };

        this.ws.onmessage = (event) => {
          const result: ASRResult = JSON.parse(event.data);
          console.log('📝 ASR 识别结果:', result.text, result.isFinal ? '(最终)' : '(临时)');

          if (this.onResultCallback) {
            this.onResultCallback(result);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ ASR WebSocket 错误:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('⚠️ ASR WebSocket 已关闭');
          this.isConnected = false;
        };
      } catch (error) {
        console.error('❌ 连接 ASR 失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 发送音频分片
   */
  sendAudioChunk(audioBlob: Blob): void {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ ASR 未连接，无法发送音频');
      return;
    }

    this.ws.send(audioBlob);
    console.log('📤 发送音频分片:', audioBlob.size, 'bytes');
  }

  /**
   * 设置识别结果回调
   */
  onResult(callback: (result: ASRResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      console.log('🔌 ASR 已断开');
    }
  }

  /**
   * 获取连接状态
   */
  getConnected(): boolean {
    return this.isConnected;
  }
}

/**
 * 使用浏览器内置 SpeechRecognition API（备用方案）
 * 适用于 Web 版本或没有 ASR 服务器的情况
 */
export class BrowserASR {
  private recognition: any;
  private isListening = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;

  constructor(language: string = 'zh-CN') {
    // @ts-ignore - SpeechRecognition 不是标准 TypeScript 类型
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('当前浏览器不支持语音识别');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.setupListeners();
  }

  private setupListeners(): void {
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      console.log('📝 浏览器识别:', finalTranscript || interimTranscript);

      if (this.onResultCallback) {
        this.onResultCallback(finalTranscript || interimTranscript, !!finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('❌ 语音识别错误:', event.error);
    };

    this.recognition.onend = () => {
      console.log('⚠️ 语音识别结束');
      this.isListening = false;
    };
  }

  /**
   * 开始监听
   */
  start(): void {
    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
      console.log('🎤 浏览器语音识别已启动');
    }
  }

  /**
   * 停止监听
   */
  stop(): void {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('⏹️ 浏览器语音识别已停止');
    }
  }

  /**
   * 设置结果回调
   */
  onResult(callback: (text: string, isFinal: boolean) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * 获取监听状态
   */
  getListening(): boolean {
    return this.isListening;
  }
}
