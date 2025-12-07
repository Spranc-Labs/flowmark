/**
 * Selection Tooltip Component
 * Default UI for highlighting selected text
 */

import type { SelectionData, SelectionUIComponent } from '../types'

/** Default pencil/edit icon SVG */
const DEFAULT_ICON = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
`

/** Style options for the tooltip container */
export interface TooltipStyles {
  background?: string
  border?: string
  borderRadius?: string
  padding?: string
  boxShadow?: string
  fontFamily?: string
  fontSize?: string
}

/** Style options for the button */
export interface ButtonStyles {
  background?: string
  color?: string
  border?: string
  borderRadius?: string
  padding?: string
  fontSize?: string
  height?: string
  hoverBackground?: string
  activeBackground?: string
}

export interface SelectionTooltipOptions {
  /** Button text (default: "Highlight") */
  buttonText?: string
  /** CSS class name for the tooltip (default: "flowmark-tooltip") */
  className?: string
  /** Vertical offset from selection in pixels (default: 60) */
  offsetY?: number
  /** Custom icon SVG string, or null to hide icon */
  icon?: string | null
  /** Style customization options */
  styles?: {
    tooltip?: TooltipStyles
    button?: ButtonStyles
  }
}

/** Internal options with defaults applied */
interface ResolvedOptions {
  buttonText: string
  className: string
  offsetY: number
  icon: string | null
  styles: {
    tooltip: Required<TooltipStyles>
    button: Required<ButtonStyles>
  }
}

/**
 * Default tooltip component that shows a "Highlight" button near the selection
 */
export class SelectionTooltip implements SelectionUIComponent {
  private element: HTMLElement | null = null
  private styleElement: HTMLStyleElement | null = null
  private onHighlightCallback: ((selection: SelectionData) => void) | null = null
  private currentSelection: SelectionData | null = null
  private options: ResolvedOptions

  constructor(options: SelectionTooltipOptions = {}) {
    this.options = {
      buttonText: options.buttonText ?? 'Highlight',
      className: options.className ?? 'flowmark-tooltip',
      offsetY: options.offsetY ?? 60,
      icon: options.icon === null ? null : (options.icon ?? DEFAULT_ICON),
      styles: {
        tooltip: {
          background: options.styles?.tooltip?.background ?? 'white',
          border: options.styles?.tooltip?.border ?? '1px solid #ddd',
          borderRadius: options.styles?.tooltip?.borderRadius ?? '6px',
          padding: options.styles?.tooltip?.padding ?? '4px',
          boxShadow: options.styles?.tooltip?.boxShadow ?? '0 2px 8px rgba(0,0,0,0.1)',
          fontFamily: options.styles?.tooltip?.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: options.styles?.tooltip?.fontSize ?? '14px',
        },
        button: {
          background: options.styles?.button?.background ?? '#333',
          color: options.styles?.button?.color ?? 'white',
          border: options.styles?.button?.border ?? 'none',
          borderRadius: options.styles?.button?.borderRadius ?? '4px',
          padding: options.styles?.button?.padding ?? '8px 16px',
          fontSize: options.styles?.button?.fontSize ?? '14px',
          height: options.styles?.button?.height ?? 'auto',
          hoverBackground: options.styles?.button?.hoverBackground ?? '#555',
          activeBackground: options.styles?.button?.activeBackground ?? '#222',
        },
      },
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
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
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

    // Apply styles
    this.applyStyles(tooltip)

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
    const iconHtml = this.options.icon ?? ''
    return `${iconHtml}<span>${this.options.buttonText}</span>`
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
   * Applies styles to the tooltip element
   */
  private applyStyles(element: HTMLElement): void {
    const { tooltip, button } = this.options.styles

    // Apply tooltip container styles
    Object.assign(element.style, {
      background: tooltip.background,
      border: tooltip.border,
      borderRadius: tooltip.borderRadius,
      padding: tooltip.padding,
      boxShadow: tooltip.boxShadow,
      fontFamily: tooltip.fontFamily,
      fontSize: tooltip.fontSize,
    })

    // Create dynamic button styles
    this.styleElement = document.createElement('style')
    this.styleElement.textContent = `
      .${this.options.className}__button {
        background: ${button.background};
        color: ${button.color};
        border: ${button.border};
        border-radius: ${button.borderRadius};
        padding: ${button.padding};
        height: ${button.height};
        cursor: pointer;
        font-size: ${button.fontSize};
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: background 0.2s;
        white-space: nowrap;
        line-height: 1;
      }
      .${this.options.className}__button:hover {
        background: ${button.hoverBackground};
      }
      .${this.options.className}__button:active {
        background: ${button.activeBackground};
      }
    `

    document.head.appendChild(this.styleElement)
  }
}
