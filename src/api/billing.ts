import {
  Transaction,
  BillingModelStatsResponse,
  EnergyStatsResponse,
  WalletsListResponse,
  WalletType,
  FeatureFlagsResponse,
  LiteLLMKeyResponse,
  SetActiveWalletResponse,
} from '@/redux/types/billing'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

export const getTransactionsAPI = async (
  page: number = 1
): Promise<{
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}> => {
  return await baseRequest<{
    count: number
    next: string | null
    previous: string | null
    results: Transaction[]
  }>({
    url: `api/billing/transactions/?page=${page}`,
    method: METHOD.GET,
  })
}

export const getBillingModelStatsAPI =
  async (): Promise<BillingModelStatsResponse> => {
    return await baseRequest<BillingModelStatsResponse>({
      url: 'api/billing/model_stats/',
      method: METHOD.GET,
    })
  }

export const getEnergyStatsAPI = async (
  period: string = 'all'
): Promise<EnergyStatsResponse> => {
  return await baseRequest<EnergyStatsResponse>({
    url: `api/billing/energy-stats/?period=${period}`,
    method: METHOD.GET,
  })
}

// ─────────────────────────────────────────────────────────────
// Multi-wallet endpoints (popover + Billing page)
// ─────────────────────────────────────────────────────────────

export const getWalletsAPI = async (): Promise<WalletsListResponse> => {
  return await baseRequest<WalletsListResponse>({
    url: 'api/billing/wallets/',
    method: METHOD.GET,
  })
}

export const setActiveWalletAPI = async (
  type: WalletType,
  refId: string | null
): Promise<SetActiveWalletResponse> => {
  return await baseRequest<SetActiveWalletResponse>({
    url: 'api/billing/wallets/active/',
    method: METHOD.PUT,
    data: { type, refId },
  })
}

export const getFeatureFlagsAPI = async (): Promise<FeatureFlagsResponse> => {
  return await baseRequest<FeatureFlagsResponse>({
    url: 'api/billing/feature-flags/',
    method: METHOD.GET,
  })
}

export const createLiteLLMKeyAPI = async (
  label: string,
  baseUrl: string,
  apiKey: string
): Promise<LiteLLMKeyResponse> => {
  return await baseRequest<LiteLLMKeyResponse>({
    url: 'api/billing/wallets/litellm/',
    method: METHOD.POST,
    data: { label, baseUrl, apiKey },
  })
}

export const renameLiteLLMKeyAPI = async (
  id: string,
  label: string
): Promise<LiteLLMKeyResponse> => {
  return await baseRequest<LiteLLMKeyResponse>({
    url: `api/billing/wallets/litellm/${id}/`,
    method: METHOD.PATCH,
    data: { label },
  })
}

export const deleteLiteLLMKeyAPI = async (id: string): Promise<void> => {
  return await baseRequest<void>({
    url: `api/billing/wallets/litellm/${id}/`,
    method: METHOD.DELETE,
  })
}
