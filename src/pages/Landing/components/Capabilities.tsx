import React from 'react'
import {
  Layers,
  Database,
  Workflow,
  BarChart3,
  KeyRound,
  Box,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container, Eyebrow, Section, SectionTitle } from './primitives'

type Tile = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  /** lg-and-up bento span — base/sm stay single-column so it stacks cleanly */
  span: string
  feature?: boolean
}

const TILES: Tile[] = [
  {
    icon: Layers,
    title: 'Multi-model access',
    body: 'One governed gateway across leading commercial and open-source LLMs. Connect the models you choose, swap them without rewrites.',
    span: 'lg:col-span-2 lg:row-span-2',
    feature: true,
  },
  {
    icon: Workflow,
    title: 'Workflow builder',
    body: 'A visual canvas with conditional logic for composing multi-step, pedagogically intentional tools.',
    span: 'lg:col-span-2',
  },
  {
    icon: Database,
    title: 'RAG, grounded in your corpus',
    body: 'Retrieval over institutional documents, with answers grounded in your own materials.',
    span: 'lg:col-span-1 lg:row-span-1',
  },
  {
    icon: BarChart3,
    title: 'Usage & cost analytics',
    body: 'Spend and usage scoped to your deployment.',
    span: 'lg:col-span-1 lg:row-span-1',
  },
  {
    icon: KeyRound,
    title: 'Role-based access & SSO',
    body: 'Granular RBAC with straightforward single sign-on integration paths.',
    span: 'lg:col-span-2',
  },
  {
    icon: Box,
    title: 'Docker-based deployment',
    body: 'Runs on your own infrastructure. No external data dependency, no required connection to CMU.',
    span: 'lg:col-span-2',
  },
]

const PROVIDERS = [
  { name: 'OpenAI', src: '/icons/providers/openai.png' },
  { name: 'Anthropic', src: '/icons/providers/claude.png' },
  { name: 'Google Gemini', src: '/icons/providers/gemini.png' },
  { name: 'Meta Llama', src: '/icons/providers/llama.png' },
]

const ORBIT_DURATION = 40 // seconds — slow, ambient
const ORBIT_RADIUS = '6.25rem'

/**
 * Real provider logos orbiting the DARE gateway hub. Each badge counter-rotates
 * as it revolves so the logo stays upright; evenly spaced and driven by one slow
 * duration so they hold formation. Uses the actual brand assets in
 * /icons/providers, and honours prefers-reduced-motion.
 */
const OrbitingModelsVisual: React.FC = () => {
  return (
    <div className='relative mt-auto flex min-h-64 items-center justify-center overflow-hidden pt-6'>
      <style>
        {`
          @keyframes dare-provider-orbit {
            from { transform: rotate(var(--orbit-start)) translateX(var(--orbit-radius)) rotate(calc(-1 * var(--orbit-start))); }
            to   { transform: rotate(calc(var(--orbit-start) + 360deg)) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--orbit-start) + 360deg))); }
          }
          @media (prefers-reduced-motion: reduce) {
            .dare-orbit-badge { animation: none !important; }
          }
        `}
      </style>

      {/* Guide rings */}
      <div className='absolute h-50 w-50 rounded-full border border-border/60' />
      <div className='absolute h-34 w-34 rounded-full border border-border/50' />

      {/* Gateway hub — the real shield mark */}
      <div className='relative z-10 flex h-19 w-19 flex-col items-center justify-center gap-1 rounded-full border border-dare/25 bg-background shadow-xs'>
        <img src='/icons/Logo.png' alt='' aria-hidden className='w-8' />
        <span className='font-mono text-[0.5rem] tracking-[0.16em] text-dare uppercase'>
          Gateway
        </span>
      </div>

      {/* Orbiting provider logos */}
      {PROVIDERS.map((p, i) => (
        <div
          key={p.name}
          className='dare-orbit-badge absolute top-1/2 left-1/2 z-20'
          style={
            {
              '--orbit-start': `${(360 / PROVIDERS.length) * i}deg`,
              '--orbit-radius': ORBIT_RADIUS,
              animation: `dare-provider-orbit ${ORBIT_DURATION}s linear infinite`,
            } as React.CSSProperties
          }
        >
          <div
            className='flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-xs'
            title={p.name}
            aria-label={p.name}
          >
            <img src={p.src} alt={p.name} className='h-7 w-7 object-contain' />
          </div>
        </div>
      ))}
    </div>
  )
}

export const Capabilities: React.FC = () => {
  return (
    <Section
      id='platform'
      className='scroll-mt-20 border-t border-border bg-muted/30'
    >
      <Container>
        <div className='grid items-end gap-10 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <Eyebrow index='05'>Platform</Eyebrow>
            <SectionTitle className='mt-5'>
              It is not a chatbot. It is infrastructure.
            </SectionTitle>
          </div>
          <p className='text-base leading-relaxed text-muted-foreground lg:col-span-5'>
            DARE sits between your institution and the models your community
            uses — a governed, pedagogically grounded gateway. It reduces
            barriers to <em>responsible</em> AI access, not to AI use
            indiscriminately. The difference matters.
          </p>
        </div>

        {/* Bento — varied spans, single column on small screens */}
        <div className='mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(15.5rem,auto)] lg:grid-cols-4'>
          {TILES.map(({ icon: Icon, title, body, span, feature }) => (
            <article
              key={title}
              className={cn(
                'group relative flex min-h-62 flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-dare/30',
                span,
                feature && 'bg-linear-to-br from-card to-muted/40 sm:col-span-2'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-xl border border-border bg-background/60 text-dare transition-colors group-hover:border-dare/40',
                  feature ? 'h-12 w-12' : 'h-10 w-10'
                )}
              >
                <Icon className={feature ? 'h-6 w-6' : 'h-5 w-5'} />
              </span>

              <h3
                className={cn(
                  'mt-5 font-semibold text-foreground',
                  feature ? 'font-serif text-2xl' : 'text-lg'
                )}
              >
                {title}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                {body}
              </p>

              {feature && <OrbitingModelsVisual />}
            </article>
          ))}
        </div>

        <p className='mt-8 text-sm text-muted-foreground'>
          Additional tools are under active development and ship as bolt-on
          modules against the DARE API gateway.
        </p>
      </Container>
    </Section>
  )
}

export default Capabilities
