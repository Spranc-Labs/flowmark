/**
 * Selection Manager Module
 * Handles browser text selection capture and validation
 */

import { getTextContext, normalizeText } from './text-processor'
import type { SelectionData } from './types'

/**
 * Captures the current browser selection and returns structured data
 * Returns null if selection is empty or invalid
 */
export function captureSelection(container?: HTMLElement): SelectionData | null {
  const selection = window.getSelection()

  if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
    return null
  }

  // Validate selection is within container if provided
  if (container && selection.anchorNode) {
    if (!container.contains(selection.anchorNode) ||
        !container.contains(selection.focusNode)) {
      return null
    }
  }

  const range = selection.getRangeAt(0)
  const text = selection.toString()

  // Get surrounding context for validation
  const { prefix, suffix } = getTextContext(range, 32, 32)

  // Detect cross-element selection
  const isCrossElement = range.startContainer !== range.endContainer

  return {
    text,
    normalizedText: normalizeText(text),
    range: range.cloneRange(), // Clone to prevent mutation
    startContainer: range.startContainer,
    endContainer: range.endContainer,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    prefix: normalizeText(prefix),
    suffix: normalizeText(suffix),
    isCrossElement,
  }
}

/**
 * Validates if a selection is suitable for highlighting
 */
export function validateSelection(
  selection: Selection | null,
  container?: HTMLElement
): boolean {
  if (!selection || selection.isCollapsed) {
    return false
  }

  const text = selection.toString().trim()
  if (text.length === 0) {
    return false
  }

  // Check if selection is within container
  if (container) {
    const anchorNode = selection.anchorNode
    const focusNode = selection.focusNode

    if (!anchorNode || !focusNode) {
      return false
    }

    if (!container.contains(anchorNode) || !container.contains(focusNode)) {
      return false
    }
  }

  return true
}

/**
 * Clears the current browser selection
 */
export function clearSelection(): void {
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }
}

/**
 * Gets the bounding rectangle for a selection/range
 * Useful for positioning UI elements near the selection
 */
export function getSelectionBoundingRect(
  selection?: Selection | null
): DOMRect | null {
  const sel = selection || window.getSelection()

  if (!sel || sel.rangeCount === 0) {
    return null
  }

  const range = sel.getRangeAt(0)
  return range.getBoundingClientRect()
}

/**
 * Checks if a click event occurred outside of the current selection
 */
export function isClickOutsideSelection(
  event: MouseEvent,
  selection: Selection | null
): boolean {
  if (!selection || selection.rangeCount === 0) {
    return true
  }

  const range = selection.getRangeAt(0)
  const rects = range.getClientRects()

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      return false
    }
  }

  return true
}
