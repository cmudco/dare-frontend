/**
 * InlineEditor
 *
 * Rewrite one memory in place. Used by both the feed card and the USER.md
 * document line so a correction behaves identically wherever you make it:
 * Enter saves, Escape cancels, and the field stays open while the save is in
 * flight — if the server refuses (a rule whose trigger now collides, a line
 * that would cross the token ceiling), the text is still there to fix.
 */
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  saving: boolean
  onSave: (content: string) => void
  onCancel: () => void
  /** Monospace, for the USER.md document view */
  mono?: boolean
}

const InlineEditor = ({ value, saving, onSave, onCancel, mono }: Props) => {
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const field = ref.current
    if (!field) return
    field.focus()
    field.setSelectionRange(field.value.length, field.value.length)
  }, [])

  // Grow with the content so a long rule is never edited through a keyhole.
  useEffect(() => {
    const field = ref.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }, [draft])

  const trimmed = draft.trim()
  const unchanged = trimmed === value.trim()

  const commit = () => {
    if (!trimmed || unchanged) {
      onCancel()
      return
    }
    onSave(trimmed)
  }

  return (
    <div className='mt-2.5 space-y-2'>
      <textarea
        ref={ref}
        value={draft}
        disabled={saving}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            commit()
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            onCancel()
          }
        }}
        rows={1}
        className={cn(
          'w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed',
          'focus:border-ring focus:ring-2 focus:ring-ring focus:outline-hidden',
          'disabled:opacity-60',
          mono && 'font-mono text-[13px]'
        )}
      />
      <div className='flex items-center gap-2'>
        <Button size='sm' onClick={commit} disabled={saving || !trimmed}>
          {saving && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
          Save
        </Button>
        <Button size='sm' variant='ghost' onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <span className='text-xs text-muted-foreground'>
          Enter to save · Escape to cancel
        </span>
      </div>
    </div>
  )
}

export default InlineEditor
