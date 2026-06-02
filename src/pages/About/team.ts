/**
 * The people shown on the About page, grouped by tier (Founders / Team).
 *
 * `avatar` may be a remote URL (e.g. a GitHub avatar) or a path under /public;
 * if omitted the card falls back to the person's initials. `role`, `bio` and
 * `socials` are all optional — the card renders gracefully without them, so it's
 * safe to flesh these out incrementally as we collect links and headshots.
 */
export interface SocialLink {
  type: 'github' | 'linkedin' | 'email' | 'website'
  href: string
}

export interface TeamMember {
  name: string
  role?: string
  bio?: string
  avatar?: string
  socials: SocialLink[]
}

export interface TeamGroup {
  label: string
  members: TeamMember[]
}

export const TEAM_GROUPS: TeamGroup[] = [
  {
    label: 'Founders',
    members: [
      {
        name: 'Vincent Sha',
        role: 'Founder',
        avatar: '/team/vince.png',
        socials: [],
      },
      {
        name: 'George Cann',
        role: 'Founder',
        avatar: '/team/george.png',
        socials: [],
      },
      {
        name: 'Carl Skipper',
        role: 'Founder',
        avatar: '/team/carl.png',
        socials: [],
      },
    ],
  },
  {
    label: 'Team',
    members: [
      { name: 'Sayeed Choudhury', role: 'Contributor', socials: [] },
      { name: 'Muhammad Abdurrehman', role: 'Team Lead', socials: [] },
      { name: 'Brian Wingenroth', role: 'Developer', socials: [] },
      { name: 'Farhat Abbas', role: 'Developer', socials: [] },
      { name: 'Hariss M.', role: 'Developer', socials: [] },
      { name: 'Eira Khan', role: 'QA', socials: [] },
    ],
  },
]
