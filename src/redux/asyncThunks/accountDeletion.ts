import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteAccountAPI } from '@/api/accountDeletion'
import { AccountDeletionResponse } from '@/redux/types/accountDeletion'

export const deleteAccount = createAsyncThunk<
  AccountDeletionResponse,
  string,
  { rejectValue: string }
>('accountDeletion/deleteAccount', async (confirmation, thunkAPI) => {
  try {
    const response = await deleteAccountAPI(confirmation)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
