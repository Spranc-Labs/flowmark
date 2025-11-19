/**
 * Highlight Restorer Module
 * Restores saved highlights to the DOM by finding text and creating Ranges
 */

import {
  normalizeText,
  findTextPosition,
  validateTextMatch,
  computeSimilarity,
} from './text-processor'
import type { StoredHighlight } from './types'

export interface RestoreResult {
  success: boolean
  range?: Range
  confidence?: number
  error?: string
}

/**
 * Attempts to restore a highlight to the DOM by finding its text
 */
export function restoreHighlight(
  container: HTMLElement,
  highlight: StoredHighlight
): RestoreResult {
  try {
    // Get container text
    const containerText = container.textContent || ''
    const normalizedContainerText = normalizeText(containerText)

    // Try to find the exact text with prefix/suffix validation
    const range = findTextInDOM(container, highlight, normalizedContainerText)

    if (range) {
      return {
        success: true,
        range,
        confidence: 1.0,
      }
    }

    // If exact match failed, try fuzzy matching
    const fuzzyRange = findTextWithFuzzyMatching(
      container,
      highlight,
      normalizedContainerText
    )

    if (fuzzyRange) {
      return {
        success: true,
        range: fuzzyRange.range,
        confidence: fuzzyRange.confidence,
      }
    }

    return {
      success: false,
      error: 'Text not found in container',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Finds text in DOM using exact matching with prefix/suffix validation
 */
function findTextInDOM(
  container: HTMLElement,
  highlight: StoredHighlight,
  normalizedContainerText: string
): Range | null {
  const { normalizedText, prefix, suffix } = highlight

  // Find all possible positions of the text
  let searchStartIndex = 0
  while (searchStartIndex < normalizedContainerText.length) {
    const position = findTextPosition(
      normalizedContainerText,
      normalizedText,
      searchStartIndex
    )

    if (!position) {
      break
    }

    // Validate with prefix and suffix
    const isValid = validateTextMatch(
      normalizedContainerText,
      normalizedText,
      prefix,
      suffix
    )

    if (isValid) {
      // Create a Range from the character offsets
      const range = createRangeFromCharacterOffsets(
        container,
        position.startOffset,
        position.endOffset
      )

      if (range) {
        return range
      }
    }

    // Try next occurrence
    searchStartIndex = position.endOffset + 1
  }

  return null
}

/**
 * Finds text using fuzzy matching when exact match fails
 */
function findTextWithFuzzyMatching(
  container: HTMLElement,
  highlight: StoredHighlight,
  normalizedContainerText: string
): { range: Range; confidence: number } | null {
  const { normalizedText } = highlight
  const threshold = 0.8 // Minimum similarity score

  // Split container text into chunks of similar length
  const targetLength = normalizedText.length
  const chunkSize = targetLength
  const chunkStep = Math.floor(targetLength / 4) // Sliding window

  let bestMatch: { range: Range; confidence: number } | null = null

  for (
    let i = 0;
    i < normalizedContainerText.length - chunkSize;
    i += chunkStep
  ) {
    const chunk = normalizedContainerText.substring(i, i + chunkSize)
    const similarity = computeSimilarity(normalizedText, chunk)

    if (similarity >= threshold) {
      const range = createRangeFromCharacterOffsets(container, i, i + chunkSize)

      if (range) {
        if (!bestMatch || similarity > bestMatch.confidence) {
          bestMatch = {
            range,
            confidence: similarity,
          }
        }
      }
    }
  }

  return bestMatch
}

/**
 * Creates a DOM Range from character offsets in the container's text content
 */
export function createRangeFromCharacterOffsets(
  container: HTMLElement,
  startOffset: number,
  endOffset: number
): Range | null {
  try {
    // Get all text nodes in the container
    const textNodes: { node: Node; offset: number; length: number }[] = []
    let currentOffset = 0

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    )

    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node.textContent || ''
      const normalizedLength = normalizeText(text).length

      if (normalizedLength > 0) {
        textNodes.push({
          node,
          offset: currentOffset,
          length: normalizedLength,
        })
        currentOffset += normalizedLength
      }
    }

    // Find start and end text nodes
    let startNode: Node | null = null
    let startNodeOffset = 0
    let endNode: Node | null = null
    let endNodeOffset = 0

    for (const { node, offset, length } of textNodes) {
      // Find start node
      if (!startNode && startOffset >= offset && startOffset < offset + length) {
        startNode = node
        startNodeOffset = startOffset - offset
      }

      // Find end node
      if (!endNode && endOffset > offset && endOffset <= offset + length) {
        endNode = node
        endNodeOffset = endOffset - offset
      }

      if (startNode && endNode) {
        break
      }
    }

    if (!startNode || !endNode) {
      return null
    }

    // Create the range
    const range = document.createRange()
    range.setStart(startNode, startNodeOffset)
    range.setEnd(endNode, endNodeOffset)

    return range
  } catch (error) {
    console.error('Failed to create range from offsets:', error)
    return null
  }
}

/**
 * Validates if a restored highlight matches the expected context
 */
export function validateRestoredHighlight(
  range: Range,
  highlight: StoredHighlight
): boolean {
  try {
    const rangeText = range.toString()
    const normalizedRangeText = normalizeText(rangeText)

    // Check if text matches
    const textSimilarity = computeSimilarity(
      normalizedRangeText,
      highlight.normalizedText
    )

    // Require at least 90% similarity
    return textSimilarity >= 0.9
  } catch {
    return false
  }
}

/**
 * Batch restores multiple highlights
 */
export function restoreHighlights(
  container: HTMLElement,
  highlights: StoredHighlight[]
): Map<string, RestoreResult> {
  const results = new Map<string, RestoreResult>()

  for (const highlight of highlights) {
    const result = restoreHighlight(container, highlight)
    results.set(highlight.id, result)
  }

  return results
}
