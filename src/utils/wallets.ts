import { UnifiedWallet } from '@/redux/types/billing'

/** User-owned LiteLLM keys run background jobs on the DARE default until a model is chosen. */
export const needsBackgroundModel = (wallet: UnifiedWallet): boolean =>
  wallet.type === 'LITELLM' &&
  wallet.source === 'USER' &&
  !wallet.backgroundModel
