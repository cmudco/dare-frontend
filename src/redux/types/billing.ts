import { LLMModel } from './conversation'
import { PolicySource } from '@/utils/constants/groupWallet'

export interface TransactionSummary {
  all: number
  wallet: number
  ownApi: number
  litellm: number
}

export interface BillingState {
  transactions: Transaction[]
  transactionCount: number
  transactionSummary: TransactionSummary
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
  litellmStats: LiteLLMStatsResponse | null
  litellmStatsLoading: boolean
  ownedGroups: OwnedGroupResponse[]
  ownedGroupsLoading: boolean
  ownedGroupsLoaded: boolean
  groupActionLoading: boolean
  wallets: UnifiedWallet[]
  activeWallet: ActiveWalletRef
  walletsLoading: boolean
}

// ─────────────────────────────────────────────────────────────
// Multi-wallet (popover + Billing page) types
// ─────────────────────────────────────────────────────────────

export type WalletType = 'DARE' | 'BYO' | 'LITELLM'
export type LiteLLMSource = 'USER' | 'ADMIN_USER' | 'ADMIN_GROUP'

export interface WalletStatusBalance {
  kind: 'BALANCE'
  balance: string
  lastRefillAt: string | null
}

export interface WalletStatusExternal {
  kind: 'EXTERNAL'
  /** Cumulative reference cost through this key, in USD. Reporting only —
   *  the user pays their proxy account directly, so nothing here is charged. */
  spend?: string
}

/**
 * Unified row in the wallet picker. Per the workspace `data-schema-contract`
 * rule, type-specific fields are individually optional rather than emitted as
 * a wire-level union — components narrow by `type` first, then by `status.kind`.
 */
export interface UnifiedWallet {
  type: WalletType
  refId: string | null
  label: string
  isDefault: boolean
  isActive: boolean
  status: WalletStatusBalance | WalletStatusExternal
  // BYO only:
  provider?: string
  // LITELLM only:
  source?: LiteLLMSource
  groupName?: string | null
  titleModel?: string
  memoryModel?: string
  expiresAt?: string | null
  baseUrl?: string
}

export interface ActiveWalletRef {
  type: WalletType
  refId: string | null
}

export interface WalletsListResponse {
  activeWallet: ActiveWalletRef
  wallets: UnifiedWallet[]
}

export interface LiteLLMKeyResponse {
  id: string
  label: string
  baseUrl: string
  source: LiteLLMSource
  groupName: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SetActiveWalletResponse {
  activeWallet: ActiveWalletRef
}

export interface LiteLLMTestResponse {
  ok: boolean
  models: string[]
  error: string
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
  /** What the call would have cost at DARE rates. Null when nothing was
   *  charged and no DARE-side model matches, or when DARE did the billing. */
  displayReferenceAmount: string | null
  type: string
  source?: string
  relatedGroupCode?: string | null
  message: string
  llm: LLMModel
  llmName: string
  inputTokens: number
  outputTokens: number
  billingMode: string
  platform: string
  createdAt: string
  updatedAt: string
}

export interface BillingModelStats {
  /** Null for proxy-routed models — they have no DARE model row. */
  llmId: number | null
  llmName: string
  llmIdentifier: string
  llmProvider: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  totalCost: string
  totalCostDecimal: number
  /** True when the cost is a reference figure DARE never charged. */
  isEstimated: boolean
  transactionCount: number
}

export interface OverallStats {
  totalCost: string
  totalCostDecimal: number
  /** Reference cost of proxy-routed calls. Kept apart from totalCost — the
   *  two are different quantities and must never be added together. */
  estimatedCost: string
  estimatedCostDecimal: number
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
// LiteLLM usage types
// ─────────────────────────────────────────────────────────────

export interface LiteLLMOverallStats {
  totalCalls: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  totalReferenceCost: string
  totalReferenceCostDisplay: string
  /** Calls the price registry had no entry for — excluded from the cost. */
  unpricedCalls: number
  modelCount: number
}

export interface LiteLLMModelBreakdown {
  modelName: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  callCount: number
  referenceCost: string
  referenceCostDisplay: string
  unpricedCalls: number
}

export interface LiteLLMKeyBreakdown {
  keyId: string
  label: string
  source: LiteLLMSource
  groupName: string | null
  callCount: number
  referenceCost: string
  referenceCostDisplay: string
}

export interface LiteLLMStatsResponse {
  overallStats: LiteLLMOverallStats
  modelsBreakdown: LiteLLMModelBreakdown[]
  keysBreakdown: LiteLLMKeyBreakdown[]
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
