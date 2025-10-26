import {
  UserProviderApiKey,
  ProviderStatusMap,
  BillingModeResponse,
  UpdateApiKeyRequest,
  ProviderType,
  BillingModeType,
} from '@/redux/types/apiKeys'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

/**
 * Get all API keys for the authenticated user
 */
export const getUserApiKeysAPI = async (): Promise<UserProviderApiKey[]> => {
  return await baseRequest<UserProviderApiKey[]>({
    url: 'api/user-api-keys/',
    method: METHOD.GET,
  })
}

/**
 * Get status of all providers (which have keys set)
 */
export const getProviderStatusAPI = async (): Promise<ProviderStatusMap> => {
  return await baseRequest<ProviderStatusMap>({
    url: 'api/user-api-keys/status/',
    method: METHOD.GET,
  })
}

/**
 * Update API key for a specific provider
 */
export const updateApiKeyAPI = async (
  data: UpdateApiKeyRequest
): Promise<UserProviderApiKey> => {
  return await baseRequest<UserProviderApiKey>({
    url: 'api/user-api-keys/update/',
    method: METHOD.POST,
    data,
  })
}

/**
 * Delete (clear) API key for a specific provider
 */
export const deleteApiKeyAPI = async (
  provider: ProviderType
): Promise<{ message: string }> => {
  return await baseRequest<{ message: string }>({
    url: `api/user-api-keys/${provider}/`,
    method: METHOD.DELETE,
  })
}

/**
 * Get current billing mode
 */
export const getBillingModeAPI = async (): Promise<BillingModeResponse> => {
  return await baseRequest<BillingModeResponse>({
    url: 'api/user-api-keys/billing-mode/',
    method: METHOD.GET,
  })
}

/**
 * Update billing mode
 */
export const updateBillingModeAPI = async (
  billingMode: BillingModeType
): Promise<BillingModeResponse> => {
  return await baseRequest<BillingModeResponse>({
    url: 'api/user-api-keys/billing-mode/',
    method: METHOD.PATCH,
    data: { billingMode },
  })
}
