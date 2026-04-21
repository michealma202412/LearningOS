const DB_NAME = "learning_os"
const STORE = "audios"

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)

    req.onupgradeneeded = () => {
      const db = req.result
      // Check if object store already exists to prevent errors
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = reject
  })
}

export async function saveAudio(audio) {
  const db = await openDB()
  const tx = db.transaction(STORE, "readwrite")
  tx.objectStore(STORE).put(audio)
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

// New function to save articles
export async function saveArticle(article) {
  // Ensure the article has the correct type
  const articleWithTypeInfo = {
    ...article,
    type: "article"
  }
  return saveAudio(articleWithTypeInfo)
}

export async function getAllAudios() {
  const db = await openDB()
  const tx = db.transaction(STORE, "readonly")
  const store = tx.objectStore(STORE)
  
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = reject
  })
}

// New function to get all articles
export async function getAllArticles() {
  const allItems = await getAllAudios()
  return allItems.filter(item => item.type === "article")
}

// New function to get articles by folder
export async function getArticlesByFolder(folder) {
  const allItems = await getAllAudios()
  return allItems.filter(item => item.type === "article" && item.folder === folder)
}

export async function getAudiosByFolder(folder) {
  const allAudios = await getAllAudios()
  return allAudios.filter(a => a.folder === folder && a.type !== "article")
}

export async function updateAudio(audio) {
  return saveAudio(audio)
}

export async function deleteAudio(id) {
  const db = await openDB()
  const tx = db.transaction(STORE, "readwrite")
  tx.objectStore(STORE).delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

export async function getAllFolders() {
  const allAudios = await getAllAudios()
  const folders = new Set(allAudios.map(a => a.folder))
  return Array.from(folders).sort().reverse()
}