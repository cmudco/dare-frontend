/**
 * API Keys types for Redux state management
 */

export enum Provider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  LLAMA = 'llama',
}

export type ProviderType = 'openai' | 'claude' | 'gemini' | 'llama'

export type BillingModeType = 'wallet' | 'own_api'

export interface UserProviderApiKey {
  id: number
  provider: ProviderType
  providerDisplay: string
  hasKey: boolean
  maskedKey: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProviderStatus {
  hasKey: boolean
  maskedKey: string | null
  providerDisplay: string
}

export interface ProviderStatusMap {
  openai: ProviderStatus
  claude: ProviderStatus
  gemini: ProviderStatus
  llama: ProviderStatus
}

export interface BillingModeResponse {
  billingMode: BillingModeType
  billingModeDisplay: string
  message?: string
}

export interface UpdateApiKeyRequest {
  provider: ProviderType
  apiKey: string
}

export interface ApiKeysState {
  userApiKeys: UserProviderApiKey[]
  providerStatus: ProviderStatusMap | null
  billingMode: BillingModeType
  billingModeDisplay: string
  loading: boolean
  error: string | null
  updating: boolean
  updateError: string | null
}
