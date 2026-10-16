import { useState } from 'react'
import { Eye, FileText, PencilLine } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import ChatMarkdown from '../components/ChatMarkdown'

export interface EditorFile {
  key: string
  name: string
  /** One line under the tabs: what this file is and who reads it. */
  caption: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  size: number
  limit: number
  limitNote: string
}

interface Props {
  files: EditorFile[]
  active: string
  onSelect: (key: string) => void
  /** Rendered between the caption and the text, e.g. a restructure prompt. */
  notice?: React.ReactNode
}

/** A small multi-file Markdown editor: file tabs, write / preview, a size meter. */
const DocumentEditor = ({ files, active, onSelect, notice }: Props) => {
  const [view, setView] = useState<'write' | 'preview'>('write')
  const file = files.find((f) => f.key === active) ?? files[0]
  const overLimit = file.size > file.limit

  return (
    <div className='flex min-h-[40rem] flex-col rounded-xl border border-border bg-card lg:sticky lg:top-4 lg:h-[calc(100vh-14rem)]'>
      <div className='flex items-end gap-1 border-b border-border px-3 pt-2'>
        <div role='tablist' aria-label='Files' className='flex gap-1'>
          {files.map((f) => (
            <button
              key={f.key}
              type='button'
              role='tab'
              aria-selected={f.key === file.key}
              onClick={() => onSelect(f.key)}
              className={cn(
                '-mb-px inline-flex items-center gap-1.5 rounded-t-lg border px-3.5 py-2 font-mono text-sm',
                f.key === file.key
                  ? 'border-border border-b-card bg-card text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className='h-3.5 w-3.5' /> {f.name}
            </button>
          ))}
        </div>
        <div
          role='tablist'
          aria-label='View'
          className='mb-1.5 ml-auto flex rounded-lg bg-muted p-0.5'
        >
          {(
            [
              ['write', 'Markdown', PencilLine],
              ['preview', 'Preview', Eye],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type='button'
              role='tab'
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs',
                view === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className='h-3.5 w-3.5' /> {label}
            </button>
          ))}
        </div>
      </div>

      <p className='border-b border-border px-5 py-2.5 text-xs text-muted-foreground'>
        {file.caption}
      </p>
      {notice}

      {view === 'write' ? (
        <Textarea
          value={file.value}
          onChange={(e) => file.onChange(e.target.value)}
          placeholder={file.placeholder}
          aria-label={file.name}
          spellCheck={false}
          className='flex-1 resize-none rounded-none border-0 px-6 py-5 font-mono text-[13px] leading-6 focus-visible:ring-0'
        />
      ) : (
        <div className='flex-1 overflow-y-auto px-8 py-6'>
          {file.value.trim() ? (
            <ChatMarkdown content={file.value} />
          ) : (
            <p className='text-sm text-muted-foreground'>Nothing here yet.</p>
          )}
        </div>
      )}

      <p
        className={cn(
          'border-t border-border px-5 py-2.5 text-xs',
          overLimit ? 'text-destructive' : 'text-muted-foreground'
        )}
      >
        {file.size.toLocaleString()} / {file.limit.toLocaleString()} characters
        · {file.limitNote}
      </p>
    </div>
  )
}

export default DocumentEditor
