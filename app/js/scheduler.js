const intervals = [0, 1, 3, 7]

export function createReviews(ts) {
  return intervals.map(d => ({
    date: ts + d * 86400000,
    done: false
  }))
}

export function isToday(ts) {
  const a = new Date(ts).toDateString()
  const b = new Date().toDateString()
  return a === b
}

export function getTodayFolder() {
  return new Date().toISOString().slice(0, 10)
}

export function getFolderDateString(folder) {
  const date = new Date(folder + "T00:00:00")
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('zh-CN', options)
}

export function calculateFolderStats(items, folder) {
  const folderItems = items.filter(item => item.folder === folder)
  
  const totalRecordings = folderItems.length
  const totalAudios = folderItems.filter(item => item.type === "audio").length
  const totalArticles = folderItems.filter(item => item.type === "article").length
  
  let completedReviews = 0
  let totalReviews = 0
  
  // Only calculate reviews for audio items (which have reviews property)
  const audioItems = folderItems.filter(item => item.type === "audio");
  audioItems.forEach(audio => {
    if (audio.reviews && Array.isArray(audio.reviews)) {
      audio.reviews.forEach(review => {
        totalReviews++;
        if (review.done) completedReviews++;
      });
    }
  })
  
  const completionRate = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0
  
  return {
    totalRecordings,
    totalAudios,
    totalArticles,
    completedReviews,
    totalReviews,
    completionRate
  }
}