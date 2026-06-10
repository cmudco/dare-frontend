import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Container, Eyebrow, Section, SectionTitle } from './primitives'

const MILESTONES = [
  {
    when: '2023',
    phase: 'Committee',
    title: 'A committee, not a mandate',
    body: 'Dietrich College formed a committee to understand the risks of a new generation of large language models arriving in higher education.',
  },
  {
    when: 'Fall 2023',
    phase: 'Classroom',
    title: 'First tools in classrooms',
    body: 'Dietrich deployed the first CMU-sanctioned AI tools to classrooms — focused, accessible, built for the way educators actually work.',
  },
  {
    when: 'Jan 2024',
    phase: 'Founding',
    title: 'The Open Forum for AI',
    body: 'OFAI was founded and design and development of DARE began in earnest.',
  },
  {
    when: 'Fall 2024',
    phase: 'Courses',
    title: 'Running in courses',
    body: 'Prototypes were running in courses across Dietrich, informing every design decision with real classroom use.',
  },
  {
    when: 'Spring 2025',
    phase: 'Alpha',
    title: 'Alpha & collaboration',
    body: 'DARE entered alpha deployment with multi-school collaborations underway.',
  },
  {
    when: 'Now',
    phase: 'Release',
    title: 'Wider release',
    body: 'DARE is in wider release. This is what we learned along the way.',
  },
]

export const Timeline: React.FC = () => {
  const [active, setActive] = useState(0)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const lastIndex = MILESTONES.length - 1

  // Scroll-spy: the milestone crossing the vertical centre band becomes active.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(idx)) setActive(idx)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const current = MILESTONES[active]

  return (
    <Section className='border-t border-border bg-muted/30'>
      <Container>
        <div className='max-w-2xl'>
          <Eyebrow index='02'>Origin</Eyebrow>
          <SectionTitle className='mt-5'>
            The problem we set out to solve.
          </SectionTitle>
          <p className='mt-5 text-lg leading-relaxed text-muted-foreground'>
            What we found was not a single risk but a structural one: the tools
            available to faculty and students were either too unwieldy to use
            responsibly or too simple to use meaningfully. We needed something
            in between.
          </p>
        </div>

        <div className='mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16'>
          {/* Timeline rail */}
          <ol className='lg:col-span-7'>
            {MILESTONES.map((m, i) => {
              const isLast = i === lastIndex
              const passed = i < active
              const isActive = i === active
              return (
                <li
                  key={m.when}
                  data-index={i}
                  ref={(el) => (itemRefs.current[i] = el)}
                  className='flex gap-5 sm:gap-7'
                >
                  {/* Node + connector */}
                  <div className='flex flex-col items-center'>
                    <span
                      className={cn(
                        'mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                        isActive
                          ? 'bg-dare ring-4 ring-dare/15'
                          : passed
                            ? 'bg-dare'
                            : 'border-2 border-border bg-background'
                      )}
                    >
                      {isActive && (
                        <span className='h-1.5 w-1.5 rounded-full bg-white/90' />
                      )}
                    </span>
                    {!isLast && (
                      <span
                        className={cn(
                          'mt-1.5 w-px flex-1 transition-colors duration-300',
                          passed ? 'bg-dare' : 'bg-border'
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn('pb-12', isLast && 'pb-0')}>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors duration-300',
                        isActive
                          ? 'bg-dare/10 text-dare'
                          : 'bg-background text-muted-foreground'
                      )}
                    >
                      {m.when}
                    </span>
                    <h3 className='mt-3 font-serif text-xl font-semibold text-foreground sm:text-2xl'>
                      {m.title}
                    </h3>
                    <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base'>
                      {m.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Sticky highlight — tracks the active milestone as you scroll.
              The visual frame is a slot for a real photo / screenshot later. */}
          <div className='hidden lg:col-span-5 lg:block'>
            <div className='lg:sticky lg:top-28'>
              <div className='relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-card'>
                {/* Motif backdrop */}
                <div
                  aria-hidden
                  className='absolute inset-0 bg-linear-to-br from-dare/10 via-transparent to-transparent'
                />
                <div
                  aria-hidden
                  className='absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[20px_20px] opacity-50'
                />

                {/* Step counter */}
                <div className='absolute top-5 right-5 font-mono text-xs text-muted-foreground'>
                  {String(active + 1).padStart(2, '0')} /{' '}
                  {String(MILESTONES.length).padStart(2, '0')}
                </div>

                {/* Active content (gently animates on change) */}
                <div
                  key={active}
                  className='absolute inset-0 flex animate-in flex-col justify-end p-7 duration-300 fade-in slide-in-from-bottom-2'
                >
                  <span className='font-mono text-xs tracking-[0.22em] text-dare uppercase'>
                    {current.phase}
                  </span>
                  <span className='mt-1 font-serif text-5xl leading-none font-semibold tracking-tight text-foreground'>
                    {current.when}
                  </span>
                  <p className='mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground'>
                    {current.body}
                  </p>
                </div>
              </div>

              {/* Progress dots */}
              <div className='mt-5 flex items-center gap-2'>
                {MILESTONES.map((m, i) => (
                  <span
                    key={m.when}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === active ? 'w-6 bg-dare' : 'w-1.5 bg-border'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

export default Timeline
