/**
 * SessionSearch
 *
 * The transcript layer, searchable. Words, a date range, or both — the same
 * search the model reaches through its search_sessions tool, so what the
 * page shows and what the model can find are one and the same. Each hit is
 * the matched line with the turn either side of it, and a door into the
 * conversation it came from.
 */
import { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, MessagesSquare, Search, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { searchSessions } from '@/redux/asyncThunks/memory'
import { clearSessionResults } from '@/redux/memorySlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  query: string
  onQueryChange: (query: string) => void
  since: string
  until: string
  onSinceChange: (value: string) => void
  onUntilChange: (value: string) => void
}

const SessionSearch = ({
  query,
  onQueryChange,
  since,
  until,
  onSinceChange,
  onUntilChange,
}: Props) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const results = useAppSelector((state) => state.memory.sessionResults)
  const loading = useAppSelector((state) => state.memory.sessionLoading)

  const canSearch = Boolean(query.trim() || since || until)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSearch) return
    dispatch(
      searchSessions({
        q: query.trim() || undefined,
        since: since || undefined,
        until: until || undefined,
      })
    )
  }

  const handleClear = () => {
    onQueryChange('')
    onSinceChange('')
    onUntilChange('')
    dispatch(clearSessionResults())
  }

  return (
    <div className='space-y-3'>
      <form onSubmit={handleSubmit} className='space-y-2'>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') handleClear()
              }}
              placeholder='Search your conversations word for word — or leave empty and pick dates'
              aria-label='Search conversations'
              className='h-11 rounded-xl bg-card pr-10 pl-10'
            />
            {(query || since || until || results) && (
              <button
                type='button'
                onClick={handleClear}
                aria-label='Clear session search'
                className='absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
          <Button
            type='submit'
            variant='outline'
            disabled={!canSearch || loading}
            className='h-11 shrink-0 rounded-xl'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <MessagesSquare className='h-4 w-4' />
            )}
            Search sessions
          </Button>
        </div>
        <div className='flex flex-wrap items-center gap-2 px-1 text-xs text-muted-foreground'>
          <span>Between</span>
          <Input
            type='date'
            value={since}
            onChange={(event) => onSinceChange(event.target.value)}
            aria-label='From date'
            className='h-8 w-auto rounded-lg bg-card text-xs'
          />
          <span>and</span>
          <Input
            type='date'
            value={until}
            onChange={(event) => onUntilChange(event.target.value)}
            aria-label='To date'
            className='h-8 w-auto rounded-lg bg-card text-xs'
          />
          <span className='text-muted-foreground/70'>
            — both optional; dates alone answer &ldquo;what did we talk about
            last week?&rdquo;
          </span>
        </div>
      </form>

      {results && (
        <p className='px-1 text-xs text-muted-foreground'>
          {results.found === 0 ? (
            <>
              Nothing matched. The transcript only answers in your own words —
              try the exact terms you would have typed.
            </>
          ) : (
            <>
              {results.found} {results.found === 1 ? 'exchange' : 'exchanges'}
              {results.query && (
                <>
                  {' '}
                  matching{' '}
                  <span className='font-medium text-foreground'>
                    &ldquo;{results.query}&rdquo;
                  </span>
                </>
              )}
              {(results.since || results.until) && (
                <>
                  {' '}
                  between{' '}
                  <span className='tabular-nums'>
                    {results.since ?? 'the beginning'}
                  </span>{' '}
                  and{' '}
                  <span className='tabular-nums'>
                    {results.until ?? 'today'}
                  </span>
                </>
              )}
              , word for word.
            </>
          )}
        </p>
      )}

      {results && results.hits.length > 0 && (
        <div className='space-y-3'>
          {results.hits.map((hit) => (
            <div
              key={`${hit.conversationId}-${hit.messageId}`}
              className='rounded-xl border border-border bg-card p-4 shadow-xs'
            >
              <div className='flex items-center justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold'>
                    {hit.conversationTitle}
                  </p>
                  {hit.date && (
                    <p className='text-xs text-muted-foreground tabular-nums'>
                      {hit.date}
                    </p>
                  )}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='shrink-0'
                  onClick={() =>
                    navigate(`/conversation/${hit.conversationId}`)
                  }
                >
                  Open conversation
                  <ArrowRight className='h-3.5 w-3.5' />
                </Button>
              </div>
              <div className='mt-3 space-y-1.5 border-t border-border pt-3'>
                {hit.exchange.map((line, index) => (
                  <p
                    key={index}
                    className={cn(
                      'text-sm leading-relaxed',
                      line.matched
                        ? 'text-foreground'
                        : 'text-muted-foreground/80'
                    )}
                  >
                    <span
                      className={cn(
                        'mr-2 text-[11px] font-medium tracking-wide uppercase',
                        line.matched
                          ? 'text-primary'
                          : 'text-muted-foreground/60'
                      )}
                    >
                      {line.role === 'user' ? 'You' : 'DARE'}
                    </span>
                    {line.text.length > 260
                      ? `${line.text.slice(0, 260)}…`
                      : line.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SessionSearch
