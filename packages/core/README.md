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
import { Highlighter } from '@spranclabs/flowmark'

// Initialize highlighter
const highlighter = new Highlighter({
  container: document.body,
  onHighlight: (highlight) => {
    console.log('New highlight:', highlight)
  },
})

// Enable highlighting
highlighter.enable()

// Add existing highlights
highlighter.loadHighlights([
  {
    id: '1',
    text: 'highlighted text',
    startOffset: 0,
    endOffset: 16,
    color: '#ffeb3b',
  },
])
```

## API Documentation

Coming soon...

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
