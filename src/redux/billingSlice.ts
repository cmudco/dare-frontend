import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialBillingState } from './initialState/billing'

import {
  getTransactions,
  getWallet,
  getBillingModelStats,
} from './asyncThunks/billing'
import { Transaction, Wallet, BillingModelStatsResponse } from './types/billing'

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
  },
})

export default billingSlice.reducer
