import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Container } from './primitives'
import ArchitectureDiagram from './ArchitectureDiagram'
import { LINKS } from '../links'

export const Hero: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section
      id='top'
      className='relative overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-36'
    >
      {/* Restrained brand wash */}
      <div
        aria-hidden
        className='pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-dare/[0.07] blur-[150px] dark:bg-dare/10'
      />
      {/* Faint dotted grid, faded toward the edges */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] opacity-40 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_35%,transparent_100%)]'
      />

      <Container className='relative'>
        {/* Centered copy — deliberately minimal */}
        <div className='mx-auto max-w-3xl text-center'>
          <a
            href='#adoption'
            className='inline-flex items-center gap-2 rounded-full border border-border bg-background/60 py-1 pl-1.5 pr-3 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground'
          >
            <span className='rounded-full bg-dare/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-dare'>
              CMU
            </span>
            2,000+ students · piloting across institutions
          </a>

          <h1 className='mt-7 font-serif text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]'>
            AI infrastructure built for{' '}
            <span className='text-dare'>education</span>.
          </h1>

          <p className='mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground'>
            Open source, self-hosted, and built by educators at Carnegie Mellon
            — so any institution can run a governed AI environment on its own
            terms.
          </p>

          <p className='mt-4 font-serif text-lg italic text-foreground/80'>
            We built DARE because we needed it. Now we&apos;re sharing it
            because you might too.
          </p>

          <div className='mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <button
              onClick={() => navigate(LINKS.console)}
              className='group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-dare-gradient px-6 font-semibold text-white shadow-lg shadow-dare/20 transition-all hover:shadow-dare/30'
            >
              Launch console
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
            </button>
            <a
              href={LINKS.deploymentGuide}
              className='inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 font-semibold text-foreground transition-colors hover:bg-muted'
            >
              Read the deployment guide
            </a>
          </div>

          <div className='mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground'>
            <span>Open source · AGPL 3.0</span>
            <span className='hidden h-3 w-px bg-border sm:inline' />
            <span>Self-hosted via Docker</span>
            <span className='hidden h-3 w-px bg-border sm:inline' />
            <span>No vendor lock-in</span>
          </div>
        </div>

        {/*
          Hero stage — the conceptual visual. DARE is the governed layer
          between an institution's community and the models it uses; that role
          (not any single screen) is what the hero needs to show.
          See ArchitectureDiagram for the diagram itself.
        */}
        <div className='relative mx-auto mt-16 max-w-5xl sm:mt-20'>
          <div
            aria-hidden
            className='absolute -inset-x-6 -top-6 bottom-0 -z-10 rounded-[2rem] bg-gradient-to-b from-dare/5 to-transparent blur-2xl'
          />
          <ArchitectureDiagram />

          <a
            href={LINKS.repository}
            target='_blank'
            rel='noreferrer'
            className='group mx-auto mt-4 flex w-fit items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground'
          >
            Inspect every line on GitHub
            <ArrowUpRight className='h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
          </a>
        </div>
      </Container>
    </section>
  )
}

export default Hero
