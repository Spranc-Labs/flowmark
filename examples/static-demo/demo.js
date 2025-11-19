/**
 * Flowmark Demo
 *
 * This demo showcases the core features of Flowmark
 * using simplified inline implementations for demonstration purposes.
 */

// ============================================================================
// Core Utilities (from @spranclabs/flowmark)
// ============================================================================

/**
 * Normalizes text for consistent matching
 */
function normalizeText(text, options = {}) {
  const { preserveSpacing = false, preserveCase = false } = options

  let normalized = text
    // Convert smart quotes to straight quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    // Normalize whitespace
    .replace(/[\n\r\t]+/g, ' ')
    // Normalize punctuation spacing
    .replace(/([.!?])\s*(?!["'])/g, '$1 ')
    .replace(/([.!?])\s+(["'])/g, '$1 $2')
    .replace(/\s*([,;:])\s*(?!["'])/g, '$1 ')
    .replace(/([,;:])(["'])/g, '$1$2')
    .replace(/\s+/g, ' ')

  if (!preserveSpacing) {
    normalized = normalized.trim()
  }

  if (!preserveCase) {
    normalized = normalized.toLowerCase()
  }

  return normalized
}

/**
 * Gets text context before and after a Range
 */
function getTextContext(range, charsBefore = 32, charsAfter = 32) {
  const container = range.commonAncestorContainer
  const fullText = container.textContent || ''
  const startOffset = range.startOffset
  const endOffset = range.endOffset

  const prefix = fullText.substring(
    Math.max(0, startOffset - charsBefore),
    startOffset
  )
  const suffix = fullText.substring(
    endOffset,
    Math.min(fullText.length, endOffset + charsAfter)
  )

  return { prefix, suffix }
}

/**
 * LocalStorage adapter for persisting highlights
 */
class LocalStorageAdapter {
  constructor(storageKey = 'flowmark-demo-highlights') {
    this.storageKey = storageKey
  }

  async load() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load highlights:', error)
      return []
    }
  }

  async save(highlight) {
    const highlights = await this.load()
    highlights.push(highlight)
    localStorage.setItem(this.storageKey, JSON.stringify(highlights))
  }

  async remove(id) {
    const highlights = await this.load()
    const filtered = highlights.filter(h => h.id !== id)
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  async clear() {
    localStorage.removeItem(this.storageKey)
  }
}

// ============================================================================
// Demo Application State
// ============================================================================

let highlights = []
let tooltip = null
let currentSelection = null
const storage = new LocalStorageAdapter()

// ============================================================================
// Highlighting Logic
// ============================================================================

/**
 * Captures the current text selection
 */
function captureSelection() {
  const selection = window.getSelection()

  if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
    return null
  }

  const range = selection.getRangeAt(0)
  const exactText = selection.toString()

  // Get context for validation
  const { prefix, suffix } = getTextContext(range, 32, 32)

  // Check if cross-element
  const isCrossElement = range.startContainer !== range.endContainer

  return {
    text: exactText,
    normalizedText: normalizeText(exactText),
    prefix: normalizeText(prefix),
    suffix: normalizeText(suffix),
    isCrossElement,
    range: range.cloneRange()
  }
}

/**
 * Shows highlight tooltip near selection
 */
function showTooltip(x, y) {
  removeTooltip()

  tooltip = document.createElement('div')
  tooltip.className = 'highlight-tooltip'
  tooltip.innerHTML = `
    <button onclick="handleHighlightClick(event)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
      <span>Highlight</span>
    </button>
  `

  tooltip.style.position = 'absolute'
  tooltip.style.left = `${x}px`
  tooltip.style.top = `${y - 60}px`

  document.body.appendChild(tooltip)
  currentSelection = captureSelection()
}

/**
 * Removes the tooltip
 */
function removeTooltip() {
  if (tooltip) {
    tooltip.remove()
    tooltip = null
  }
  currentSelection = null
}

/**
 * Handles highlight button click
 */
async function handleHighlightClick(e) {
  e.preventDefault()
  e.stopPropagation()

  if (!currentSelection) return

  // Create highlight object
  const highlight = {
    id: `highlight_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    text: currentSelection.text,
    normalizedText: currentSelection.normalizedText,
    prefix: currentSelection.prefix,
    suffix: currentSelection.suffix,
    isCrossElement: currentSelection.isCrossElement,
    createdAt: new Date().toISOString(),
    color: '#ffeb3b'
  }

  // Save to storage
  await storage.save(highlight)

  // Add to local array
  highlights.push(highlight)

  // Render the highlight
  renderHighlight(currentSelection.range, highlight.id)

  // Update UI
  updateHighlightsList()
  updateStats()

  // Clear selection and tooltip
  window.getSelection().removeAllRanges()
  removeTooltip()
}

/**
 * Renders a highlight on the page
 */
function renderHighlight(range, highlightId) {
  try {
    // Check if it's a simple selection (same container)
    if (range.startContainer === range.endContainer) {
      const mark = document.createElement('mark')
      mark.className = 'highlight'
      mark.dataset.highlightId = highlightId
      mark.style.backgroundColor = '#ffeb3b'
      mark.style.padding = '2px 0'
      range.surroundContents(mark)
      console.log('✅ Simple highlight rendered')
      return
    }

    // Cross-element selection - use a more robust approach
    console.log('⚠️ Cross-element selection detected, using advanced wrapping')

    // Get all text nodes in the range
    const textNodes = getTextNodesInRange(range)

    if (textNodes.length === 0) {
      console.error('No text nodes found in range')
      return
    }

    // Wrap each text node segment
    textNodes.forEach((nodeInfo, index) => {
      const mark = document.createElement('mark')
      mark.className = 'highlight'
      mark.dataset.highlightId = highlightId
      mark.dataset.highlightPart = index
      mark.style.backgroundColor = '#ffeb3b'
      mark.style.padding = '2px 0'

      const nodeRange = document.createRange()
      nodeRange.selectNodeContents(nodeInfo.node)

      // Adjust start/end if this is the first/last node
      if (nodeInfo.isFirst) {
        nodeRange.setStart(nodeInfo.node, nodeInfo.startOffset)
      }
      if (nodeInfo.isLast) {
        nodeRange.setEnd(nodeInfo.node, nodeInfo.endOffset)
      }

      try {
        nodeRange.surroundContents(mark)
      } catch (e) {
        console.warn('Could not wrap text node:', e.message)
      }
    })

    console.log(`Cross-element highlight created with ${textNodes.length} parts`)
  } catch (error) {
    console.error('Failed to render highlight:', error)
  }
}

/**
 * Gets all text nodes within a range with their offsets
 * Firefox-compatible implementation
 */
function getTextNodesInRange(range) {
  const textNodes = []

  // Firefox requires filter to be a function, not an object
  const filterFunction = function(node) {
    // Skip empty text nodes
    if (!node.textContent || node.textContent.trim().length === 0) {
      return NodeFilter.FILTER_REJECT
    }

    // Check if this node is within our range
    const nodeRange = document.createRange()
    nodeRange.selectNodeContents(node)

    try {
      // Check if ranges intersect
      const startCompare = range.compareBoundaryPoints(Range.START_TO_END, nodeRange)
      const endCompare = range.compareBoundaryPoints(Range.END_TO_START, nodeRange)

      // If our range ends before node starts, or starts after node ends, reject
      if (startCompare <= 0 || endCompare >= 0) {
        return NodeFilter.FILTER_REJECT
      }

      return NodeFilter.FILTER_ACCEPT
    } catch (e) {
      // If comparison fails, try a simpler check
      return NodeFilter.FILTER_ACCEPT
    }
  }

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    filterFunction // Plain function for Firefox compatibility
  )

  let node
  while (node = walker.nextNode()) {
    const isFirst = node === range.startContainer
    const isLast = node === range.endContainer

    textNodes.push({
      node: node,
      isFirst: isFirst,
      isLast: isLast,
      startOffset: isFirst ? range.startOffset : 0,
      endOffset: isLast ? range.endOffset : node.textContent.length
    })
  }

  console.log(`Found ${textNodes.length} text nodes in range`)

  // Fallback: if no nodes found, try manual traversal
  if (textNodes.length === 0) {
    console.log('TreeWalker found nothing, using fallback method')
    return getTextNodesFallback(range)
  }

  return textNodes
}

/**
 * Fallback method to find text nodes using manual traversal
 */
function getTextNodesFallback(range) {
  const textNodes = []
  const startContainer = range.startContainer
  const endContainer = range.endContainer

  // Simple case: same container
  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    return [{
      node: startContainer,
      isFirst: true,
      isLast: true,
      startOffset: range.startOffset,
      endOffset: range.endOffset
    }]
  }

  // Find all text nodes between start and end
  const allTextNodes = []
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null // No filter - accept all
  )

  let node
  let foundStart = false
  while (node = walker.nextNode()) {
    if (node === startContainer || node.contains(startContainer)) {
      foundStart = true
    }

    if (foundStart) {
      if (node.textContent.trim().length > 0) {
        const isFirst = node === startContainer
        const isLast = node === endContainer

        allTextNodes.push({
          node: node,
          isFirst: isFirst,
          isLast: isLast,
          startOffset: isFirst ? range.startOffset : 0,
          endOffset: isLast ? range.endOffset : node.textContent.length
        })
      }

      if (node === endContainer || node.contains(endContainer)) {
        break
      }
    }
  }

  console.log(`Fallback found ${allTextNodes.length} text nodes`)
  return allTextNodes
}

/**
 * Finds and renders all saved highlights
 */
function renderAllHighlights() {
  const content = document.getElementById('content')
  const text = content.textContent
  const normalizedText = normalizeText(text)

  highlights.forEach(highlight => {
    // Simple matching for demo - in production, would use more sophisticated matching
    const index = normalizedText.indexOf(highlight.normalizedText)

    if (index !== -1) {
      // For demo, we'll mark the text by wrapping it
      // In production, would use the prefix/suffix validation
      console.log(`Found highlight: "${highlight.text.substring(0, 30)}..."`)
    }
  })
}

/**
 * Updates the highlights list in the sidebar
 */
function updateHighlightsList() {
  const listContainer = document.getElementById('highlights-list')
  const countElement = document.getElementById('highlight-count')

  if (highlights.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
        <p>No highlights yet.<br>Select some text to get started!</p>
      </div>
    `
    countElement.textContent = '0'
    return
  }

  countElement.textContent = highlights.length

  listContainer.innerHTML = highlights
    .map((highlight, index) => {
      const date = new Date(highlight.createdAt).toLocaleDateString()
      const preview = highlight.text.length > 100
        ? highlight.text.substring(0, 100) + '...'
        : highlight.text

      return `
        <div class="highlight-item" onclick="scrollToHighlight('${highlight.id}')">
          <div class="highlight-item-text">"${preview}"</div>
          <div class="highlight-item-meta">
            <span>${date} • ${highlight.text.length} chars</span>
            <div class="highlight-item-actions">
              <button class="btn-small" onclick="event.stopPropagation(); showHighlightDetails('${highlight.id}')" title="Details">
                ℹ️
              </button>
              <button class="btn-small btn-danger" onclick="event.stopPropagation(); removeHighlight('${highlight.id}')" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `
    })
    .join('')
}

/**
 * Updates statistics
 */
function updateStats() {
  document.getElementById('total-highlights').textContent = highlights.length

  const totalWords = highlights.reduce((sum, h) => sum + h.text.split(/\s+/).length, 0)
  document.getElementById('total-words').textContent = totalWords

  const totalChars = highlights.reduce((sum, h) => sum + h.text.length, 0)
  document.getElementById('total-chars').textContent = totalChars
}

/**
 * Removes a highlight
 */
async function removeHighlight(id) {
  // Remove from storage
  await storage.remove(id)

  // Remove from local array
  highlights = highlights.filter(h => h.id !== id)

  // Remove from DOM
  const mark = document.querySelector(`mark[data-highlight-id="${id}"]`)
  if (mark) {
    const parent = mark.parentNode
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    mark.remove()
  }

  // Update UI
  updateHighlightsList()
  updateStats()
}

/**
 * Clears all highlights
 */
async function clearAllHighlights() {
  if (!confirm('Are you sure you want to clear all highlights?')) {
    return
  }

  // Clear storage
  await storage.clear()

  // Clear local array
  highlights = []

  // Remove all marks from DOM
  document.querySelectorAll('mark.highlight').forEach(mark => {
    const parent = mark.parentNode
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    mark.remove()
  })

  // Update UI
  updateHighlightsList()
  updateStats()
}

/**
 * Scrolls to a highlight
 */
function scrollToHighlight(id) {
  const mark = document.querySelector(`mark[data-highlight-id="${id}"]`)
  if (mark) {
    mark.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Animate highlight
    mark.style.transition = 'background 0.3s'
    mark.style.background = '#fdd835'
    setTimeout(() => {
      mark.style.background = '#ffeb3b'
    }, 300)
  }
}

/**
 * Shows highlight details
 */
function showHighlightDetails(id) {
  const highlight = highlights.find(h => h.id === id)
  if (!highlight) return

  const normalized = highlight.normalizedText
  const original = highlight.text
  const isSame = normalized === original.toLowerCase()

  alert(`
📝 Highlight Details

Text: "${highlight.text}"

Normalized: "${highlight.normalizedText}"
${!isSame ? '(Text was normalized for matching)' : '(No normalization needed)'}

Prefix: "${highlight.prefix}"
Suffix: "${highlight.suffix}"

Cross-element: ${highlight.isCrossElement ? 'Yes ✅' : 'No'}
Created: ${new Date(highlight.createdAt).toLocaleString()}
Characters: ${highlight.text.length}
Words: ${highlight.text.split(/\s+/).length}
  `)
}

// ============================================================================
// Event Listeners
// ============================================================================

// Listen for text selection
document.addEventListener('mouseup', (e) => {
  // Small delay to ensure selection is complete
  setTimeout(() => {
    const selection = window.getSelection()

    // Check if we have a selection
    if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
      removeTooltip()
      return
    }

    // Only show tooltip for selections in the content area
    const contentArea = document.getElementById('content')
    if (!selection.anchorNode || !contentArea.contains(selection.anchorNode)) {
      removeTooltip()
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const x = rect.left + (rect.width / 2) + window.scrollX
    const y = rect.top + window.scrollY

    showTooltip(x, y)
  }, 10)
})

// Click outside to remove tooltip
document.addEventListener('mousedown', (e) => {
  if (tooltip && !tooltip.contains(e.target)) {
    removeTooltip()
  }
})

// Make functions globally available
window.handleHighlightClick = handleHighlightClick
window.removeHighlight = removeHighlight
window.clearAllHighlights = clearAllHighlights
window.scrollToHighlight = scrollToHighlight
window.showHighlightDetails = showHighlightDetails

// ============================================================================
// Initialize
// ============================================================================

async function init() {
  console.log('Flowmark Demo initialized')
  console.log('Using inline implementation of @spranclabs/flowmark')

  highlights = await storage.load()
  console.log(`Loaded ${highlights.length} highlights from LocalStorage`)

  renderAllHighlights()
  updateHighlightsList()
  updateStats()

  console.log('Demo ready. Select text in the reading content to highlight.')
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
