import { describe, it, expect } from 'vitest'
import {
  normalizeText,
  getTextContext,
  findTextPosition,
  validateTextMatch,
  computeSimilarity,
} from './text-processor'

describe('normalizeText', () => {
  describe('smart quotes normalization', () => {
    it('converts double smart quotes to straight quotes', () => {
      expect(normalizeText('\u201Chello\u201D')).toBe('"hello"')
      expect(normalizeText('\u201Ehello\u201F')).toBe('"hello"')
      expect(normalizeText('\u201Chello\u201D')).toBe('"hello"')
    })

    it('converts single smart quotes to straight quotes', () => {
      expect(normalizeText('\u2018hello\u2019')).toBe("'hello'")
      expect(normalizeText('\u201Bhello\u201A')).toBe("'hello'")
    })

    it('handles mixed quote types', () => {
      expect(normalizeText('\u201CIt\u2019s great,\u201D she said.')).toBe(
        '"it\'s great," she said.'
      )
    })
  })

  describe('whitespace normalization', () => {
    it('converts newlines to spaces', () => {
      expect(normalizeText('Hello\nWorld')).toBe('hello world')
      expect(normalizeText('Hello\r\nWorld')).toBe('hello world')
    })

    it('converts tabs to spaces', () => {
      expect(normalizeText('Hello\tWorld')).toBe('hello world')
    })

    it('collapses multiple spaces into one', () => {
      expect(normalizeText('Hello    World')).toBe('hello world')
      expect(normalizeText('Hello  \n\n  World')).toBe('hello world')
    })

    it('trims leading and trailing whitespace by default', () => {
      expect(normalizeText('  Hello World  ')).toBe('hello world')
    })

    it('preserves spacing when option is set', () => {
      expect(normalizeText('  Hello World  ', { preserveSpacing: true })).toBe(
        ' hello world '
      )
    })
  })

  describe('punctuation spacing', () => {
    it('adds exactly one space after periods', () => {
      expect(normalizeText('Hello.World')).toBe('hello. world')
      expect(normalizeText('Hello.  World')).toBe('hello. world')
    })

    it('adds exactly one space after exclamation marks', () => {
      expect(normalizeText('Hello!World')).toBe('hello! world')
    })

    it('adds exactly one space after question marks', () => {
      expect(normalizeText('Hello?World')).toBe('hello? world')
    })

    it('adds exactly one space after commas', () => {
      expect(normalizeText('Hello,World')).toBe('hello, world')
      expect(normalizeText('Hello  ,  World')).toBe('hello, world')
    })

    it('adds exactly one space after semicolons', () => {
      expect(normalizeText('Hello;World')).toBe('hello; world')
    })

    it('adds exactly one space after colons', () => {
      expect(normalizeText('Hello:World')).toBe('hello: world')
    })
  })

  describe('case normalization', () => {
    it('converts to lowercase by default', () => {
      expect(normalizeText('HELLO WORLD')).toBe('hello world')
      expect(normalizeText('HeLLo WoRLd')).toBe('hello world')
    })

    it('preserves case when option is set', () => {
      expect(normalizeText('HELLO WORLD', { preserveCase: true })).toBe(
        'HELLO WORLD'
      )
      expect(normalizeText('HeLLo WoRLd', { preserveCase: true })).toBe(
        'HeLLo WoRLd'
      )
    })
  })

  describe('complex real-world examples', () => {
    it('handles typical web content', () => {
      const input = `This is a test.\n\nIt has multiple   paragraphs,\tand   weird spacing!`
      const expected = 'this is a test. it has multiple paragraphs, and weird spacing!'
      expect(normalizeText(input)).toBe(expected)
    })

    it('handles quotes and punctuation together', () => {
      const input = '"Hello,"  she said.  "How are you?"'
      const expected = '"hello," she said. "how are you?"'
      expect(normalizeText(input)).toBe(expected)
    })

    it('handles empty string', () => {
      expect(normalizeText('')).toBe('')
    })

    it('handles whitespace-only string', () => {
      expect(normalizeText('   \n\t  ')).toBe('')
    })
  })
})

describe('getTextContext', () => {
  it('extracts prefix and suffix from a range', () => {
    // Create a simple DOM structure
    const div = document.createElement('div')
    div.textContent = 'The quick brown fox jumps over the lazy dog'
    document.body.appendChild(div)

    const range = document.createRange()
    range.setStart(div.firstChild!, 10) // "brown"
    range.setEnd(div.firstChild!, 15)

    const { prefix, suffix } = getTextContext(range, 10, 10)

    expect(prefix).toBe('The quick ')
    expect(suffix).toBe(' fox jumps')

    document.body.removeChild(div)
  })

  it('handles ranges at the start of text', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello world'
    document.body.appendChild(div)

    const range = document.createRange()
    range.setStart(div.firstChild!, 0)
    range.setEnd(div.firstChild!, 5)

    const { prefix, suffix } = getTextContext(range, 10, 10)

    expect(prefix).toBe('')
    expect(suffix).toBe(' world')

    document.body.removeChild(div)
  })

  it('handles ranges at the end of text', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello world'
    document.body.appendChild(div)

    const range = document.createRange()
    range.setStart(div.firstChild!, 6)
    range.setEnd(div.firstChild!, 11)

    const { prefix, suffix } = getTextContext(range, 10, 10)

    expect(prefix).toBe('Hello ')
    expect(suffix).toBe('')

    document.body.removeChild(div)
  })
})

describe('findTextPosition', () => {
  it('finds text in a string', () => {
    const text = 'The quick brown fox jumps'
    const result = findTextPosition(text, 'brown')

    expect(result).toEqual({ startOffset: 10, endOffset: 15 })
  })

  it('handles case-insensitive matching', () => {
    const text = 'The Quick Brown Fox'
    const result = findTextPosition(text, 'QUICK')

    expect(result).not.toBeNull()
    expect(result?.startOffset).toBeGreaterThanOrEqual(0)
  })

  it('returns null when text is not found', () => {
    const text = 'Hello world'
    const result = findTextPosition(text, 'goodbye')

    expect(result).toBeNull()
  })

  it('finds text with start offset', () => {
    const text = 'hello world, hello universe'
    const result = findTextPosition(text, 'hello', 10)

    expect(result).not.toBeNull()
    expect(result!.startOffset).toBeGreaterThan(10)
  })

  it('handles text with special characters', () => {
    const text = 'Price: $19.99'
    const result = findTextPosition(text, '$19.99')

    expect(result).not.toBeNull()
  })
})

describe('validateTextMatch', () => {
  it('validates correct match with context', () => {
    const text = 'The quick brown fox jumps'
    const result = validateTextMatch(text, 'brown', 'quick ', ' fox')

    expect(result).toBe(true)
  })

  it('rejects match with incorrect prefix', () => {
    const text = 'The quick brown fox jumps'
    const result = validateTextMatch(text, 'brown', 'slow ', ' fox')

    expect(result).toBe(false)
  })

  it('rejects match with incorrect suffix', () => {
    const text = 'The quick brown fox jumps'
    const result = validateTextMatch(text, 'brown', 'quick ', ' cat')

    expect(result).toBe(false)
  })

  it('handles empty prefix/suffix', () => {
    const text = 'Hello world'
    const result = validateTextMatch(text, 'Hello', '', ' world')

    expect(result).toBe(true)
  })

  it('handles normalized text differences', () => {
    const text = 'The  quick   brown\nfox'
    const result = validateTextMatch(text, 'brown', 'quick ', ' fox')

    expect(result).toBe(true)
  })
})

describe('computeSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(computeSimilarity('hello', 'hello')).toBe(1)
  })

  it('returns 1 for strings that normalize to the same', () => {
    expect(computeSimilarity('Hello', 'hello')).toBe(1)
    expect(computeSimilarity('hello  world', 'hello world')).toBe(1)
  })

  it('returns high similarity for similar strings', () => {
    const similarity = computeSimilarity('hello', 'hallo')
    expect(similarity).toBeGreaterThan(0.7)
    expect(similarity).toBeLessThan(1)
  })

  it('returns low similarity for different strings', () => {
    const similarity = computeSimilarity('hello', 'world')
    expect(similarity).toBeLessThan(0.5)
  })

  it('returns 0 for completely different strings', () => {
    const similarity = computeSimilarity('abc', 'xyz')
    expect(similarity).toBe(0)
  })

  it('handles empty strings', () => {
    expect(computeSimilarity('', '')).toBe(1)
    expect(computeSimilarity('hello', '')).toBeLessThan(1)
  })

  it('handles strings of different lengths', () => {
    const similarity = computeSimilarity('hello', 'hello world')
    expect(similarity).toBeGreaterThan(0.4)
    expect(similarity).toBeLessThan(0.7)
  })
})
