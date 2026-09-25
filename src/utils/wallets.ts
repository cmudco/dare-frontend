import { UnifiedWallet } from '@/redux/types/billing'

/** User-owned LiteLLM keys run background jobs on the DARE default until a model is chosen. */
export const needsBackgroundModel = (wallet: UnifiedWallet): boolean =>
  wallet.type === 'LITELLM' &&
  wallet.source === 'USER' &&
  !wallet.backgroundModel

/** Two-decimal USD for a decimal string from the billing API. Usage below a
 *  cent reads as "<$0.01" so it is not mistaken for no usage at all. */
export const formatUsd = (amount: string): string => {
  const value = Number(amount)
  return value > 0 && value < 0.01 ? '<$0.01' : `$${value.toFixed(2)}`
}

/** Form value for an optional API amount: "15.000000" → "15", null → "". */
export const toAmountInput = (amount: string | null): string =>
  amount === null ? '' : String(Number(amount))
