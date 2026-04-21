// exporter.js
// Module for exporting articles and audio to markdown format

import { getAllAudios } from "./db.js"
import { getTodayFolder } from "./scheduler.js"

function formatList(text) {
  if (!text) return "- （待补充）"
  return text
    .split("\n")
    .filter(l => l.trim())
    .map(l => `- ${l}`)
    .join("\n")
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Get audios from the same folder
async function getFolderAudios(folder) {
  const audios = await getAllAudios()
  return audios.filter(
    a => a.folder === folder && a.type === "audio"
  )
}

// Download a blob as a file
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

// Main export function
export async function exportAll(data) {
  const folder = data.folder || getTodayFolder()
  const slug = slugify(data.title) || "article"

  // 1. Get audios from the same folder
  const audios = await getFolderAudios(folder)

  // 2. Rename audios appropriately
  const audioFilenames = audios.map((a, i) => {
    return `${slug}-audio-${i + 1}.webm`
  })

  // 3. Download audio files
  audios.forEach((a, i) => {
    downloadBlob(a.blob, audioFilenames[i])
  })

  // 4. Generate markdown audio references
  const audioSection = audioFilenames.length
    ? audioFilenames
        .map(name => `<audio controls src="/audio/${name}"></audio>`)
        .join("\n\n")
    : "（暂无音频）"

  // 5. Generate markdown content
  const md = `# ${data.title}

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
`

  // 6. Generate markdown filename
  const mdName = `${slug}.md`

  // 7. Download markdown file
  downloadBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), mdName)

  // 8. Generate suggested path
  const suggestedPath = `/docs/learn/${folder}/${mdName}`
  
  // Show success message with suggested path
  alert(
`导出完成！

请将文件放入：
${suggestedPath}

音频放入：
/docs/public/audio/

然后执行：
git add .
git commit -m "add: ${data.title}"
git push`
  )
}