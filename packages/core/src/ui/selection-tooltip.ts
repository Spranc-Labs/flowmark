/**
 * Selection Tooltip Component
 * Default UI for highlighting selected text
 */

import type { SelectionData, SelectionUIComponent } from '../types'

export interface SelectionTooltipOptions {
  buttonText?: string
  className?: string
  offsetY?: number
}

/**
 * Default tooltip component that shows a "Highlight" button near the selection
 */
export class SelectionTooltip implements SelectionUIComponent {
  private element: HTMLElement | null = null
  private onHighlightCallback: ((selection: SelectionData) => void) | null = null
  private currentSelection: SelectionData | null = null
  private options: Required<SelectionTooltipOptions>

  constructor(options: SelectionTooltipOptions = {}) {
    this.options = {
      buttonText: options.buttonText || 'Highlight',
      className: options.className || 'flowmark-tooltip',
      offsetY: options.offsetY || 60,
    }
  }

  /**
   * Shows the tooltip at the specified position
   */
  show(x: number, y: number, selection: SelectionData): void {
    this.hide() // Remove any existing tooltip

    this.currentSelection = selection
    this.element = this.createTooltipElement()

    // Position the tooltip
    this.element.style.position = 'absolute'
    this.element.style.left = `${x}px`
    this.element.style.top = `${y - this.options.offsetY}px`
    this.element.style.zIndex = '10000'

    document.body.appendChild(this.element)
  }

  /**
   * Hides and removes the tooltip
   */
  hide(): void {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
    this.currentSelection = null
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.hide()
    this.onHighlightCallback = null
  }

  /**
   * Sets the callback for when the highlight button is clicked
   */
  onHighlight(callback: (selection: SelectionData) => void): void {
    this.onHighlightCallback = callback
  }

  /**
   * Creates the tooltip DOM element
   */
  private createTooltipElement(): HTMLElement {
    const tooltip = document.createElement('div')
    tooltip.className = this.options.className

    // Apply default styles
    this.applyDefaultStyles(tooltip)

    // Create button
    const button = document.createElement('button')
    button.className = `${this.options.className}__button`
    button.innerHTML = this.getButtonHTML()

    // Add click handler
    button.addEventListener('click', this.handleButtonClick.bind(this))

    tooltip.appendChild(button)
    return tooltip
  }

  /**
   * Returns the HTML content for the button
   */
  private getButtonHTML(): string {
    return `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
      <span style="vertical-align: middle;">${this.options.buttonText}</span>
    `
  }

  /**
   * Handles button click events
   */
  private handleButtonClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()

    if (this.onHighlightCallback && this.currentSelection) {
      this.onHighlightCallback(this.currentSelection)
    }

    this.hide()
  }

  /**
   * Applies default styles to the tooltip element
   */
  private applyDefaultStyles(element: HTMLElement): void {
    Object.assign(element.style, {
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '8px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
    })

    // Style the button
    const style = document.createElement('style')
    style.textContent = `
      .${this.options.className}__button {
        background: #333;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
        font-family: inherit;
        display: flex;
        align-items: center;
        transition: background 0.2s;
      }
      .${this.options.className}__button:hover {
        background: #555;
      }
      .${this.options.className}__button:active {
        background: #222;
      }
    `

    document.head.appendChild(style)
  }
}
