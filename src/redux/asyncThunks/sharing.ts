import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  getRecipientsAPI,
  getSharedWithMeAPI,
  revokeShareAPI,
  shareItemAPI,
} from '@/api/sharing'
import { ShareableEntityType, ShareRequest } from '../types/sharing'

export const shareItem = createAsyncThunk(
  'sharing/shareItem',
  async (data: ShareRequest, { rejectWithValue }) => {
    try {
      return await shareItemAPI(data)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const fetchSharedWithMe = createAsyncThunk(
  'sharing/fetchSharedWithMe',
  async (type: ShareableEntityType | undefined, { rejectWithValue }) => {
    try {
      const response = await getSharedWithMeAPI(type)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const fetchRecipients = createAsyncThunk(
  'sharing/fetchRecipients',
  async (
    {
      type,
      objectId,
    }: { type: ShareableEntityType; objectId: string | number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRecipientsAPI(type, objectId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const revokeShare = createAsyncThunk(
  'sharing/revokeShare',
  async (shareId: number, { rejectWithValue }) => {
    try {
      await revokeShareAPI(shareId)
      return shareId
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
