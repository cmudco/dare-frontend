import { LLMModel } from './conversation'

export interface BillingState {
  wallet: Wallet | null
  transactions: Transaction[]
  transactionCount: number
  nextPage: string | null
  previousPage: string | null
  loading: boolean
  error: string | null
  modelStats: BillingModelStats[]
  overallStats: OverallStats | null
  modelStatsLoading: boolean
}

export interface Wallet {
  displayBalance: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  displayAmount: string
  type: string
  message: string
  llm: LLMModel
  inputTokens: number
  outputTokens: number
  createdAt: string
  updatedAt: string
}

export interface BillingModelStats {
  llmId: number
  llmName: string
  llmIdentifier: string
  llmProvider: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  totalCost: string
  totalCostDecimal: number
  transactionCount: number
}

export interface OverallStats {
  totalCost: string
  totalCostDecimal: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  totalTransactions: number
}

export interface BillingModelStatsResponse {
  modelsBillingStats: BillingModelStats[]
  overallStats: OverallStats
}
