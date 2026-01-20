import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Eye, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

/**
 * Simple Markdown Editor with Edit/Preview toggle.
 * Uses a plain textarea for editing (preserves whitespace/formatting)
 * and ReactMarkdown for preview rendering.
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  placeholder = 'Enter content...',
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  return (
    <div className='overflow-hidden rounded-md border border-border'>
      {/* Toolbar */}
      <div className='flex items-center gap-1 border-b border-border bg-muted p-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setMode('edit')}
          className={cn(
            mode === 'edit' ? 'bg-accent' : 'text-foreground hover:bg-accent'
          )}
          aria-label='Edit'
        >
          <Edit3 className='mr-1 h-4 w-4' />
          Edit
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setMode('preview')}
          className={cn(
            mode === 'preview' ? 'bg-accent' : 'text-foreground hover:bg-accent'
          )}
          aria-label='Preview'
        >
          <Eye className='mr-1 h-4 w-4' />
          Preview
        </Button>
      </div>

      {/* Content Area */}
      <div className='bg-transparent p-4'>
        {mode === 'edit' ? (
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className='min-h-[200px] resize-y border-none bg-transparent p-0 text-sm text-foreground focus-visible:ring-0 focus-visible:ring-offset-0'
            style={{ whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div className='prose prose-sm max-w-none dark:prose-invert'>
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className='text-muted-foreground'>{placeholder}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor
