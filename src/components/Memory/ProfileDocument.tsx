/**
 * ProfileDocument
 *
 * The profile layer rendered as what it conceptually is: a USER.md file.
 * Profile memories are grouped under canonical markdown headings (derived
 * from their categories) and shown as a document with file chrome, a token
 * budget meter, and per-line actions.
 */
import { useMemo, useState } from 'react'
import { Check, Copy, FileText, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast'
import type { MemoryItem } from '@/redux/types/memory'
import { PROFILE_TOKEN_BUDGET, estimateTokens } from './layers'
import InlineEditor from './InlineEditor'

interface Props {
  items: MemoryItem[]
  onDelete: (id: string) => void
  /** Rewrite one line. Resolves false when the server refused. */
  onEdit: (id: string, content: string) => Promise<boolean>
  /** Id of the line currently being saved, if any */
  savingId?: string | null
}

/** Canonical USER.md sections, in document order */
const SECTIONS: Array<{ heading: string; match: string[] }> = [
  { heading: 'Identity', match: ['identity'] },
  { heading: 'Background', match: ['background', 'research', 'education'] },
  { heading: 'Communication', match: ['communication'] },
  {
    heading: 'Working preferences',
    match: ['working-preferences', 'preferences', 'writing', 'workflow'],
  },
  { heading: 'Constraints', match: ['constraints', 'privacy', 'safety'] },
  { heading: 'Boundaries', match: ['boundaries'] },
  { heading: 'Notes', match: [] },
]

const sectionFor = (item: MemoryItem): string => {
  const categories = (item.categories ?? []).map((c) => c.toLowerCase())
  for (const section of SECTIONS) {
    if (section.match.some((m) => categories.includes(m))) {
      return section.heading
    }
  }
  return 'Notes'
}

const DocLine = ({
  item,
  onDelete,
  onEdit,
  saving,
}: {
  item: MemoryItem
  onDelete: (id: string) => void
  onEdit: (id: string, content: string) => Promise<boolean>
  saving: boolean
}) => {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  if (editing) {
    return (
      <div className='-mx-2 px-2'>
        <InlineEditor
          mono
          value={item.content}
          saving={saving}
          onCancel={() => setEditing(false)}
          onSave={async (content) => {
            const saved = await onEdit(item.id, content)
            if (saved) setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className='group -mx-2 flex items-start gap-2 rounded-md px-2 py-0.5 hover:bg-muted/50'>
      <span className='text-muted-foreground select-none'>-</span>
      <span className='flex-1'>{item.content}</span>
      <span className='flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'>
        <button
          aria-label='Copy line'
          onClick={handleCopy}
          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
        >
          {copied ? (
            <Check className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
          ) : (
            <Copy className='h-3.5 w-3.5' />
          )}
        </button>
        <button
          aria-label='Edit line'
          onClick={() => setEditing(true)}
          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
        >
          <Pencil className='h-3.5 w-3.5' />
        </button>
        <button
          aria-label='Forget line'
          onClick={() => onDelete(item.id)}
          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive'
        >
          <Trash2 className='h-3.5 w-3.5' />
        </button>
      </span>
    </div>
  )
}

const ProfileDocument = ({ items, onDelete, onEdit, savingId }: Props) => {
  const sections = useMemo(() => {
    const grouped = new Map<string, MemoryItem[]>()
    items.forEach((item) => {
      const heading = sectionFor(item)
      grouped.set(heading, [...(grouped.get(heading) ?? []), item])
    })
    return SECTIONS.filter((section) => grouped.has(section.heading)).map(
      (section) => ({
        heading: section.heading,
        items: grouped.get(section.heading)!,
      })
    )
  }, [items])

  const tokens = items.reduce(
    (sum, item) => sum + estimateTokens(item.content),
    0
  )
  const percent = Math.min(
    Math.round((tokens / PROFILE_TOKEN_BUDGET) * 100),
    100
  )
  const over = tokens > PROFILE_TOKEN_BUDGET
  const warning = !over && tokens > PROFILE_TOKEN_BUDGET * 0.8

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-card shadow-xs'>
      {/* File chrome */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-4 py-2.5'>
        <div className='flex min-w-0 items-center gap-2'>
          <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
          <span className='font-mono text-sm font-medium'>USER.md</span>
          <span className='rounded-full border border-border bg-card px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase'>
            always injected
          </span>
        </div>
        <div className='flex shrink-0 items-center gap-3'>
          <span className='h-1.5 w-24 overflow-hidden rounded-full bg-muted'>
            <span
              className={cn(
                'block h-full rounded-full transition-all',
                over
                  ? 'bg-destructive'
                  : warning
                    ? 'bg-amber-500 dark:bg-amber-400'
                    : 'bg-emerald-500 dark:bg-emerald-400'
              )}
              style={{ width: `${percent}%` }}
            />
          </span>
          <span className='text-xs text-muted-foreground tabular-nums'>
            ~{tokens} / {PROFILE_TOKEN_BUDGET} tokens
          </span>
        </div>
      </div>

      {/* Document body */}
      <div className='space-y-4 px-5 py-4 font-mono text-[13px] leading-relaxed'>
        {sections.map((section) => (
          <div key={section.heading}>
            <p className='mb-1.5'>
              <span className='text-muted-foreground select-none'>## </span>
              <span className='font-semibold'>{section.heading}</span>
            </p>
            <div className='space-y-0.5'>
              {section.items.map((item) => (
                <DocLine
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  saving={savingId === item.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className='border-t border-border px-4 py-2 text-[11px] text-muted-foreground'>
        Carried into every conversation · kept under budget · never searched
      </div>
    </div>
  )
}

export default ProfileDocument
