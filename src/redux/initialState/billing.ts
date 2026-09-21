import { BillingState } from '../types/billing'

export const initialBillingState: BillingState = {
  transactionsRequestId: null,
  transactions: [],
  loading: false,
  error: null,
  modelStats: [],
  overallStats: null,
  modelStatsLoading: false,
  energyStats: null,
  energyStatsLoading: false,
  energyStatsPeriod: 'all',
  litellmStats: null,
  litellmStatsLoading: false,
  ownedGroups: [],
  ownedGroupsLoading: false,
  ownedGroupsLoaded: false,
  groupActionLoading: false,
  wallets: [],
  activeWallet: { type: 'DARE', refId: null },
  walletsLoading: false,
}
