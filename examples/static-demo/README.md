# Flowmark - Interactive Demo

A fully functional, interactive demo showcasing all features of Flowmark.

## 🎯 What This Demo Shows

### Core Features

1. **✨ Text Highlighting**
   - Select any text on the page
   - Click "Highlight" button to save
   - Highlights persist across page refreshes

2. **🎨 Smart Normalization**
   - Handles smart quotes ("" → "")
   - Normalizes whitespace and punctuation
   - Case-insensitive matching

3. **🔗 Cross-Element Selection**
   - Highlight text spanning multiple paragraphs
   - Works across different HTML elements
   - Seamless user experience

4. **💾 Persistent Storage**
   - Uses LocalStorage adapter
   - Survives page refresh
   - View all saved highlights in sidebar

5. **📊 Statistics & Management**
   - Live stats (total highlights, words, characters)
   - Delete individual highlights
   - Clear all highlights
   - Scroll to highlight on click

## 🚀 How to Run

### Option 1: Direct File Open

```bash
# Simply open the HTML file in your browser
open index.html

# Or on Windows
start index.html

# Or on Linux
xdg-open index.html
```

### Option 2: Local Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js http-server
npx http-server

# Then visit: http://localhost:8000
```

## 📋 How to Use

1. **Create a Highlight**
   - Select any text in the reading content
   - Click the "Highlight" button that appears
   - The text is now highlighted and saved!

2. **View Highlights**
   - See all your highlights in the right sidebar
   - Click on a highlight to scroll to it
   - Click ℹ️ to see detailed information

3. **Manage Highlights**
   - Click 🗑️ on any highlight to delete it
   - Click "Clear All Highlights" to remove everything
   - Refresh the page - your highlights persist!

4. **Test Normalization**
   - Try highlighting text with "smart quotes"
   - Try text with   extra   spaces
   - Try text with weird,punctuation!spacing
   - All normalized automatically!

## 🧪 Features Demonstrated

### Text Processing

- **normalizeText()** - Smart quote conversion, whitespace normalization, punctuation spacing
- **getTextContext()** - Extract prefix/suffix for validation
- **Cross-element handling** - Highlights spanning multiple DOM elements

### Storage

- **LocalStorageAdapter** - Browser-based persistence
- **save()** - Store new highlights
- **load()** - Retrieve saved highlights
- **remove()** - Delete specific highlights
- **clear()** - Remove all highlights

### UI/UX

- Selection detection
- Floating tooltip
- Sidebar management
- Real-time statistics
- Smooth scrolling
- Visual feedback

## 📁 Files

```
static-demo/
├── index.html    # Main HTML with UI and styles
├── demo.js       # JavaScript implementation
└── README.md     # This file
```

## 🎨 Customization

### Change Highlight Color

Edit in `demo.js`:

```javascript
const highlight = {
  // ...
  color: '#your-color-here'
}
```

Edit in `index.html` CSS:

```css
mark.highlight {
  background: #your-color-here;
}
```

### Change Storage Key

Edit in `demo.js`:

```javascript
const storage = new LocalStorageAdapter('your-key-here')
```

### Add More Content

Edit the `<div class="reading-content">` section in `index.html`.

## 🐛 Known Limitations

1. **Cross-element rendering** - Complex cross-element selections may not render perfectly in the demo (production version handles this better)
2. **Simple matching** - Demo uses basic text matching; production version uses sophisticated prefix/suffix validation
3. **No persistence of DOM positions** - Demo re-renders highlights on reload; production version stores precise positions

## 💡 Tips

- Try highlighting text with smart quotes from Word/Docs
- Test cross-element selection across paragraphs
- Refresh the page to see persistence in action
- Open browser console to see debug logs
- Try the highlight details (ℹ️) to see normalization

## 🔗 Next Steps

- See the full library: [../../packages/core/](../../packages/core/)
- Check out Chrome extension demo: [../chrome-extension/](../chrome-extension/) (coming soon)
- View API documentation: [../../docs/](../../docs/) (coming soon)

## 📝 License

MIT © Spranc Labs

---

**Building in public** 🚧 Built by [Spranc Labs](https://github.com/spranc-labs)
