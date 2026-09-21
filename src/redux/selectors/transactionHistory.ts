import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import {
  filterTransactionHistory,
  type TransactionFilters,
} from '@/utils/transactionHistory'

const selectTransactions = (state: RootState) => state.billing.transactions
export const selectTransactionModels = createSelector(
  [selectTransactions],
  (rows) =>
    [
      ...new Set(
        rows.map((row) => row.llmName || row.llm?.name).filter(Boolean)
      ),
    ].sort()
)
export const selectFilteredTransactions = createSelector(
  [
    selectTransactions,
    (_state: RootState, filters: TransactionFilters) => filters,
  ],
  filterTransactionHistory
)
