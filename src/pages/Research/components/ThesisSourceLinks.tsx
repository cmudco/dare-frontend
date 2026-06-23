import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  addThesisSourceLinkAPI,
  getThesisSourceLinksAPI,
  removeThesisSourceLinkAPI,
  type ThesisSourceLink,
} from '@/api/research'
import type { KnowledgeItem } from '../types'

const STANCES = ['supporting', 'disputing', 'partial']

const STANCE_COLORS: Record<string, string> = {
  supporting: '#22c55e',
  disputing: '#ef4444',
  partial: '#f59e0b',
}

/**
 * Per-thesis editor for the typed thesis → source links that drive the OKF
 * bundle's "Supported by / Disputed by" sections. Lists current links and lets
 * the scholar attach an approved source with a stance (defaulting to the
 * source's own evidence label) or detach one.
 */
const ThesisSourceLinks = ({
  thesisId,
  sources,
}: {
  thesisId: number
  sources: KnowledgeItem[]
}) => {
  const [links, setLinks] = useState<ThesisSourceLink[]>([])
  const [adding, setAdding] = useState(false)
  const [pickId, setPickId] = useState<number | ''>('')
  const [stance, setStance] = useState('supporting')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getThesisSourceLinksAPI(thesisId)
      .then(setLinks)
      .catch(() => setLinks([]))
  }, [thesisId])

  const byId = new Map(sources.map((s) => [s.id, s]))
  const linkedIds = new Set(links.map((l) => l.sourceId))
  const available = sources.filter((s) => !linkedIds.has(s.id))

  const add = async () => {
    if (pickId === '') return
    setBusy(true)
    try {
      await addThesisSourceLinkAPI(thesisId, Number(pickId), stance)
      setLinks(await getThesisSourceLinksAPI(thesisId))
      setPickId('')
      setAdding(false)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (sourceId: number) => {
    setBusy(true)
    try {
      await removeThesisSourceLinkAPI(thesisId, sourceId)
      setLinks((prev) => prev.filter((l) => l.sourceId !== sourceId))
    } finally {
      setBusy(false)
    }
  }

  const onPick = (id: number | '') => {
    setPickId(id)
    if (id !== '') {
      const ev = byId.get(Number(id))?.evidenceLabel
      if (ev && STANCES.includes(ev)) setStance(ev)
    }
  }

  return (
    <div className='mt-3 border-t border-border pt-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        Linked sources
      </p>
      {links.length === 0 && !adding && (
        <p className='text-xs text-muted-foreground'>None yet.</p>
      )}
      <div className='space-y-1.5'>
        {links.map((l) => {
          const s = byId.get(l.sourceId)
          const color = STANCE_COLORS[l.stance] || '#94a3b8'
          return (
            <div key={l.sourceId} className='flex items-center gap-2 text-sm'>
              <span
                className='inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium'
                style={{
                  color,
                  backgroundColor: `${color}1f`,
                  border: `1px solid ${color}55`,
                }}
              >
                {l.stance || 'related'}
              </span>
              <span className='min-w-0 flex-1 truncate text-foreground/90'>
                {s ? s.title : `source ${l.sourceId}`}
              </span>
              <button
                onClick={() => remove(l.sourceId)}
                disabled={busy}
                className='shrink-0 text-muted-foreground transition-colors hover:text-foreground'
                aria-label='Unlink source'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className='mt-2 flex flex-wrap items-center gap-2'>
          <select
            value={pickId}
            onChange={(e) =>
              onPick(e.target.value === '' ? '' : Number(e.target.value))
            }
            className='min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm'
          >
            <option value=''>Select a source…</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <select
            value={stance}
            onChange={(e) => setStance(e.target.value)}
            className='rounded-md border border-border bg-background px-2 py-1 text-sm'
          >
            {STANCES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <button
            onClick={add}
            disabled={busy || pickId === ''}
            className='rounded-md border border-border px-2.5 py-1 text-sm hover:bg-muted/60 disabled:opacity-50'
          >
            Add
          </button>
          <button
            onClick={() => {
              setAdding(false)
              setPickId('')
            }}
            className='text-sm text-muted-foreground hover:text-foreground'
          >
            Cancel
          </button>
        </div>
      ) : (
        available.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className='mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
          >
            <Plus className='h-3.5 w-3.5' /> Link a source
          </button>
        )
      )}
    </div>
  )
}

export default ThesisSourceLinks
