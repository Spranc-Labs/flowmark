/**
 * Event Manager Module
 * Handles event listeners and user interactions for highlighting
 */

import { validateSelection, getSelectionBoundingRect, captureSelection } from './selection-manager'
import { getHighlightId } from './dom-renderer'
import type { SelectionData, SelectionUIComponent } from './types'

export interface EventCallbacks {
  onSelectionChange?: (selection: SelectionData | null) => void
  onHighlightClick?: (highlightId: string, event: MouseEvent) => void
  onHighlightHover?: (highlightId: string, event: MouseEvent) => void
}

/**
 * EventManager handles all user interactions for the highlighter
 */
export class EventManager {
  private container: HTMLElement
  private ui: SelectionUIComponent | null
  private callbacks: EventCallbacks
  private boundHandlers: Map<string, EventListener>

  constructor(
    container: HTMLElement,
    ui: SelectionUIComponent | null,
    callbacks: EventCallbacks = {}
  ) {
    this.container = container
    this.ui = ui
    this.callbacks = callbacks
    this.boundHandlers = new Map()
  }

  /**
   * Sets up all event listeners
   */
  setupEventListeners(): void {
    // Mouse up - detect text selection
    const handleMouseUp = (e: Event) => this.handleMouseUp(e as MouseEvent)
    this.container.addEventListener('mouseup', handleMouseUp)
    this.boundHandlers.set('mouseup', handleMouseUp)

    // Mouse down - hide UI if clicking outside selection
    const handleMouseDown = (e: Event) => this.handleMouseDown(e as MouseEvent)
    document.addEventListener('mousedown', handleMouseDown)
    this.boundHandlers.set('mousedown', handleMouseDown)

    // Click on highlights
    const handleClick = (e: Event) => this.handleClick(e as MouseEvent)
    this.container.addEventListener('click', handleClick)
    this.boundHandlers.set('click', handleClick)

    // Mouse over highlights
    const handleMouseOver = (e: Event) => this.handleMouseOver(e as MouseEvent)
    this.container.addEventListener('mouseover', handleMouseOver)
    this.boundHandlers.set('mouseover', handleMouseOver)

    // Touch support
    const handleTouchEnd = (e: Event) => this.handleTouchEnd(e as TouchEvent)
    this.container.addEventListener('touchend', handleTouchEnd)
    this.boundHandlers.set('touchend', handleTouchEnd)
  }

  /**
   * Removes all event listeners
   */
  teardownEventListeners(): void {
    const mouseUpHandler = this.boundHandlers.get('mouseup')
    if (mouseUpHandler) {
      this.container.removeEventListener('mouseup', mouseUpHandler)
    }

    const mouseDownHandler = this.boundHandlers.get('mousedown')
    if (mouseDownHandler) {
      document.removeEventListener('mousedown', mouseDownHandler)
    }

    const clickHandler = this.boundHandlers.get('click')
    if (clickHandler) {
      this.container.removeEventListener('click', clickHandler)
    }

    const mouseOverHandler = this.boundHandlers.get('mouseover')
    if (mouseOverHandler) {
      this.container.removeEventListener('mouseover', mouseOverHandler)
    }

    const touchEndHandler = this.boundHandlers.get('touchend')
    if (touchEndHandler) {
      this.container.removeEventListener('touchend', touchEndHandler)
    }

    this.boundHandlers.clear()
  }

  /**
   * Handles mouse up events to detect text selection
   */
  private handleMouseUp(_event: MouseEvent): void {
    // Small delay to let selection settle
    setTimeout(() => {
      const selection = window.getSelection()

      if (!validateSelection(selection, this.container)) {
        this.hideUI()
        return
      }

      // Check if selection is within container
      if (selection && selection.anchorNode) {
        if (!this.container.contains(selection.anchorNode)) {
          this.hideUI()
          return
        }
      }

      // Get selection bounds
      const rect = getSelectionBoundingRect(selection)
      if (!rect) {
        this.hideUI()
        return
      }

      // Capture selection data
      const selectionData = captureSelection(this.container)
      if (!selectionData) {
        this.hideUI()
        return
      }

      // Notify callback
      if (this.callbacks.onSelectionChange) {
        this.callbacks.onSelectionChange(selectionData)
      }

      // Show UI near selection
      if (this.ui) {
        const x = rect.left + rect.width / 2 + window.scrollX
        const y = rect.top + window.scrollY
        this.ui.show(x, y, selectionData)
      }
    }, 10)
  }

  /**
   * Handles mouse down events to hide UI when clicking outside
   */
  private handleMouseDown(_event: MouseEvent): void {
    // Check if clicking on a highlight or the UI tooltip
    const target = _event.target as HTMLElement

    // Don't hide if clicking on UI
    if (target.closest('.flowmark-tooltip')) {
      return
    }

    // Hide UI
    this.hideUI()
  }

  /**
   * Handles click events on highlights
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const highlightId = getHighlightId(target)

    if (highlightId && this.callbacks.onHighlightClick) {
      this.callbacks.onHighlightClick(highlightId, event)
    }
  }

  /**
   * Handles mouse over events on highlights
   */
  private handleMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const highlightId = getHighlightId(target)

    if (highlightId && this.callbacks.onHighlightHover) {
      this.callbacks.onHighlightHover(highlightId, event)
    }
  }

  /**
   * Handles touch end events for mobile support
   */
  private handleTouchEnd(_event: TouchEvent): void {
    // Convert to MouseEvent-like behavior
    setTimeout(() => {
      const selection = window.getSelection()

      if (!validateSelection(selection, this.container)) {
        this.hideUI()
        return
      }

      const rect = getSelectionBoundingRect(selection)
      if (!rect) {
        this.hideUI()
        return
      }

      const selectionData = captureSelection(this.container)
      if (!selectionData) {
        this.hideUI()
        return
      }

      if (this.callbacks.onSelectionChange) {
        this.callbacks.onSelectionChange(selectionData)
      }

      if (this.ui) {
        const x = rect.left + rect.width / 2 + window.scrollX
        const y = rect.top + window.scrollY
        this.ui.show(x, y, selectionData)
      }
    }, 10)
  }

  /**
   * Hides the UI component
   */
  private hideUI(): void {
    if (this.ui) {
      this.ui.hide()
    }

    if (this.callbacks.onSelectionChange) {
      this.callbacks.onSelectionChange(null)
    }
  }

  /**
   * Updates the UI component
   */
  setUI(ui: SelectionUIComponent | null): void {
    if (this.ui) {
      this.ui.destroy()
    }
    this.ui = ui
  }

  /**
   * Updates callbacks
   */
  setCallbacks(callbacks: EventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.teardownEventListeners()
    if (this.ui) {
      this.ui.destroy()
    }
  }
}
