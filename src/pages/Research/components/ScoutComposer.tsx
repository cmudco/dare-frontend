import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { RESEARCH_TOOLS, ResearchTool } from '@/utils/constants/research'

type ScoutDepth = 'quick' | 'deep'

const DEPTHS: { key: ScoutDepth; label: string }[] = [
  { key: 'quick', label: 'Quick' },
  { key: 'deep', label: 'Deep' },
]

const toolName = (key: ResearchTool): string =>
  RESEARCH_TOOLS.find((t) => t.key === key)?.name ?? key

interface Props {
  /** Tools offered for this run (from the project's enabled set). */
  tools: ResearchTool[]
  /** When true, the composer shows the async "working" state instead. */
  running: boolean
  onRun: () => void
}

// The Scout query composer — shared by the Overview and the Ask Scout view.
const ScoutComposer = ({ tools, running, onRun }: Props) => {
  const [query, setQuery] = useState('')
  const [selectedTools, setSelectedTools] = useState<ResearchTool[]>(tools)
  const [depth, setDepth] = useState<ScoutDepth>('deep')

  const toggleTool = (key: ResearchTool) =>
    setSelectedTools((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    )

  const selectedNames = tools
    .filter((t) => selectedTools.includes(t))
    .map(toolName)
    .join(' · ')

  const canRun = query.trim().length > 0 && selectedTools.length > 0

  if (running) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='space-y-2'
      >
        <p className='flex items-center gap-2 text-sm font-medium'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Scout is searching {selectedNames || 'your sources'}…
        </p>
        {query.trim() && (
          <p className='text-sm italic text-muted-foreground'>
            “{query.trim()}”
          </p>
        )}
        <p className='text-xs text-muted-foreground'>
          Findings will arrive in your Review Inbox — you can keep working.
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
          {tools.map((key) => {
            const isOn = selectedTools.includes(key)
            return (
              <button
                key={key}
                type='button'
                onClick={() => toggleTool(key)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-colors',
                  isOn
                    ? 'border-foreground/30 bg-muted text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {toolName(key)}
              </button>
            )
          })}
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

        <Button onClick={onRun} disabled={!canRun} className='ml-auto shrink-0'>
          <Sparkles className='h-4 w-4' /> Run Scout
        </Button>
      </div>
    </div>
  )
}

export default ScoutComposer
