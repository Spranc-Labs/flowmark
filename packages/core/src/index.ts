/**
 * @spranclabs/flowmark
 *
 * Flowmark - Zero-dependency highlighting library that flows across boundaries
 */

// Types
export type {
  Highlight,
  CreateHighlightInput,
  StoredHighlight,
  SelectionData,
  NormalizeOptions,
  HighlighterConfig,
  StorageAdapter,
  SelectionUIComponent,
  TextMatch,
  TextNode,
  HighlightElement,
} from './types'

// Text processing utilities
export {
  normalizeText,
  getTextContext,
  extractTextFromRange,
  findTextPosition,
  validateTextMatch,
  computeSimilarity,
} from './text-processor'

// Storage adapters
export { BaseStorageAdapter } from './adapters/base'
export { MemoryStorageAdapter } from './adapters/memory'
export { LocalStorageAdapter } from './adapters/local-storage'
export { PostMessageAdapter } from './adapters/post-message'

// Core Highlighter
export { Highlighter } from './highlighter'

// UI Components
export { SelectionTooltip } from './ui/selection-tooltip'

// DOM Renderer utilities (for advanced use cases)
export {
  renderHighlightMarks,
  unwrapHighlight,
  getHighlightElements,
  getHighlightId,
  isHighlightElement,
  updateHighlightColor,
  type TextNodeInfo,
  type RenderOptions,
} from './dom-renderer'

// Selection Manager utilities (for advanced use cases)
export {
  captureSelection,
  validateSelection,
  clearSelection,
  getSelectionBoundingRect,
} from './selection-manager'

// Highlight Restorer utilities (for advanced use cases)
export {
  restoreHighlight,
  restoreHighlights,
  createRangeFromCharacterOffsets,
  validateRestoredHighlight,
  type RestoreResult,
} from './highlight-restorer'

// Event Manager (for advanced use cases)
export { EventManager, type EventCallbacks } from './event-manager'

// Version
export const VERSION = '0.1.0'
