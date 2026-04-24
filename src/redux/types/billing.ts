import { LLMModel } from './conversation'
import { PolicySource } from '@/utils/constants/groupWallet'

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
  ownedGroups: OwnedGroupResponse[]
  ownedGroupsLoading: boolean
  ownedGroupsLoaded: boolean
  groupActionLoading: boolean
}

export interface Wallet {
  displayBalance: string
  lastRefillAt: string | null
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────
// Group wallet types (owner-facing)
// ─────────────────────────────────────────────────────────────

export interface EffectivePolicy {
  amount: string
  periodDays: number
  amountSource: PolicySource
  periodSource: PolicySource
}

export interface UserRefillOverride {
  refillAmount: string | null
  refillPeriodDays: number | null
  reason: string
  updatedAt: string
}

export interface GroupWallet {
  id: number
  budgetBalance: string
  displayBudget: string
  refillAmount: string | null
  refillPeriodDays: number | null
  isActive: boolean
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface OwnedGroupMember {
  id: number
  email: string
  firstName: string
  lastName: string
  displayBalance: string
  effectivePolicy: EffectivePolicy
  override: UserRefillOverride | null
}

export interface OwnedGroupResponse {
  id: number
  accessCode: string
  notes: string | null
  isActive: boolean
  groupWallet: GroupWallet | null
  members: OwnedGroupMember[]
  createdAt: string
  updatedAt: string
}

export interface AllocateToMemberPayload {
  recipientUserId: number
  amount: string
  note?: string
}

export interface UpdateGroupPolicyPayload {
  refillAmount?: string
  refillPeriodDays?: number
  isActive?: boolean
  clearAmount?: boolean
  clearPeriod?: boolean
}

export interface UpsertUserOverridePayload {
  refillAmount?: string | null
  refillPeriodDays?: number | null
  reason?: string
  clearAmount?: boolean
  clearPeriod?: boolean
}

export interface AllocateResponse {
  groupWallet: GroupWallet
  transaction: Transaction
  recipient: OwnedGroupMember
}

export interface UpsertUserOverrideResponse {
  override: UserRefillOverride | null
  member: OwnedGroupMember
}

export interface Transaction {
  id: number
  displayAmount: string
  type: string
  source?: string
  relatedGroupCode?: string | null
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
