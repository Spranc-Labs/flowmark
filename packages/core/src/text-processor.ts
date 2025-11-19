import type { NormalizeOptions } from './types'

/**
 * Normalizes text for consistent matching across different text formats
 *
 * This function handles:
 * - Smart quotes → straight quotes (", ')
 * - Whitespace normalization (newlines, tabs, multiple spaces → single space)
 * - Punctuation spacing standardization
 *
 * @param text - The text to normalize
 * @param options - Normalization options
 * @returns Normalized text
 *
 * @example
 * ```typescript
 * normalizeText('"Hello  world"') // => '"Hello world"'
 * normalizeText('Hello\n\nWorld') // => 'Hello World'
 * normalizeText('test,no space') // => 'test, no space'
 * ```
 */
export function normalizeText(
  text: string,
  options: NormalizeOptions = {}
): string {
  const { preserveSpacing = false, preserveCase = false } = options

  let normalized = text
    // Convert ALL quote variations to straight quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // All double quote variants
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // All single quote variants
    // Normalize whitespace (newlines, tabs, multiple spaces → single space)
    .replace(/[\n\r\t]+/g, ' ')
    // Normalize punctuation spacing - exactly one space after sentence endings (but not before quotes)
    .replace(/([.!?])\s*(?!["'])/g, '$1 ') // Exactly one space after . ! ? (unless followed by quote)
    .replace(/([.!?])\s+(["'])/g, '$1 $2') // One space after . ! ? before quote
    .replace(/\s*([,;:])\s*(?!["'])/g, '$1 ') // Exactly one space after , ; : (unless followed by quote)
    .replace(/([,;:])(["'])/g, '$1$2') // No space between , ; : and quote
    .replace(/\s+/g, ' ') // Collapse any remaining multiple spaces

  // Only trim if we're not preserving spacing between text nodes
  if (!preserveSpacing) {
    normalized = normalized.trim()
  }

  // Convert to lowercase if not preserving case
  if (!preserveCase) {
    normalized = normalized.toLowerCase()
  }

  return normalized
}

/**
 * Gets text context before and after a Range for validation
 *
 * @param range - DOM Range object
 * @param charsBefore - Number of characters to extract before the range
 * @param charsAfter - Number of characters to extract after the range
 * @returns Object with prefix and suffix text
 *
 * @example
 * ```typescript
 * const range = window.getSelection()?.getRangeAt(0)
 * const { prefix, suffix } = getTextContext(range, 32, 32)
 * // prefix: "...text before selection"
 * // suffix: "text after selection..."
 * ```
 */
export function getTextContext(
  range: Range,
  charsBefore = 32,
  charsAfter = 32
): { prefix: string; suffix: string } {
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
 * Extracts text from a DOM Range, handling cross-element selections
 *
 * @param range - DOM Range object
 * @returns Extracted text with proper spacing
 *
 * @example
 * ```typescript
 * const range = window.getSelection()?.getRangeAt(0)
 * const text = extractTextFromRange(range)
 * ```
 */
export function extractTextFromRange(range: Range): string {
  if (!range) return ''

  // For simple ranges, use toString()
  if (range.startContainer === range.endContainer) {
    return range.toString()
  }

  // For cross-element ranges, extract text more carefully
  const contents = range.cloneContents()
  const textNodes: string[] = []

  // Walk through all text nodes
  const walker = document.createTreeWalker(
    contents,
    NodeFilter.SHOW_TEXT,
    null
  )

  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    if (text.trim()) {
      textNodes.push(text)
    }
  }

  return textNodes.join(' ')
}

/**
 * Finds text position in a normalized string
 *
 * @param haystack - The text to search in
 * @param needle - The text to find
 * @param startOffset - Optional starting offset
 * @returns Start and end offsets, or null if not found
 *
 * @example
 * ```typescript
 * const text = 'Hello world, hello universe'
 * const pos = findTextPosition(text, 'hello', 0)
 * // => { startOffset: 0, endOffset: 5 }
 * ```
 */
export function findTextPosition(
  haystack: string,
  needle: string,
  startOffset = 0
): { startOffset: number; endOffset: number } | null {
  const normalizedHaystack = normalizeText(haystack)
  const normalizedNeedle = normalizeText(needle)

  const index = normalizedHaystack.indexOf(normalizedNeedle, startOffset)

  if (index === -1) {
    return null
  }

  return {
    startOffset: index,
    endOffset: index + normalizedNeedle.length,
  }
}

/**
 * Validates if text matches at a given position with context
 *
 * @param text - The full text to search in
 * @param searchText - The text to find
 * @param prefix - Expected text before the match
 * @param suffix - Expected text after the match
 * @returns True if match is validated
 *
 * @example
 * ```typescript
 * const text = 'The quick brown fox jumps'
 * const valid = validateTextMatch(text, 'brown', 'quick ', ' fox')
 * // => true
 * ```
 */
export function validateTextMatch(
  text: string,
  searchText: string,
  prefix: string,
  suffix: string
): boolean {
  const normalizedText = normalizeText(text)
  const normalizedSearch = normalizeText(searchText)
  // Don't trim prefix/suffix as leading/trailing spaces may be significant
  const normalizedPrefix = normalizeText(prefix, { preserveSpacing: true }).trim()
  const normalizedSuffix = normalizeText(suffix, { preserveSpacing: true }).trim()

  const position = findTextPosition(normalizedText, normalizedSearch)

  if (!position) {
    return false
  }

  const { startOffset, endOffset } = position

  // Handle empty prefix/suffix
  if (normalizedPrefix === '' && normalizedSuffix === '') {
    return true // No context to validate
  }

  // Check prefix - extract a bit more to account for spacing differences
  let prefixMatch = true
  if (normalizedPrefix) {
    const prefixStart = Math.max(0, startOffset - normalizedPrefix.length - 5)
    const actualPrefix = normalizedText.substring(prefixStart, startOffset).trim()
    // Check if the actual prefix ends with the expected prefix
    prefixMatch = actualPrefix.endsWith(normalizedPrefix) || actualPrefix === normalizedPrefix
  }

  // Check suffix - extract a bit more to account for spacing differences
  let suffixMatch = true
  if (normalizedSuffix) {
    const suffixEnd = Math.min(
      normalizedText.length,
      endOffset + normalizedSuffix.length + 5
    )
    const actualSuffix = normalizedText.substring(endOffset, suffixEnd).trim()
    // Check if the actual suffix starts with the expected suffix
    suffixMatch = actualSuffix.startsWith(normalizedSuffix) || actualSuffix === normalizedSuffix
  }

  return prefixMatch && suffixMatch
}

/**
 * Computes similarity score between two strings (0-1)
 *
 * Uses Levenshtein distance algorithm
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (1 = identical, 0 = completely different)
 *
 * @example
 * ```typescript
 * computeSimilarity('hello', 'hello') // => 1
 * computeSimilarity('hello', 'hallo') // => 0.8
 * computeSimilarity('hello', 'world') // => 0.2
 * ```
 */
export function computeSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1)
  const s2 = normalizeText(str2)

  if (s1 === s2) return 1

  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 1

  const distance = levenshteinDistance(s1, s2)
  return 1 - distance / maxLen
}

/**
 * Calculates Levenshtein distance between two strings
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length

  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  )

  // Initialize first column and row
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return dp[m][n]
}
