import { useSelector } from 'react-redux'

import type { RootState } from '@/redux/store'
import type { FeatureFlagMap } from '@/api/featureFlags'

/**
 * Returns the resolved value of a single feature flag for the current user.
 * While flags are loading or if the key is unknown it returns ``fallback``:
 * pass ``true`` for a feature that is on by default, so it does not blink
 * out of view before the flags arrive.
 *
 * Keys are camelCase (post-renderer transform), e.g. ``enableByok``.
 */
export function useFeatureFlag(key: string, fallback = false): boolean {
  return useSelector<RootState, boolean>(
    (state) => state.featureFlags.flags[key] ?? fallback
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
