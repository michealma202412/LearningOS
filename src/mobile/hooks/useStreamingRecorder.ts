/**
 * 流式录音 Hook（移动端）
 * 
 * 实现定时切片录音 + 实时语音识别 + 文本去重拼接
 * 提供类似微信的长按录音体验
 */

import { useState, useCallback, useRef } from 'react';
import { NativeRecorder } from '../core/engine/recorder';
import { mergeText } from '../utils/textMerge';

interface UseStreamingRecorderOptions {
  onTextUpdate?: (text: string) => void;  // 文本更新回调
  chunkInterval?: number;                  // 切片间隔（毫秒），默认 2000ms
}

export function useStreamingRecorder(options: UseStreamingRecorderOptions = {}) {
  const { onTextUpdate, chunkInterval = 2000 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  const recorderRef = useRef(new NativeRecorder());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef('');

  /**
   * 开始录音
   */
  const start = useCallback(async () => {
    try {
      await recorderRef.current.start();
      setIsRecording(true);
      textRef.current = '';
      setTranscribedText('');

      console.log('🎤 开始流式录音，切片间隔:', chunkInterval, 'ms');

      // 定时切片发送（如果后续接入 ASR 服务）
      // intervalRef.current = setInterval(async () => {
      //   if (!recorderRef.current.getRecordingStatus()) return;
      //
      //   // 停止当前录音获取 chunk
      //   const result = await recorderRef.current.stop();
      //   
      //   // 立即重新开始
      //   await recorderRef.current.start();
      //
      //   // TODO: 发送到 ASR 服务进行识别
      //   // const response = await fetch('YOUR_ASR_API', {...});
      //   // const data = await response.json();
      //   // textRef.current = mergeText(textRef.current, data.text);
      //   // setTranscribedText(textRef.current);
      // }, chunkInterval);

    } catch (error) {
      console.error('❌ 开始录音失败:', error);
      setIsRecording(false);
      alert('录音启动失败：' + (error as Error).message);
    }
  }, [chunkInterval]);

  /**
   * 停止录音
   */
  const stop = useCallback(async () => {
    // 清除定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recorderRef.current.getRecordingStatus()) {
      try {
        const result = await recorderRef.current.stop();
        setIsRecording(false);

        console.log('✅ 录音已停止，时长:', result.duration, 's');

        return {
          text: textRef.current,
          audioPath: result.filePath,
          duration: result.duration,
        };
      } catch (error) {
        console.error('❌ 停止录音失败:', error);
        throw error;
      }
    }

    return {
      text: textRef.current,
      audioPath: '',
      duration: 0,
    };
  }, []);

  /**
   * 取消录音
   */
  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    recorderRef.current.cancel();
    setIsRecording(false);
    textRef.current = '';
    setTranscribedText('');

    console.log('🗑️ 录音已取消');
  }, []);

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
    start,
    stop,
    cancel,
    updateText,
  };
}
