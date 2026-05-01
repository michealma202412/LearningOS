const DB_NAME = "learning_os";
const STORE = "items"; // Change store name to be more generic to support both audio and articles
const USER_STORE = "users"; // Store for user information

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 3); // Update version to 3 to add user store

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Check if object store already exists to prevent errors
      if (!db.objectStoreNames.contains(STORE)) {
        // Create a new store that will hold both audio and articles
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      
      // Create users store if it doesn't exist
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: "userId" });
      }
      
      // If upgrading from version 1 or 2, we don't need to do anything special
      // since the store structure remains the same, just the name changed
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
}

// User Management Functions
export async function getCurrentUser() {
  const userId = localStorage.getItem('currentUserId');
  if (!userId) {
    return null;
  }
  
  const db = await openDB();
  const tx = db.transaction(USER_STORE, "readonly");
  const store = tx.objectStore(USER_STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.get(userId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = reject;
  });
}

export async function setCurrentUser(userId, username) {
  localStorage.setItem('currentUserId', userId);
  
  const db = await openDB();
  const tx = db.transaction(USER_STORE, "readwrite");
  const store = tx.objectStore(USER_STORE);
  
  const user = {
    userId,
    username,
    createdAt: Date.now()
  };
  
  store.put(user);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(user);
    tx.onerror = reject;
  });
}

export async function getAllUsers() {
  const db = await openDB();
  const tx = db.transaction(USER_STORE, "readonly");
  const store = tx.objectStore(USER_STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = reject;
  });
}

export function logout() {
  localStorage.removeItem('currentUserId');
}

export async function saveAudio(audio) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  
  // Ensure audio has the correct type and userId
  const audioWithTypeInfo = {
    ...audio,
    type: audio.type || "audio",
    userId: currentUser.userId
  };
  
  store.put(audioWithTypeInfo);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(audioWithTypeInfo);
    tx.onerror = reject;
  });
}

// New function to save articles
export async function saveArticle(article) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  
  // Ensure the article has the correct type and userId
  const articleWithTypeInfo = {
    ...article,
    type: "article",
    userId: currentUser.userId
  };
  
  store.put(articleWithTypeInfo);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(articleWithTypeInfo);
    tx.onerror = reject;
  });
}

export async function getAllAudios() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return [];
  }
  
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      // Filter to only return audio items for current user
      const allItems = req.result || [];
      const audioItems = allItems.filter(item => item.type === "audio" && item.userId === currentUser.userId);
      resolve(audioItems);
    };
    req.onerror = reject;
  });
}

// New function to get all articles for current user
export async function getAllArticles() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return [];
  }
  
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      // Filter to only return article items for current user
      const allItems = req.result || [];
      const articleItems = allItems.filter(item => item.type === "article" && item.userId === currentUser.userId);
      resolve(articleItems);
    };
    req.onerror = reject;
  });
}

// New function to get all items (both audio and articles) for current user
export async function getAllItems() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return [];
  }
  
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      // Filter items by current user
      const allItems = req.result || [];
      const userItems = allItems.filter(item => item.userId === currentUser.userId);
      resolve(userItems);
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