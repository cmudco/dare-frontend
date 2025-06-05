import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getWalletAPI,
  getTransactionsAPI,
  getBillingModelStatsAPI,
} from '../../api/billing'

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
