import React from 'react'
import { Logo } from '@/components/Logo'
import { Container } from './primitives'
import { LINKS } from '../links'

const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Principles', href: '#principles' },
      { label: 'Capabilities', href: '#platform' },
      { label: 'Audiences', href: '#audiences' },
      { label: 'Adoption', href: '#adoption' },
    ],
  },
  {
    heading: 'Build',
    links: [
      { label: 'Repository', href: LINKS.repository, external: true },
      { label: 'Deployment guide', href: LINKS.deploymentGuide },
      { label: 'Architecture', href: LINKS.architecture },
      { label: 'Contributing', href: LINKS.contributing },
    ],
  },
  {
    heading: 'OFAI',
    links: [
      { label: 'Become a partner', href: LINKS.partner },
      { label: 'Contact us', href: LINKS.contact },
    ],
  },
]

export const Footer: React.FC = () => {
  return (
    <footer className='border-t border-border bg-muted/30'>
      <Container className='py-16'>
        <div className='grid gap-12 lg:grid-cols-12'>
          {/* About */}
          <div className='lg:col-span-5'>
            <Logo size='md' showTagline />
            <p className='mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground'>
              The Open Forum for AI (OFAI) is a Carnegie Mellon University
              initiative for responsible, faculty-driven AI integration in
              higher education. DARE is its flagship open-source platform,
              developed by the Dietrich College Computing & Operations team.
            </p>
            <p className='mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground'>
              Committed to the OSI Open Source Definition — building AI
              infrastructure institutions can trust, inspect, and improve.
            </p>
          </div>

          {/* Link columns */}
          <div className='grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7'>
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className='font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                  {col.heading}
                </h3>
                <ul className='mt-4 space-y-3'>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={
                          'external' in l && l.external ? '_blank' : undefined
                        }
                        rel={
                          'external' in l && l.external
                            ? 'noreferrer'
                            : undefined
                        }
                        className='text-sm text-foreground/80 transition-colors hover:text-dare'
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-14 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p>
            Released under AGPL 3.0 · © Carnegie Mellon University. The DARE
            name and marks are governed by the{' '}
            <a
              href={LINKS.brandUsage}
              className='text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-dare hover:decoration-dare'
            >
              DARE Brand Usage Policy
            </a>
            .
          </p>
          <p className='font-mono uppercase tracking-[0.16em]'>
            Open Forum for AI · CMU Dietrich
          </p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
