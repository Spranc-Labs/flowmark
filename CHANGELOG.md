# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-07

### Added
- **SelectionTooltip customization** - Full style customization for the selection tooltip
  - `styles.tooltip` - Customize container (background, border, borderRadius, padding, boxShadow, fontFamily, fontSize)
  - `styles.button` - Customize button (background, color, border, borderRadius, padding, fontSize, height, hoverBackground, activeBackground)
  - `icon` option - Custom SVG icon string, or `null` to hide icon
  - `offsetY` option - Control vertical distance from selection
- Export `TooltipStyles` and `ButtonStyles` types from package

### Changed
- SelectionTooltip button uses `inline-flex` with `gap: 4px` for better icon/text alignment
- Improved button styling with `line-height: 1` and `white-space: nowrap`

### Fixed
- Highlight click callback no longer triggers when user has active text selection

---

## [0.1.0] - 2025-11-23

### Added
- Initial release of Flowmark
- Core `Highlighter` class with configuration options
- Cross-element text highlighting with smart boundary detection
- Storage adapters:
  - `LocalStorageAdapter` - Browser localStorage persistence
  - `PostMessageAdapter` - Iframe-to-parent communication
  - `MemoryStorageAdapter` - In-memory storage for testing
  - Custom adapter interface via `StorageAdapter`
- Text normalization and matching utilities
- Precise highlight restoration using prefix/suffix context
- Event callbacks:
  - `onHighlight` - Triggered when highlight is created
  - `onHighlightClick` - Triggered when highlight is clicked
  - `onRemove` - Triggered when highlight is removed
  - `onUpdate` - Triggered when highlight is updated
- DOM manipulation utilities:
  - `renderHighlightMarks` - Render highlights in DOM
  - `unwrapHighlight` - Remove highlight marks
  - `updateHighlightColor` - Change highlight color
- Selection handling:
  - `captureSelection` - Capture browser text selection
  - `validateSelection` - Validate selection for highlighting
  - `clearSelection` - Clear browser selection
- TypeScript support with full type definitions
- Customizable highlight colors and CSS classes
- Mobile-friendly touch selection support
- Zero external dependencies
- Examples:
  - Basic LocalStorage HTML example
  - Iframe PostMessage example (parent + child)
  - React TypeScript component example

### Features
- **Cross-element highlighting** - Select text across multiple DOM elements seamlessly
- **Precise text matching** - Context-aware positioning with prefix/suffix validation
- **Framework agnostic** - Works with React, Vue, Angular, or plain HTML
- **Tiny bundle size** - ~10KB minified
- **Storage flexibility** - Multiple storage adapters with custom adapter support
- **Customizable UI** - Fully customizable colors, styles, and selection toolbar
- **Mobile support** - Touch selection and mobile-friendly interactions

### Developer Experience
- Complete TypeScript types
- Comprehensive API documentation
- Working examples for common use cases
- MIT license for commercial and open-source use

---

## [Unreleased]

### Planned
- Highlight groups/categories
- Highlight annotations/notes
- Collaborative highlighting
- Highlight search and filtering
- Export highlights to JSON/Markdown
- Import highlights from external sources
- Performance optimizations for large documents
- Accessibility improvements (ARIA labels, keyboard navigation)

---

## Version History

- **1.0.0** - SelectionTooltip customization, bug fixes (2025-12-07)
- **0.1.0** - Initial release (2025-11-23)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

MIT © Spranc Labs (Gabriel Ocampo)
