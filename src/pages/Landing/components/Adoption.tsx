import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Container, Eyebrow } from './primitives'
import { LINKS } from '../links'

const STATS = [
  { value: '2,000+', label: 'students served' },
  { value: 'Multi-school', label: 'collaborations underway' },
  { value: 'US & intl.', label: 'partner institutions piloting' },
]

export const Adoption: React.FC = () => {
  return (
    <section
      id='adoption'
      className='scroll-mt-20 border-t border-border py-24 sm:py-28'
    >
      <Container>
        <div className='overflow-hidden rounded-3xl border border-border bg-card'>
          <div className='grid lg:grid-cols-2'>
            {/* Copy + CTA */}
            <div className='p-9 sm:p-12'>
              <Eyebrow index='07'>Adoption</Eyebrow>
              <h2 className='mt-5 font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl'>
                Built honest, useful, and replicable.
              </h2>
              <p className='mt-5 max-w-md text-base leading-relaxed text-muted-foreground'>
                We are not trying to be everywhere at once. We are trying to
                build something worth learning from — and to learn from every
                institution that deploys it. If yours is exploring responsible
                AI integration on the same values, we&apos;d like to talk.
              </p>
              <a
                href={LINKS.partner}
                className='group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-dare-gradient px-6 font-semibold text-white shadow-lg shadow-dare/20 transition-all hover:shadow-dare/30'
              >
                Become a partner
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
              </a>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-1 border-t border-border bg-muted/40 sm:grid-cols-3 lg:grid-cols-1 lg:border-t-0 lg:border-l'>
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={
                    'flex flex-col justify-center p-8 sm:p-9 ' +
                    (i > 0
                      ? 'border-t border-border sm:border-t-0 sm:border-l lg:border-t lg:border-l-0'
                      : '')
                  }
                >
                  <span className='font-serif text-3xl font-semibold text-foreground sm:text-4xl'>
                    {s.value}
                  </span>
                  <span className='mt-1.5 text-sm text-muted-foreground'>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default Adoption
