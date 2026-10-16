import { useState, type ReactNode } from 'react'
import { PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  file: string
  reach: string
  /** The file's text as it is edited (Markdown). */
  value: string
  /** What the file looks like when not being edited. */
  preview: ReactNode
  /** Shown above the preview and the editor, never edited here. */
  fixed?: ReactNode
  limit: number
  /** Size of `value` as the agent's runtime counts it. */
  sizeOf?: (value: string) => number
  placeholder: string
  hint?: string
  onSave: (value: string) => Promise<void>
}

// One of the agent's files: read it as rendered, or switch to edit its text.
const EditableFile = ({
  title,
  file,
  reach,
  value,
  preview,
  fixed,
  limit,
  sizeOf = (text) => text.length,
  placeholder,
  hint,
  onSave,
}: Props) => {
  const [draft, setDraft] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = draft !== null
  const size = sizeOf(editing ? draft : value)

  const save = async () => {
    if (draft === null) return
    setSaving(true)
    setError('')
    try {
      await onSave(draft)
      setDraft(null)
    } catch {
      setError(`Could not save ${file}. Your text is still here; try again.`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-3'>
        <h3 className='text-sm font-medium'>{title}</h3>
        <div className='flex items-center gap-3'>
          <span className='font-mono text-[11px] text-muted-foreground'>
            {file}
          </span>
          {!editing && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setDraft(value)}
              aria-label={`Edit ${file}`}
            >
              <PencilLine className='h-3.5 w-3.5' /> Edit
            </Button>
          )}
        </div>
      </div>
      <p className='mb-3 text-xs text-muted-foreground'>{reach}</p>
      {fixed}
      {editing ? (
        <div className='rounded-xl border border-border bg-card'>
          {hint && (
            <p className='border-b border-border px-4 py-2 text-xs text-muted-foreground'>
              {hint}
            </p>
          )}
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            aria-label={file}
            spellCheck={false}
            className='min-h-64 resize-y rounded-none border-0 px-4 py-3 font-mono text-[13px] leading-6 focus-visible:ring-0'
          />
          <div className='flex flex-wrap items-center gap-3 border-t border-border px-4 py-2.5'>
            <span
              className={cn(
                'text-xs tabular-nums',
                size > limit ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {size.toLocaleString()} / {limit.toLocaleString()} characters
            </span>
            {error && <span className='text-xs text-destructive'>{error}</span>}
            <div className='ml-auto flex gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setDraft(null)
                  setError('')
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={save}
                disabled={saving || size > limit || draft === value}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        preview
      )}
    </section>
  )
}

export default EditableFile
