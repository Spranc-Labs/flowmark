/**
 * Flowmark React Example
 *
 * This example shows how to integrate Flowmark into a React application.
 * Features:
 * - Proper initialization and cleanup with useEffect
 * - TypeScript types
 * - Custom backend storage adapter
 * - Highlight management UI
 */

import { useEffect, useRef, useState } from 'react'
import { Highlighter, type StorageAdapter, type StoredHighlight } from '@spranclabs/flowmark'

// Example: Custom backend storage adapter
class BackendStorageAdapter implements StorageAdapter {
  private baseUrl: string

  constructor(baseUrl = '/api/highlights') {
    this.baseUrl = baseUrl
  }

  async load(): Promise<StoredHighlight[]> {
    const response = await fetch(`${this.baseUrl}?page_url=${encodeURIComponent(window.location.href)}`)
    if (!response.ok) throw new Error('Failed to load highlights')
    return response.json()
  }

  async save(highlight: StoredHighlight): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...highlight,
        page_url: window.location.href
      })
    })
    if (!response.ok) throw new Error('Failed to save highlight')
  }

  async update(id: string, data: Partial<StoredHighlight>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update highlight')
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to remove highlight')
  }

  async clear(): Promise<void> {
    const response = await fetch(`${this.baseUrl}?page_url=${encodeURIComponent(window.location.href)}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to clear highlights')
  }
}

interface ArticleWithHighlightsProps {
  articleId: string
  title: string
  content: string
}

export function ArticleWithHighlights({ articleId, title, content }: ArticleWithHighlightsProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const highlighterRef = useRef<Highlighter | null>(null)
  const [highlightCount, setHighlightCount] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // Initialize Flowmark on mount
  useEffect(() => {
    if (!contentRef.current) return

    const storage = new BackendStorageAdapter('/api/highlights')

    const highlighter = new Highlighter(contentRef.current, {
      storage: storage,
      defaultColor: 'rgba(253, 224, 71, 0.4)', // Yellow
      enableCrossElement: true,
      showSelectionUI: true,

      // Handle highlight clicks
      onHighlightClick: (highlightId, event) => {
        const confirmed = window.confirm('Delete this highlight?')
        if (confirmed) {
          highlighter.removeHighlight(highlightId).catch(err => {
            console.error('Failed to remove highlight:', err)
            alert('Failed to delete highlight')
          })
        }
      },

      // Track highlights for UI updates
      onHighlight: (highlight) => {
        console.log('✅ Highlight created:', highlight.id)
        setHighlightCount(prev => prev + 1)
      },

      onRemove: (highlightId) => {
        console.log('🗑️ Highlight removed:', highlightId)
        setHighlightCount(prev => Math.max(0, prev - 1))
      }
    })

    // Initialize (async)
    highlighter.init()
      .then(() => {
        console.log('✅ Flowmark initialized')
        highlighterRef.current = highlighter
        setIsReady(true)
      })
      .catch(err => {
        console.error('❌ Failed to initialize Flowmark:', err)
      })

    // Cleanup on unmount
    return () => {
      if (highlighterRef.current) {
        highlighterRef.current.destroy()
        highlighterRef.current = null
        console.log('🧹 Flowmark destroyed')
      }
    }
  }, [articleId]) // Re-initialize if articleId changes

  // Clear all highlights
  const handleClearAll = async () => {
    if (!highlighterRef.current) return

    const confirmed = window.confirm('Remove all highlights from this article?')
    if (!confirmed) return

    try {
      const storage = highlighterRef.current.storage
      await storage.clear()

      // Reload to show cleared state
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear highlights:', error)
      alert('Failed to clear highlights')
    }
  }

  return (
    <div className="article-container">
      {/* Header with controls */}
      <header className="article-header">
        <h1>{title}</h1>
        <div className="controls">
          <span className="highlight-count">
            {highlightCount} highlight{highlightCount !== 1 ? 's' : ''}
          </span>
          {isReady && (
            <button onClick={handleClearAll} className="clear-btn">
              Clear All
            </button>
          )}
        </div>
      </header>

      {/* Article content (highlightable) */}
      <article ref={contentRef} className="article-content">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      {/* Instructions */}
      <footer className="article-footer">
        <p>
          <strong>How to use:</strong> Select any text to create a highlight.
          Click on highlighted text to delete it.
        </p>
      </footer>
    </div>
  )
}

// Example CSS (can be in a separate file)
const styles = `
  .article-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .article-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
  }

  .article-header h1 {
    margin: 0;
    color: #1f2937;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .highlight-count {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }

  .clear-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .clear-btn:hover {
    background: #dc2626;
  }

  .article-content {
    line-height: 1.8;
    font-size: 18px;
    color: #374151;
  }

  .article-content mark.highlight {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .article-content mark.highlight:hover {
    opacity: 0.7;
  }

  .article-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
  }
`

// Usage in your app:
/*
import { ArticleWithHighlights } from './components/ArticleWithHighlights'

function App() {
  return (
    <ArticleWithHighlights
      articleId="123"
      title="My Article"
      content="<p>Article content here...</p>"
    />
  )
}
*/
