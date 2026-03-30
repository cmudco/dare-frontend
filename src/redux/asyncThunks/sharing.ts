import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  getRecipientsAPI,
  getSharedWithMeAPI,
  revokeShareAPI,
  shareItemAPI,
} from '@/api/sharing'
import {
  ShareableEntityType,
  ShareRequest,
  SharingEntity,
} from '../types/sharing'
import { AppDispatch } from '../store'
import { publishWorkflow, getWorkflows } from './workflow'
import { publishPrompt, unpublishPrompt } from './promptsLibrary'
import { getPrompts } from './prompt'
import { toast } from '@/utils/toast'

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

export const toggleEntityVisibility = createAsyncThunk<
  boolean,
  SharingEntity,
  { dispatch: AppDispatch }
>(
  'sharing/toggleVisibility',
  async (entity: SharingEntity, { dispatch, rejectWithValue }) => {
    try {
      if (entity.type === ShareableEntityType.Workflow) {
        await dispatch(publishWorkflow(entity.id as number)).unwrap()
        dispatch(getWorkflows())
      } else if (entity.type === ShareableEntityType.Prompt) {
        if (entity.isPublished) {
          await dispatch(unpublishPrompt(entity.id as number)).unwrap()
        } else {
          await dispatch(publishPrompt({ id: entity.id as number })).unwrap()
        }
        dispatch(getPrompts())
      } else if (entity.type === ShareableEntityType.Conversation) {
        toast.info('Conversation visibility toggle not yet implemented')
      }
      return !entity.isPublished
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
