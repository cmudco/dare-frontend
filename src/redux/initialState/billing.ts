import { BillingState } from '../types/billing'

export const initialBillingState: BillingState = {
  wallet: null,
  transactions: [],
  transactionCount: 0,
  nextPage: null,
  previousPage: null,
  loading: false,
  error: null,
  modelStats: [],
  overallStats: null,
  modelStatsLoading: false,
}
