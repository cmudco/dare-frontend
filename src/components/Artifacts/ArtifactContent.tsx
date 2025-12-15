import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import type { ArtifactStatus, ArtifactType } from '@/redux/types/artifact'

interface ArtifactContentProps {
  content: string
  outline: string
  artifactType: ArtifactType
  language?: string
  status: ArtifactStatus
}

export interface ArtifactContentRef {
  scrollToSection: (sectionIndex: number) => void
}

const ArtifactContent = forwardRef<ArtifactContentRef, ArtifactContentProps>(
  ({ content, outline, artifactType, language, status }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const lastContentLength = useRef(0)

    // Parse outline sections for matching
    const sectionTitles = useMemo(() => {
      if (!outline) return []
      return outline
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          // Remove number prefix and extract title
          const withoutNumber = line.replace(/^\d+\.\s*/, '')
          const dashIndex = withoutNumber.indexOf(' - ')
          return dashIndex > 0
            ? withoutNumber.substring(0, dashIndex).trim()
            : withoutNumber.trim()
        })
    }, [outline])

    // Expose scrollToSection method to parent
    useImperativeHandle(ref, () => ({
      scrollToSection: (sectionIndex: number) => {
        // Try to find heading by matching outline section title
        const sectionTitle = sectionTitles[sectionIndex]

        if (sectionTitle && contentRef.current) {
          // Find all headings in the rendered content
          const headings = contentRef.current.querySelectorAll('h1, h2, h3')
          const normalizedTitle = sectionTitle.toLowerCase()

          // Find best matching heading
          let bestMatch: Element | null = null
          for (const heading of headings) {
            const headingText = heading.textContent?.toLowerCase() || ''
            if (
              headingText.includes(normalizedTitle) ||
              normalizedTitle.includes(headingText.replace(/^\d+[.:]\s*/, ''))
            ) {
              bestMatch = heading
              break
            }
          }

          if (bestMatch) {
            bestMatch.scrollIntoView({ behavior: 'smooth', block: 'start' })
            return
          }
        }

        // Fallback to index-based ID
        const sectionId = `artifact-section-${sectionIndex}`
        const element = document.getElementById(sectionId)
        if (element && contentRef.current) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
    }))

    // Auto-scroll to bottom when new content is added during generation
    useEffect(() => {
      if (
        status === 'generating' &&
        content.length > lastContentLength.current
      ) {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight
        }
      }
      lastContentLength.current = content.length
    }, [content, status])

    // Counter ref for tracking h2 sections during markdown rendering
    // This is used by the h2 component to assign unique IDs
    const h2CounterRef = useRef(0)

    // Create markdown components - memoized but counter is tracked via ref
    const markdownComponents = useMemo(() => {
      return {
        code({
          className,
          children,
          ...props
        }: {
          className?: string
          children?: React.ReactNode
        }) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')

          // Check if this is inline code
          const isInline = !className && !match

          if (isInline) {
            return (
              <code
                className='rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800'
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <SyntaxHighlighter
              style={oneDark}
              language={match ? match[1] : 'text'}
              customStyle={{
                margin: '1rem 0',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
              showLineNumbers={codeString.includes('\n')}
            >
              {codeString}
            </SyntaxHighlighter>
          )
        },
        // Custom heading rendering with section IDs
        h1: ({ children }: { children?: React.ReactNode }) => (
          <h1 className='mb-4 mt-6 border-b border-gray-200 pb-2 text-2xl font-bold dark:border-gray-700'>
            {children}
          </h1>
        ),
        h2: ({ children }: { children?: React.ReactNode }) => {
          // Use the current counter value and increment it
          const sectionIndex = h2CounterRef.current
          h2CounterRef.current++
          return (
            <h2
              id={`artifact-section-${sectionIndex}`}
              className='mb-3 mt-5 scroll-mt-4 text-xl font-semibold text-gray-900 dark:text-white'
            >
              {children}
            </h2>
          )
        },
        h3: ({ children }: { children?: React.ReactNode }) => (
          <h3 className='mb-2 mt-4 text-lg font-medium text-gray-800 dark:text-gray-200'>
            {children}
          </h3>
        ),
        p: ({ children }: { children?: React.ReactNode }) => (
          <p className='mb-3 leading-relaxed text-gray-700 dark:text-gray-300'>
            {children}
          </p>
        ),
        ul: ({ children }: { children?: React.ReactNode }) => (
          <ul className='mb-3 list-disc space-y-1 pl-5'>{children}</ul>
        ),
        ol: ({ children }: { children?: React.ReactNode }) => (
          <ol className='mb-3 list-decimal space-y-1 pl-5'>{children}</ol>
        ),
        li: ({ children }: { children?: React.ReactNode }) => (
          <li className='text-gray-700 dark:text-gray-300'>{children}</li>
        ),
        blockquote: ({ children }: { children?: React.ReactNode }) => (
          <blockquote className='my-3 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400'>
            {children}
          </blockquote>
        ),
        table: ({ children }: { children?: React.ReactNode }) => (
          <div className='my-4 overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              {children}
            </table>
          </div>
        ),
        th: ({ children }: { children?: React.ReactNode }) => (
          <th className='bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white'>
            {children}
          </th>
        ),
        td: ({ children }: { children?: React.ReactNode }) => (
          <td className='border-t border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300'>
            {children}
          </td>
        ),
      }
    }, []) // Empty deps - components are stable

    // Show outline during planning phase
    if (status === 'planning' && outline) {
      return (
        <div className='p-4'>
          <div className='mb-4 flex items-center gap-2'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
            <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
              Creating outline...
            </span>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
            <h3 className='mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Document Outline
            </h3>
            <pre className='whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400'>
              {outline}
            </pre>
          </div>
        </div>
      )
    }

    // Show content with streaming cursor
    if (!content && status === 'generating') {
      return (
        <div className='flex h-full items-center justify-center p-8'>
          <div className='flex items-center gap-3'>
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
            <span className='text-gray-500 dark:text-gray-400'>
              Generating content...
            </span>
          </div>
        </div>
      )
    }

    // Reset counter before each render to ensure section IDs start from 0
    h2CounterRef.current = 0

    return (
      <div ref={contentRef} className='h-full overflow-y-auto p-4'>
        {/* Code artifact */}
        {artifactType === 'code' && language ? (
          <div className='relative'>
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
              showLineNumbers
            >
              {content}
            </SyntaxHighlighter>
            {status === 'generating' && (
              <span className='ml-1 inline-block h-5 w-0.5 animate-pulse bg-blue-500' />
            )}
          </div>
        ) : (
          /* Document/Markdown artifact */
          <div className='prose prose-sm max-w-none dark:prose-invert'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
            {/* Streaming cursor */}
            {status === 'generating' && (
              <span
                className={cn(
                  'ml-1 inline-block h-5 w-0.5 bg-blue-500',
                  'animate-pulse'
                )}
              />
            )}
          </div>
        )}
      </div>
    )
  }
)

ArtifactContent.displayName = 'ArtifactContent'

export default ArtifactContent
