import React from 'react'
import { GraduationCap, Code2, Server, ArrowUpRight } from 'lucide-react'
import { Container, Eyebrow, Section, SectionTitle } from './primitives'
import { LINKS } from '../links'

const AUDIENCES = [
  {
    icon: GraduationCap,
    role: 'For faculty',
    body: 'A course-level AI environment you actually control. Set system prompts, restrict models, design RAG workflows from your own materials, and deploy tools that challenge students rather than answer for them.',
    note: 'In active use across Dietrich courses in history, psychology, philosophy, statistics, and writing.',
    links: [{ label: 'Launch console', href: LINKS.console }],
  },
  {
    icon: Code2,
    role: 'For developers',
    body: 'DARE is open source under AGPL 3.0, actively maintained by CMU Dietrich Computing & Operations. The platform is built to be extended — additional tools deploy as bolt-on modules against the API gateway.',
    note: 'We welcome contributors who share the mission.',
    links: [
      { label: 'View the repository', href: LINKS.repository, external: true },
      { label: 'Contributing guide', href: LINKS.contributing },
    ],
  },
  {
    icon: Server,
    role: 'For IT & administrators',
    body: 'Deploys via Docker Compose, on your infrastructure, under your governance policies. No external data dependency, no vendor lock-in, no required connection to CMU systems.',
    note: 'We are honest about our service level: a best-faith effort from a small academic team, maintained seriously and built in public.',
    links: [
      { label: 'Deployment guide', href: LINKS.deploymentGuide },
      { label: 'Architecture overview', href: LINKS.architecture },
    ],
  },
]

export const Audiences: React.FC = () => {
  return (
    <Section id='audiences' className='scroll-mt-20 border-t border-border'>
      <Container>
        <div className='max-w-2xl'>
          <Eyebrow index='05'>Audiences</Eyebrow>
          <SectionTitle className='mt-5'>
            Built for the people who run the classroom.
          </SectionTitle>
        </div>

        <div className='mt-14 grid gap-6 lg:grid-cols-3'>
          {AUDIENCES.map(({ icon: Icon, role, body, note, links }) => (
            <div
              key={role}
              className='flex flex-col rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20'
            >
              <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-dare/10 text-dare'>
                <Icon className='h-5 w-5' />
              </span>
              <h3 className='mt-5 font-serif text-xl font-semibold text-foreground'>
                {role}
              </h3>
              <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
                {body}
              </p>
              <p className='mt-4 border-l-2 border-border pl-3 text-sm italic leading-relaxed text-foreground/70'>
                {note}
              </p>

              <div className='mt-6 flex flex-col gap-2 border-t border-border pt-5'>
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={
                      'external' in l && l.external ? '_blank' : undefined
                    }
                    rel={
                      'external' in l && l.external ? 'noreferrer' : undefined
                    }
                    className='group inline-flex items-center justify-between text-sm font-medium text-foreground transition-colors hover:text-dare'
                  >
                    {l.label}
                    <ArrowUpRight className='h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-dare' />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

export default Audiences
