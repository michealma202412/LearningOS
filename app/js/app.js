import { getAllAudios, updateAudio } from "./db.js"
import { isToday } from "./scheduler.js"

export async function renderTodayList() {
  try {
    const allItems = await getAllAudios()

    const grouped = {}

    allItems.forEach(item => {
      if (!grouped[item.folder]) grouped[item.folder] = []
      grouped[item.folder].push(item)
    })

    const container = document.getElementById("list")
    container.innerHTML = ""

    Object.keys(grouped).sort().reverse().forEach(folder => {
      const section = document.createElement("div")
      section.style.marginBottom = "20px"

      section.innerHTML = `<h3>📁 ${folder}</h3>`

      const itemsInFolder = grouped[folder]
      
      // Filter for today's items (either audio reviews or articles)
      const todayItems = itemsInFolder.filter(item => {
        // For audio items, check if they have a pending review today
        if (item.type === "audio") {
          // Make sure the audio has reviews before accessing them
          if (!item.reviews || !Array.isArray(item.reviews)) {
            console.warn(`Audio item ${item.id} has no reviews array`, item);
            return false;
          }
          return item.reviews.some(r => !r.done && isToday(r.date))
        }
        // For articles, they are always considered "active" in their folder
        return item.type === "article"
      })

      if (todayItems.length === 0) {
        const emptyMsg = document.createElement("p")
        emptyMsg.textContent = "该文件夹内无今日待复习项目"
        emptyMsg.style.color = "#999"
        emptyMsg.style.fontStyle = "italic"
        section.appendChild(emptyMsg)
        container.appendChild(section)
        return
      }

      todayItems.forEach(item => {
        const div = document.createElement("div")
        div.style.marginBottom = "15px"
        div.style.padding = "10px"
        div.style.border = "1px solid #ddd"
        div.style.borderRadius = "5px"
        div.style.backgroundColor = item.type === "article" ? "#f9f9f9" : "#fff"

        if (item.type === "audio") {
          // Audio item
          if (!item.blob) {
            console.warn(`Audio item ${item.id} has no blob`, item);
            div.innerHTML = `<p>音频文件损坏: ${item.id}</p>`;
            section.appendChild(div);
            return;
          }
          
          const url = URL.createObjectURL(item.blob)

          div.innerHTML = `
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <strong>🎤 音频：</strong> <span>ID: ${item.id}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <audio controls src="${url}" style="width: 100%; max-width: 300px;"></audio>
            </div>
          `

          const button = document.createElement("button")
          button.textContent = "✓ 标记完成"
          button.style.padding = "8px 16px"
          button.style.backgroundColor = "#4CAF50"
          button.style.color = "white"
          button.style.border = "none"
          button.style.borderRadius = "4px"
          button.style.cursor = "pointer"
          button.style.marginRight = "10px"

          button.onclick = async () => {
            // Make sure the item has reviews before processing
            if (item.reviews && Array.isArray(item.reviews)) {
              item.reviews.forEach(r => {
                if (!r.done && isToday(r.date)) r.done = true
              })

              await updateAudio(item)
              await renderTodayList()
            } else {
              console.error(`Attempting to update audio item without reviews:`, item);
            }
          }

          div.appendChild(button)
        } else if (item.type === "article") {
          // Article item
          const contentPreview = item.content && item.content.length > 100 
            ? item.content.substring(0, 100) + "..." 
            : (item.content || "无内容")

          div.innerHTML = `
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <strong>📝 文章：</strong> <span>${item.title || '无标题'}</span>
            </div>
            <div style="margin-bottom: 10px; color: #666; font-size: 0.9em; line-height: 1.5;">
              ${contentPreview}
            </div>
            <div style="margin-bottom: 10px; font-size: 0.8em; color: #999;">
              创建于: ${new Date(item.createdAt).toLocaleString()}
            </div>
          `

          // Add view article button that links to the new article page
          const viewButton = document.createElement("a")
          viewButton.textContent = "👁️ 查看全文"
          viewButton.href = `article.html?id=${item.id}`
          viewButton.style.padding = "8px 16px"
          viewButton.style.backgroundColor = "#2196F3"
          viewButton.style.color = "white"
          viewButton.style.textDecoration = "none"
          viewButton.style.border = "none"
          viewButton.style.borderRadius = "4px"
          viewButton.style.cursor = "pointer"
          viewButton.style.marginRight = "10px"
          viewButton.style.display = "inline-block"
          viewButton.style.fontSize = "14px"

          div.appendChild(viewButton)
        }

        section.appendChild(div)
      })

      container.appendChild(section)
    })
  } catch (error) {
    console.error("Error in renderTodayList:", error);
    const container = document.getElementById("list");
    if (container) {
      container.innerHTML = `<div class="error-message">❌ 加载失败: ${error.message || '未知错误'}，请刷新页面重试</div>`;
    }
  }
}