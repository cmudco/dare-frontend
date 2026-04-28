import { LLMModel } from './conversation'
import { PolicySource } from '@/utils/constants/groupWallet'

export interface BillingState {
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
  wallets: UnifiedWallet[]
  activeWallet: ActiveWalletRef
  byoEnabled: boolean
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
  expiresAt?: string | null
  baseUrl?: string
}

export interface ActiveWalletRef {
  type: WalletType
  refId: string | null
}

export interface WalletsListResponse {
  activeWallet: ActiveWalletRef
  byoEnabled: boolean
  wallets: UnifiedWallet[]
}

export interface FeatureFlagsResponse {
  byoEnabled: boolean
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
