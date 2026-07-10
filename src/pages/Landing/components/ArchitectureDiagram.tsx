import React from 'react'
import { ArrowRight, ArrowDown, Building2, Boxes } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'

const INSTITUTION = ['Faculty', 'Students', 'IT & Admin']
const GATEWAY = [
  'Policies & guardrails',
  'RBAC · SSO',
  'RAG · your corpus',
  'Workflow builder',
  'Usage & cost analytics',
  'Audit & transparency',
]
const MODELS = [
  'OpenAI',
  'Anthropic',
  'Gemini',
  'Llama',
  'Mistral',
  'Open-source',
]

/** A side column (institution / models) — header + chip list. */
const SideGroup: React.FC<{
  title: string
  caption: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
  className?: string
}> = ({ title, caption, icon: Icon, items, className }) => (
  <div
    className={cn(
      'flex flex-col rounded-xl border border-border bg-muted/30 p-5',
      className
    )}
  >
    <div className='flex items-center gap-2.5'>
      <span className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground'>
        <Icon className='h-4 w-4' />
      </span>
      <div className='leading-tight'>
        <p className='text-sm font-semibold text-foreground'>{title}</p>
        <p className='font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase'>
          {caption}
        </p>
      </div>
    </div>
    <div className='mt-4 flex flex-wrap gap-2'>
      {items.map((it) => (
        <span
          key={it}
          className='rounded-md border border-border bg-background/70 px-2.5 py-1 font-mono text-xs text-muted-foreground'
        >
          {it}
        </span>
      ))}
    </div>
  </div>
)

/** Directional connector — horizontal on desktop, vertical when stacked. */
const Connector: React.FC = () => (
  <div
    aria-hidden
    className='flex shrink-0 items-center justify-center py-1 md:w-12 md:py-0'
  >
    <ArrowRight className='hidden h-5 w-5 text-dare/70 md:block' />
    <ArrowDown className='h-5 w-5 text-dare/70 md:hidden' />
  </div>
)

/**
 * The conceptual hero visual: DARE as the governed layer between an
 * institution's community and the models it chooses. Encapsulates the whole
 * platform — which no single product screenshot can — and is styled to the
 * brand rather than rendered from a generic diagramming default.
 */
export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className='rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/6 sm:p-7 dark:shadow-black/40'>
      <div className='mb-6 flex items-center justify-between'>
        <span className='font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase'>
          Architecture
        </span>
        <span className='font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase'>
          one governed layer
        </span>
      </div>

      <div className='flex flex-col gap-3 md:flex-row md:items-stretch'>
        <SideGroup
          title='Your institution'
          caption='who it serves'
          icon={Building2}
          items={INSTITUTION}
          className='md:flex-1'
        />

        <Connector />

        {/* DARE gateway — the emphasized centerpiece */}
        <div className='relative flex flex-col rounded-xl border-2 border-dare/30 bg-linear-to-b from-dare/[0.07] to-transparent p-5 shadow-lg shadow-dare/5 md:flex-[1.5]'>
          <div className='flex flex-col gap-1.5'>
            <Logo size='sm' showTagline={false} />
            <p className='font-mono text-[0.6rem] tracking-[0.16em] text-dare uppercase'>
              governed gateway
            </p>
          </div>

          <ul className='mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2'>
            {GATEWAY.map((g) => (
              <li
                key={g}
                className='flex items-center gap-2 rounded-md bg-background/60 px-2.5 py-1.5 text-xs text-foreground/80'
              >
                <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-dare/70' />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <Connector />

        <SideGroup
          title='Any model'
          caption='commercial & open'
          icon={Boxes}
          items={MODELS}
          className='md:flex-1'
        />
      </div>

      <p className='mt-6 text-center text-sm leading-relaxed text-muted-foreground'>
        DARE sits between your community and the models it uses — deployed on
        your own infrastructure, governed by your own policies.
      </p>
    </div>
  )
}

export default ArchitectureDiagram
