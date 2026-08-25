import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getTransactionsAPI,
  GetTransactionsOptions,
  getBillingModelStatsAPI,
  getEnergyStatsAPI,
  getWalletsAPI,
  setActiveWalletAPI,
  createLiteLLMKeyAPI,
  renameLiteLLMKeyAPI,
  deleteLiteLLMKeyAPI,
} from '../../api/billing'
import { getAvailableModels } from './conversation'
import {
  allocateToMemberAPI,
  clearUserOverrideAPI,
  fetchGroupMembersAPI,
  fetchOwnedGroupsAPI,
  updateGroupPolicyAPI,
  upsertUserOverrideAPI,
} from '../../api/groupWallets'
import {
  AllocateResponse,
  AllocateToMemberPayload,
  GroupWallet,
  LiteLLMKeyResponse,
  OwnedGroupMember,
  OwnedGroupResponse,
  SetActiveWalletResponse,
  UpdateGroupPolicyPayload,
  UpsertUserOverridePayload,
  UpsertUserOverrideResponse,
  WalletType,
  WalletsListResponse,
} from '../types/billing'

export const getTransactions = createAsyncThunk(
  'billing/getTransactions',
  async (options: GetTransactionsOptions = {}, thunkAPI) => {
    try {
      const response = await getTransactionsAPI(options)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const getBillingModelStats = createAsyncThunk(
  'billing/getBillingModelStats',
  async (_, thunkAPI) => {
    try {
      const response = await getBillingModelStatsAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const getEnergyStats = createAsyncThunk(
  'billing/getEnergyStats',
  async (period: string = 'all', thunkAPI) => {
    try {
      const response = await getEnergyStatsAPI(period)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

// ─────────────────────────────────────────────────────────────
// Group wallet thunks
// ─────────────────────────────────────────────────────────────

export const fetchOwnedGroups = createAsyncThunk<OwnedGroupResponse[]>(
  'billing/fetchOwnedGroups',
  async (_, thunkAPI) => {
    try {
      return await fetchOwnedGroupsAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const refreshGroupMembers = createAsyncThunk<
  { groupWalletId: number; members: OwnedGroupMember[] },
  number
>('billing/refreshGroupMembers', async (groupWalletId, thunkAPI) => {
  try {
    const members = await fetchGroupMembersAPI(groupWalletId)
    return { groupWalletId, members }
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const updateGroupPolicy = createAsyncThunk<
  { groupWalletId: number; groupWallet: GroupWallet },
  { groupWalletId: number; payload: UpdateGroupPolicyPayload }
>('billing/updateGroupPolicy', async ({ groupWalletId, payload }, thunkAPI) => {
  try {
    const groupWallet = await updateGroupPolicyAPI(groupWalletId, payload)
    return { groupWalletId, groupWallet }
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const allocateToMember = createAsyncThunk<
  { groupWalletId: number; response: AllocateResponse },
  { groupWalletId: number; payload: AllocateToMemberPayload }
>('billing/allocateToMember', async ({ groupWalletId, payload }, thunkAPI) => {
  try {
    const response = await allocateToMemberAPI(groupWalletId, payload)
    return { groupWalletId, response }
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const upsertUserOverride = createAsyncThunk<
  {
    groupWalletId: number
    userId: number
    response: UpsertUserOverrideResponse
  },
  { groupWalletId: number; userId: number; payload: UpsertUserOverridePayload }
>(
  'billing/upsertUserOverride',
  async ({ groupWalletId, userId, payload }, thunkAPI) => {
    try {
      const response = await upsertUserOverrideAPI(
        groupWalletId,
        userId,
        payload
      )
      return { groupWalletId, userId, response }
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const clearUserOverride = createAsyncThunk<
  { groupWalletId: number; userId: number },
  { groupWalletId: number; userId: number }
>('billing/clearUserOverride', async ({ groupWalletId, userId }, thunkAPI) => {
  try {
    await clearUserOverrideAPI(groupWalletId, userId)
    return { groupWalletId, userId }
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

// ─────────────────────────────────────────────────────────────
// Multi-wallet thunks
// ─────────────────────────────────────────────────────────────

export const getWallets = createAsyncThunk<WalletsListResponse>(
  'billing/getWallets',
  async (_, thunkAPI) => {
    try {
      return await getWalletsAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const setActiveWallet = createAsyncThunk<
  SetActiveWalletResponse,
  { type: WalletType; refId: string | null }
>('billing/setActiveWallet', async ({ type, refId }, thunkAPI) => {
  try {
    const response = await setActiveWalletAPI(type, refId)
    // Re-pull authoritative wallet list so inactive rows reflect the change.
    thunkAPI.dispatch(getWallets())
    // The model picker is wallet-scoped (LITELLM exposes synthetic entries,
    // BYO filters by configured providers, DARE returns the full catalog),
    // so refresh it whenever the active wallet changes — otherwise the user
    // sees a stale list until they reopen the picker.
    thunkAPI.dispatch(getAvailableModels())
    return response
  } catch (error) {
    // Rollback optimistic update by re-fetching.
    thunkAPI.dispatch(getWallets())
    thunkAPI.dispatch(getAvailableModels())
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const addLiteLLMKey = createAsyncThunk<
  LiteLLMKeyResponse,
  {
    label: string
    baseUrl: string
    apiKey: string
    titleModel: string
    memoryModel: string
  }
>(
  'billing/addLiteLLMKey',
  async ({ label, baseUrl, apiKey, titleModel, memoryModel }, thunkAPI) => {
    try {
      const created = await createLiteLLMKeyAPI(
        label,
        baseUrl,
        apiKey,
        titleModel,
        memoryModel
      )
      thunkAPI.dispatch(getWallets())
      return created
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const renameLiteLLMKey = createAsyncThunk<
  LiteLLMKeyResponse,
  { id: string; label: string }
>('billing/renameLiteLLMKey', async ({ id, label }, thunkAPI) => {
  try {
    const updated = await renameLiteLLMKeyAPI(id, label)
    thunkAPI.dispatch(getWallets())
    return updated
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const removeLiteLLMKey = createAsyncThunk<string, string>(
  'billing/removeLiteLLMKey',
  async (id, thunkAPI) => {
    try {
      await deleteLiteLLMKeyAPI(id)
      thunkAPI.dispatch(getWallets())
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
