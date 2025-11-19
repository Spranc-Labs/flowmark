import type { StorageAdapter, StoredHighlight } from '../types'

/**
 * Abstract base class for storage adapters
 *
 * Provides common functionality and structure for all storage implementations
 */
export abstract class BaseStorageAdapter implements StorageAdapter {
  protected abstract storageKey: string

  abstract load(): Promise<StoredHighlight[]>
  abstract save(highlight: StoredHighlight): Promise<void>
  abstract update(id: string, data: Partial<StoredHighlight>): Promise<void>
  abstract remove(id: string): Promise<void>
  abstract clear(): Promise<void>

  /**
   * Validates a stored highlight object
   */
  protected validateHighlight(highlight: StoredHighlight): boolean {
    return (
      typeof highlight.id === 'string' &&
      typeof highlight.text === 'string' &&
      typeof highlight.normalizedText === 'string' &&
      typeof highlight.startOffset === 'number' &&
      typeof highlight.endOffset === 'number' &&
      typeof highlight.prefix === 'string' &&
      typeof highlight.suffix === 'string' &&
      typeof highlight.createdAt === 'string' &&
      typeof highlight.isCrossElement === 'boolean'
    )
  }

  /**
   * Generates a unique ID for a highlight
   */
  protected generateId(): string {
    return `highlight_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
