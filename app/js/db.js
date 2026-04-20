const DB_NAME = "learning_os"
const STORE = "audios"

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)

    req.onupgradeneeded = () => {
      const db = req.result
      db.createObjectStore(STORE, { keyPath: "id" })
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

export async function getAudiosByFolder(folder) {
  const allAudios = await getAllAudios()
  return allAudios.filter(a => a.folder === folder)
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

