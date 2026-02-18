import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Code,
} from 'lucide-react'

interface MCPJsonViewerProps {
  data: unknown
}

interface McpContentItem {
  type: string
  text?: string
}

interface McpResultWithContent {
  content?: McpContentItem[]
}

interface McpResponseData {
  success?: boolean
  result?: McpResultWithContent | unknown
}

/**
 * MCPJsonViewer - Smart display for MCP responses
 * Renders markdown/text content when detected, falls back to JSON display
 */
const MCPJsonViewer = ({ data }: MCPJsonViewerProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'auto' | 'json'>('auto')
  const [copied, setCopied] = useState(false)

  // Extract text content from MCP response structure
  const textContent = useMemo(() => {
    try {
      const response = data as McpResponseData
      const result = response?.result as McpResultWithContent

      if (result?.content && Array.isArray(result.content)) {
        const textItems = result.content
          .filter(
            (item): item is McpContentItem =>
              item.type === 'text' && !!item.text
          )
          .map((item) => item.text)

        if (textItems.length > 0) {
          return textItems.join('\n\n')
        }
      }
    } catch {
      // Not the expected structure, fall back to JSON
    }
    return null
  }, [data])

  const formattedJson = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }, [data])

  const handleCopy = () => {
    const copyText =
      viewMode === 'auto' && textContent ? textContent : formattedJson
    navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasTextContent = textContent !== null
  const showTextView = viewMode === 'auto' && hasTextContent

  return (
    <div className='overflow-hidden rounded-lg border bg-muted/30'>
      <div className='flex items-center justify-between border-b bg-muted/50 px-3 py-2'>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
        >
          {collapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          Response
        </button>
        <div className='flex items-center gap-2'>
          {/* View mode toggle - only show if we have text content */}
          {hasTextContent && (
            <div className='flex items-center gap-1 rounded-md border bg-background p-0.5'>
              <button
                onClick={() => setViewMode('auto')}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                  viewMode === 'auto'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title='Formatted view'
              >
                <FileText className='h-3 w-3' />
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                  viewMode === 'json'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title='JSON view'
              >
                <Code className='h-3 w-3' />
              </button>
            </div>
          )}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 text-xs transition-colors ${
              copied
                ? 'text-green-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {copied ? (
              <>
                <Check className='h-3 w-3' />
                Copied
              </>
            ) : (
              <>
                <Copy className='h-3 w-3' />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className='max-h-96 overflow-auto p-4'>
          {showTextView ? (
            <div className='prose prose-sm max-w-none dark:prose-invert'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {textContent}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className='text-sm'>
              <code className='text-foreground'>{formattedJson}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

export default MCPJsonViewer
