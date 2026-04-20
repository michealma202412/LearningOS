import { getAllAudios, updateAudio } from "./db.js"
import { isToday } from "./scheduler.js"

export async function renderTodayList() {
  const audios = await getAllAudios()

  const grouped = {}

  audios.forEach(a => {
    if (!grouped[a.folder]) grouped[a.folder] = []
    grouped[a.folder].push(a)
  })

  const container = document.getElementById("list")
  container.innerHTML = ""

  Object.keys(grouped).sort().reverse().forEach(folder => {
    const section = document.createElement("div")
    section.style.marginBottom = "20px"

    section.innerHTML = `<h3>📁 ${folder}</h3>`

    const audiosInFolder = grouped[folder]
    const todayAudios = audiosInFolder.filter(audio => 
      audio.reviews.some(r => !r.done && isToday(r.date))
    )

    if (todayAudios.length === 0) {
      const emptyMsg = document.createElement("p")
      emptyMsg.textContent = "该文件夹内无今日待复习项目"
      section.appendChild(emptyMsg)
      container.appendChild(section)
      return
    }

    todayAudios.forEach(audio => {
      const div = document.createElement("div")
      div.style.marginBottom = "15px"
      div.style.padding = "10px"
      div.style.border = "1px solid #ddd"
      div.style.borderRadius = "5px"

      const url = URL.createObjectURL(audio.blob)

      div.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong>录音ID：</strong> ${audio.id}
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

      button.onclick = async () => {
        audio.reviews.forEach(r => {
          if (!r.done && isToday(r.date)) r.done = true
        })

        await updateAudio(audio)
        await renderTodayList()
      }

      div.appendChild(button)
      section.appendChild(div)
    })

    container.appendChild(section)
  })
}
