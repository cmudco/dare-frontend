export enum BillingMode {
  WALLET = 'Use Wallet Credits',
  OWN_API = 'Use Own API Keys',
  LITELLM = 'Use LiteLLM Proxy Key',
}

export enum TransactionTab {
  ALL = 'all',
  WALLET = 'wallet',
  OWN_API = 'own-api',
  LITELLM = 'litellm',
}

export enum PlatformFilter {
  ALL = 'ALL',
  DARE = 'DARE',
  SOCRATIC_BOTS = 'SocraticBots',
}

export const PLATFORM_LABELS: Record<PlatformFilter, string> = {
  [PlatformFilter.ALL]: 'All Platforms',
  [PlatformFilter.DARE]: 'DARE',
  [PlatformFilter.SOCRATIC_BOTS]: 'Socratic Bots',
}

export const getBillingModeLabel = (mode: BillingMode): string => {
  switch (mode) {
    case BillingMode.WALLET:
      return 'Wallet'
    case BillingMode.OWN_API:
      return 'Own API'
    case BillingMode.LITELLM:
      return 'LiteLLM'
    default:
      return 'Unknown'
  }
}

/**
 * Maps the `TransactionTab` enum to the backend `billing_mode` query param.
 * The "All" tab returns null — no `billing_mode` filter is applied.
 */
export const tabToBillingModeParam = (
  tab: TransactionTab
): 'wallet' | 'own_api' | 'litellm' | null => {
  switch (tab) {
    case TransactionTab.WALLET:
      return 'wallet'
    case TransactionTab.OWN_API:
      return 'own_api'
    case TransactionTab.LITELLM:
      return 'litellm'
    default:
      return null
  }
}
