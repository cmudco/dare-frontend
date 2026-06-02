import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { RESEARCH_TOOLS, ResearchTool } from '@/utils/constants/research'
import { PROJECT } from '../mockData'

type ScoutDepth = 'quick' | 'deep'

interface Props {
  scoutRunning: boolean
  pendingCount: number
  approvedCount: number
  tools: ResearchTool[]
  onRunScout: () => void
  onGoToReview: () => void
}

type StepState = 'done' | 'active' | 'todo'

const DEPTHS: { key: ScoutDepth; label: string }[] = [
  { key: 'quick', label: 'Quick' },
  { key: 'deep', label: 'Deep' },
]

const toolName = (key: ResearchTool): string =>
  RESEARCH_TOOLS.find((t) => t.key === key)?.name ?? key

const OverviewPanel = ({
  scoutRunning,
  pendingCount,
  approvedCount,
  tools,
  onRunScout,
  onGoToReview,
}: Props) => {
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

  // Derive which step of the loop the researcher is on.
  const askState: StepState = scoutRunning
    ? 'active'
    : pendingCount > 0 || approvedCount > 0
      ? 'done'
      : 'active'
  const reviewState: StepState = pendingCount > 0 ? 'active' : 'todo'
  const approveState: StepState = approvedCount > 0 ? 'done' : 'todo'

  return (
    <div className='space-y-8'>
      <header>
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          Research question
        </p>
        <h2 className='mt-2 max-w-2xl text-2xl font-semibold leading-snug tracking-tight'>
          {PROJECT.question}
        </h2>
      </header>

      <div className='rounded-2xl border border-border bg-card p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <Step
            index={1}
            label='Ask Scout'
            desc='Gather candidate sources'
            state={askState}
          />
          <Connector />
          <Step
            index={2}
            label='Review results'
            desc='Weigh each finding'
            state={reviewState}
          />
          <Connector />
          <Step
            index={3}
            label='Approve knowledge'
            desc='Keep what holds up'
            state={approveState}
          />
        </div>

        <div className='mt-6 border-t border-border pt-6'>
          {pendingCount > 0 ? (
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='max-w-md text-sm text-muted-foreground'>
                Scout has returned {pendingCount} source
                {pendingCount > 1 ? 's' : ''} waiting for your review.
              </p>
              <Button onClick={onGoToReview} className='shrink-0'>
                Review {pendingCount} finding{pendingCount > 1 ? 's' : ''}
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          ) : scoutRunning ? (
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
                Findings will arrive in your Review Inbox — you can keep
                working.
              </p>
            </motion.div>
          ) : (
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

                <Button
                  onClick={onRunScout}
                  disabled={!canRun}
                  className='ml-auto shrink-0'
                >
                  <Sparkles className='h-4 w-4' /> Run Scout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground'>
        This workspace keeps orchestration with you. AI helpers do bounded work
        and stage their results; you decide what becomes durable project
        knowledge. The seams between your judgement and the system stay visible
        by design.
      </p>
    </div>
  )
}

const Step = ({
  index,
  label,
  desc,
  state,
}: {
  index: number
  label: string
  desc: string
  state: StepState
}) => (
  <div className='flex flex-1 items-center gap-3'>
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
        state === 'done' &&
          'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        state === 'active' && 'border-transparent bg-dare-gradient text-white',
        state === 'todo' && 'border-border text-muted-foreground'
      )}
    >
      {state === 'done' ? <Check className='h-4 w-4' /> : index}
    </div>
    <div>
      <p
        className={cn(
          'text-sm font-medium',
          state === 'todo' && 'text-muted-foreground'
        )}
      >
        {label}
      </p>
      <p className='text-xs text-muted-foreground'>{desc}</p>
    </div>
  </div>
)

const Connector = () => (
  <div className='hidden h-px flex-1 bg-border sm:block' />
)

export default OverviewPanel
