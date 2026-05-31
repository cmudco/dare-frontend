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
  deploymentGuide: '/docs/',
  architecture: '/docs/backend/architecture/',
  contributing: '/docs/frontend/contributing/',
  brandUsage: '/docs/reference/brand/',
  repository: 'https://github.com/cmudco',
  community: 'https://github.com/cmudco',
  pilotAccount: 'mailto:dare@cmu.edu?subject=DARE%20pilot%20account%20request',
  partner: 'mailto:vks@andrew.cmu.edu?subject=DARE%20partnership',
  contact: 'mailto:vks@andrew.cmu.edu?subject=DARE%20inquiry',
} as const
