import {
  MessageCircleQuestion,
  MessagesSquare,
  Repeat,
  Shapes,
  Telescope,
} from 'lucide-react'
import type { ElementType } from 'react'
import { AGENT_LOOP_MAX_TURNS, SCOUT_DEPTH } from '@/utils/constants/research'

interface AgentEntry {
  icon: ElementType
  name: string
  desc: string
  meta?: string
}

// A plain-language reference for what each AI helper does and its limits, so a
// scholar understands the system rather than treating it as a black box.
const AGENTS: AgentEntry[] = [
  {
    icon: Telescope,
    name: 'Scout',
    desc: 'Delegated discovery — searches your sources and the web, reads the strongest, and stages findings to your Review Inbox (never straight into the record).',
    meta: `Quick: up to ${SCOUT_DEPTH.quick.searches} searches, ${SCOUT_DEPTH.quick.findings} findings · Deep: up to ${SCOUT_DEPTH.deep.searches} searches, ${SCOUT_DEPTH.deep.findings} findings`,
  },
  {
    icon: MessageCircleQuestion,
    name: 'Critic',
    desc: 'Pressure-tests a staged finding — surfaces its weaknesses and how well the evidence holds up before you approve it.',
  },
  {
    icon: Shapes,
    name: 'Artifacts',
    desc: 'Turns your approved knowledge into renderable artifacts, grounded in the project.',
    meta: 'Diagram · SVG · HTML · Excalidraw · Document · Word · Slides',
  },
  {
    icon: MessagesSquare,
    name: 'Chat',
    desc: 'Hands-on live thinking under the project’s standards, grounded in your approved knowledge.',
  },
]

const AgentGuide = () => (
  <section className='rounded-2xl border border-border bg-card p-6'>
    <h3 className='text-sm font-medium'>How research mode works</h3>
    <p className='mt-1 text-xs text-muted-foreground'>
      Bounded AI helpers do the legwork; you decide what becomes durable
      knowledge.
    </p>

    <div className='mt-4 grid gap-3 sm:grid-cols-2'>
      {AGENTS.map((a) => {
        const Icon = a.icon
        return (
          <div
            key={a.name}
            className='flex gap-3 rounded-xl border border-border bg-background/40 p-4'
          >
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-medium'>{a.name}</p>
              <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
                {a.desc}
              </p>
              {a.meta && (
                <p className='mt-1.5 text-xs font-medium text-foreground/70'>
                  {a.meta}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>

    <div className='mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground'>
      <Repeat className='mt-0.5 h-3.5 w-3.5 shrink-0' />
      <p>
        Every run is bounded: the agent works in turns (search → read →
        produce), up to {AGENT_LOOP_MAX_TURNS} per run, then returns its result
        — DARE records the honest outcome, never a fabricated failure. All web
        search and reading goes through DARE’s own audited tools.
      </p>
    </div>
  </section>
)

export default AgentGuide
