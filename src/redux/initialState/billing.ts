import { BillingState } from '../types/billing'

export const initialBillingState: BillingState = {
  transactions: [],
  transactionCount: 0,
  transactionSummary: { all: 0, wallet: 0, ownApi: 0, litellm: 0 },
  nextPage: null,
  previousPage: null,
  loading: false,
  error: null,
  modelStats: [],
  overallStats: null,
  modelStatsLoading: false,
  energyStats: null,
  energyStatsLoading: false,
  energyStatsPeriod: 'all',
  ownedGroups: [],
  ownedGroupsLoading: false,
  ownedGroupsLoaded: false,
  groupActionLoading: false,
  wallets: [],
  activeWallet: { type: 'DARE', refId: null },
  walletsLoading: false,
}
