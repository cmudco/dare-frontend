import { ApiKeysState } from '../types/apiKeys'

export const initialApiKeysState: ApiKeysState = {
  userApiKeys: [],
  providerStatus: null,
  billingMode: 'wallet',
  billingModeDisplay: 'Use Wallet Credits',
  loading: false,
  error: null,
  updating: false,
  updateError: null,
}
