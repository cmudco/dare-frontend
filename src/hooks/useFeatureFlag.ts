import { useSelector } from 'react-redux'

import type { RootState } from '@/redux/store'
import type { FeatureFlagMap } from '@/api/featureFlags'

/**
 * Returns the resolved value of a single feature flag for the current user.
 * Defaults to ``false`` while flags are loading or if the key is unknown.
 *
 * Keys are camelCase (post-renderer transform), e.g. ``enableByok``.
 */
export function useFeatureFlag(key: string): boolean {
  return useSelector<RootState, boolean>(
    (state) => state.featureFlags.flags[key] === true
  )
}

/**
 * Returns the full resolved flag map. Use this when a component needs to
 * read several flags at once.
 */
export function useFeatureFlags(): FeatureFlagMap {
  return useSelector<RootState, FeatureFlagMap>(
    (state) => state.featureFlags.flags
  )
}
