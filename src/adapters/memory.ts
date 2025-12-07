import { BaseStorageAdapter } from './base'
import type { StoredHighlight } from '../types'

/**
 * In-memory storage adapter (for testing or temporary storage)
 *
 * Data is lost on page reload
 */
export class MemoryStorageAdapter extends BaseStorageAdapter {
  protected storageKey = 'memory'
  private highlights: Map<string, StoredHighlight> = new Map()

  async load(): Promise<StoredHighlight[]> {
    return Array.from(this.highlights.values())
  }

  async save(highlight: StoredHighlight): Promise<void> {
    if (!this.validateHighlight(highlight)) {
      throw new Error('Invalid highlight data')
    }

    this.highlights.set(highlight.id, highlight)
  }

  async update(id: string, data: Partial<StoredHighlight>): Promise<void> {
    const existing = this.highlights.get(id)

    if (!existing) {
      throw new Error(`Highlight with id ${id} not found`)
    }

    const updated: StoredHighlight = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    this.highlights.set(id, updated)
  }

  async remove(id: string): Promise<void> {
    const deleted = this.highlights.delete(id)

    if (!deleted) {
      throw new Error(`Highlight with id ${id} not found`)
    }
  }

  async clear(): Promise<void> {
    this.highlights.clear()
  }

  /**
   * Get count of stored highlights (for testing)
   */
  size(): number {
    return this.highlights.size
  }
}
