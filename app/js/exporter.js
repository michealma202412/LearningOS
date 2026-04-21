// exporter.js
// Module for exporting articles and audio to markdown format

import { getAllAudios, getAllArticles } from "./db.js";
import { getTodayFolder } from "./scheduler.js";

function formatList(text) {
  if (!text) return "- （待补充）"
  return text
    .split("\n")
    .filter(l => l.trim())
    .map(l => `- ${l}`)
    .join("\n")
}

function slugify(text) {
  if (!text) return "article"
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Get audios from the same folder
async function getFolderItems(folder) {
  const allItems = await getAllAudios();
  // Also get articles if needed for cross-referencing
  const articles = await getAllArticles();
  return {
    audios: allItems.filter(
      a => a.folder === folder && a.type === "audio"
    ),
    articles: articles.filter(
      a => a.folder === folder && a.type === "article"
    )
  };
}

// Download a blob as a file
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // 确保元素在DOM中
  a.click();
  document.body.removeChild(a); // 清理

  URL.revokeObjectURL(url);
}

// Main export function
export async function exportAll(data) {
  const folder = data.folder || getTodayFolder();
  const slug = slugify(data.title) || "article";

  // 1. Get audios from the same folder
  const { audios } = await getFolderItems(folder);

  // 2. Rename audios appropriately with proper paths
  const audioFilenames = audios.map((a, i) => {
    return `${slug}-audio-${i + 1}.webm`;
  });

  // 3. Download audio files to correct path
  if (audios.length > 0) {
    console.log(`📥 正在下载 ${audios.length} 个音频文件...`);
    audios.forEach((a, i) => {
      // Download to /docs/public/audio/ path as per spec
      setTimeout(() => {
        downloadBlob(a.blob, audioFilenames[i]);
      }, i * 500); // 延迟下载，避免浏览器阻止多个下载
    });
  }

  // 4. Generate markdown audio references with correct paths
  const audioSection = audioFilenames.length
    ? audioFilenames
        .map(name => `<audio controls src="../public/audio/${name}"></audio>`)
        .join("\n\n")
    : "（暂无音频）";

  // 5. Generate markdown content
  const md = `# ${data.title || '(无标题)'}

## 🎯 学习目标
${formatList(data.goals)}

## 📖 内容
${data.content || "（待补充）"}

## 🔊 音频
${audioSection}

## 🧠 记忆点
${formatList(data.memory)}

## ❓ 小测试
${formatList(data.quiz)}

## 🔁 复习建议
- 第1天：学习
- 第3天：复习
- 第7天：第7天复习
`;

  // 6. Generate markdown filename
  const mdName = `${slug}.md`;

  // 7. Download markdown file to correct location
  const fullMdPath = `docs/learn/${folder}/${mdName}`;
  downloadBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), mdName);

  // 8. Generate suggested path
  const suggestedMdPath = `/docs/learn/${folder}/${mdName}`;
  const suggestedAudioPath = `/docs/public/audio/`;
  
  // Show success message with detailed instructions
  const message = `
✅ 导出完成！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Markdown 文件已下载：
   ${mdName}

📁 建议存放路径：
   ${suggestedMdPath}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 音频文件已下载（${audioFilenames.length} 个）：
${audioFilenames.map(f => `   • ${f}`).join('\n')}

📁 建议存放路径：
   ${suggestedAudioPath}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 发布步骤：

1️⃣  如果目录不存在，请创建：
   /docs/learn/${folder}/
   /docs/public/audio/

2️⃣  将文件移动到对应位置：
   • ${mdName} → /docs/learn/${folder}/
   • 所有 .webm 文件 → /docs/public/audio/

3️⃣  提交到 Git：
   git add .
   git commit -m "add: ${data.title || '新文章'}"
   git push

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 提示：音频文件可能因浏览器限制需要逐个确认下载。
`.trim();

  alert(message);
  console.log('✅ 导出完成，请查看下载的文件');
}

// Export a single article to markdown
export async function downloadMarkdown(article) {
  const folder = article.folder || getTodayFolder();
  const slug = slugify(article.title) || "article";

  // Get audios from the same folder
  const { audios } = await getFolderItems(folder);

  // Match audios that are close in time to the article creation (likely related)
  const relatedAudios = audios.filter(audio => 
    Math.abs(audio.createdAt - article.createdAt) < 600000 // Within 10 minutes
  );

  // Rename related audios appropriately
  const audioFilenames = relatedAudios.map((a, i) => {
    return `${slug}-audio-${i + 1}.webm`;
  });

  // Download related audio files to correct path
  if (relatedAudios.length > 0) {
    console.log(`📥 正在下载 ${relatedAudios.length} 个相关音频文件...`);
    relatedAudios.forEach((a, i) => {
      setTimeout(() => {
        downloadBlob(a.blob, audioFilenames[i]);
      }, i * 500);
    });
  }

  // Generate markdown audio references with correct paths
  const audioSection = audioFilenames.length
    ? audioFilenames
        .map(name => `<audio controls src="../public/audio/${name}"></audio>`)
        .join("\n\n")
    : "（暂无音频）";

  // Generate markdown content
  const md = `# ${article.title || '(无标题)'}

## 🎯 学习目标
${formatList(article.goals)}

## 📖 内容
${article.content || "（待补充）"}

## 🔊 音频
${audioSection}

## 🧠 记忆点
${formatList(article.memory)}

## ❓ 小测试
${formatList(article.quiz)}

## 🔁 复习建议
- 第1天：学习
- 第3天：复习
- 第7天：第7天复习
`;

  // Generate markdown filename
  const mdName = `${slug}.md`;

  // Download markdown file to correct location
  downloadBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), mdName);

  // Show success message with detailed instructions
  const message = `
✅ 文章导出完成！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Markdown 文件：${mdName}
📁 建议路径：/docs/learn/${folder}/${mdName}

🎵 相关音频：${audioFilenames.length} 个
📁 建议路径：/docs/public/audio/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请将文件移动到 docs 仓库的对应位置后提交。
`.trim();

  alert(message);
}

// Function to export all items in a folder
export async function exportFolder(folder) {
  // Get all items in the folder
  const { audios, articles } = await getFolderItems(folder);
  
  if (articles.length === 0 && audios.length === 0) {
    alert(`文件夹 ${folder} 中没有内容可导出`);
    return;
  }
  
  const slug = slugify(folder);
  
  // Create a summary markdown with all items
  let summaryContent = `# ${folder} 学习汇总

> 生成时间：${new Date().toLocaleString('zh-CN')}

---

`;
  
  // Add all articles
  if (articles.length > 0) {
    summaryContent += `## 📝 文章列表（${articles.length} 篇）\n\n`;
    
    for (const article of articles) {
      summaryContent += `### ${article.title || '无标题文章'}\n\n`;
      
      if (article.goals) {
        summaryContent += `**学习目标：**\n${formatList(article.goals)}\n\n`;
      }
      
      const preview = article.content && article.content.length > 200 
        ? article.content.substring(0, 200) + '...' 
        : (article.content || '无内容');
      summaryContent += `${preview}\n\n`;
      
      // Find related audios for this article
      const relatedAudios = audios.filter(audio => 
        Math.abs(audio.createdAt - article.createdAt) < 600000 // Within 10 minutes
      );
      
      if (relatedAudios.length > 0) {
        summaryContent += `**相关音频：**\n`;
        relatedAudios.forEach((_, idx) => {
          const audioName = `${slugify(article.title) || 'audio'}-audio-${idx + 1}.webm`;
          summaryContent += `- ${audioName}\n`;
        });
        summaryContent += "\n";
      }
      
      summaryContent += "---\n\n";
    }
  }
  
  // Add standalone audios
  const unassignedAudios = audios.filter(audio => {
    return !articles.some(article => 
      Math.abs(audio.createdAt - article.createdAt) < 600000
    );
  });
  
  if (unassignedAudios.length > 0) {
    summaryContent += `## 🎙️ 独立音频（${unassignedAudios.length} 个）\n\n`;
    unassignedAudios.forEach((audio, idx) => {
      summaryContent += `${idx + 1}. ${new Date(audio.createdAt).toLocaleTimeString('zh-CN')}\n`;
    });
    summaryContent += "\n";
  }
  
  // Statistics
  summaryContent += `---

## 📊 统计信息

- 文章数量：${articles.length}
- 音频总数：${audios.length}
- 独立音频：${unassignedAudios.length}
`;
  
  // Generate summary filename
  const summaryFileName = `${slug}-summary.md`;
  
  downloadBlob(new Blob([summaryContent], { type: "text/markdown;charset=utf-8" }), summaryFileName);
  
  alert(`✅ 文件夹 ${folder} 的汇总已导出

📄 文件名：${summaryFileName}
📁 建议路径：/docs/learn/${folder}/${summaryFileName}

请将此文件和相关文章/音频移动到 docs 仓库。`);
}