import { useAppSelector } from '@/redux/hooks'

/**
 * Whether the current user may see Research Mode. The flag is a global
 * release switch; users must also hold a role accepted by the Research API.
 */
export function useCanAccessResearch(): boolean {
  const platformRole = useAppSelector((state) => state.user.user?.platformRole)
  const enableResearch = useAppSelector(
    (state) => state.featureFlags.flags.enableResearch === true
  )

  return (
    enableResearch &&
    (platformRole === 'RESEARCHER' ||
      platformRole === 'SUPERVISOR' ||
      platformRole === 'SUPERADMIN')
  )
}
