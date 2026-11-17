import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { getGraphNamesAPI } from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import type { GraphEntity, GraphNamesPage } from '@/redux/types/knowledgeGraph'

import { entityKind } from './entityKinds'
import { tierOf } from './tiers'

const PAGE = 100
const NEAR_END_PX = 240
const GROUPS = [
  { key: '', label: 'All' },
  { key: 'person', label: 'People' },
  { key: 'location', label: 'Places' },
  { key: 'organization', label: 'Organizations' },
  { key: 'other', label: 'Other' },
] as const
type Group = (typeof GROUPS)[number]['key']

interface EntityListProps {
  graphId: number
  /** Changes when names were merged or separated, so the list reloads. */
  revision: number
  drawnIds: ReadonlySet<number>
  onSelect: (id: number) => void
}

/** Every name in the graph, loaded a page at a time as the reader scrolls. */
const EntityList = ({
  graphId,
  revision,
  drawnIds,
  onSelect,
}: EntityListProps) => {
  const [group, setGroup] = useState<Group>('')
  const [summary, setSummary] = useState<GraphNamesPage | null>(null)
  const [rows, setRows] = useState<GraphEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const latest = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)

  const load = useCallback(
    async (offset: number) => {
      const request = ++latest.current
      setLoading(true)
      setFailed(false)
      try {
        const page = await getGraphNamesAPI(graphId, {
          group,
          offset,
          limit: PAGE,
        })
        if (request !== latest.current) return
        setSummary(page)
        setRows((shown) =>
          offset ? [...shown, ...page.results] : page.results
        )
      } catch {
        if (request === latest.current) setFailed(true)
      } finally {
        if (request === latest.current) setLoading(false)
      }
    },
    [graphId, group]
  )

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    void load(0)
  }, [load, revision])

  const countOf = (key: Group) =>
    summary ? (key ? summary.counts[key] : summary.total) : null

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='space-y-2 border-b border-border p-4'>
        <p className='text-xs text-muted-foreground'>
          Every name found in these documents, tier 1 first. Pick one to see it
          in the picture.
        </p>
        <div className='flex flex-wrap gap-1'>
          {GROUPS.map(({ key, label }) => (
            <Button
              key={key}
              size='sm'
              variant={group === key ? 'secondary' : 'ghost'}
              aria-pressed={group === key}
              className='h-7 gap-1.5 px-2 text-xs'
              onClick={() => setGroup(key)}
            >
              {label}
              <span className='text-muted-foreground tabular-nums'>
                {countOf(key)?.toLocaleString()}
              </span>
            </Button>
          ))}
        </div>
      </div>
      <div className='flex justify-between px-4 pt-2 pb-1 text-[11px] tracking-wide text-muted-foreground uppercase'>
        <span>Name</span>
        <span>Passages</span>
      </div>
      <div
        ref={scroller}
        className='min-h-0 flex-1 overflow-y-auto pb-2'
        onScroll={(event) => {
          const list = event.currentTarget
          const left = list.scrollHeight - list.scrollTop - list.clientHeight
          if (
            left < NEAR_END_PX &&
            !loading &&
            summary &&
            rows.length < summary.matches
          )
            void load(rows.length)
        }}
      >
        {rows.map((entity, index) => {
          const { icon: Icon } = entityKind(entity.kind)
          const tier = tierOf(entity.passages)
          const opensTier =
            index === 0 || tierOf(rows[index - 1].passages) !== tier
          return (
            <Fragment key={entity.id}>
              {opensTier && (
                <p className='sticky top-0 border-y border-border bg-muted px-4 py-1 text-xs'>
                  <span className='font-medium'>
                    Tier {tier.tier} · {tier.title}
                  </span>
                  <span className='text-muted-foreground'>
                    {' · '}
                    {tier.passages}
                  </span>
                </p>
              )}
              <button
                type='button'
                onClick={() => onSelect(entity.id)}
                className='flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground'
              >
                <Icon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                <span className='min-w-0 flex-1 truncate'>{entity.label}</span>
                {drawnIds.has(entity.id) && (
                  <span className='shrink-0 rounded-full border border-border px-1.5 text-[10px] text-muted-foreground'>
                    in picture
                  </span>
                )}
                <span className='w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums'>
                  {entity.passages.toLocaleString()}
                </span>
              </button>
            </Fragment>
          )
        })}
        {loading && (
          <div className='flex justify-center py-3'>
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          </div>
        )}
        {failed && (
          <p className='px-4 py-4 text-center text-sm text-muted-foreground'>
            Couldn't load the names.{' '}
            <button
              type='button'
              className='font-medium text-foreground underline underline-offset-2'
              onClick={() => void load(rows.length)}
            >
              Try again
            </button>
          </p>
        )}
        {!loading && !failed && summary && rows.length === 0 && (
          <p className='px-4 py-6 text-center text-sm text-muted-foreground'>
            No names of this kind.
          </p>
        )}
      </div>
    </div>
  )
}

export default EntityList
