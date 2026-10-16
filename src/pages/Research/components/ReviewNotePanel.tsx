import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { REVIEW_REASON_TAGS } from '@/utils/constants/research'
import type { ReviewReasonTag } from '@/redux/types/research'

interface Props {
  decision: 'approve' | 'reject'
  onConfirm: (note: string, tags: ReviewReasonTag[]) => void
  onCancel: () => void
  busy: boolean
}

/**
 * Why the scholar decided. Optional, but it is the signal the agent learns
 * from: a note on a rejection is what turns into "set preprints aside" next
 * session, so the panel makes leaving one a click, not a chore.
 */
const ReviewNotePanel = ({ decision, onConfirm, onCancel, busy }: Props) => {
  const [note, setNote] = useState('')
  const [tags, setTags] = useState<ReviewReasonTag[]>([])
  const options = REVIEW_REASON_TAGS.filter((tag) => tag.on === decision)

  const toggle = (value: ReviewReasonTag) =>
    setTags((current) =>
      current.includes(value)
        ? current.filter((tag) => tag !== value)
        : [...current, value]
    )

  return (
    <div className='mx-5 mb-1 rounded-lg border border-border bg-muted/40 p-3'>
      <p className='text-xs font-medium text-muted-foreground'>
        {decision === 'reject' ? 'Why not?' : 'What makes it strong?'}{' '}
        <span className='font-normal'>
          Optional — the agent learns from this.
        </span>
      </p>
      <div className='mt-2 flex flex-wrap gap-1.5'>
        {options.map((tag) => (
          <button
            key={tag.value}
            type='button'
            aria-pressed={tags.includes(tag.value)}
            onClick={() => toggle(tag.value)}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
              tags.includes(tag.value)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-accent'
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>
      <Textarea
        className='mt-2'
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={
          decision === 'reject'
            ? 'e.g. Preprints aren’t enough for this chapter'
            : 'e.g. This is the design I want more of'
        }
        aria-label='Review note'
      />
      <div className='mt-2 flex gap-2'>
        <Button
          size='sm'
          variant={decision === 'reject' ? 'destructive' : 'default'}
          disabled={busy}
          onClick={() => onConfirm(note.trim(), tags)}
        >
          {decision === 'reject' ? 'Reject' : 'Approve'}
          {(note.trim() || tags.length > 0) && ' with note'}
        </Button>
        <Button size='sm' variant='ghost' disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default ReviewNotePanel
