import { useAppSelector } from '@/redux/hooks'

/**
 * Whether the current user may see the Research section.
 */
export function useCanAccessResearch(): boolean {
  const platformRole = useAppSelector((state) => state.user.user?.platformRole)
  const enableResearch = useAppSelector(
    (state) => state.featureFlags.flags.enableResearch === true
  )

  return (
    enableResearch ||
    platformRole === 'RESEARCHER' ||
    platformRole === 'SUPERADMIN'
  )
}
