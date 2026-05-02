/**
 * LearningOS 原生录音引擎（移动端）
 * 
 * 使用 capacitor-voice-recorder 插件实现稳定的音频录制
 * 替代 Web 版的 MediaRecorder，解决 iOS Safari 兼容性问题
 */

import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface RecordingResult {
  base64: string;      // Base64 编码的音频数据
  filePath: string;    // 文件存储路径
  duration: number;    // 录音时长（秒）
}

export class NativeRecorder {
  private isRecording = false;
  private startTime = 0;

  /**
   * 开始录音
   */
  async start(): Promise<void> {
    try {
      // 请求麦克风权限
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      
      if (!permission.value) {
        throw new Error('麦克风权限被拒绝，请在设置中允许访问麦克风');
      }

      // 开始录音
      await VoiceRecorder.startRecording();
      this.isRecording = true;
      this.startTime = Date.now();
      
      console.log('🎤 录音已开始');
    } catch (error) {
      console.error('❌ 开始录音失败:', error);
      throw error;
    }
  }

  /**
   * 停止录音并返回结果
   */
  async stop(): Promise<RecordingResult> {
    if (!this.isRecording) {
      throw new Error('当前未在录音状态');
    }

    try {
      // 停止录音
      const result = await VoiceRecorder.stopRecording();
      this.isRecording = false;

      const duration = (Date.now() - this.startTime) / 1000;
      const base64 = result.value.recordDataBase64;

      // 检查 base64 是否存在
      if (!base64) {
        throw new Error('录音数据为空');
      }

      // 保存到文件系统
      const fileName = `recording_${Date.now()}.wav`;
      const filePath = await this.saveAudio(base64, fileName);

      console.log('✅ 录音已保存:', filePath, `时长: ${duration.toFixed(2)}s`);

      return {
        base64,
        filePath,
        duration,
      };
    } catch (error) {
      console.error('❌ 停止录音失败:', error);
      throw error;
    }
  }

  /**
   * 取消录音（不保存）
   */
  async cancel(): Promise<void> {
    if (this.isRecording) {
      try {
        await VoiceRecorder.stopRecording();
        this.isRecording = false;
        console.log('🗑️ 录音已取消');
      } catch (error) {
        console.error('❌ 取消录音失败:', error);
      }
    }
  }

  /**
   * 获取录音状态
   */
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * 保存音频到文件系统
   */
  private async saveAudio(base64: string, fileName: string): Promise<string> {
    const path = `notes/${fileName}`;

    try {
      await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.Documents,
      });

      console.log('💾 音频文件已保存:', path);
      return path;
    } catch (error) {
      console.error('❌ 保存音频文件失败:', error);
      throw error;
    }
  }
}
