/**
 * Highlighter - Main class for text highlighting functionality
 * Orchestrates all highlighting operations
 */

import { EventManager, type EventCallbacks } from './event-manager'
import { renderHighlightMarks, unwrapHighlight } from './dom-renderer'
import { restoreHighlights } from './highlight-restorer'
import { clearSelection } from './selection-manager'
import { SelectionTooltip } from './ui/selection-tooltip'
import { normalizeText, getTextContext } from './text-processor'
import type {
  Highlight,
  StoredHighlight,
  SelectionData,
  HighlighterConfig,
  StorageAdapter,
  SelectionUIComponent,
} from './types'

/**
 * Main Highlighter class
 */
export class Highlighter {
  private container: HTMLElement
  private config: HighlighterConfig & {
    defaultColor: string
    enableCrossElement: boolean
    highlightClassName: string
    showSelectionUI: boolean
  }
  private eventManager: EventManager
  private highlights: Map<string, Highlight>
  private storage: StorageAdapter | null
  private ui: SelectionUIComponent | null
  private isInitialized: boolean

  constructor(container: HTMLElement, config: Partial<HighlighterConfig> = {}) {
    this.container = container
    this.highlights = new Map()
    this.isInitialized = false

    // Set up default config
    this.config = {
      container,
      onHighlight: config.onHighlight,
      onRemove: config.onRemove,
      onUpdate: config.onUpdate,
      onHighlightClick: config.onHighlightClick,
      defaultColor: config.defaultColor || '#ffeb3b',
      enableCrossElement: config.enableCrossElement !== false, // Default true
      storage: config.storage,
      highlightClassName: config.highlightClassName || 'highlight',
      showSelectionUI: config.showSelectionUI !== false, // Default true
      selectionUI: config.selectionUI,
    }

    this.storage = this.config.storage || null
    this.ui = this.config.selectionUI || null

    // Create default UI if enabled and none provided
    if (this.config.showSelectionUI && !this.ui) {
      this.ui = new SelectionTooltip()
    }

    // Set up event manager
    const eventCallbacks: EventCallbacks = {
      onSelectionChange: this.handleSelectionChange.bind(this),
      onHighlightClick: this.handleHighlightClick.bind(this),
      onHighlightHover: this.handleHighlightHover.bind(this),
    }

    this.eventManager = new EventManager(this.container, this.ui, eventCallbacks)

    // Connect UI highlight callback
    if (this.ui) {
      this.ui.onHighlight(this.handleUIHighlightRequest.bind(this))
    }
  }

  /**
   * Initializes the highlighter and loads existing highlights
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Highlighter already initialized')
      return
    }

    // Set up event listeners
    this.eventManager.setupEventListeners()

    // Load highlights from storage
    if (this.storage) {
      try {
        const stored = await this.storage.load()
        await this.loadHighlights(stored)
      } catch (error) {
        console.error('Failed to load highlights from storage:', error)
      }
    }

    this.isInitialized = true
  }

  /**
   * Loads highlights from storage and renders them
   */
  async loadHighlights(stored: StoredHighlight[]): Promise<void> {
    const results = restoreHighlights(this.container, stored)

    for (const [id, result] of results) {
      if (result.success && result.range) {
        const storedHighlight = stored.find((h) => h.id === id)
        if (storedHighlight) {
          try {
            const highlight = this.createHighlightFromStored(storedHighlight, result.range)
            this.highlights.set(id, highlight)
          } catch (error) {
            console.warn(`Failed to restore highlight ${id}:`, error)
          }
        }
      }
    }
  }

  /**
   * Creates a new highlight from a Range
   */
  async createHighlight(range: Range, color?: string): Promise<Highlight> {
    const id = this.generateHighlightId()
    const text = range.toString()
    const normalizedText = normalizeText(text)
    const highlightColor = color || this.config.defaultColor

    // Extract context from range
    const { prefix, suffix } = getTextContext(range, 32, 32)

    // Render marks in DOM
    renderHighlightMarks(range, id, {
      color: highlightColor,
      className: this.config.highlightClassName,
    })

    // Create highlight object
    const highlight: Highlight = {
      id,
      text,
      normalizedText,
      startOffset: 0, // TODO: Calculate actual offsets in container
      endOffset: text.length,
      prefix: normalizeText(prefix),
      suffix: normalizeText(suffix),
      color: highlightColor,
      createdAt: new Date(),
      isCrossElement: range.startContainer !== range.endContainer,
    }

    // Store in memory
    this.highlights.set(id, highlight)

    // Save to storage
    if (this.storage) {
      try {
        await this.storage.save(this.highlightToStored(highlight))
      } catch (error) {
        console.error('Failed to save highlight to storage:', error)
      }
    }

    // Notify callback
    if (this.config.onHighlight) {
      this.config.onHighlight(highlight)
    }

    // Clear selection
    clearSelection()

    return highlight
  }

  /**
   * Removes a highlight by ID
   */
  async removeHighlight(id: string): Promise<void> {
    const highlight = this.highlights.get(id)
    if (!highlight) {
      return
    }

    // Remove from DOM
    unwrapHighlight(id, this.container)

    // Remove from memory
    this.highlights.delete(id)

    // Remove from storage
    if (this.storage) {
      try {
        await this.storage.remove(id)
      } catch (error) {
        console.error('Failed to remove highlight from storage:', error)
      }
    }

    // Notify callback
    if (this.config.onRemove) {
      this.config.onRemove(id)
    }
  }

  /**
   * Updates a highlight
   */
  async updateHighlight(id: string, updates: Partial<Highlight>): Promise<void> {
    const highlight = this.highlights.get(id)
    if (!highlight) {
      throw new Error(`Highlight ${id} not found`)
    }

    // Update in memory
    const updated: Highlight = {
      ...highlight,
      ...updates,
      updatedAt: new Date(),
    }
    this.highlights.set(id, updated)

    // Update in storage
    if (this.storage) {
      try {
        await this.storage.update(id, this.highlightToStored(updated))
      } catch (error) {
        console.error('Failed to update highlight in storage:', error)
      }
    }

    // Notify callback
    if (this.config.onUpdate) {
      this.config.onUpdate(updated)
    }
  }

  /**
   * Gets a highlight by ID
   */
  getHighlight(id: string): Highlight | undefined {
    return this.highlights.get(id)
  }

  /**
   * Gets all highlights
   */
  getHighlights(): Highlight[] {
    return Array.from(this.highlights.values())
  }

  /**
   * Clears all highlights
   */
  async clearAllHighlights(): Promise<void> {
    const ids = Array.from(this.highlights.keys())
    for (const id of ids) {
      await this.removeHighlight(id)
    }

    if (this.storage) {
      try {
        await this.storage.clear()
      } catch (error) {
        console.error('Failed to clear storage:', error)
      }
    }
  }

  /**
   * Destroys the highlighter and cleans up resources
   */
  destroy(): void {
    this.eventManager.destroy()

    if (this.ui) {
      this.ui.destroy()
    }

    this.highlights.clear()
    this.isInitialized = false
  }

  /**
   * Handles selection change events from EventManager
   */
  private handleSelectionChange(_selection: SelectionData | null): void {
    // Can be used to notify external listeners
  }

  /**
   * Handles highlight click events from EventManager
   */
  private handleHighlightClick(highlightId: string, event: MouseEvent): void {
    // Invoke callback if provided
    if (this.config.onHighlightClick) {
      this.config.onHighlightClick(highlightId, event)
    }
  }

  /**
   * Handles highlight hover events from EventManager
   */
  private handleHighlightHover(_highlightId: string, _event: MouseEvent): void {
    // Default behavior: could be used to show preview, etc.
  }

  /**
   * Handles highlight request from UI component
   */
  private async handleUIHighlightRequest(selection: SelectionData): Promise<void> {
    try {
      await this.createHighlight(selection.range)
    } catch (error) {
      console.error('Failed to create highlight:', error)
    }
  }

  /**
   * Creates a Highlight from a StoredHighlight and Range
   */
  private createHighlightFromStored(stored: StoredHighlight, range: Range): Highlight {
    // Render marks in DOM
    renderHighlightMarks(range, stored.id, {
      color: stored.color,
      className: this.config.highlightClassName,
    })

    return {
      id: stored.id,
      text: stored.text,
      normalizedText: stored.normalizedText,
      startOffset: stored.startOffset,
      endOffset: stored.endOffset,
      prefix: stored.prefix,
      suffix: stored.suffix,
      color: stored.color,
      note: stored.note,
      createdAt: new Date(stored.createdAt),
      updatedAt: stored.updatedAt ? new Date(stored.updatedAt) : undefined,
      isCrossElement: stored.isCrossElement,
    }
  }

  /**
   * Converts Highlight to StoredHighlight
   */
  private highlightToStored(highlight: Highlight): StoredHighlight {
    return {
      id: highlight.id,
      text: highlight.text,
      normalizedText: highlight.normalizedText,
      startOffset: highlight.startOffset,
      endOffset: highlight.endOffset,
      prefix: highlight.prefix,
      suffix: highlight.suffix,
      color: highlight.color,
      note: highlight.note,
      createdAt: highlight.createdAt.toISOString(),
      updatedAt: highlight.updatedAt?.toISOString(),
      isCrossElement: highlight.isCrossElement,
    }
  }

  /**
   * Generates a unique highlight ID
   */
  private generateHighlightId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    return `highlight_${timestamp}_${random}`
  }
}
