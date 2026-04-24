import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialBillingState } from './initialState/billing'

import {
  getTransactions,
  getWallet,
  getBillingModelStats,
  getEnergyStats,
  fetchOwnedGroups,
  refreshGroupMembers,
  updateGroupPolicy,
  allocateToMember,
  upsertUserOverride,
  clearUserOverride,
} from './asyncThunks/billing'
import {
  AllocateResponse,
  BillingModelStatsResponse,
  EnergyStatsResponse,
  GroupWallet,
  OwnedGroupMember,
  OwnedGroupResponse,
  Transaction,
  UpsertUserOverrideResponse,
  Wallet,
} from './types/billing'

const billingSlice = createSlice({
  name: 'billing',
  initialState: initialBillingState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWallet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWallet.fulfilled, (state, action: PayloadAction<Wallet>) => {
        state.loading = false
        state.wallet = action.payload
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
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
          }>
        ) => {
          state.loading = false
          state.transactions = action.payload.results
          state.transactionCount = action.payload.count
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
  },
})

export default billingSlice.reducer
