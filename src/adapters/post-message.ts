import { BaseStorageAdapter } from './base'
import type { StoredHighlight } from '../types'

/**
 * PostMessage adapter for iframe communication
 *
 * Sends highlights to parent window for storage
 * This is the adapter used in the current HeyHo implementation
 */
export class PostMessageAdapter extends BaseStorageAdapter {
  protected storageKey = 'postmessage'
  private targetWindow: Window
  private targetOrigin: string
  private pendingRequests: Map<
    string,
    { resolve: (value: any) => void; reject: (error: Error) => void }
  > = new Map()

  constructor(targetWindow: Window = window.parent, targetOrigin = '*') {
    super()
    this.targetWindow = targetWindow
    this.targetOrigin = targetOrigin

    // Listen for responses from parent window
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent): void {
    const { type, requestId, data, error } = event.data

    if (!type || !requestId) return

    const pending = this.pendingRequests.get(requestId)

    if (!pending) return

    if (error) {
      pending.reject(new Error(error))
    } else {
      pending.resolve(data)
    }

    this.pendingRequests.delete(requestId)
  }

  private sendRequest(type: string, data?: any): Promise<any> {
    const requestId = this.generateId()

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject })

      this.targetWindow.postMessage(
        {
          type,
          requestId,
          data,
        },
        this.targetOrigin
      )

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          reject(new Error(`Request timeout: ${type}`))
        }
      }, 10000)
    })
  }

  async load(): Promise<StoredHighlight[]> {
    const highlights = await this.sendRequest('load_highlights')
    return Array.isArray(highlights) ? highlights : []
  }

  async save(highlight: StoredHighlight): Promise<void> {
    if (!this.validateHighlight(highlight)) {
      throw new Error('Invalid highlight data')
    }

    await this.sendRequest('save_highlight', highlight)
  }

  async update(id: string, data: Partial<StoredHighlight>): Promise<void> {
    await this.sendRequest('update_highlight', { id, data })
  }

  async remove(id: string): Promise<void> {
    await this.sendRequest('remove_highlight', { id })
  }

  async clear(): Promise<void> {
    await this.sendRequest('clear_highlights')
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this))
    this.pendingRequests.clear()
  }
}
