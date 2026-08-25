import {
  Transaction,
  TransactionSummary,
  BillingModelStatsResponse,
  EnergyStatsResponse,
  WalletsListResponse,
  WalletType,
  LiteLLMKeyResponse,
  LiteLLMTestResponse,
  SetActiveWalletResponse,
} from '@/redux/types/billing'
import { PlatformFilter } from '@/utils/constants/billing'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

export interface TransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
  summary: TransactionSummary
}

export interface GetTransactionsOptions {
  page?: number
  platform?: PlatformFilter
  billingMode?: 'wallet' | 'own_api' | 'litellm' | null
}

export const getTransactionsAPI = async (
  options: GetTransactionsOptions = {}
): Promise<TransactionsResponse> => {
  const {
    page = 1,
    platform = PlatformFilter.ALL,
    billingMode = null,
  } = options
  const params = new URLSearchParams({
    page: String(page),
    platform,
  })
  if (billingMode) params.append('billing_mode', billingMode)

  return await baseRequest<TransactionsResponse>({
    url: `api/billing/transactions/?${params.toString()}`,
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

export const createLiteLLMKeyAPI = async (
  label: string,
  baseUrl: string,
  apiKey: string,
  titleModel: string,
  memoryModel: string
): Promise<LiteLLMKeyResponse> => {
  return await baseRequest<LiteLLMKeyResponse>({
    url: 'api/billing/wallets/litellm/',
    method: METHOD.POST,
    data: { label, baseUrl, apiKey, titleModel, memoryModel },
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

export const updateLiteLLMKeyModelsAPI = async (
  id: string,
  titleModel: string,
  memoryModel: string
): Promise<LiteLLMKeyResponse> => {
  return await baseRequest<LiteLLMKeyResponse>({
    url: `api/billing/wallets/litellm/${id}/`,
    method: METHOD.PATCH,
    data: { titleModel, memoryModel },
  })
}

export const deleteLiteLLMKeyAPI = async (id: string): Promise<void> => {
  return await baseRequest<void>({
    url: `api/billing/wallets/litellm/${id}/`,
    method: METHOD.DELETE,
  })
}

export const testLiteLLMUnsavedAPI = async (
  baseUrl: string,
  apiKey: string
): Promise<LiteLLMTestResponse> => {
  return await baseRequest<LiteLLMTestResponse>({
    url: 'api/billing/wallets/litellm/test/',
    method: METHOD.POST,
    data: { base_url: baseUrl, api_key: apiKey },
  })
}

export const testLiteLLMSavedAPI = async (
  id: string
): Promise<LiteLLMTestResponse> => {
  return await baseRequest<LiteLLMTestResponse>({
    url: `api/billing/wallets/litellm/${id}/test/`,
    method: METHOD.POST,
  })
}
