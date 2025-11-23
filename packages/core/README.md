# @spranclabs/flowmark

[![npm version](https://img.shields.io/npm/v/@spranclabs/flowmark.svg?style=flat-square)](https://www.npmjs.com/package/@spranclabs/flowmark)
[![npm downloads](https://img.shields.io/npm/dm/@spranclabs/flowmark.svg?style=flat-square)](https://www.npmjs.com/package/@spranclabs/flowmark)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Spranc-Labs/flowmark/ci.yml?branch=main&style=flat-square)](https://github.com/Spranc-Labs/flowmark/actions)
[![codecov](https://img.shields.io/codecov/c/github/Spranc-Labs/flowmark?style=flat-square)](https://codecov.io/gh/Spranc-Labs/flowmark)

**Flowmark** - Zero-dependency highlighting library that flows across boundaries.

> Seamless cross-element text highlighting with smart normalization.

## Features

- **Cross-element highlighting** - Select text across multiple DOM elements
- **Precise text matching** - Context-aware text positioning with prefix/suffix validation
- **Zero dependencies** - Pure vanilla JavaScript/TypeScript
- **Tiny bundle size** - ~10KB minified
- **Framework agnostic** - Works with React, Vue, Angular, or plain HTML
- **Customizable UI** - Fully customizable highlight colors and styles
- **Storage adapters** - Support for LocalStorage, PostMessage (iframes), or custom backends
- **Mobile friendly** - Touch selection support

## Installation

```bash
npm install @spranclabs/flowmark
# or
pnpm add @spranclabs/flowmark
# or
yarn add @spranclabs/flowmark
```

## Quick Start

```typescript
import { Highlighter, LocalStorageAdapter } from '@spranclabs/flowmark'

// 1. Create storage adapter
const storage = new LocalStorageAdapter('my-highlights')

// 2. Initialize highlighter
const highlighter = new Highlighter(document.body, {
  storage: storage,
  defaultColor: 'rgba(255, 235, 59, 0.4)',
  enableCrossElement: true,
  showSelectionUI: true,

  // Event callbacks
  onHighlightClick: (highlightId, event) => {
    console.log('Highlight clicked:', highlightId)
    // Show delete confirmation, etc.
  },
  onHighlight: (highlight) => {
    console.log('New highlight created:', highlight)
  },
  onRemove: (highlightId) => {
    console.log('Highlight removed:', highlightId)
  }
})

// 3. Initialize (loads highlights and sets up event listeners)
await highlighter.init()

// Now users can select text and create highlights!
```

---

## Highlighter Class

### Constructor

```typescript
new Highlighter(container: HTMLElement, config: HighlighterConfig)
```

**Parameters:**
- `container: HTMLElement` - Container element to enable highlighting within (e.g., `document.body`)
- `config: HighlighterConfig` - Configuration options (see below)

---

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage` | `StorageAdapter` | - | **Required.** Storage adapter for persisting highlights |
| `defaultColor` | `string` | `'rgba(255, 235, 59, 0.4)'` | Default highlight color (CSS color value) |
| `enableCrossElement` | `boolean` | `true` | Allow text selections across multiple DOM elements |
| `showSelectionUI` | `boolean` | `true` | Show action toolbar when text is selected |
| `highlightClassName` | `string` | `'highlight'` | CSS class name applied to highlight `<mark>` elements |
| `onHighlightClick` | `(id: string, event: MouseEvent) => void` | - | Called when a highlight is clicked |
| `onHighlight` | `(highlight: Highlight) => void` | - | Called when a new highlight is created |
| `onRemove` | `(highlightId: string) => void` | - | Called when a highlight is removed |
| `onUpdate` | `(highlight: Highlight) => void` | - | Called when a highlight is updated |
| `selectionUI` | `SelectionUIComponent` | - | Custom UI component for selection actions |

**Example with all callbacks:**

```typescript
const highlighter = new Highlighter(document.body, {
  storage: new LocalStorageAdapter(),
  defaultColor: '#fef08a',

  onHighlightClick: (highlightId, event) => {
    // Handle click (e.g., show delete button, open notes panel)
    if (confirm('Delete this highlight?')) {
      highlighter.removeHighlight(highlightId)
    }
  },

  onHighlight: (highlight) => {
    // Handle creation (e.g., analytics, toast notification)
    console.log('Highlighted:', highlight.text)
  },

  onRemove: (highlightId) => {
    // Handle deletion (e.g., update UI, sync to server)
    console.log('Removed highlight:', highlightId)
  },

  onUpdate: (highlight) => {
    // Handle updates (e.g., color change, note added)
    console.log('Updated highlight:', highlight)
  }
})
```

---

### Methods

#### `init(): Promise<void>`

Initializes the highlighter by:
1. Loading existing highlights from storage
2. Rendering highlights on the page
3. Setting up event listeners for text selection

```typescript
await highlighter.init()
```

---

#### `createHighlight(range: Range, color?: string): Promise<Highlight>`

Programmatically create a highlight from a DOM Range.

```typescript
const selection = window.getSelection()
if (selection && selection.rangeCount > 0) {
  const range = selection.getRangeAt(0)
  const highlight = await highlighter.createHighlight(range, '#86efac')
  console.log('Created:', highlight)
}
```

---

#### `removeHighlight(highlightId: string): Promise<void>`

Remove a highlight by ID.

```typescript
await highlighter.removeHighlight('highlight_123')
```

---

#### `destroy(): void`

Clean up event listeners and remove highlights from DOM. Call this when unmounting the highlighter.

```typescript
highlighter.destroy()
```

---

## Storage Adapters

Flowmark uses storage adapters to persist highlights. You can use a built-in adapter or create your own.

---

### LocalStorageAdapter (Browser)

Persists highlights in browser localStorage. Data survives page reloads.

```typescript
import { LocalStorageAdapter } from '@spranclabs/flowmark'

const storage = new LocalStorageAdapter('my-app-highlights')
```

**Parameters:**
- `storageKey?: string` - LocalStorage key (default: `'text-annotator-highlights'`)

**Use case:** Single-page apps, browser extensions, offline-first apps

---

### PostMessageAdapter (Iframes)

Sends highlight operations to parent window via `postMessage`. Use this when highlighting content in iframes.

```typescript
import { PostMessageAdapter } from '@spranclabs/flowmark'

const storage = new PostMessageAdapter(window.parent, 'https://parent-domain.com')
```

**Parameters:**
- `targetWindow?: Window` - Target window to send messages (default: `window.parent`)
- `targetOrigin?: string` - Target origin for security (default: `'*'`)

**Message protocol:**
```typescript
// Sent from iframe to parent
{
  type: 'load_highlights' | 'save_highlight' | 'remove_highlight' | ...,
  requestId: string,
  data: any
}

// Parent responds with
{
  type: '<same-as-request>',
  requestId: string,
  data: any,
  error?: string
}
```

**Use case:** Highlighting content in iframed web pages, browser extension content scripts

**Parent window handler example:**
```typescript
window.addEventListener('message', async (event) => {
  if (event.data.type === 'save_highlight') {
    const { requestId, data } = event.data

    // Save to your backend
    const savedHighlight = await saveToDatabase(data)

    // Respond to iframe
    event.source.postMessage({
      type: 'save_highlight',
      requestId,
      data: savedHighlight
    }, event.origin)
  }
})
```

---

### MemoryStorageAdapter (Testing)

In-memory storage for testing. Data is lost on page reload.

```typescript
import { MemoryStorageAdapter } from '@spranclabs/flowmark'

const storage = new MemoryStorageAdapter()
```

**Use case:** Unit tests, demos, temporary highlighting

---

### Custom Adapter

Create a custom adapter by implementing the `StorageAdapter` interface:

```typescript
import { StorageAdapter, StoredHighlight } from '@spranclabs/flowmark'

class MyCustomAdapter implements StorageAdapter {
  async load(): Promise<StoredHighlight[]> {
    const response = await fetch('/api/highlights')
    return response.json()
  }

  async save(highlight: StoredHighlight): Promise<void> {
    await fetch('/api/highlights', {
      method: 'POST',
      body: JSON.stringify(highlight)
    })
  }

  async update(id: string, data: Partial<StoredHighlight>): Promise<void> {
    await fetch(`/api/highlights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async remove(id: string): Promise<void> {
    await fetch(`/api/highlights/${id}`, {
      method: 'DELETE'
    })
  }

  async clear(): Promise<void> {
    await fetch('/api/highlights', {
      method: 'DELETE'
    })
  }
}

const storage = new MyCustomAdapter()
```

---

## TypeScript

Flowmark is written in TypeScript. All types are exported:

```typescript
import type {
  Highlight,           // Highlight with Date objects
  StoredHighlight,     // Serializable highlight (with ISO date strings)
  HighlighterConfig,   // Configuration options
  StorageAdapter,      // Storage interface
  SelectionData,       // Browser selection data
  CreateHighlightInput // Input for creating highlights
} from '@spranclabs/flowmark'
```

See [`src/types.ts`](./src/types.ts) for full type definitions.

---

## Advanced Usage

For advanced use cases, Flowmark exports low-level utilities:

**Text processing:**
- `normalizeText(text, options?)` - Normalize text for consistent matching
- `computeSimilarity(str1, str2)` - Compute similarity score (0-1)
- `getTextContext(range, before?, after?)` - Extract text context around a range

**DOM manipulation:**
- `renderHighlightMarks(range, id, options)` - Render highlight marks in DOM
- `unwrapHighlight(container, highlightId)` - Remove highlight marks
- `getHighlightElements(container, highlightId)` - Get all `<mark>` elements for a highlight
- `updateHighlightColor(container, highlightId, color)` - Change highlight color

**Selection handling:**
- `captureSelection()` - Get current browser selection as `SelectionData`
- `validateSelection(selection)` - Validate selection is suitable for highlighting
- `clearSelection()` - Clear browser selection

**Highlight restoration:**
- `restoreHighlight(container, highlight)` - Restore a highlight to the DOM
- `restoreHighlights(container, highlights)` - Restore multiple highlights

For detailed documentation on these utilities, see [`src/`](./src/) directory.

---

## Styling Highlights

Flowmark renders highlights as `<mark>` elements with inline `background-color` styles. You can customize the appearance with CSS:

```css
/* Basic styling */
mark.highlight {
  cursor: pointer;
  transition: background-color 0.2s;
}

mark.highlight:hover {
  opacity: 0.8;
}

/* Custom class for specific highlights */
mark.my-custom-class {
  background-color: #fef08a;
  border-bottom: 2px solid #fbbf24;
}
```

Pass custom class via config:
```typescript
const highlighter = new Highlighter(document.body, {
  highlightClassName: 'my-custom-class',
  // ...
})
```

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## License

MIT © [Spranc Labs](https://github.com/spranc-labs)

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## Links

- **GitHub:** [github.com/spranc-labs/flowmark](https://github.com/spranc-labs/flowmark)
- **npm:** [npmjs.com/package/@spranclabs/flowmark](https://www.npmjs.com/package/@spranclabs/flowmark)
- **Issues:** [github.com/spranc-labs/flowmark/issues](https://github.com/spranc-labs/flowmark/issues)
