/**
 * Handing a signed-in user over to Research Tools.
 *
 * Both products sign their JWTs with the same key and name the user by email,
 * so this application's own access token is proof of identity there. Research
 * Tools exchanges it for a token of its own and creates the account if it has
 * never seen the address, which is why no registration step is needed.
 */

const RESEARCH_TOOLS_URL = import.meta.env.VITE_RESEARCH_TOOLS_URL as
  string | undefined

/** Whether the handover is configured for this deployment. */
export const isResearchToolsEnabled = (): boolean => Boolean(RESEARCH_TOOLS_URL)

/**
 * The URL that signs this user into Research Tools, or null if there is no
 * token to hand over or no Research Tools configured.
 */
export const researchToolsSignInUrl = (): string | null => {
  if (!RESEARCH_TOOLS_URL) return null

  const token = localStorage.getItem('token')
  if (!token) return null

  const base = RESEARCH_TOOLS_URL.replace(/\/+$/, '')
  return `${base}/sso?token=${encodeURIComponent(token)}`
}
