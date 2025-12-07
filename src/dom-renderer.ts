/**
 * DOM Renderer Module
 * Handles creation and removal of highlight marks in the DOM
 */

export interface TextNodeInfo {
  node: Node
  isFirst: boolean
  isLast: boolean
  startOffset: number
  endOffset: number
}

export interface RenderOptions {
  color?: string
  className?: string
}

/**
 * Renders highlight marks in the DOM for a given Range
 * Handles both simple (same container) and cross-element selections
 */
export function renderHighlightMarks(
  range: Range,
  highlightId: string,
  options: RenderOptions = {}
): HTMLElement[] {
  const { color = '#ffeb3b', className = 'highlight' } = options
  const marks: HTMLElement[] = []

  try {
    // Simple case: selection within same text node
    if (range.startContainer === range.endContainer) {
      const mark = createMarkElement(highlightId, color, className)
      range.surroundContents(mark)
      marks.push(mark)
      return marks
    }

    // Complex case: cross-element selection
    const textNodes = getTextNodesInRange(range)

    if (textNodes.length === 0) {
      throw new Error('No text nodes found in range')
    }

    // Wrap each text node segment with a mark
    textNodes.forEach((nodeInfo, index) => {
      const mark = createMarkElement(highlightId, color, className, index)
      const nodeRange = document.createRange()
      nodeRange.selectNodeContents(nodeInfo.node)

      // Adjust boundaries for first and last nodes
      if (nodeInfo.isFirst) {
        nodeRange.setStart(nodeInfo.node, nodeInfo.startOffset)
      }
      if (nodeInfo.isLast) {
        nodeRange.setEnd(nodeInfo.node, nodeInfo.endOffset)
      }

      try {
        nodeRange.surroundContents(mark)
        marks.push(mark)
      } catch (error) {
        console.warn(`Failed to wrap text node ${index}:`, error)
      }
    })

    return marks
  } catch (error) {
    throw new Error(`Failed to render highlight: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Creates a mark element with appropriate attributes and styles
 */
function createMarkElement(
  highlightId: string,
  color: string,
  className: string,
  partIndex?: number
): HTMLElement {
  const mark = document.createElement('mark')
  mark.className = className
  mark.dataset.highlightId = highlightId

  if (partIndex !== undefined) {
    mark.dataset.highlightPart = String(partIndex)
  }

  mark.style.backgroundColor = color
  mark.style.padding = '2px 0'
  mark.style.cursor = 'pointer'

  return mark
}

/**
 * Gets all text nodes within a range with their offsets
 * Firefox-compatible implementation using plain function filter
 */
export function getTextNodesInRange(range: Range): TextNodeInfo[] {
  const textNodes: TextNodeInfo[] = []

  // Firefox requires filter to be a plain function, not an object with acceptNode
  const filterFunction = (node: Node): number => {
    // Skip empty text nodes
    if (!node.textContent || node.textContent.trim().length === 0) {
      return NodeFilter.FILTER_REJECT
    }

    // Check if this node intersects with our range
    const nodeRange = document.createRange()
    nodeRange.selectNodeContents(node)

    try {
      // Check if ranges intersect using boundary point comparison
      const startCompare = range.compareBoundaryPoints(Range.START_TO_END, nodeRange)
      const endCompare = range.compareBoundaryPoints(Range.END_TO_START, nodeRange)

      // If our range ends before node starts, or starts after node ends, reject
      if (startCompare <= 0 || endCompare >= 0) {
        return NodeFilter.FILTER_REJECT
      }

      return NodeFilter.FILTER_ACCEPT
    } catch {
      // If comparison fails, accept the node (safer fallback)
      return NodeFilter.FILTER_ACCEPT
    }
  }

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    filterFunction as unknown as NodeFilter
  )

  let node: Node | null
  while ((node = walker.nextNode())) {
    const isFirst = node === range.startContainer
    const isLast = node === range.endContainer

    textNodes.push({
      node,
      isFirst,
      isLast,
      startOffset: isFirst ? range.startOffset : 0,
      endOffset: isLast ? range.endOffset : (node.textContent?.length || 0),
    })
  }

  // Fallback if TreeWalker found nothing
  if (textNodes.length === 0) {
    return getTextNodesFallback(range)
  }

  return textNodes
}

/**
 * Fallback method to find text nodes using manual traversal
 * Used when TreeWalker fails (browser compatibility issues)
 */
function getTextNodesFallback(range: Range): TextNodeInfo[] {
  const startContainer = range.startContainer
  const endContainer = range.endContainer

  // Simple case: same text node container
  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    return [
      {
        node: startContainer,
        isFirst: true,
        isLast: true,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      },
    ]
  }

  // Complex case: traverse all text nodes between start and end
  const textNodes: TextNodeInfo[] = []
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null
  )

  let node: Node | null
  let foundStart = false

  while ((node = walker.nextNode())) {
    // Check if we've reached the start
    if (node === startContainer || node.contains(startContainer)) {
      foundStart = true
    }

    // Collect nodes between start and end
    if (foundStart) {
      if (node.textContent && node.textContent.trim().length > 0) {
        const isFirst = node === startContainer
        const isLast = node === endContainer

        textNodes.push({
          node,
          isFirst,
          isLast,
          startOffset: isFirst ? range.startOffset : 0,
          endOffset: isLast ? range.endOffset : (node.textContent.length || 0),
        })
      }

      // Stop if we've reached the end
      if (node === endContainer || node.contains(endContainer)) {
        break
      }
    }
  }

  return textNodes
}

/**
 * Removes all highlight marks with the given highlightId from the DOM
 */
export function unwrapHighlight(highlightId: string, container?: HTMLElement): void {
  const root = container || document.body
  const marks = root.querySelectorAll(`mark[data-highlight-id="${highlightId}"]`)

  marks.forEach((mark) => {
    // Replace mark with its text content
    const parent = mark.parentNode
    if (parent) {
      // Create a text node with the mark's content
      const textNode = document.createTextNode(mark.textContent || '')
      parent.replaceChild(textNode, mark)

      // Normalize to merge adjacent text nodes
      parent.normalize()
    }
  })
}

/**
 * Checks if a given element or its ancestors is a highlight mark
 */
export function isHighlightElement(element: HTMLElement): boolean {
  return element.tagName === 'MARK' && element.hasAttribute('data-highlight-id')
}

/**
 * Gets the highlight ID from a mark element or its ancestors
 * When highlights overlap, returns the innermost (most recent) highlight ID
 */
export function getHighlightId(element: HTMLElement): string | null {
  // Check if element itself is a mark
  if (element.tagName === 'MARK' && element.dataset.highlightId) {
    return element.dataset.highlightId
  }

  // Find the closest mark ancestor
  // closest() naturally finds the innermost mark first when highlights are nested
  const mark = element.closest('mark[data-highlight-id]') as HTMLElement | null
  return mark?.dataset.highlightId || null
}

/**
 * Gets all mark elements for a given highlight ID
 */
export function getHighlightElements(highlightId: string, container?: HTMLElement): HTMLElement[] {
  const root = container || document.body
  const marks = root.querySelectorAll(`mark[data-highlight-id="${highlightId}"]`)
  return Array.from(marks) as HTMLElement[]
}

/**
 * Updates the color of all marks for a given highlight
 */
export function updateHighlightColor(
  highlightId: string,
  color: string,
  container?: HTMLElement
): void {
  const marks = getHighlightElements(highlightId, container)
  marks.forEach((mark) => {
    mark.style.backgroundColor = color
  })
}
