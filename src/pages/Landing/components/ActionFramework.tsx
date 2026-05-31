import React, { useState } from 'react'
import { BrainCircuit, Check, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container, Eyebrow, Section, SectionTitle } from './primitives'

type Principle = {
  letter: string
  name: string
  tag: string
  desc: string
  /** label shown on the snippet panel — reads like a file / context handle */
  context: string
  lines: string[]
  researchSuggestion?: {
    mode: string
    suggestion: string
    rationale: string
    provenance: string
    confidence: string
    primaryAction: string
  }
}

const PRINCIPLES: Principle[] = [
  {
    letter: 'A',
    name: 'Agency',
    tag: 'A tool in their hands',
    desc: 'Scholars remain the orchestrators. Agents can prepare work upstream, but the scholar decides what becomes durable.',
    context: 'research.staging',
    lines: [],
    researchSuggestion: {
      mode: 'Research staging',
      suggestion: 'Scout found 4 candidate sources for the ethics section.',
      rationale:
        'Grouped by use case with inclusion rationale, uncertainty notes, and source-level provenance preserved.',
      provenance: 'PubMed MCP · Scite context · scholar soul file',
      confidence: 'High, with 1 disputed citation flagged',
      primaryAction: 'Promote to DARE',
    },
  },
  {
    letter: 'C',
    name: 'Control',
    tag: 'The parameters are yours',
    desc: 'Users stay in control of the interaction. Parameters, prompts, and outputs are the user’s responsibility.',
    context: 'course.policy.ts',
    lines: [
      'export const policy = {',
      '  models: ["claude-opus-4-8", "gemini-3.5-flash"],',
      '  effort: "high",        // model-supported',
      '  temperature: 0.4,',
      '  system: "Socratic tutor — never write for the student.",',
      '}',
    ],
  },
  {
    letter: 'T',
    name: 'Transparency',
    tag: 'No black boxes',
    desc: 'Model behavior and actions should be identifiable. Every response carries its provenance.',
    context: 'response.meta',
    lines: [
      'model     claude-opus-4-8 · effort high',
      'sources   3 retrieved · course corpus',
      'usage     1,204 tokens · $0.012 · 1.8s',
      'tools     web_search → 2 calls (shown inline)',
    ],
  },
  {
    letter: 'I',
    name: 'Informed',
    tag: 'Teaches as it assists',
    desc: 'Users should understand the how and the why. DARE is designed to teach as well as assist.',
    context: 'why-this-answer',
    lines: [
      '> Why this answer?',
      'Grounded in: Lecture 4 (pp. 12–14), Reading 2.',
      'Reasoning is shown step-by-step before the conclusion —',
      'a path you can follow, not a verdict to accept.',
    ],
  },
  {
    letter: 'O',
    name: 'Open',
    tag: 'Curiosity is a feature',
    desc: 'Interactions should be open for exploration. Curiosity is a feature, not a liability.',
    context: 'explore.branch',
    lines: [
      'branch ┬─ "Argue the opposing view"',
      '       ├─ "Show me a counterexample"',
      '       └─ "What assumption am I making?"',
    ],
  },
  {
    letter: 'N',
    name: 'Nuanced',
    tag: 'Better thinking, not faster answers',
    desc: 'Encourage thoughtful reasoning and choices. The goal is better thinking, not faster answers.',
    context: 'tutor.session',
    lines: [
      'student   "Is this thesis correct?"',
      'dare      "Before I answer — what evidence are you',
      '           weighing most heavily, and why?"',
    ],
  },
]

const lineTone = (line: string) => {
  const t = line.trimStart()
  if (t.startsWith('//') || t.startsWith('>')) return 'text-muted-foreground'
  if (t.startsWith('dare')) return 'text-dare'
  return 'text-foreground/85'
}

export const ActionFramework: React.FC = () => {
  const [active, setActive] = useState(0)
  const current = PRINCIPLES[active]

  return (
    <Section id='principles' className='scroll-mt-20 border-t border-border'>
      <Container>
        {/* Heading + the "AI in the loop" framing share the top row */}
        <div className='grid gap-10 lg:grid-cols-12 lg:items-center'>
          <div className='lg:col-span-6'>
            <Eyebrow index='03'>Principles</Eyebrow>
            <SectionTitle className='mt-5'>
              Every decision grounded in{' '}
              <span className='text-dare'>ACTION</span>.
            </SectionTitle>
            <p className='mt-5 max-w-lg text-base leading-relaxed text-muted-foreground'>
              Not aspirations — constraints we impose on ourselves when
              building. Select a principle to see how it shapes scholarly work.
            </p>
          </div>

          <div className='rounded-2xl border border-border bg-muted/40 p-6 lg:col-span-6'>
            <p className='text-base leading-relaxed text-foreground/90'>
              We call this{' '}
              <span className='font-semibold text-foreground'>
                &ldquo;AI in the loop.&rdquo;
              </span>{' '}
              The scholar plans, the AI participates, and orchestration stays
              with the scholar. Agents can scout, critique, and stage work, but
              durable knowledge is promoted deliberately.
            </p>
          </div>
        </div>

        {/* Horizontal selector — fixed equal-width cells, so the layout never
            reflows when you switch principles */}
        <div
          role='tablist'
          aria-label='ACTION principles'
          className='mt-12 grid grid-cols-3 gap-2 sm:grid-cols-6'
        >
          {PRINCIPLES.map((p, i) => {
            const selected = i === active
            return (
              <button
                key={p.name}
                role='tab'
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={cn(
                  'group flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors',
                  selected
                    ? 'border-dare/40 bg-card shadow-sm'
                    : 'border-border bg-background hover:border-dare/20 hover:bg-muted/50'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg font-serif text-xl font-semibold transition-colors',
                    selected
                      ? 'bg-dare/10 text-dare'
                      : 'bg-muted text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {p.letter}
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold sm:text-sm',
                    selected
                      ? 'text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {p.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Detail panel — full width, fixed minimum height so switching tabs
            doesn't jump the page */}
        <div className='mt-4 grid min-h-[18rem] gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-2 lg:gap-10'>
          <div className='flex flex-col'>
            <div className='flex items-baseline gap-3'>
              <span className='font-serif text-3xl font-semibold text-dare'>
                {current.letter}
              </span>
              <h3 className='font-serif text-2xl font-semibold text-foreground'>
                {current.name}
              </h3>
            </div>
            <span className='mt-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground'>
              {current.tag}
            </span>
            <p className='mt-5 max-w-md text-base leading-relaxed text-muted-foreground'>
              {current.desc}
            </p>
          </div>

          {/* Agency uses the research-staging pattern; other principles retain
              the original lightweight implementation snippets. */}
          <div className='overflow-hidden rounded-xl border border-border bg-muted/40'>
            <div className='flex items-center gap-2 border-b border-border px-4 py-2.5'>
              <span className='h-2 w-2 rounded-full bg-dare/70' />
              <span className='font-mono text-xs text-muted-foreground'>
                {current.researchSuggestion?.mode ?? current.context}
              </span>
            </div>

            {current.researchSuggestion ? (
              <div className='p-4 sm:p-5'>
                <div className='rounded-xl border border-dare/20 bg-background p-4 shadow-sm'>
                  <div className='flex items-start gap-3'>
                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dare/25 bg-dare-gradient text-white shadow-sm shadow-dare/20'>
                      <BrainCircuit className='h-4 w-4' />
                    </span>
                    <div>
                      <p className='font-mono text-[0.62rem] uppercase tracking-[0.16em] text-dare'>
                        Suggested by AI
                      </p>
                      <p className='mt-2 text-sm font-semibold leading-snug text-foreground'>
                        {current.researchSuggestion.suggestion}
                      </p>
                      <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                        {current.researchSuggestion.rationale}
                      </p>
                    </div>
                  </div>

                  <dl className='mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2'>
                    <div>
                      <dt className='font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground'>
                        Provenance
                      </dt>
                      <dd className='mt-1 text-xs leading-relaxed text-foreground/80'>
                        {current.researchSuggestion.provenance}
                      </dd>
                    </div>
                    <div>
                      <dt className='font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground'>
                        Confidence
                      </dt>
                      <dd className='mt-1 text-xs leading-relaxed text-foreground/80'>
                        {current.researchSuggestion.confidence}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className='mt-4 grid grid-cols-3 gap-2'>
                  <button className='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-dare/30 bg-dare px-3 text-xs font-semibold text-white transition-colors hover:bg-dare/90'>
                    <Check className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>
                      {current.researchSuggestion.primaryAction}
                    </span>
                    <span className='sm:hidden'>Accept</span>
                  </button>
                  <button className='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-dare/30'>
                    <Pencil className='h-3.5 w-3.5' />
                    Revise
                  </button>
                  <button className='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-dare/30 hover:text-foreground'>
                    <X className='h-3.5 w-3.5' />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <pre className='overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed'>
                {current.lines.map((line, i) => (
                  <div key={i} className={lineTone(line)}>
                    {line || ' '}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}

export default ActionFramework
