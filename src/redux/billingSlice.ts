import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialBillingState } from './initialState/billing'

import {
  getTransactions,
  getBillingModelStats,
  getEnergyStats,
  getLiteLLMStats,
  fetchOwnedGroups,
  refreshGroupMembers,
  updateGroupPolicy,
  allocateToMember,
  upsertUserOverride,
  clearUserOverride,
  getWallets,
} from './asyncThunks/billing'
import {
  ActiveWalletRef,
  AllocateResponse,
  BillingModelStatsResponse,
  EnergyStatsResponse,
  LiteLLMStatsResponse,
  GroupWallet,
  OwnedGroupMember,
  OwnedGroupResponse,
  Transaction,
  TransactionSummary,
  UpsertUserOverrideResponse,
  WalletsListResponse,
} from './types/billing'

const billingSlice = createSlice({
  name: 'billing',
  initialState: initialBillingState,
  reducers: {
    /**
     * Optimistically flip the active wallet pointer the moment the user clicks
     * a row in the picker. The thunk then PUTs and re-fetches; rollback is the
     * `getWallets` dispatch in the rejected branch of `setActiveWallet`.
     */
    setActiveWalletOptimistic(state, action: PayloadAction<ActiveWalletRef>) {
      state.activeWallet = action.payload
      state.wallets = state.wallets.map((w) => ({
        ...w,
        isActive:
          w.type === action.payload.type && w.refId === action.payload.refId,
      }))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getTransactions.fulfilled,
        (
          state,
          action: PayloadAction<{
            count: number
            next: string | null
            previous: string | null
            results: Transaction[]
            summary: TransactionSummary
          }>
        ) => {
          state.loading = false
          state.transactions = action.payload.results
          state.transactionCount = action.payload.count
          state.transactionSummary = action.payload.summary
          state.nextPage = action.payload.next
          state.previousPage = action.payload.previous
        }
      )
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getBillingModelStats.pending, (state) => {
        state.modelStatsLoading = true
        state.error = null
      })
      .addCase(
        getBillingModelStats.fulfilled,
        (state, action: PayloadAction<BillingModelStatsResponse>) => {
          state.modelStatsLoading = false
          state.modelStats = action.payload.modelsBillingStats
          state.overallStats = action.payload.overallStats
        }
      )
      .addCase(getBillingModelStats.rejected, (state, action) => {
        state.modelStatsLoading = false
        state.error = action.payload as string
      })
      .addCase(getEnergyStats.pending, (state) => {
        state.energyStatsLoading = true
        state.error = null
      })
      .addCase(
        getEnergyStats.fulfilled,
        (state, action: PayloadAction<EnergyStatsResponse>) => {
          state.energyStatsLoading = false
          state.energyStats = action.payload
          state.energyStatsPeriod = action.payload.period
        }
      )
      .addCase(getEnergyStats.rejected, (state, action) => {
        state.energyStatsLoading = false
        state.error = action.payload as string
      })
      .addCase(getLiteLLMStats.pending, (state) => {
        state.litellmStatsLoading = true
        state.error = null
      })
      .addCase(
        getLiteLLMStats.fulfilled,
        (state, action: PayloadAction<LiteLLMStatsResponse>) => {
          state.litellmStatsLoading = false
          state.litellmStats = action.payload
        }
      )
      .addCase(getLiteLLMStats.rejected, (state, action) => {
        state.litellmStatsLoading = false
        state.error = action.payload as string
      })
      // Owned groups ─────────────────────────────────────────
      .addCase(fetchOwnedGroups.pending, (state) => {
        state.ownedGroupsLoading = true
        state.error = null
      })
      .addCase(
        fetchOwnedGroups.fulfilled,
        (state, action: PayloadAction<OwnedGroupResponse[]>) => {
          state.ownedGroupsLoading = false
          state.ownedGroupsLoaded = true
          state.ownedGroups = action.payload
        }
      )
      .addCase(fetchOwnedGroups.rejected, (state, action) => {
        state.ownedGroupsLoading = false
        state.ownedGroupsLoaded = true
        state.error = action.payload as string
      })
      .addCase(
        refreshGroupMembers.fulfilled,
        (
          state,
          action: PayloadAction<{
            groupWalletId: number
            members: OwnedGroupMember[]
          }>
        ) => {
          const group = state.ownedGroups.find(
            (g) => g.groupWallet?.id === action.payload.groupWalletId
          )
          if (group) {
            group.members = action.payload.members
          }
        }
      )
      .addCase(updateGroupPolicy.pending, (state) => {
        state.groupActionLoading = true
      })
      .addCase(
        updateGroupPolicy.fulfilled,
        (
          state,
          action: PayloadAction<{
            groupWalletId: number
            groupWallet: GroupWallet
          }>
        ) => {
          state.groupActionLoading = false
          const group = state.ownedGroups.find(
            (g) => g.groupWallet?.id === action.payload.groupWalletId
          )
          if (group) {
            group.groupWallet = action.payload.groupWallet
          }
        }
      )
      .addCase(updateGroupPolicy.rejected, (state, action) => {
        state.groupActionLoading = false
        state.error = action.payload as string
      })
      .addCase(allocateToMember.pending, (state) => {
        state.groupActionLoading = true
      })
      .addCase(
        allocateToMember.fulfilled,
        (
          state,
          action: PayloadAction<{
            groupWalletId: number
            response: AllocateResponse
          }>
        ) => {
          state.groupActionLoading = false
          const group = state.ownedGroups.find(
            (g) => g.groupWallet?.id === action.payload.groupWalletId
          )
          if (!group) return
          group.groupWallet = action.payload.response.groupWallet
          const recipient = action.payload.response.recipient
          const idx = group.members.findIndex((m) => m.id === recipient.id)
          if (idx >= 0) {
            group.members[idx] = recipient
          }
        }
      )
      .addCase(allocateToMember.rejected, (state, action) => {
        state.groupActionLoading = false
        state.error = action.payload as string
      })
      .addCase(upsertUserOverride.pending, (state) => {
        state.groupActionLoading = true
      })
      .addCase(
        upsertUserOverride.fulfilled,
        (
          state,
          action: PayloadAction<{
            groupWalletId: number
            userId: number
            response: UpsertUserOverrideResponse
          }>
        ) => {
          state.groupActionLoading = false
          const group = state.ownedGroups.find(
            (g) => g.groupWallet?.id === action.payload.groupWalletId
          )
          if (!group) return
          const idx = group.members.findIndex(
            (m) => m.id === action.payload.userId
          )
          if (idx >= 0) {
            group.members[idx] = action.payload.response.member
          }
        }
      )
      .addCase(upsertUserOverride.rejected, (state, action) => {
        state.groupActionLoading = false
        state.error = action.payload as string
      })
      .addCase(clearUserOverride.pending, (state) => {
        state.groupActionLoading = true
      })
      .addCase(
        clearUserOverride.fulfilled,
        (
          state,
          action: PayloadAction<{ groupWalletId: number; userId: number }>
        ) => {
          state.groupActionLoading = false
          const group = state.ownedGroups.find(
            (g) => g.groupWallet?.id === action.payload.groupWalletId
          )
          if (!group) return
          const member = group.members.find(
            (m) => m.id === action.payload.userId
          )
          if (member) {
            member.override = null
          }
          // Effective-policy badge needs a backend recompute — refreshGroupMembers
          // is dispatched from the page on success.
        }
      )
      .addCase(clearUserOverride.rejected, (state, action) => {
        state.groupActionLoading = false
        state.error = action.payload as string
      })
      .addCase(getWallets.pending, (state) => {
        state.walletsLoading = true
      })
      .addCase(
        getWallets.fulfilled,
        (state, action: PayloadAction<WalletsListResponse>) => {
          state.walletsLoading = false
          state.wallets = action.payload.wallets
          state.activeWallet = action.payload.activeWallet
        }
      )
      .addCase(getWallets.rejected, (state) => {
        state.walletsLoading = false
      })
  },
})

export const { setActiveWalletOptimistic } = billingSlice.actions

export default billingSlice.reducer
