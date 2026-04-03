import { createAsyncThunk } from '@reduxjs/toolkit'
import { requestSyftboxOtpAPI, verifySyftboxOtpAPI } from '@/api/syftbox'

export const requestSyftboxOtp = createAsyncThunk(
  'syftbox/requestOtp',
  async (_, thunkAPI) => {
    try {
      await requestSyftboxOtpAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const verifySyftboxOtp = createAsyncThunk(
  'syftbox/verifyOtp',
  async (otp: string, thunkAPI) => {
    try {
      await verifySyftboxOtpAPI(otp.trim())
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
