/**
 * 流式录音 Hook（移动端）
 * 
 * 实现定时切片录音 + 实时语音识别 + 文本去重拼接
 * 提供类似微信的长按录音体验
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { NativeRecorder } from '../core/engine/recorder';
import { ASREngine, BrowserASR, ASRResult } from '../core/engine/asr';
import { mergeText } from '../utils/textMerge';

interface UseStreamingRecorderOptions {
  onTextUpdate?: (text: string) => void;  // 文本更新回调
  chunkInterval?: number;                  // 切片间隔（毫秒），默认 2000ms
  enableRealtimeASR?: boolean;             // 是否启用实时 ASR，默认 false
  asrServerUrl?: string;                   // ASR 服务器地址
}

export function useStreamingRecorder(options: UseStreamingRecorderOptions = {}) {
  const { 
    onTextUpdate, 
    chunkInterval = 2000,
    enableRealtimeASR = false,
    asrServerUrl,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioPath, setAudioPath] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // 新增：处理状态

  const recorderRef = useRef(new NativeRecorder());
  const asrRef = useRef<ASREngine | BrowserASR | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef('');
  const chunksRef = useRef<Blob[]>([]); // 存储音频分片

  // 初始化 ASR 引擎
  useEffect(() => {
    if (enableRealtimeASR) {
      if (asrServerUrl) {
        // 使用 WebSocket ASR
        asrRef.current = new ASREngine({
          serverUrl: asrServerUrl,
          language: 'zh-CN',
          chunkDuration: chunkInterval,
        });
        
        asrRef.current.onResult((result: ASRResult) => {
          if (result.isFinal) {
            textRef.current = mergeText(textRef.current, result.text);
            setTranscribedText(textRef.current);
            
            if (onTextUpdate) {
              onTextUpdate(textRef.current);
            }
          }
        });
      } else {
        // 使用浏览器内置 SpeechRecognition
        try {
          asrRef.current = new BrowserASR('zh-CN');
          
          asrRef.current.onResult((text: string, isFinal: boolean) => {
            if (isFinal) {
              textRef.current = mergeText(textRef.current, text);
              setTranscribedText(textRef.current);
              
              if (onTextUpdate) {
                onTextUpdate(textRef.current);
              }
            } else {
              // 临时结果，直接显示
              setTranscribedText(textRef.current + text);
            }
          });
        } catch (error) {
          console.warn('⚠️ 浏览器不支持语音识别:', error);
        }
      }
    }
    
    return () => {
      if (asrRef.current) {
        if ('disconnect' in asrRef.current) {
          (asrRef.current as ASREngine).disconnect();
        } else {
          (asrRef.current as BrowserASR).stop();
        }
      }
    };
  }, [enableRealtimeASR, asrServerUrl, chunkInterval, onTextUpdate]);

  /**
   * 开始录音
   */
  const start = useCallback(async () => {
    try {
      await recorderRef.current.start();
      setIsRecording(true);
      setIsProcessing(true);
      setAudioPath('');
      textRef.current = '';
      setTranscribedText('');
      chunksRef.current = [];

      console.log('🎤 开始流式录音，切片间隔:', chunkInterval, 'ms');

      // 启动 ASR（如果启用）
      if (asrRef.current && enableRealtimeASR) {
        if ('connect' in asrRef.current) {
          await (asrRef.current as ASREngine).connect();
        } else {
          (asrRef.current as BrowserASR).start();
        }
      }

      // 定时切片（用于后续 ASR 处理）
      intervalRef.current = setInterval(async () => {
        if (!recorderRef.current.getRecordingStatus()) return;

        console.log('📤 录音分片...');
        // 注意：这里只是标记，实际分片在 stop 时处理
      }, chunkInterval);

    } catch (error) {
      console.error('❌ 开始录音失败:', error);
      setIsRecording(false);
      setIsProcessing(false);
      alert('录音启动失败：' + (error as Error).message);
    }
  }, [chunkInterval, enableRealtimeASR]);

  /**
   * 停止录音
   */
  const stop = useCallback(async () => {
    // 清除定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 停止 ASR
    if (asrRef.current && enableRealtimeASR) {
      if ('disconnect' in asrRef.current) {
        (asrRef.current as ASREngine).disconnect();
      } else {
        (asrRef.current as BrowserASR).stop();
      }
    }

    if (recorderRef.current.getRecordingStatus()) {
      try {
        const result = await recorderRef.current.stop();
        setIsRecording(false);
        setIsProcessing(false);
        setAudioPath(result.filePath);

        console.log('✅ 录音已停止，时长:', result.duration, 's, 路径:', result.filePath);

        // 如果没有启用实时 ASR，在这里进行离线识别（可选）
        if (!enableRealtimeASR && !textRef.current) {
          console.log('⚠️ 未启用实时 ASR，需要手动输入或后续处理');
        }

        return {
          text: textRef.current,
          audioPath: result.filePath,
          duration: result.duration,
        };
      } catch (error) {
        console.error('❌ 停止录音失败:', error);
        setIsProcessing(false);
        throw error;
      }
    }

    setIsProcessing(false);
    return {
      text: textRef.current,
      audioPath: '',
      duration: 0,
    };
  }, [enableRealtimeASR]);

  /**
   * 取消录音
   */
  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 停止 ASR
    if (asrRef.current && enableRealtimeASR) {
      if ('disconnect' in asrRef.current) {
        (asrRef.current as ASREngine).disconnect();
      } else {
        (asrRef.current as BrowserASR).stop();
      }
    }

    recorderRef.current.cancel();
    setIsRecording(false);
    setIsProcessing(false);
    setAudioPath('');
    textRef.current = '';
    setTranscribedText('');

    console.log('🗑️ 录音已取消');
  }, [enableRealtimeASR]);

  /**
   * 手动更新文本（用于直接输入或编辑）
   */
  const updateText = useCallback((newText: string) => {
    textRef.current = newText;
    setTranscribedText(newText);
    
    if (onTextUpdate) {
      onTextUpdate(newText);
    }
  }, [onTextUpdate]);

  return {
    isRecording,
    transcribedText,
    audioPath,
    isProcessing, // 新增：返回处理状态
    start,
    stop,
    cancel,
    updateText,
  };
}
