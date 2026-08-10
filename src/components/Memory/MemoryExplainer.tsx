/**
 * MemoryExplainer
 *
 * A drawer that explains how DARE's memory works, visually: the layer model
 * (what lives where, and what fetches it) and the life of one conversation
 * turn (recall → reply → propose → gate → consolidate).
 */
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Combine,
  Cpu,
  Eye,
  Fingerprint,
  History,
  MessageSquare,
  PenLine,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { MEMORY_LAYERS, SESSIONS_LAYER } from './layers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Connector label per layer: how it reaches the model, mechanically */
const FETCH_SHORT: Record<string, string> = {
  profile: 'read whole — never searched',
  knowledge: 'your question → top 3',
  behavior: 'your task → top 5',
}

interface TurnStep {
  phase: string
  icon: LucideIcon
  title: string
  text: string
}

const TURN_STEPS: TurnStep[] = [
  {
    phase: 'Before the reply',
    icon: Search,
    title: 'Recall',
    text: 'Your message is searched against the layers — by keyword and by meaning. Only the few most relevant memories ride along; past sessions stay searchable word-for-word when the conversation needs them.',
  },
  {
    phase: 'During the reply',
    icon: MessageSquare,
    title: 'Reply',
    text: 'The model answers with your profile and the recalled memories in hand.',
  },
  {
    phase: 'After the reply',
    icon: PenLine,
    title: 'Propose',
    text: 'A memory writer reads the finished turn and proposes what is worth keeping. Most turns produce nothing.',
  },
  {
    phase: 'After the reply',
    icon: ShieldCheck,
    title: 'Gate',
    text: 'Rules route every proposal: into your profile, into the archive, superseding an outdated fact — or ignored. Corrections retire the old fact instead of erasing it.',
  },
  {
    phase: 'Off the clock',
    icon: Combine,
    title: 'Consolidate',
    text: 'Repeated facts merge and get promoted; stale ones fade. The archive stays small and true.',
  },
]

const PRINCIPLES: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Eye,
    title: 'Nothing hidden',
    text: 'Every memory sits on this page — searchable, dated, and organized by layer.',
  },
  {
    icon: PenLine,
    title: 'Nothing locked in',
    text: 'Memories can be pruned today; editing and export are on the way.',
  },
  {
    icon: History,
    title: 'Nothing silently lost',
    text: 'A correction retires the old fact and keeps the history. It never quietly erases it.',
  },
]

const sectionMotion = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
})

const LayerDiagram = () => (
  <div className='rounded-xl border border-border bg-muted/30 p-4'>
    <p className='text-[10px] font-medium tracking-wide text-muted-foreground uppercase'>
      Hot — always with the model
    </p>
    <div className='mt-3 flex items-stretch gap-0'>
      {/* Layer stack + connectors */}
      <div className='flex flex-1 flex-col justify-between gap-3'>
        {MEMORY_LAYERS.map((layer) => {
          const Icon = layer.icon
          return (
            <div key={layer.type} className='flex items-center'>
              <div className='flex w-44 shrink-0 items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 shadow-xs sm:w-52'>
                <div className={cn('rounded-md p-1.5', layer.tile)}>
                  <Icon className={cn('h-4 w-4', layer.iconColor)} />
                </div>
                <div className='min-w-0'>
                  <p className='flex items-baseline gap-1.5 text-sm leading-tight font-semibold'>
                    {layer.label}
                    {layer.type === 'profile' && (
                      <span className='font-mono text-[10px] font-normal text-muted-foreground'>
                        USER.md
                      </span>
                    )}
                  </p>
                  <p className='text-[10px] tracking-wide text-muted-foreground uppercase'>
                    {layer.kind}
                  </p>
                </div>
              </div>
              {/* Connector to the context bar */}
              <div className='relative mx-1 h-px flex-1 border-t border-dashed border-border'>
                <span className='absolute inset-x-0 -top-4 truncate text-center text-[10px] text-muted-foreground'>
                  {FETCH_SHORT[layer.type]}
                </span>
                <ChevronRight className='absolute -top-[7px] -right-1.5 h-3.5 w-3.5 text-muted-foreground' />
              </div>
            </div>
          )
        })}
        {/* Sessions — the transcript, searched rather than extracted */}
        <div className='flex items-center'>
          <div className='flex w-44 shrink-0 items-center gap-2.5 rounded-lg border border-dashed border-border bg-card p-2.5 shadow-xs sm:w-52'>
            <div className={cn('rounded-md p-1.5', SESSIONS_LAYER.tile)}>
              <SESSIONS_LAYER.icon
                className={cn('h-4 w-4', SESSIONS_LAYER.iconColor)}
              />
            </div>
            <div className='min-w-0'>
              <p className='flex items-baseline gap-1.5 text-sm leading-tight font-semibold'>
                {SESSIONS_LAYER.label}
                <span className='font-mono text-[10px] font-normal text-muted-foreground'>
                  FTS5
                </span>
              </p>
              <p className='text-[10px] tracking-wide text-muted-foreground uppercase'>
                {SESSIONS_LAYER.kind}
              </p>
            </div>
          </div>
          <div className='relative mx-1 h-px flex-1 border-t border-dashed border-border'>
            <span className='absolute inset-x-0 -top-4 truncate text-center font-mono text-[10px] text-muted-foreground'>
              search_sessions — the model&apos;s call
            </span>
            <ChevronRight className='absolute -top-[7px] -right-1.5 h-3.5 w-3.5 text-muted-foreground' />
          </div>
        </div>
        <p className='pt-1 text-[10px] text-muted-foreground/80 italic'>
          The top three rows are fetched automatically before every reply. The
          transcript is different: the model reaches for it with a tool,
          mid-reply, only when the conversation looks backward.
        </p>
      </div>
      {/* The model's context */}
      <div className='flex w-12 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card shadow-xs'>
        <Cpu className='h-4 w-4 text-muted-foreground' />
        <span className='text-[10px] font-medium tracking-wide text-muted-foreground uppercase [writing-mode:vertical-rl]'>
          Model context
        </span>
      </div>
    </div>
    <p className='mt-3 text-[10px] font-medium tracking-wide text-muted-foreground uppercase'>
      Cold — fetched only when needed
    </p>
  </div>
)

/** The curation funnel for the cold layers: archive → shortlist → chosen. */
const FunnelDiagram = () => {
  const stages = [
    {
      title: 'Everything active',
      detail: 'the whole archive',
      className: 'border-border bg-card',
    },
    {
      title: '~50 shortlisted',
      detail: 'keyword ∪ important ∪ recent',
      className: 'border-border bg-card',
    },
    {
      title: '3–5 ride along',
      detail: 'meaning · words · importance · recency',
      className: 'border-foreground/30 bg-card ring-1 ring-foreground/10',
    },
  ]
  return (
    <div className='rounded-xl border border-border bg-muted/30 p-4'>
      <div className='flex items-center gap-1.5'>
        {stages.map((stage, index) => (
          <div key={stage.title} className='flex min-w-0 flex-1 items-center'>
            {index > 0 && (
              <ChevronRight className='mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            )}
            <div
              className={cn(
                'min-w-0 flex-1 rounded-lg border p-2.5 text-center shadow-xs',
                stage.className
              )}
            >
              <p className='truncate text-xs font-semibold'>{stage.title}</p>
              <p className='truncate text-[10px] text-muted-foreground'>
                {stage.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-3 space-y-1 text-xs text-muted-foreground'>
        <p>
          Facts answer the <span className='text-foreground'>question</span> —
          the bar is high, only the best three make it.
        </p>
        <p>
          Rules answer the <span className='text-foreground'>task</span> — the
          bar is lower and wider, because a missed rule hurts more than a missed
          fact.
        </p>
        <p>
          A relevance gate holds back memories that score well on importance
          alone but are not about this conversation.
        </p>
      </div>
    </div>
  )
}

const TurnDiagram = () => {
  let lastPhase = ''
  return (
    <div className='relative'>
      <div className='absolute top-2 bottom-4 left-[15px] w-px bg-border' />
      <div className='space-y-0'>
        {TURN_STEPS.map((step) => {
          const Icon = step.icon
          const showPhase = step.phase !== lastPhase
          lastPhase = step.phase
          return (
            <div key={step.title} className='relative flex gap-4 pb-6'>
              <div className='z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-xs'>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='min-w-0 pt-0.5'>
                {showPhase && (
                  <p className='mb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase'>
                    {step.phase}
                  </p>
                )}
                <p className='text-sm font-semibold'>{step.title}</p>
                <p className='mt-0.5 text-sm text-muted-foreground'>
                  {step.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MemoryExplainer = ({ open, onOpenChange }: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full overflow-y-auto p-0 sm:max-w-xl'
      >
        <div className='space-y-8 p-6 pb-12'>
          <SheetHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-dare-gradient'>
                <Fingerprint className='h-5 w-5 text-white' />
              </div>
              <div>
                <SheetTitle>How memory works</SheetTitle>
                <SheetDescription>
                  What DARE keeps, where it lives, and when it reaches the
                  model.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <motion.section {...sectionMotion(0.05)} className='space-y-3'>
            <div>
              <h3 className='text-sm font-semibold'>The layers</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Memory is layered by how close it sits to the model — from your
                profile, carried into every conversation, down to your raw
                conversations, searched word-for-word only when you ask about
                the past. The profile layer is literally a markdown file —{' '}
                <span className='font-mono text-xs'>USER.md</span> — small
                enough to read in one glance. Nothing is extracted into the
                transcript layer; it simply is what was said.
              </p>
            </div>
            <LayerDiagram />
          </motion.section>

          <motion.section {...sectionMotion(0.1)} className='space-y-3'>
            <div>
              <h3 className='text-sm font-semibold'>
                How the cold layers are curated
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Facts and rules are never dumped into the prompt. Before every
                reply they pass through a funnel — searched, scored, and floored
                — so only what this turn actually needs rides along.
              </p>
            </div>
            <FunnelDiagram />
          </motion.section>

          <motion.section {...sectionMotion(0.15)} className='space-y-3'>
            <div>
              <h3 className='text-sm font-semibold'>
                One turn, start to finish
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                What happens to memory every time you send a message.
              </p>
            </div>
            <TurnDiagram />
            <p className='text-xs text-muted-foreground italic'>
              The layers are live today. The writer, gate, and consolidation
              passes are the layered memory engine DARE is rolling out next.
            </p>
          </motion.section>

          <motion.section {...sectionMotion(0.25)} className='space-y-3'>
            <h3 className='text-sm font-semibold'>The promises</h3>
            <div className='space-y-3'>
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon
                return (
                  <div key={principle.title} className='flex items-start gap-3'>
                    <div className='rounded-md bg-muted p-2'>
                      <Icon className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{principle.title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {principle.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MemoryExplainer
