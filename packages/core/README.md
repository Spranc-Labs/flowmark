# @spranclabs/flowmark

**Flowmark** - Zero-dependency highlighting library that flows across boundaries.

> Seamless cross-element text highlighting with smart normalization.

## Features

- **Cross-element highlighting** - Select text across multiple DOM elements
- **Precise text matching** - Context-aware text positioning with prefix/suffix validation
- **Zero dependencies** - Pure vanilla JavaScript/TypeScript
- **Tiny bundle size** - ~10KB minified
- **Framework agnostic** - Works with React, Vue, Angular, or plain HTML
- **Customizable UI** - Fully customizable highlight colors and styles
- **Storage adapters** - Support for Chrome, Firefox, and custom storage backends
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
import {
  normalizeText,
  computeSimilarity,
  LocalStorageAdapter,
  type Highlight,
  type StoredHighlight
} from '@spranclabs/flowmark'

// Text normalization - handles smart quotes, whitespace, punctuation
const normalized = normalizeText('"Hello  World"')
console.log(normalized) // => '"hello world"'

// Compute similarity between strings (1.0 = identical, 0.0 = completely different)
const similarity = computeSimilarity('hello world', 'Hello World')
console.log(similarity) // => 1.0

// Storage adapter for persisting highlights
const storage = new LocalStorageAdapter('my-app-highlights')

// Save a highlight
const highlight: StoredHighlight = {
  id: 'highlight_1',
  text: 'selected text',
  normalizedText: normalizeText('selected text'),
  startOffset: 0,
  endOffset: 13,
  prefix: 'Some ',
  suffix: ' here',
  createdAt: new Date().toISOString(),
  isCrossElement: false,
}

await storage.save(highlight)

// Load all highlights
const highlights = await storage.load()
console.log(highlights) // => [{ id: 'highlight_1', ... }]

// Update a highlight
await storage.update('highlight_1', {
  note: 'This is an important passage'
})

// Remove a highlight
await storage.remove('highlight_1')

// Clear all highlights
await storage.clear()
```

## API Documentation

### Text Processing Functions

#### `normalizeText(text: string, options?: NormalizeOptions): string`

Normalizes text for consistent matching across different text formats.

**Parameters:**
- `text: string` - The text to normalize
- `options?: NormalizeOptions` - Optional configuration
  - `preserveSpacing?: boolean` - Keep original spacing (default: `false`)
  - `preserveCase?: boolean` - Keep original case (default: `false`)

**Returns:** `string` - Normalized text

**Handles:**
- Smart quotes → straight quotes (", ')
- Whitespace normalization (newlines, tabs, multiple spaces → single space)
- Punctuation spacing standardization
- Optional case normalization (lowercase)

**Examples:**

```typescript
import { normalizeText } from '@spranclabs/flowmark'

normalizeText('"Hello  world"')
// => '"hello world"'

normalizeText('Hello\n\nWorld')
// => 'hello world'

normalizeText('test,no space')
// => 'test, no space'

normalizeText('HELLO', { preserveCase: true })
// => 'HELLO'
```

---

#### `computeSimilarity(str1: string, str2: string): number`

Computes similarity score between two strings using Levenshtein distance algorithm.

**Parameters:**
- `str1: string` - First string to compare
- `str2: string` - Second string to compare

**Returns:** `number` - Similarity score between 0.0 and 1.0
- `1.0` = Identical strings
- `0.0` = Completely different strings

**Examples:**

```typescript
import { computeSimilarity } from '@spranclabs/flowmark'

computeSimilarity('hello', 'hello')
// => 1.0

computeSimilarity('hello', 'hallo')
// => 0.8

computeSimilarity('hello', 'world')
// => 0.2

computeSimilarity('', '')
// => 1.0
```

---

#### `getTextContext(range: Range, charsBefore?: number, charsAfter?: number): { prefix: string; suffix: string }`

Extracts text context before and after a DOM Range for validation.

**Parameters:**
- `range: Range` - DOM Range object
- `charsBefore?: number` - Characters to extract before the range (default: `32`)
- `charsAfter?: number` - Characters to extract after the range (default: `32`)

**Returns:** `{ prefix: string; suffix: string }`
- `prefix` - Text before the range
- `suffix` - Text after the range

**Examples:**

```typescript
import { getTextContext } from '@spranclabs/flowmark'

const selection = window.getSelection()
if (selection && selection.rangeCount > 0) {
  const range = selection.getRangeAt(0)
  const { prefix, suffix } = getTextContext(range, 32, 32)

  console.log('Before:', prefix)
  console.log('After:', suffix)
}
```

---

#### `extractTextFromRange(range: Range): string`

Extracts text content from a DOM Range, properly handling cross-element selections.

**Parameters:**
- `range: Range` - DOM Range object

**Returns:** `string` - Extracted text with proper spacing

**Examples:**

```typescript
import { extractTextFromRange } from '@spranclabs/flowmark'

const selection = window.getSelection()
if (selection && selection.rangeCount > 0) {
  const range = selection.getRangeAt(0)
  const text = extractTextFromRange(range)
  console.log('Selected text:', text)
}
```

---

#### `findTextPosition(haystack: string, needle: string, startOffset?: number): { startOffset: number; endOffset: number } | null`

Finds the position of text within a larger string.

**Parameters:**
- `haystack: string` - The text to search in
- `needle: string` - The text to find
- `startOffset?: number` - Starting offset for search (default: `0`)

**Returns:** `{ startOffset: number; endOffset: number } | null`
- Returns position object if found
- Returns `null` if not found

**Examples:**

```typescript
import { findTextPosition } from '@spranclabs/flowmark'

const text = 'Hello world, hello universe'
const pos = findTextPosition(text, 'hello', 0)
console.log(pos)
// => { startOffset: 0, endOffset: 5 }

const notFound = findTextPosition(text, 'galaxy', 0)
console.log(notFound)
// => null
```

---

#### `validateTextMatch(text: string, searchText: string, prefix: string, suffix: string): boolean`

Validates if text matches at a given position with surrounding context.

**Parameters:**
- `text: string` - The full text to search in
- `searchText: string` - The text to find
- `prefix: string` - Expected text before the match
- `suffix: string` - Expected text after the match

**Returns:** `boolean` - `true` if match is validated with correct context

**Examples:**

```typescript
import { validateTextMatch } from '@spranclabs/flowmark'

const text = 'The quick brown fox jumps'
const valid = validateTextMatch(text, 'brown', 'quick ', ' fox')
console.log(valid)
// => true

const invalid = validateTextMatch(text, 'brown', 'slow ', ' fox')
console.log(invalid)
// => false
```

---

### Storage Adapters

All storage adapters implement the `StorageAdapter` interface:

```typescript
interface StorageAdapter {
  load(): Promise<StoredHighlight[]>
  save(highlight: StoredHighlight): Promise<void>
  update(id: string, data: Partial<StoredHighlight>): Promise<void>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}
```

---

#### `MemoryStorageAdapter`

In-memory storage adapter for testing or temporary storage. Data is lost on page reload.

**Constructor:**
```typescript
new MemoryStorageAdapter()
```

**Methods:**
- `load(): Promise<StoredHighlight[]>` - Returns all stored highlights
- `save(highlight: StoredHighlight): Promise<void>` - Saves a highlight
- `update(id: string, data: Partial<StoredHighlight>): Promise<void>` - Updates a highlight
- `remove(id: string): Promise<void>` - Removes a highlight
- `clear(): Promise<void>` - Clears all highlights
- `size(): number` - Returns count of stored highlights (for testing)

**Usage:**

```typescript
import { MemoryStorageAdapter } from '@spranclabs/flowmark'

const storage = new MemoryStorageAdapter()

await storage.save({
  id: '1',
  text: 'important text',
  normalizedText: 'important text',
  startOffset: 0,
  endOffset: 14,
  prefix: '',
  suffix: '',
  createdAt: new Date().toISOString(),
  isCrossElement: false,
})

const highlights = await storage.load()
console.log(highlights.length) // => 1
console.log(storage.size()) // => 1
```

---

#### `LocalStorageAdapter`

LocalStorage adapter for persisting highlights in the browser.

**Constructor:**
```typescript
new LocalStorageAdapter(storageKey?: string)
```

**Parameters:**
- `storageKey?: string` - LocalStorage key (default: `'text-annotator-highlights'`)

**Methods:**
- `load(): Promise<StoredHighlight[]>` - Loads highlights from localStorage
- `save(highlight: StoredHighlight): Promise<void>` - Saves a highlight
- `update(id: string, data: Partial<StoredHighlight>): Promise<void>` - Updates a highlight
- `remove(id: string): Promise<void>` - Removes a highlight
- `clear(): Promise<void>` - Removes all highlights

**Usage:**

```typescript
import { LocalStorageAdapter } from '@spranclabs/flowmark'

const storage = new LocalStorageAdapter('my-app-highlights')

// Save a highlight (persists across page reloads)
await storage.save({
  id: 'highlight_123',
  text: 'persistent highlight',
  normalizedText: 'persistent highlight',
  startOffset: 0,
  endOffset: 20,
  prefix: 'This is a ',
  suffix: ' that will persist',
  createdAt: new Date().toISOString(),
  isCrossElement: false,
})

// Reload page...

// Load highlights (data persists)
const highlights = await storage.load()
console.log(highlights.length) // => 1
```

---

#### `PostMessageAdapter`

PostMessage adapter for iframe communication. Sends highlights to parent window for storage.

**Constructor:**
```typescript
new PostMessageAdapter(targetWindow?: Window, targetOrigin?: string)
```

**Parameters:**
- `targetWindow?: Window` - Target window (default: `window.parent`)
- `targetOrigin?: string` - Target origin for security (default: `'*'`)

**Methods:**
- `load(): Promise<StoredHighlight[]>` - Requests highlights from parent
- `save(highlight: StoredHighlight): Promise<void>` - Sends save request to parent
- `update(id: string, data: Partial<StoredHighlight>): Promise<void>` - Sends update request
- `remove(id: string): Promise<void>` - Sends remove request
- `clear(): Promise<void>` - Sends clear request
- `destroy(): void` - Cleans up event listeners

**Message Format:**

Messages sent to parent window:
```typescript
{
  type: 'text-annotator',
  action: 'load_highlights' | 'save_highlight' | 'update_highlight' | 'remove_highlight' | 'clear_highlights',
  requestId: string,
  data?: any
}
```

Expected response from parent:
```typescript
{
  type: 'text-annotator-response',
  requestId: string,
  success: boolean,
  data?: any,
  error?: string
}
```

**Usage:**

In iframe:
```typescript
import { PostMessageAdapter } from '@spranclabs/flowmark'

const storage = new PostMessageAdapter(
  window.parent,
  'https://parent-domain.com'
)

// Send save request to parent
await storage.save({
  id: 'highlight_1',
  text: 'iframe highlight',
  normalizedText: 'iframe highlight',
  startOffset: 0,
  endOffset: 16,
  prefix: '',
  suffix: '',
  createdAt: new Date().toISOString(),
  isCrossElement: false,
})

// Clean up when done
storage.destroy()
```

In parent window:
```typescript
window.addEventListener('message', async (event) => {
  if (event.data.type !== 'text-annotator') return

  const { action, requestId, data } = event.data

  try {
    let result

    switch (action) {
      case 'load_highlights':
        result = await loadHighlightsFromDB()
        break
      case 'save_highlight':
        await saveHighlightToDB(data)
        result = { success: true }
        break
      // ... handle other actions
    }

    event.source.postMessage({
      type: 'text-annotator-response',
      requestId,
      success: true,
      data: result
    }, event.origin)
  } catch (error) {
    event.source.postMessage({
      type: 'text-annotator-response',
      requestId,
      success: false,
      error: error.message
    }, event.origin)
  }
})
```

---

### TypeScript Types

#### `Highlight`

Represents a text highlight with position and metadata.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✓ | Unique identifier for the highlight |
| `text` | `string` | ✓ | The highlighted text content |
| `normalizedText` | `string` | ✓ | Normalized text (used for matching) |
| `startOffset` | `number` | ✓ | Start character offset in normalized text |
| `endOffset` | `number` | ✓ | End character offset in normalized text |
| `prefix` | `string` | ✓ | Text context before highlight (for validation) |
| `suffix` | `string` | ✓ | Text context after highlight (for validation) |
| `createdAt` | `Date` | ✓ | Creation timestamp |
| `isCrossElement` | `boolean` | ✓ | Whether highlight spans multiple DOM elements |
| `color` | `string` | ✗ | Highlight color (hex, rgb, or color name) |
| `note` | `string` | ✗ | Optional note attached to highlight |
| `updatedAt` | `Date` | ✗ | Last update timestamp |

---

#### `StoredHighlight`

Serializable highlight format for storage (uses ISO date strings instead of Date objects).

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✓ | Unique identifier |
| `text` | `string` | ✓ | Highlighted text |
| `normalizedText` | `string` | ✓ | Normalized text |
| `startOffset` | `number` | ✓ | Start offset |
| `endOffset` | `number` | ✓ | End offset |
| `prefix` | `string` | ✓ | Text before highlight |
| `suffix` | `string` | ✓ | Text after highlight |
| `createdAt` | `string` | ✓ | ISO date string |
| `isCrossElement` | `boolean` | ✓ | Cross-element flag |
| `color` | `string` | ✗ | Highlight color |
| `note` | `string` | ✗ | Optional note |
| `updatedAt` | `string` | ✗ | ISO date string |

---

#### `CreateHighlightInput`

Data required to create a new highlight.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | `string` | ✓ | Selected text |
| `startOffset` | `number` | ✓ | Start offset in normalized text |
| `endOffset` | `number` | ✓ | End offset in normalized text |
| `prefix` | `string` | ✓ | Text context before selection |
| `suffix` | `string` | ✓ | Text context after selection |
| `isCrossElement` | `boolean` | ✓ | Whether spans multiple elements |
| `color` | `string` | ✗ | Highlight color |
| `note` | `string` | ✗ | Optional note |

---

#### `SelectionData`

Selection data from browser Selection API.

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Selected text |
| `normalizedText` | `string` | Normalized text |
| `range` | `Range` | Selection Range object |
| `startContainer` | `Node` | Start container node |
| `endContainer` | `Node` | End container node |
| `startOffset` | `number` | Start offset within container |
| `endOffset` | `number` | End offset within container |
| `isCrossElement` | `boolean` | Whether selection spans multiple elements |

---

#### `NormalizeOptions`

Text normalization configuration.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `preserveSpacing` | `boolean` | `false` | Keep original spacing |
| `preserveCase` | `boolean` | `false` | Keep original case |

---

#### `TextMatch`

Text match result with position information.

| Property | Type | Description |
|----------|------|-------------|
| `startOffset` | `number` | Start offset in document |
| `endOffset` | `number` | End offset in document |
| `text` | `string` | Matched text |
| `confidence` | `number` | Confidence score (0-1) |
| `validated` | `boolean` | Whether prefix/suffix validated |

---

#### `StorageAdapter`

Storage adapter interface that all adapters must implement.

```typescript
interface StorageAdapter {
  load(): Promise<StoredHighlight[]>
  save(highlight: StoredHighlight): Promise<void>
  update(id: string, data: Partial<StoredHighlight>): Promise<void>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}
```

---

### Exports Summary

**Functions (6):**
- `normalizeText()` - Text normalization
- `computeSimilarity()` - String similarity scoring
- `getTextContext()` - Extract prefix/suffix context
- `extractTextFromRange()` - DOM Range text extraction
- `findTextPosition()` - Find text offsets
- `validateTextMatch()` - Context-aware validation

**Classes (3):**
- `MemoryStorageAdapter` - In-memory storage
- `LocalStorageAdapter` - Browser localStorage
- `PostMessageAdapter` - Iframe communication

**Types (11):**
- `Highlight` - Highlight with Date objects
- `StoredHighlight` - Serializable highlight
- `CreateHighlightInput` - Create highlight data
- `SelectionData` - Browser selection data
- `NormalizeOptions` - Text normalization config
- `TextMatch` - Text match result
- `TextNode` - DOM text node
- `HighlightElement` - Rendered highlight
- `StorageAdapter` - Storage interface
- `HighlighterConfig` - Highlighter configuration
- `SelectionUIComponent` - UI component interface

**Constants (1):**
- `VERSION` - Package version string

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
