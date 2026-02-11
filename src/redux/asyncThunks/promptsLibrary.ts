import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  cloneFromLibraryAPI,
  getPromptsLibraryAPI,
  publishPromptAPI,
  unpublishPromptAPI,
} from '@/api/promptsLibrary'

export const getPromptsLibrary = createAsyncThunk(
  'promptsLibrary/getPromptsLibrary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPromptsLibraryAPI()
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const publishPrompt = createAsyncThunk(
  'promptsLibrary/publishPrompt',
  async (
    { id, description }: { id: number; description?: string },
    { rejectWithValue }
  ) => {
    try {
      return await publishPromptAPI(id, description)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const unpublishPrompt = createAsyncThunk(
  'promptsLibrary/unpublishPrompt',
  async (id: number, { rejectWithValue }) => {
    try {
      await unpublishPromptAPI(id)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const cloneFromLibrary = createAsyncThunk(
  'promptsLibrary/cloneFromLibrary',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cloneFromLibraryAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
