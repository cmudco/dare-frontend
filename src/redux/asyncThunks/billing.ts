import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getWalletAPI,
  getTransactionsAPI,
  getBillingModelStatsAPI,
  getEnergyStatsAPI,
} from '../../api/billing'
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
  OwnedGroupMember,
  OwnedGroupResponse,
  UpdateGroupPolicyPayload,
  UpsertUserOverridePayload,
  UpsertUserOverrideResponse,
} from '../types/billing'

export const getWallet = createAsyncThunk(
  'billing/getWallet',
  async (_, thunkAPI) => {
    try {
      const response = await getWalletAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const getTransactions = createAsyncThunk(
  'billing/getTransactions',
  async (page: number = 1, thunkAPI) => {
    try {
      const response = await getTransactionsAPI(page)
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
