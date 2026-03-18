import React, { useCallback, useState } from 'react'
import MDEditor, { commands } from '@uiw/react-md-editor'
import { Button } from '../ui/button'
import { Eye, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const TOOLBAR_COMMANDS = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  commands.heading1,
  commands.heading2,
  commands.heading3,
  commands.divider,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.checkedListCommand,
  commands.divider,
  commands.quote,
  commands.code,
  commands.codeBlock,
  commands.divider,
  commands.link,
  commands.image,
  commands.table,
]

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  placeholder = 'Enter content...',
}) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  const handleChange = useCallback(
    (value?: string) => {
      onChange(value ?? '')
    },
    [onChange]
  )

  return (
    <div className='flex flex-col overflow-hidden rounded-md border border-border'>
      {/* Tab Bar */}
      <div className='flex items-center border-b border-border bg-muted p-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setMode('write')}
          className={cn(
            mode === 'write' ? 'bg-accent' : 'text-foreground hover:bg-accent'
          )}
          aria-label='Write'
        >
          <Edit3 className='mr-1 h-4 w-4' />
          Write
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
      <div data-color-mode='light'>
        {mode === 'write' ? (
          <MDEditor
            value={content}
            onChange={handleChange}
            preview='edit'
            commands={TOOLBAR_COMMANDS}
            extraCommands={[commands.fullscreen]}
            textareaProps={{ placeholder }}
            height={350}
            visibleDragbar={false}
          />
        ) : (
          <div className='h-[350px] overflow-y-auto bg-white p-4'>
            {content ? (
              <MDEditor.Markdown source={content} />
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
