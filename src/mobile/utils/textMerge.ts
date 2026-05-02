/**
 * 文本去重拼接算法
 * 
 * 用于流式语音识别场景，智能合并连续的识别结果，去除重叠部分
 * 
 * 示例:
 * - chunk1: "今天 我们 讨论"
 * - chunk2: "我们 讨论 学习 系统"
 * - 结果: "今天 我们 讨论 学习 系统"
 */

/**
 * 智能合并两段文本，去除重叠部分
 * @param prev 前一段文本
 * @param next 后一段文本
 * @returns 合并后的文本
 */
export function mergeText(prev: string, next: string): string {
  // 边界情况处理
  if (!prev) return next;
  if (!next) return prev;

  const pWords = prev.split(/\s+/);
  const nWords = next.split(/\s+/);

  let maxOverlap = 0;
  // 最多检查 10 个词的重叠
  const maxCheck = Math.min(pWords.length, nWords.length, 10);

  for (let i = 1; i <= maxCheck; i++) {
    const pSuffix = pWords.slice(-i).join(' ');
    const nPrefix = nWords.slice(0, i).join(' ');

    if (pSuffix === nPrefix) {
      maxOverlap = i;
    }
  }

  // 如果有重叠，去除重叠部分后拼接
  if (maxOverlap > 0) {
    // 如果完全重叠（next 的所有词都在 prev 末尾）
    if (maxOverlap === nWords.length) {
      return prev.trim();
    }
    return prev + ' ' + nWords.slice(maxOverlap).join(' ');
  }

  // 无重叠，直接拼接
  return prev + ' ' + next;
}

/**
 * 清理文本（去除多余空格和标点）
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')  // 多个空格合并为一个
    .trim()                 // 去除首尾空格
    .replace(/[。，、；：！？]+$/g, ''); // 去除末尾标点
}
