export enum BillingMode {
  WALLET = 'Use Wallet Credits',
  OWN_API = 'Use Own API Keys',
}

export enum TransactionTab {
  ALL = 'all',
  WALLET = 'wallet',
  OWN_API = 'own-api',
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
): 'wallet' | 'own_api' | null => {
  switch (tab) {
    case TransactionTab.WALLET:
      return 'wallet'
    case TransactionTab.OWN_API:
      return 'own_api'
    default:
      return null
  }
}
