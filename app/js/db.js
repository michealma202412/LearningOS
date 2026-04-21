const DB_NAME = "learning_os";
const STORE = "items"; // Change store name to be more generic to support both audio and articles

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2); // Update version to 2

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Check if object store already exists to prevent errors
      if (!db.objectStoreNames.contains(STORE)) {
        // Create a new store that will hold both audio and articles
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      
      // If upgrading from version 1, we don't need to do anything special
      // since the store structure remains the same, just the name changed
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
}

export async function saveAudio(audio) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  
  // Ensure audio has the correct type
  const audioWithTypeInfo = {
    ...audio,
    type: audio.type || "audio"
  };
  
  store.put(audioWithTypeInfo);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(audioWithTypeInfo);
    tx.onerror = reject;
  });
}

// New function to save articles
export async function saveArticle(article) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  
  // Ensure the article has the correct type
  const articleWithTypeInfo = {
    ...article,
    type: "article"
  };
  
  store.put(articleWithTypeInfo);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(articleWithTypeInfo);
    tx.onerror = reject;
  });
}

export async function getAllAudios() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      // Filter to only return audio items
      const allItems = req.result || [];
      const audioItems = allItems.filter(item => item.type === "audio");
      resolve(audioItems);
    };
    req.onerror = reject;
  });
}

// New function to get all articles
export async function getAllArticles() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      // Filter to only return article items
      const allItems = req.result || [];
      const articleItems = allItems.filter(item => item.type === "article");
      resolve(articleItems);
    };
    req.onerror = reject;
  });
}

// New function to get all items (both audio and articles)
export async function getAllItems() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      resolve(req.result || []);
    };
    req.onerror = reject;
  });
}

// New function to get items by folder (both audio and articles)
export async function getItemsByFolder(folder) {
  const allItems = await getAllItems();
  return allItems.filter(item => item.folder === folder);
}

// New function to get articles by folder
export async function getArticlesByFolder(folder) {
  const allItems = await getAllItems();
  return allItems.filter(item => item.type === "article" && item.folder === folder);
}

export async function getAudiosByFolder(folder) {
  const allItems = await getAllItems();
  return allItems.filter(item => item.type === "audio" && item.folder === folder);
}

export async function updateItem(item) {
  if (item.type === "article") {
    return saveArticle(item);
  } else {
    return saveAudio(item);
  }
}

export async function deleteItem(id) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

export async function getAllFolders() {
  const allItems = await getAllItems();
  const folders = new Set(allItems.map(item => item.folder));
  return Array.from(folders).sort().reverse();
}

// Convenience function to initialize DB connection
export async function initDB() {
  const db = await openDB();
  return {
    get: async (storeName, id) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
      });
    },
    getAll: getAllItems,
    save: (item) => {
      if (item.type === "article") {
        return saveArticle(item);
      } else {
        return saveAudio(item);
      }
    }
  };
}