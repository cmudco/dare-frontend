import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/hooks'
import { resolveToolMeta } from '@/utils/constants/research'

type ScoutDepth = 'quick' | 'deep'

const DEPTHS: { key: ScoutDepth; label: string }[] = [
  { key: 'quick', label: 'Quick' },
  { key: 'deep', label: 'Deep' },
]

interface Props {
  /** Tool slugs offered for this run (from the project's enabled set). */
  tools: string[]
  /** When true, the composer shows the async "working" state instead. */
  running: boolean
  /** Live status line from the running run (e.g. 'Searching the web…'). */
  status?: string
  onRun: (query: string, depth: ScoutDepth) => void
}

// The Scout query composer — shared by the Overview and the Ask Scout view.
const ScoutComposer = ({ tools, running, status, onRun }: Props) => {
  const connections = useAppSelector((state) => state.mcp.connections)
  const nameOf = (slug: string): string =>
    resolveToolMeta(slug, connections).name

  const [query, setQuery] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>(tools)
  const [depth, setDepth] = useState<ScoutDepth>('deep')

  const toggleTool = (slug: string) =>
    setSelectedTools((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    )

  const selectedNames = tools
    .filter((t) => selectedTools.includes(t))
    .map(nameOf)
    .join(' · ')

  // Only a query is required — tools default to the project's enabled set, and
  // Scout searches the web today (other tools arrive with the MCP gateway).
  const canRun = query.trim().length > 0

  if (running) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='space-y-2'
      >
        <p className='flex items-center gap-2 text-sm font-medium'>
          <Loader2 className='h-4 w-4 animate-spin' />
          {status || `Scout is searching ${selectedNames || 'your sources'}…`}
        </p>
        {query.trim() && (
          <p className='text-sm italic text-muted-foreground'>
            “{query.trim()}”
          </p>
        )}
        <p className='text-xs text-muted-foreground'>
          Findings will arrive in your Review Inbox — you can keep working,
          switch pages, even reload.
        </p>
      </motion.div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-1.5'>
        <label htmlFor='scout-query' className='text-sm font-medium'>
          Ask Scout
        </label>
        <Textarea
          id='scout-query'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='What should Scout look for? e.g. empirical studies on IRB authority after model deployment'
          rows={2}
        />
      </div>

      <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
        <div className='flex flex-wrap items-center gap-1.5'>
          {tools.map((slug) => {
            const isOn = selectedTools.includes(slug)
            return (
              <button
                key={slug}
                type='button'
                onClick={() => toggleTool(slug)}
                aria-pressed={isOn}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isOn
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {isOn ? (
                  <Check className='h-3 w-3 text-primary' />
                ) : (
                  <span className='h-1.5 w-1.5 rounded-full bg-muted-foreground/40' />
                )}
                {nameOf(slug)}
              </button>
            )
          })}
          {/* Built-in, always on: Scout reads result pages with DARE's fast
              fetcher (the fetch_page gateway tool) — shown for full clarity. */}
          <span
            title="Built-in: Scout reads the pages behind search results with DARE's fast page reader before staging."
            className='inline-flex cursor-default items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground'
          >
            <BookOpenText className='h-3 w-3' />
            Page reader · built-in
          </span>
        </div>

        <div className='flex items-center gap-0.5 rounded-lg border border-border p-0.5'>
          {DEPTHS.map((d) => (
            <button
              key={d.key}
              type='button'
              onClick={() => setDepth(d.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs transition-colors',
                depth === d.key
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <Button
          onClick={() => onRun(query.trim(), depth)}
          disabled={!canRun}
          className='ml-auto shrink-0'
        >
          <Sparkles className='h-4 w-4' /> Run Scout
        </Button>
      </div>
    </div>
  )
}

export default ScoutComposer
