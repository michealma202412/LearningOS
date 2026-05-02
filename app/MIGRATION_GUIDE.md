# Migration Guide: Old App → New Refactored App

## 📋 Overview

This guide helps you migrate from the old multi-page LearningOS app to the new unified single-page application.

---

## 🔄 What's Changing?

### Old Structure (Multi-Page)
```
index.html      → Dashboard/Review page
recorder.html   → Recording page  
folder.html     → Folder management
editor.html     → Article editor
article.html    → Article viewer
```

### New Structure (Single-Page)
```
index.html      → Unified app with all features
  ├─ Record section (default)
  ├─ File list (collapsible)
  └─ Daily review (collapsible)
```

---

## ✅ Data Compatibility

**Good news**: Your existing data is **fully compatible**! 

The new app uses the same:
- IndexedDB database name: `learning_os`
- Store name: `items`
- Data structure for audio and articles

No data migration needed - just start using the new app!

---

## 🚀 Migration Steps

### Step 1: Backup (Recommended)

Although not required, it's wise to backup your data:

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → `learning_os` → `items`
4. Right-click and export data (if your browser supports it)

Or use this console command to export:
```javascript
// Run in browser console on old app
const data = await getAllItems()
console.log(JSON.stringify(data, null, 2))
// Copy the output and save to a file
```

### Step 2: Update Bookmarks

If you bookmarked specific pages:

| Old URL | New URL | Action |
|---------|---------|--------|
| `/app/index.html` | `/app/index.html` | ✅ No change needed |
| `/app/recorder.html` | `/app/index.html` | 🔄 Update bookmark |
| `/app/folder.html` | `/app/index.html` | 🔄 Update bookmark |
| `/app/editor.html` | `/app/index.html` | 🔄 Update bookmark |
| `/app/article.html` | `/app/index.html` | 🔄 Update bookmark |

All functionality is now in the unified `index.html`.

### Step 3: Test the New App

1. Navigate to: `http://localhost:5173/app/index.html`
2. Verify your previous recordings appear in:
   - **File List** section (expand to see)
   - **Daily Review** section (if any are due today)

3. Try creating a new recording:
   - Select mode (audio/text/both)
   - Record something
   - Save it
   - Check if it appears in the file list

### Step 4: Archive Old Files (Optional)

Once you're comfortable with the new app, you can rename old files:

```bash
# In the /app directory
mv index.html index_old.html
mv recorder.html recorder_old.html
mv folder.html folder_old.html
mv editor.html editor_old.html
mv article.html article_old.html
```

This prevents confusion but keeps them as backup.

---

## 🎯 Feature Mapping

### Where did my features go?

| Old Feature | Old Location | New Location |
|-------------|--------------|--------------|
| Start recording | `recorder.html` | Record section → "▶ 开始录音" |
| View folders | `folder.html` | File list section (expand) |
| Write article | `editor.html` | Record section → Select "仅文字" mode |
| View article | `article.html` | File list → Click item (future: inline expand) |
| Today's reviews | `index.html` | Daily review section (expand) |
| Mark complete | `index.html` | Review item → "✓ 完成" button |

---

## 💡 Tips for Smooth Transition

### 1. Give it time
The new UI might feel different at first. Spend 5-10 minutes exploring:
- Expand/collapse sections
- Try different recording modes
- Test the search filter

### 2. Keyboard shortcuts (coming soon)
Plan to add:
- `Ctrl/Cmd + R` - Start/stop recording
- `Ctrl/Cmd + S` - Save current note
- `Ctrl/Cmd + F` - Focus search box

### 3. Mobile usage
The new app is optimized for mobile:
- Bottom navigation bar is thumb-friendly
- Large touch targets
- Responsive layout

### 4. QR codes
Each view can generate a QR code (click 📱 button). Use these to:
- Print daily recording links
- Create learning cards
- Quick access from e-ink devices

---

## ❓ FAQ

### Q: Will I lose my old recordings?
**A**: No! All data remains in IndexedDB. The new app reads the same database.

### Q: Can I still use the old pages?
**A**: Yes, during transition. But we recommend switching to the new app for better experience.

### Q: What if I don't like the new design?
**A**: You can revert by renaming files back. But please give feedback so we can improve!

### Q: Are there missing features?
**A**: Some advanced features from old pages are simplified:
- Article editing is basic (textarea instead of rich editor)
- No separate article view page yet (planned)
- Export function needs UI integration

These will be added in future updates.

### Q: How do I report bugs?
**A**: 
1. Open browser DevTools (F12)
2. Check Console for errors
3. Take a screenshot
4. Report with steps to reproduce

---

## 🔧 Troubleshooting

### Issue: Don't see old recordings

**Solution**:
1. Check browser console (F12) for errors
2. Verify you're on the correct domain/port
3. Clear cache and reload (Ctrl+Shift+R)
4. Check IndexedDB has data

### Issue: Microphone not working

**Solution**:
1. Check browser permissions (click lock icon in address bar)
2. Ensure you're using HTTPS or localhost
3. Try a different browser
4. Restart browser completely

### Issue: Speech recognition fails

**Solution**:
1. Use Chrome browser (best support)
2. Check internet connection (required for speech API)
3. Switch to text-only mode as workaround
4. Enable microphone permissions

---

## 📞 Support

If you encounter issues:

1. **Check documentation**: [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)
2. **Review design plan**: [OPTIMIZATION_SUMMARY.md](../doc/OPTIMIZATION_SUMMARY.md)
3. **Browser console**: Look for error messages
4. **GitHub Issues**: Report bugs with details

---

## ✨ Benefits of New Version

Why switch?

✅ **Faster workflow** - No page switching  
✅ **Cleaner UI** - Less visual clutter  
✅ **Better mobile** - Optimized for phones  
✅ **Unified experience** - Everything in one place  
✅ **Future-ready** - Easier to add AI features  

---

**Migration Date**: 2026-05-01  
**Version**: 2.0  
**Status**: Stable ✅
