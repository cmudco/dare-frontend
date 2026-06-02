import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  Code2,
  Server,
  ArrowUpRight,
  GitFork,
  Scale,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Nav from '../Landing/components/Nav'
import Footer from '../Landing/components/Footer'
import {
  Container,
  Eyebrow,
  Section,
  SectionTitle,
} from '../Landing/components/primitives'
import { TEAM_GROUPS, type TeamMember, type SocialLink } from './team'
import { REPOS, type RepoEntry } from './repos'

/**
 * Unified public "About" page.
 *
 * A single, GitHub-README-style overview of the project: what DARE / OFAI is,
 * the two repositories it ships as, and the founding members behind it — so a
 * visitor handed the /about URL gets the whole story on one page (access the
 * repos up top, meet the team below). Reuses the landing page's chrome (Nav /
 * Footer) and design primitives so it reads as a native part of the site and
 * follows the global light/dark theme with no bespoke colour handling.
 */

/* ------------------------------------------------------------------ */
/* Repositories                                                        */
/* ------------------------------------------------------------------ */

// Map a repo's role to its icon here (not in repos.ts) so the data file stays
// plain serialisable values and the view owns its presentation.
const REPO_ICON: Record<RepoEntry['role'], typeof Code2> = {
  Frontend: Code2,
  Backend: Server,
}

// One repository tile: role badge + icon, name/description, tech tags, a
// language/license meta row, and an external "view repository" link.
const RepoCard: React.FC<{ repo: RepoEntry }> = ({ repo }) => {
  const Icon = REPO_ICON[repo.role]
  return (
    <div className='flex flex-col rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20'>
      <div className='flex items-center justify-between'>
        <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-dare/10 text-dare'>
          <Icon className='h-5 w-5' />
        </span>
        <span className='font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground'>
          {repo.role}
        </span>
      </div>

      <h3 className='mt-5 font-serif text-xl font-semibold text-foreground'>
        {repo.name}
      </h3>
      <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
        {repo.description}
      </p>

      <div className='mt-5 flex flex-wrap gap-2'>
        {repo.tags.map((tag) => (
          <Badge key={tag} variant='gray'>
            {tag}
          </Badge>
        ))}
      </div>

      <dl className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground'>
        <div className='flex items-center gap-1.5'>
          <span className='h-2 w-2 rounded-full bg-dare' aria-hidden />
          <dt className='sr-only'>Primary language</dt>
          <dd>{repo.language}</dd>
        </div>
        <div className='flex items-center gap-1.5'>
          <Scale className='h-3.5 w-3.5' aria-hidden />
          <dt className='sr-only'>License</dt>
          <dd>{repo.license}</dd>
        </div>
      </dl>

      <div className='mt-6 border-t border-border pt-5'>
        <a
          href={repo.url}
          target='_blank'
          rel='noreferrer'
          className='group inline-flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground transition-colors hover:text-dare'
        >
          <span className='inline-flex items-center gap-2'>
            <GitFork className='h-4 w-4' />
            View repository
          </span>
          <ArrowUpRight className='h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-dare' />
        </a>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

// Icon + accessible label per social-link type. SOCIAL_LABEL is used only for
// the aria-label so the icon-only links remain screen-reader friendly.
const SOCIAL_ICON: Record<SocialLink['type'], typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
}

const SOCIAL_LABEL: Record<SocialLink['type'], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  email: 'Email',
  website: 'Website',
}

// Monogram shown when a member has no headshot: first letter of up to two
// name parts (e.g. "Vincent Sha" -> "VS").
const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

// One person tile. role / bio / socials are all optional and only render when
// present, so a sparsely-filled entry in team.ts still looks intentional rather
// than broken — fill them in incrementally as we gather links and headshots.
const MemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className='group flex flex-col items-center rounded-2xl border border-border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-dare/30 hover:shadow-xl hover:shadow-black/[0.06] dark:hover:shadow-black/30'>
    <div className='relative'>
      {/* Soft brand glow that blooms on hover */}
      <div
        className='absolute -inset-1 rounded-full bg-dare-gradient opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-30'
        aria-hidden
      />
      {member.avatar ? (
        <img
          src={member.avatar}
          alt={member.name}
          loading='lazy'
          className='relative h-24 w-24 rounded-full object-cover ring-2 ring-border transition-all duration-300 group-hover:scale-105 group-hover:ring-dare/40'
        />
      ) : (
        <span className='relative flex h-24 w-24 items-center justify-center rounded-full bg-dare/10 font-serif text-2xl font-semibold text-dare ring-2 ring-border transition-all duration-300 group-hover:scale-105 group-hover:ring-dare/40'>
          {initials(member.name)}
        </span>
      )}
    </div>

    <h3 className='mt-5 font-serif text-xl font-semibold text-foreground'>
      {member.name}
    </h3>
    {member.role && (
      <p className='mt-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground'>
        {member.role}
      </p>
    )}
    {member.bio && (
      <p className='mt-4 text-sm leading-relaxed text-muted-foreground'>
        {member.bio}
      </p>
    )}

    {member.socials.length > 0 && (
      <div className='mt-6 flex items-center gap-2 border-t border-border pt-5'>
        {member.socials.map((s) => {
          const Icon = SOCIAL_ICON[s.type]
          const isEmail = s.type === 'email'
          return (
            <a
              key={s.type + s.href}
              href={s.href}
              target={isEmail ? undefined : '_blank'}
              rel={isEmail ? undefined : 'noreferrer'}
              aria-label={`${member.name} — ${SOCIAL_LABEL[s.type]}`}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-dare'
            >
              <Icon className='h-[1.05rem] w-[1.05rem]' />
            </a>
          )
        })}
      </div>
    )}
  </div>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const AboutPage: React.FC = () => {
  const { hash } = useLocation()

  // Honour deep links / the /repositories redirect (#repositories, #team).
  // React Router doesn't scroll to a hash on navigation, so do it ourselves.
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <div className='min-h-screen scroll-smooth bg-background font-sans text-foreground antialiased'>
      <Nav />
      <main>
        {/* Mission / about DARE */}
        <Section className='pt-32'>
          <Container>
            <div className='max-w-3xl'>
              <Eyebrow index='01'>About</Eyebrow>
              <SectionTitle className='mt-5'>
                AI infrastructure that institutions can trust, inspect, and
                improve.
              </SectionTitle>
              <p className='mt-6 text-base leading-relaxed text-muted-foreground'>
                DARE is the flagship platform of the Open Forum for AI (OFAI), a
                Carnegie Mellon University initiative for responsible,
                faculty-driven AI integration in higher education. It is built
                and maintained in the open by the Dietrich College Computing
                &amp; Operations team.
              </p>
              <p className='mt-4 text-base leading-relaxed text-muted-foreground'>
                Rather than chase scale, we are building something worth
                learning from — and learning from every institution that deploys
                it. The platform ships as two repositories you can read, run,
                and extend on your own infrastructure, under your own
                governance.
              </p>

              <div className='mt-8 flex flex-wrap items-center gap-3'>
                <a
                  href='#repositories'
                  className='inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-dare/40 hover:text-dare'
                >
                  <GitFork className='h-4 w-4' />
                  Browse the repositories
                </a>
                <a
                  href='#team'
                  className='inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  Meet the team
                  <ArrowUpRight className='h-4 w-4' />
                </a>
              </div>
            </div>
          </Container>
        </Section>

        {/* Repositories */}
        <Section
          id='repositories'
          className='scroll-mt-20 border-t border-border'
        >
          <Container>
            <div className='max-w-2xl'>
              <Eyebrow index='02'>Repositories</Eyebrow>
              <SectionTitle className='mt-5'>
                DARE is built and shipped as two repositories.
              </SectionTitle>
              <p className='mt-5 text-base leading-relaxed text-muted-foreground'>
                Rather than a single monorepo, DARE separates its console UI
                from its API and AI services. Both live under the{' '}
                <a
                  href='https://github.com/cmudco'
                  target='_blank'
                  rel='noreferrer'
                  className='text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-dare hover:decoration-dare'
                >
                  cmudco
                </a>{' '}
                organisation on GitHub.
              </p>
            </div>

            <div className='mt-14 grid gap-6 lg:grid-cols-2'>
              {REPOS.map((repo) => (
                <RepoCard key={repo.name} repo={repo} />
              ))}
            </div>
          </Container>
        </Section>

        {/* Meet the team */}
        <Section id='team' className='scroll-mt-20 border-t border-border'>
          <Container>
            <div className='max-w-2xl'>
              <Eyebrow index='03'>The people</Eyebrow>
              <SectionTitle className='mt-5'>Meet the team.</SectionTitle>
              <p className='mt-5 text-base leading-relaxed text-muted-foreground'>
                A small team building DARE seriously and in public — the people
                behind the platform.
              </p>
            </div>

            {/* One labelled block per tier (Founders, Team), each a responsive
                1 -> 2 -> 3 column grid of member cards. */}
            {TEAM_GROUPS.map((group) => (
              <div key={group.label} className='mt-14'>
                <h3 className='font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                  {group.label}
                </h3>
                <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {group.members.map((member) => (
                    <MemberCard key={member.name} member={member} />
                  ))}
                </div>
              </div>
            ))}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}

export default AboutPage
