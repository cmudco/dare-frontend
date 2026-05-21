import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export type FeatureFlagMap = Record<string, boolean>

export interface FeatureFlagsResponse {
  flags: FeatureFlagMap
}

export const getMyFeatureFlags = async (): Promise<FeatureFlagsResponse> => {
  return await baseRequest<FeatureFlagsResponse>({
    url: 'api/feature-flags/me/',
    method: METHOD.GET,
    includeAuthToken: true,
  })
}
