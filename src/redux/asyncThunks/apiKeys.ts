import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getUserApiKeysAPI,
  getProviderStatusAPI,
  updateApiKeyAPI,
  deleteApiKeyAPI,
  getBillingModeAPI,
  updateBillingModeAPI,
} from '../../api/apiKeys'
import {
  UpdateApiKeyRequest,
  ProviderType,
  BillingModeType,
} from '../types/apiKeys'

/**
 * Fetch all user API keys
 */
export const getUserApiKeys = createAsyncThunk(
  'apiKeys/getUserApiKeys',
  async (_, thunkAPI) => {
    try {
      const response = await getUserApiKeysAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Fetch provider status for all providers
 */
export const getProviderStatus = createAsyncThunk(
  'apiKeys/getProviderStatus',
  async (_, thunkAPI) => {
    try {
      const response = await getProviderStatusAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Update API key for a provider
 */
export const updateApiKey = createAsyncThunk(
  'apiKeys/updateApiKey',
  async (data: UpdateApiKeyRequest, thunkAPI) => {
    try {
      const response = await updateApiKeyAPI(data)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Delete API key for a provider
 */
export const deleteApiKey = createAsyncThunk(
  'apiKeys/deleteApiKey',
  async (provider: ProviderType, thunkAPI) => {
    try {
      await deleteApiKeyAPI(provider)
      return provider
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Get billing mode
 */
export const getBillingMode = createAsyncThunk(
  'apiKeys/getBillingMode',
  async (_, thunkAPI) => {
    try {
      const response = await getBillingModeAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Update billing mode
 */
export const updateBillingMode = createAsyncThunk(
  'apiKeys/updateBillingMode',
  async (billingMode: BillingModeType, thunkAPI) => {
    try {
      const response = await updateBillingModeAPI(billingMode)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
