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

// Version
export const VERSION = '0.1.0'
