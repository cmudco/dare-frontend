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
  energyStats: EnergyStatsResponse | null
  energyStatsLoading: boolean
  energyStatsPeriod: string
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
  llmName: string
  inputTokens: number
  outputTokens: number
  billingMode: string
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

// ─────────────────────────────────────────────────────────────
// Energy Tracking Types
// ─────────────────────────────────────────────────────────────

export interface EnergyOverallStats {
  totalEnergyWh: number
  totalCarbonG: number
  totalWaterMl: number
  messageCount: number
}

export interface RelatableStats {
  phoneBatteryPct: number
  googleSearchesEquiv: number
  ledBulbSeconds: number
  netflixSeconds: number
  evMeters: number
  fridgeSeconds: number
  humanThinkingSeconds: number
}

export interface EnergyModelBreakdown {
  llmId: number
  llmName: string
  llmIdentifier: string
  llmProvider: string
  energyWh: number
  carbonG: number
  waterMl: number
  messageCount: number
}

export interface EnergyStatsResponse {
  overallStats: EnergyOverallStats
  relatableStats: RelatableStats
  modelsBreakdown: EnergyModelBreakdown[]
  period: string
}
