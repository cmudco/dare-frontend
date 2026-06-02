import { useAppSelector } from '@/redux/hooks'

// TEMP (prototype): force the Research section visible for the client demo,
// regardless of role or feature flag. Remove this (set to false) once real
// research-user gating is wired — the role/flag logic below is the real seam.
const FORCE_RESEARCH_ACCESS = true

/**
 * Whether the current user may see the Research section. Long-term this is
 * gated to research users via the `RESEARCHER` platform role or an
 * `enableResearch` feature flag; for now it is forced on for demos.
 */
export function useCanAccessResearch(): boolean {
  const platformRole = useAppSelector((state) => state.user.user?.platformRole)
  const enableResearch = useAppSelector(
    (state) => state.featureFlags.flags.enableResearch === true
  )

  if (FORCE_RESEARCH_ACCESS) return true

  return (
    enableResearch ||
    platformRole === 'RESEARCHER' ||
    platformRole === 'SUPERADMIN'
  )
}
