import type { TransactionsResponse } from '@/api/billing'
import type { Transaction } from '@/redux/types/billing'
import {
  BillingMode,
  PlatformFilter,
  TransactionTab,
} from './constants/billing'

export interface TransactionFilters {
  platform: PlatformFilter
  tab: TransactionTab
  model: string
  startDate: string
  endDate: string
}

export async function collectTransactionHistory(
  fetchPage: (page: number) => Promise<TransactionsResponse>,
  signal?: AbortSignal
): Promise<TransactionsResponse> {
  let page = 1
  const rows = new Map<number, Transaction>()
  let first: TransactionsResponse | undefined
  while (true) {
    signal?.throwIfAborted()
    const response = await fetchPage(page)
    signal?.throwIfAborted()
    first ??= response
    response.results.forEach((row) => rows.set(row.id, row))
    if (!response.next) break
    const next = Number(
      new URL(response.next, 'https://pagination.local').searchParams.get(
        'page'
      )
    )
    if (
      !Number.isInteger(next) ||
      next <= page ||
      response.results.length === 0
    ) {
      throw new Error(
        'Could not load the complete transaction history. Please retry.'
      )
    }
    page = next
  }
  if (rows.size < first.count) {
    throw new Error('Transaction history changed while loading. Please retry.')
  }
  return {
    ...first,
    results: [...rows.values()],
    count: rows.size,
    next: null,
    previous: null,
  }
}

export function filterTransactionHistory(
  rows: Transaction[],
  filters: TransactionFilters
) {
  const start = filters.startDate
    ? new Date(`${filters.startDate}T00:00:00`).getTime()
    : -Infinity
  const end = filters.endDate ? new Date(`${filters.endDate}T00:00:00`) : null
  end?.setDate(end.getDate() + 1)
  const base = rows.filter((row) => {
    const timestamp = new Date(row.createdAt).getTime()
    return (
      (filters.platform === PlatformFilter.ALL ||
        row.platform === filters.platform) &&
      (!filters.model ||
        (row.llmName || row.llm?.name || '') === filters.model) &&
      timestamp >= start &&
      timestamp < (end?.getTime() ?? Infinity)
    )
  })
  const summary = {
    all: base.length,
    wallet: base.filter((row) => row.billingMode === BillingMode.WALLET).length,
    ownApi: base.filter((row) => row.billingMode === BillingMode.OWN_API)
      .length,
    litellm: base.filter((row) => row.billingMode === BillingMode.LITELLM)
      .length,
  }
  const modes = {
    [TransactionTab.ALL]: null,
    [TransactionTab.WALLET]: BillingMode.WALLET,
    [TransactionTab.OWN_API]: BillingMode.OWN_API,
    [TransactionTab.LITELLM]: BillingMode.LITELLM,
  }
  return {
    summary,
    transactions: base.filter(
      (row) => !modes[filters.tab] || row.billingMode === modes[filters.tab]
    ),
  }
}
