/**
 * Core types for text annotation library
 */

/**
 * Represents a text highlight with position and metadata
 */
export interface Highlight {
  /** Unique identifier for the highlight */
  id: string

  /** The highlighted text content */
  text: string

  /** Normalized text (used for matching) */
  normalizedText: string

  /** Start character offset in the normalized text */
  startOffset: number

  /** End character offset in the normalized text */
  endOffset: number

  /** Text context before the highlight (for validation) */
  prefix: string

  /** Text context after the highlight (for validation) */
  suffix: string

  /** Highlight color (hex, rgb, or color name) */
  color?: string

  /** Optional note attached to the highlight */
  note?: string

  /** Creation timestamp */
  createdAt: Date

  /** Last update timestamp */
  updatedAt?: Date

  /** Whether this highlight spans multiple DOM elements */
  isCrossElement: boolean
}

/**
 * Data required to create a new highlight
 */
export interface CreateHighlightInput {
  /** The selected text */
  text: string

  /** Start offset in normalized text */
  startOffset: number

  /** End offset in normalized text */
  endOffset: number

  /** Text context before selection */
  prefix: string

  /** Text context after selection */
  suffix: string

  /** Optional highlight color */
  color?: string

  /** Optional note */
  note?: string

  /** Whether this spans multiple elements */
  isCrossElement: boolean
}

/**
 * Stored highlight data (serializable)
 */
export interface StoredHighlight {
  id: string
  text: string
  normalizedText: string
  startOffset: number
  endOffset: number
  prefix: string
  suffix: string
  color?: string
  note?: string
  createdAt: string
  updatedAt?: string
  isCrossElement: boolean
}

/**
 * Selection data from browser Selection API
 */
export interface SelectionData {
  /** Selected text */
  text: string

  /** Normalized text */
  normalizedText: string

  /** Selection Range object */
  range: Range

  /** Start container node */
  startContainer: Node

  /** End container node */
  endContainer: Node

  /** Start offset within container */
  startOffset: number

  /** End offset within container */
  endOffset: number

  /** Whether selection spans multiple elements */
  isCrossElement: boolean
}

/**
 * Text normalization options
 */
export interface NormalizeOptions {
  /** Whether to preserve spacing (default: false) */
  preserveSpacing?: boolean

  /** Whether to preserve case (default: false) */
  preserveCase?: boolean
}

/**
 * Highlighter configuration options
 */
export interface HighlighterConfig {
  /** Container element to enable highlighting within */
  container: HTMLElement

  /** Callback when a new highlight is created */
  onHighlight?: (highlight: Highlight) => void

  /** Callback when a highlight is removed */
  onRemove?: (highlightId: string) => void

  /** Callback when a highlight is updated */
  onUpdate?: (highlight: Highlight) => void

  /** Default highlight color */
  defaultColor?: string

  /** Whether to enable cross-element highlighting */
  enableCrossElement?: boolean

  /** Storage adapter for persisting highlights */
  storage?: StorageAdapter

  /** CSS class to apply to highlight marks */
  highlightClassName?: string

  /** Whether to show UI on text selection */
  showSelectionUI?: boolean

  /** Custom UI component for highlight actions */
  selectionUI?: SelectionUIComponent
}

/**
 * Storage adapter interface for persisting highlights
 */
export interface StorageAdapter {
  /** Load highlights from storage */
  load(): Promise<StoredHighlight[]>

  /** Save a highlight to storage */
  save(highlight: StoredHighlight): Promise<void>

  /** Update an existing highlight */
  update(id: string, data: Partial<StoredHighlight>): Promise<void>

  /** Remove a highlight from storage */
  remove(id: string): Promise<void>

  /** Clear all highlights */
  clear(): Promise<void>
}

/**
 * Selection UI component interface
 */
export interface SelectionUIComponent {
  /** Show UI at given position */
  show(x: number, y: number, selection: SelectionData): void

  /** Hide UI */
  hide(): void

  /** Clean up resources */
  destroy(): void
}

/**
 * Text match result with position information
 */
export interface TextMatch {
  /** Start offset in document */
  startOffset: number

  /** End offset in document */
  endOffset: number

  /** Matched text */
  text: string

  /** Confidence score (0-1) */
  confidence: number

  /** Whether prefix/suffix validated */
  validated: boolean
}

/**
 * DOM traversal result
 */
export interface TextNode {
  /** Text node element */
  node: Node

  /** Start offset in document */
  startOffset: number

  /** End offset in document */
  endOffset: number

  /** Node text content */
  text: string
}

/**
 * Highlight render result
 */
export interface HighlightElement {
  /** Highlight ID */
  highlightId: string

  /** Array of <mark> elements */
  elements: HTMLElement[]

  /** Original Range */
  range: Range
}
