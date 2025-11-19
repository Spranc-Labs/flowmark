# Flowmark

**Highlighting that flows across boundaries** - A zero-dependency, cross-browser library for seamless text highlighting with cross-element support.

> Built by [Spranc Labs](https://github.com/spranc-labs) for modern web applications

## Try the Live Demo

Open `examples/static-demo/index.html` in your browser to see all features in action.

## Features

- **Cross-element highlighting** - Select and highlight text spanning multiple DOM elements
- **Smart text normalization** - Handles smart quotes, whitespace, and punctuation differences
- **Multiple storage adapters** - Support for Chrome/Firefox extensions, LocalStorage, and iframe postMessage
- **Zero dependencies** - Pure TypeScript/JavaScript implementation
- **Tiny bundle** - ~10KB minified
- **Framework agnostic** - Works with React, Vue, Angular, or vanilla JS
- **Fully tested** - 100% test coverage with Vitest
- **TypeScript first** - Complete type definitions included

## Packages

This is a monorepo containing multiple packages:

### Core Package

```bash
npm install @spranclabs/flowmark
```

The core Flowmark library with text processing, highlighting, and storage adapters.

[View Documentation →](./packages/core/README.md)

## Project Structure

```
text-annotator/
├── packages/
│   ├── core/              # Core library (types, text processing, storage)
│   ├── adapter-chrome/    # Chrome extension storage adapter (planned)
│   ├── adapter-firefox/   # Firefox extension storage adapter (planned)
│   └── adapter-web/       # PostMessage adapter for iframes (planned)
├── examples/
│   ├── chrome-extension/  # Chrome extension demo (planned)
│   ├── firefox-extension/ # Firefox extension demo (planned)
│   ├── iframe-embed/      # Iframe integration demo (planned)
│   └── static-demo/       # 🎬 Interactive demo (LIVE!) - Try it now!
└── docs/                  # Documentation site (planned)
```

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build

# Development mode
pnpm dev
```

### Development

```bash
# Run tests in watch mode
cd packages/core
pnpm test:watch

# Lint code
pnpm lint

# Build specific package
cd packages/core
pnpm build
```

## Usage Example

```typescript
import {
  normalizeText,
  LocalStorageAdapter,
  type Highlight
} from '@spranclabs/flowmark'

// Text normalization
const normalized = normalizeText('"Hello  World"')
// => '"hello world"'

// Storage adapter
const storage = new LocalStorageAdapter('my-highlights')

// Save a highlight
await storage.save({
  id: '1',
  text: 'selected text',
  normalizedText: 'selected text',
  startOffset: 0,
  endOffset: 13,
  prefix: 'Some ',
  suffix: ' here',
  createdAt: new Date().toISOString(),
  isCrossElement: false,
})

// Load highlights
const highlights = await storage.load()
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test:watch
```

## Built With

- **TypeScript** - Type-safe development
- **pnpm** - Fast package manager with workspace support
- **Turborepo** - High-performance build system
- **tsup** - Zero-config TypeScript bundler
- **Vitest** - Blazing fast unit testing
- **Changesets** - Version management and changelog generation

## 📄 License

MIT © Gabriel Ocampo

## 🤝 Contributing

Contributions welcome! This is an open-source portfolio project.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Links

- **Documentation**: Coming soon
- **NPM Package**: `@spranclabs/flowmark` (coming soon)
- **GitHub**: [Spranc-Labs/flowmark](https://github.com/Spranc-Labs/flowmark)
- **Spranc Labs**: [github.com/Spranc-Labs](https://github.com/Spranc-Labs)

## Status

**Current Version**: 0.1.0 (Pre-release)

- [x] Core library with text processing
- [x] Storage adapters (Memory, LocalStorage, PostMessage)
- [x] TypeScript types and definitions
- [x] Unit tests (40 tests, 100% coverage)
- [x] **Interactive static demo with full feature showcase** 🎬
- [ ] Chrome extension adapter
- [ ] Firefox extension adapter
- [ ] Full documentation site
- [ ] npm publishing
- [ ] Chrome Web Store release
- [ ] Firefox Add-ons release

## About Spranc Labs

**Flowmark** is built and maintained by Spranc Labs, creating tools that make the web better.

This project was extracted from a production highlighting system, refined and packaged as a standalone library for the developer community.

---

Building in public. Follow our journey at [Spranc Labs](https://github.com/Spranc-Labs)
