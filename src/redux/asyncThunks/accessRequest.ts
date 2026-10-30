import { createAsyncThunk } from '@reduxjs/toolkit'
import { requestAccessAPI } from '@/api/accessRequests'
import {
  AccessRequestInput,
  AccessRequestResponse,
} from '@/redux/types/accessRequest'

export const requestAccess = createAsyncThunk<
  AccessRequestResponse,
  AccessRequestInput,
  { rejectValue: string }
>('accessRequest/submit', async (input, { rejectWithValue }) => {
  try {
    return await requestAccessAPI(input)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Unable to submit your request. Please try again.'
    )
  }
})
