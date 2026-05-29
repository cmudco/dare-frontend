/**
 * Outbound destinations referenced across the landing page.
 * Kept in one place so the team can confirm / swap them without hunting
 * through every section component.
 *
 * NOTE: `repository` and `community` are best guesses from the repo's GitHub
 * org (`cmudco`) — confirm before shipping publicly.
 */
export const LINKS = {
  console: '/dashboard',
  deploymentGuide: '/docs/backend/deployment-procedures',
  architecture: '/docs/backend/architecture',
  contributing: '/docs/getting-started',
  repository: 'https://github.com/cmudco',
  community: 'https://github.com/cmudco',
  partner: 'mailto:vks@andrew.cmu.edu?subject=DARE%20partnership',
  contact: 'mailto:vks@andrew.cmu.edu?subject=DARE%20inquiry',
} as const
