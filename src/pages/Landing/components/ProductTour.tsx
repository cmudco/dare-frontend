import React, { useState } from 'react'
import {
  LayoutDashboard,
  Leaf,
  MessagesSquare,
  Workflow,
  FlaskConical,
  Wallet,
  FolderSearch,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container, Eyebrow, Section, SectionTitle } from './primitives'

/**
 * Product tour — real screenshots of the shipping console, one stop per major
 * feature. The bento above (Capabilities) *describes* the platform; this
 * section *shows* it. Screenshots live in /public/screenshots and are lazy
 * loaded, so the tour adds nothing to first paint.
 */

/**
 * Optional walkthrough video. Point this at a hosted MP4/WebM and a
 * "Walkthrough" stop appears first in the tour, playing inline in the same
 * frame — no other changes needed. Leave null until the recording exists.
 */
const WALKTHROUGH_VIDEO_URL: string | null = null
const WALKTHROUGH_POSTER = '/screenshots/dashboard.png'

type Stop = {
  key: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  blurb: string
  src: string
  alt: string
  /** Rendered as a <video> instead of an <img> when set. */
  video?: string
}

const FEATURE_STOPS: Stop[] = [
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    title: 'Usage dashboard',
    blurb:
      'Messages, conversations, tokens, and wallet balance — the whole account at a glance the moment you land.',
    src: '/screenshots/dashboard.png',
    alt: 'DARE usage dashboard overview showing AI messages, conversations, files, token counts, and wallet balance',
  },
  {
    key: 'impact',
    icon: Leaf,
    title: 'Environmental impact',
    blurb:
      'Energy, carbon, and water metered per message — translated into equivalents anyone can feel.',
    src: '/screenshots/environmental-usage.png',
    alt: 'DARE environmental impact dashboard showing total energy, carbon footprint, water usage, real-world equivalents, and energy consumption by model',
  },
  {
    key: 'chat',
    icon: MessagesSquare,
    title: 'Conversations',
    blurb:
      'Streaming chat across every connected model, with per-conversation tools, temperature, and history controls.',
    src: '/screenshots/conversation.png',
    alt: 'DARE conversation view with a model response and the per-conversation configuration panel open',
  },
  {
    key: 'workflows',
    icon: Workflow,
    title: 'Workflow builder',
    blurb:
      'Multi-step pipelines on a visual canvas — conditional routes, human validation, documentation notes.',
    src: '/screenshots/workflows.png',
    alt: 'DARE workflow builder canvas showing a multi-node pedagogy pipeline with conditional routing',
  },
  {
    key: 'research',
    icon: FlaskConical,
    title: 'Research mode',
    blurb:
      'An agent gathers candidate sources; you review each finding; only what holds up becomes knowledge.',
    src: '/screenshots/research-mode.png',
    alt: 'DARE research workspace showing a research question, review pipeline, and recent agent runs',
  },
  {
    key: 'costs',
    icon: Wallet,
    title: 'Cost tracking',
    blurb:
      'A wallet per user and a ledger per message — every token, model, and dollar accounted for.',
    src: '/screenshots/cost-wallet.png',
    alt: 'DARE cost tracking page with wallet balance and a per-message transaction history',
  },
  {
    key: 'files',
    icon: FolderSearch,
    title: 'Files & RAG',
    blurb:
      'Upload a corpus, tag and organize it, and ground every answer in your own materials.',
    src: '/screenshots/files.png',
    alt: 'DARE file manager listing uploaded documents with processing status and tag filters',
  },
]

const STOPS: Stop[] = WALKTHROUGH_VIDEO_URL
  ? [
      {
        key: 'walkthrough',
        icon: Play,
        title: 'Video walkthrough',
        blurb: 'A guided pass through the console, end to end.',
        src: WALKTHROUGH_POSTER,
        alt: 'DARE walkthrough video',
        video: WALKTHROUGH_VIDEO_URL,
      },
      ...FEATURE_STOPS,
    ]
  : FEATURE_STOPS

export const ProductTour: React.FC = () => {
  const [active, setActive] = useState(0)
  const stop = STOPS[active]

  return (
    <Section id='tour' className='scroll-mt-20 border-t border-border'>
      <Container>
        <div className='grid items-end gap-10 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <Eyebrow index='02'>Product tour</Eyebrow>
            <SectionTitle className='mt-5'>
              Not mockups. The shipping console.
            </SectionTitle>
          </div>
          <p className='text-base leading-relaxed text-muted-foreground lg:col-span-5'>
            From the usage dashboard and per-message energy metering to the
            workflow canvas and the research review loop — this is what your
            community sees on day one.
          </p>
        </div>

        <div className='mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8'>
          {/* Stop list — vertical rail on desktop, scrollable pills on mobile */}
          <div
            role='tablist'
            aria-label='Platform features'
            className='flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0'
          >
            {STOPS.map(({ key, icon: Icon, title, blurb }, i) => {
              const selected = i === active
              return (
                <button
                  key={key}
                  role='tab'
                  id={`tour-tab-${key}`}
                  aria-selected={selected}
                  aria-controls='tour-panel'
                  onClick={() => setActive(i)}
                  className={cn(
                    'group flex min-w-60 shrink-0 items-start gap-3 rounded-xl border p-4 text-left transition-colors lg:min-w-0',
                    selected
                      ? 'border-dare/30 bg-card'
                      : 'border-transparent hover:border-border hover:bg-card/60'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                      selected
                        ? 'border-dare/40 bg-background/60 text-dare'
                        : 'border-border bg-background/60 text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    <Icon className='h-4 w-4' />
                  </span>
                  <span>
                    <span
                      className={cn(
                        'block text-sm font-semibold',
                        selected ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {title}
                    </span>
                    <span
                      className={cn(
                        'mt-1 hidden text-xs leading-relaxed text-muted-foreground',
                        selected && 'lg:block'
                      )}
                    >
                      {blurb}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Screenshot stage — browser-style frame, fixed aspect (no layout shift) */}
          <div className='lg:col-span-8'>
            <div
              id='tour-panel'
              role='tabpanel'
              aria-labelledby={`tour-tab-${stop.key}`}
              className='overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-dare/5'
            >
              <div className='flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-border' />
                <span className='h-2.5 w-2.5 rounded-full bg-border' />
                <span className='h-2.5 w-2.5 rounded-full bg-border' />
                <span className='mx-auto flex items-center rounded-md border border-border bg-background/70 px-3 py-0.5 font-mono text-[0.65rem] tracking-wide text-muted-foreground'>
                  dare.your-institution.edu
                </span>
              </div>

              <div className='relative aspect-[3024/1655]'>
                {stop.video ? (
                  <video
                    key={stop.video}
                    controls
                    preload='none'
                    poster={stop.src}
                    className='absolute inset-0 h-full w-full object-cover'
                  >
                    <source src={stop.video} />
                  </video>
                ) : (
                  STOPS.filter((s) => !s.video).map((s) => (
                    <img
                      key={s.key}
                      src={s.src}
                      alt={s.key === stop.key ? s.alt : ''}
                      loading='lazy'
                      decoding='async'
                      aria-hidden={s.key !== stop.key}
                      className={cn(
                        'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                        s.key === stop.key ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Active-stop caption — the rail hides blurbs below lg */}
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground lg:hidden'>
              {stop.blurb}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}

export default ProductTour
