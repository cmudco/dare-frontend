/**
 * OmpReference
 *
 * What each field of an Open Memory Protocol record means, beside the live
 * record and the header of the file it would travel in.
 */
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { OmpRecord } from '@/redux/types/memory'
import { toast } from '@/utils/toast'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Definition {
  fields: string[]
  required?: boolean
  text: string
}

const RECORD: Definition[] = [
  {
    fields: ['identifier'],
    required: true,
    text: "A stable id. With the store's origin it is the memory's identity everywhere, so it survives edits and round trips.",
  },
  {
    fields: ['media_type'],
    required: true,
    text: 'The format of the text: plain text or markdown.',
  },
  { fields: ['body'], required: true, text: 'The memory itself.' },
  {
    fields: ['created_at'],
    required: true,
    text: 'When the store recorded it.',
  },
  {
    fields: ['x_omp_origin'],
    text: 'The store this memory first came from, when it was imported.',
  },
  {
    fields: ['path'],
    text: 'Where it sits in the store, like a folder. It can change; the id cannot.',
  },
  {
    fields: ['title', 'tags'],
    text: 'Labels for people. DARE tags a memory as a fact or a rule, plus any health, safety or third-party label.',
  },
  {
    fields: ['scope'],
    text: 'Whose memory it is, as an opaque id. Never an email.',
  },
  {
    fields: ['status'],
    text: 'Active, or held while it waits for your approval.',
  },
  {
    fields: ['weight'],
    text: 'How much it matters next to other memories from the same store.',
  },
  {
    fields: ['provenance'],
    text: 'Who contributed and when: who wrote, edited, approved or imported it.',
  },
  {
    fields: ['evidence'],
    text: 'What it rests on, such as the sentence it was learned from.',
  },
  {
    fields: ['links'],
    text: 'Connections to other memories, such as the one it replaced.',
  },
  {
    fields: ['valid_from', 'valid_until'],
    text: 'When it is true in the world. An end date expires a memory without deleting it.',
  },
  {
    fields: ['version', 'checksum'],
    text: 'A revision number and a fingerprint of the record, used to detect change.',
  },
  {
    fields: ['updated_at', 'protocol_version'],
    text: 'When it last changed, and which draft of the protocol it was written for.',
  },
  {
    fields: ['attributes'],
    text: "Anything else a store wants to carry. DARE's own details sit under dare, and other systems pass them on untouched.",
  },
]

const MANIFEST: Definition[] = [
  {
    fields: ['origin'],
    text: 'This DARE store, named once per file. Origin plus identifier names a memory everywhere.',
  },
  {
    fields: ['protocol_version', 'profiles'],
    text: 'The draft and the level of the protocol the file follows.',
  },
  { fields: ['exported_at'], text: 'When the file was written.' },
  {
    fields: ['intent', 'selection'],
    text: 'A copy, not a move, and whether it holds everything or a selection.',
  },
  {
    fields: ['media_types'],
    text: 'The formats that appear in the file.',
  },
  {
    fields: ['x_dare_omitted'],
    text: 'How many memories DARE left out, and why: held or sensitive, or holding a credential.',
  },
]

const OmpReference = ({ record }: { record: OmpRecord }) => {
  const [view, setView] = useState<'record' | 'manifest'>('record')
  const [copied, setCopied] = useState(false)
  const shown = view === 'record' ? record.memory : record.manifest
  const definitions = view === 'record' ? RECORD : MANIFEST
  const json = JSON.stringify(shown, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <section>
        <h3 className='font-mono text-[11px] tracking-widest text-muted-foreground uppercase'>
          {view === 'record' ? 'The record' : 'The file header'}
        </h3>
        <dl className='mt-2 max-h-[55vh] divide-y divide-dashed divide-border overflow-y-auto pr-2'>
          {definitions.map(({ fields, required, text }) => {
            const present = fields.some((field) => field in shown)
            return (
              <div
                key={fields.join()}
                className={cn(
                  'grid grid-cols-[9rem_minmax(0,1fr)] gap-3 py-2.5',
                  !present && 'opacity-40'
                )}
              >
                <dt className='font-mono text-xs'>
                  <span
                    className={cn(
                      required
                        ? 'font-semibold text-primary'
                        : 'text-foreground'
                    )}
                  >
                    {fields.join(' · ')}
                  </span>
                  <span className='mt-0.5 block text-[10px] tracking-wide text-muted-foreground uppercase'>
                    {required
                      ? 'required'
                      : present
                        ? 'optional'
                        : 'not in this one'}
                  </span>
                </dt>
                <dd className='text-sm leading-relaxed text-muted-foreground'>
                  {text}
                </dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section className='min-w-0'>
        <div className='flex items-center justify-between gap-3'>
          <span className='text-xs text-muted-foreground'>
            Raw JSON, live from this store
          </span>
          <div className='flex items-center gap-1 rounded-lg border border-border bg-card p-0.5'>
            {(['record', 'manifest'] as const).map((key) => (
              <button
                key={key}
                type='button'
                onClick={() => setView(key)}
                aria-pressed={view === key}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                  view === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        <pre className='mt-2 max-h-[50vh] overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed'>
          {json}
        </pre>
        <div className='mt-2 flex justify-end'>
          <Button variant='outline' size='sm' onClick={handleCopy}>
            {copied ? (
              <Check className='h-4 w-4' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
            Copy
          </Button>
        </div>
      </section>
    </div>
  )
}

export default OmpReference
