export enum BillingMode {
  WALLET = 'Use Wallet Credits',
  OWN_API = 'Use Own API Keys',
}

export enum TransactionTab {
  ALL = 'all',
  WALLET = 'wallet',
  OWN_API = 'own-api',
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
