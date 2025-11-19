import { BaseStorageAdapter } from './base'
import type { StoredHighlight } from '../types'

/**
 * LocalStorage adapter for persisting highlights in the browser
 *
 * Suitable for web pages and iframe embeddings
 */
export class LocalStorageAdapter extends BaseStorageAdapter {
  protected storageKey: string

  constructor(storageKey = 'text-annotator-highlights') {
    super()
    this.storageKey = storageKey
  }

  async load(): Promise<StoredHighlight[]> {
    try {
      const data = localStorage.getItem(this.storageKey)

      if (!data) {
        return []
      }

      const parsed = JSON.parse(data)

      if (!Array.isArray(parsed)) {
        console.warn('Invalid highlights data in localStorage, expected array')
        return []
      }

      return parsed.filter((h) => this.validateHighlight(h))
    } catch (error) {
      console.error('Failed to load highlights from localStorage:', error)
      return []
    }
  }

  async save(highlight: StoredHighlight): Promise<void> {
    if (!this.validateHighlight(highlight)) {
      throw new Error('Invalid highlight data')
    }

    const highlights = await this.load()
    highlights.push(highlight)
    localStorage.setItem(this.storageKey, JSON.stringify(highlights))
  }

  async update(id: string, data: Partial<StoredHighlight>): Promise<void> {
    const highlights = await this.load()
    const index = highlights.findIndex((h) => h.id === id)

    if (index === -1) {
      throw new Error(`Highlight with id ${id} not found`)
    }

    highlights[index] = {
      ...highlights[index],
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(this.storageKey, JSON.stringify(highlights))
  }

  async remove(id: string): Promise<void> {
    const highlights = await this.load()
    const filtered = highlights.filter((h) => h.id !== id)

    if (filtered.length === highlights.length) {
      throw new Error(`Highlight with id ${id} not found`)
    }

    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey)
  }
}
