# Flowmark Examples

This directory contains example implementations of Flowmark in different scenarios.

## Examples

### 1. Basic LocalStorage Example

**File:** `basic-localstorage.html`

A simple HTML page demonstrating Flowmark with LocalStorage persistence.

**Features:**
- Highlight text across multiple elements
- Click highlights to delete them
- Highlights persist after page reload
- Clear all highlights button

**How to run:**
```bash
# Option 1: Open directly in browser
open basic-localstorage.html

# Option 2: Serve with a local server
npx serve .
# Then visit http://localhost:3000/basic-localstorage.html
```

---

### 2. Iframe PostMessage Example

**Files:** `iframe-postmessage/parent.html` and `iframe-postmessage/child.html`

Demonstrates Flowmark with PostMessage communication between iframe and parent window.

**Features:**
- Highlight text inside an iframe
- Parent window manages highlight storage
- Reload iframe to see highlights persist
- Activity log showing PostMessage communication

**How to run:**
```bash
# MUST use a local server (file:// protocol won't work for iframes)
cd iframe-postmessage
npx serve .
# Then visit http://localhost:3000/parent.html
```

**Use cases:**
- Browser extensions with injected iframes
- Sandboxed content viewers
- Multi-window applications

---

### 3. React Example

**File:** `react-example.tsx`

A React component showing Flowmark integration with TypeScript.

**Features:**
- Proper initialization/cleanup with `useEffect`
- Custom backend storage adapter
- Highlight count tracking
- TypeScript types

**How to use:**

1. Install Flowmark in your React project:
   ```bash
   npm install @spranclabs/flowmark
   ```

2. Copy `react-example.tsx` to your project

3. Import and use the component:
   ```tsx
   import { ArticleWithHighlights } from './components/ArticleWithHighlights'

   function App() {
     return (
       <ArticleWithHighlights
         articleId="123"
         title="My Article"
         content="<p>Article content...</p>"
       />
     )
   }
   ```

**Backend API expected:**
- `GET /api/highlights?page_url=...` - Load highlights
- `POST /api/highlights` - Save highlight
- `PATCH /api/highlights/:id` - Update highlight
- `DELETE /api/highlights/:id` - Remove highlight
- `DELETE /api/highlights?page_url=...` - Clear all

---

## Building Flowmark

Before running the examples, make sure Flowmark is built:

```bash
cd ..
pnpm install
pnpm run build
```

The examples import from `../dist/index.js`, so the package must be built first.

---

## Customization

All examples can be customized:

- **Colors:** Change `defaultColor` option
- **Storage:** Swap adapters (LocalStorage, PostMessage, custom)
- **UI:** Modify styles and selection toolbar
- **Events:** Add custom logic to `onHighlight`, `onRemove`, etc.

See the main [README.md](../README.md) for full API documentation.
