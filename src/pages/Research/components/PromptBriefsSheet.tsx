import { useEffect, useState } from 'react'
import { getPromptBriefsAPI } from '@/api/research'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { PromptBrief } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  active: PromptBrief['key']
  onSelect: (key: PromptBrief['key']) => void
}

// Every role's brief, word for word as runs are given it. Read-only: what is
// specific to a project belongs in its SOUL.md.
const PromptBriefsSheet = ({ open, onOpenChange, active, onSelect }: Props) => {
  const [briefs, setBriefs] = useState<PromptBrief[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open || briefs) return
    let alive = true
    getPromptBriefsAPI()
      .then(({ briefs: loaded }) => alive && setBriefs(loaded))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [open, briefs])

  const brief = briefs?.find((b) => b.key === active)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 p-0 sm:max-w-2xl'
      >
        <SheetHeader className='border-b border-border p-6'>
          <SheetTitle>Instructions</SheetTitle>
          <SheetDescription>
            Each kind of run gets one brief. It tells the agent how to behave;
            the files say who it is and what it knows.
          </SheetDescription>
        </SheetHeader>
        {error ? (
          <p className='p-6 text-sm text-destructive'>
            Could not load the instructions. Close this and try again.
          </p>
        ) : !briefs ? (
          <p className='p-6 text-sm text-muted-foreground'>Loading…</p>
        ) : (
          <>
            <div
              role='tablist'
              aria-label='Briefs'
              className='flex flex-wrap gap-1 border-b border-border px-6 py-3'
            >
              {briefs.map((b) => (
                <button
                  key={b.key}
                  type='button'
                  role='tab'
                  aria-selected={b.key === active}
                  onClick={() => onSelect(b.key)}
                  className={cn(
                    'rounded-md px-3 py-1 text-sm',
                    b.key === active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
            {brief && (
              <div className='flex min-h-0 flex-1 flex-col gap-3 p-6'>
                <p className='text-sm text-muted-foreground'>
                  {brief.when}{' '}
                  <span className='font-mono text-xs'>
                    · {brief.part} · {brief.text.length.toLocaleString()} chars
                  </span>
                </p>
                <pre className='min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed break-words whitespace-pre-wrap'>
                  {brief.text}
                </pre>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default PromptBriefsSheet
