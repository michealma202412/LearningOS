/**
 * LearningOS AI 内容生成引擎
 * 
 * 实现智能内容处理：
 * - 自动生成标题
 * - 自动提取关键词
 * - 自动分类
 * - 生成摘要
 * - 智能格式化
 */

export interface ProcessedContent {
  title: string;              // 生成的标题
  keywords: string[];         // 关键词列表
  category: string;           // 分类
  summary: string;            // 摘要
  formattedContent: string;   // 格式化后的内容
  importance: number;         // 重要性评分 1-5
}

export interface AIConfig {
  apiKey?: string;            // OpenAI API Key
  apiUrl?: string;            // API 地址（可选，默认使用 OpenAI）
  model?: string;             // 模型名称，默认 gpt-4-turbo
}

export class AIEngine {
  private config: AIConfig;

  constructor(config: AIConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      apiUrl: config.apiUrl || 'https://api.openai.com/v1/chat/completions',
      model: config.model || 'gpt-4-turbo',
    };
  }

  /**
   * 处理原始文本，生成结构化内容
   */
  async processContent(rawText: string): Promise<ProcessedContent> {
    if (!this.config.apiKey) {
      console.warn('⚠️ 未配置 API Key，使用本地规则生成');
      return this.processLocally(rawText);
    }

    try {
      const prompt = `
你是一个专业的学习笔记整理助手。请分析以下内容，并提取结构化信息：

原始内容：
${rawText}

请以 JSON 格式返回以下信息（不要有其他文字）：
{
  "title": "简洁的标题（不超过20字）",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "category": "从以下选择：数学、物理、化学、生物、计算机、语言、历史、地理、其他",
  "summary": "100字以内的摘要",
  "formattedContent": "格式化后的内容（使用 Markdown，添加适当的标题、列表等）",
  "importance": 3
}

要求：
1. 标题要简洁明了，能概括核心内容
2. 关键词3-5个，用逗号分隔
3. 分类要准确
4. 摘要要精炼
5. 格式化内容要保持原意，但更易读
6. 重要性评分1-5星（5为最重要）
      `;

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: '你是专业的学习笔记整理助手' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const aiResult = JSON.parse(data.choices[0].message.content);

      console.log('✅ AI 内容处理完成');

      return {
        title: aiResult.title || this.generateTitle(rawText),
        keywords: aiResult.keywords || [],
        category: aiResult.category || '其他',
        summary: aiResult.summary || '',
        formattedContent: aiResult.formattedContent || rawText,
        importance: aiResult.importance || 3,
      };
    } catch (error) {
      console.error('❌ AI 处理失败，使用本地规则:', error);
      return this.processLocally(rawText);
    }
  }

  /**
   * 本地规则处理（备用方案）
   */
  private processLocally(rawText: string): ProcessedContent {
    // 简单规则：取第一句作为标题
    const lines = rawText.split('\n').filter(line => line.trim());
    const title = lines[0]?.substring(0, 30) || '未命名笔记';
    
    // 简单关键词提取（高频词）
    const words = rawText.split(/[\s,，。！？、]+/).filter(w => w.length > 1);
    const wordFreq: {[key: string]: number} = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return {
      title,
      keywords,
      category: '其他',
      summary: rawText.substring(0, 100) + (rawText.length > 100 ? '...' : ''),
      formattedContent: rawText,
      importance: 3,
    };
  }

  /**
   * 生成标题（备用）
   */
  private generateTitle(text: string): string {
    const firstLine = text.split('\n')[0];
    return firstLine?.substring(0, 30) || '未命名笔记';
  }

  /**
   * 批量处理多个笔记
   */
  async processBatch(texts: string[]): Promise<ProcessedContent[]> {
    const results: ProcessedContent[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.processContent(text);
        results.push(result);
      } catch (error) {
        console.error('❌ 批量处理失败:', error);
        results.push(this.processLocally(text));
      }
    }
    
    return results;
  }
}
