import { createAsyncThunk } from '@reduxjs/toolkit'
import { Prompt } from '../types/prompt'
import {
  clonePromptAPI,
  createPromptAPI,
  deletePromptAPI,
  getPromptByIdAPI,
  getPromptsAPI,
  simpleUpdatePromptAPI,
  updatePromptAPI,
} from '@/api/prompts'
import { RootState } from '../store'

export const getPrompts = createAsyncThunk(
  'prompts/getPrompts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPromptsAPI()
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getPromptById = createAsyncThunk(
  'prompts/getPromptById',
  async (id: number, { rejectWithValue }) => {
    try {
      return (await getPromptByIdAPI(id)) as Prompt
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createOrUpdatePrompt = createAsyncThunk(
  'prompts/createOrUpdatePrompt',
  async (
    {
      id,
      promptData,
      bumpVersion,
    }: {
      id?: number
      promptData: {
        title: string
        content: string
        isDefault?: boolean
      }
      bumpVersion?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      if (id) {
        if (bumpVersion) {
          return await updatePromptAPI(id, promptData)
        } else {
          return await simpleUpdatePromptAPI(id, promptData)
        }
      } else {
        return await createPromptAPI(promptData)
      }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const clonePrompt = createAsyncThunk(
  'prompts/clonePrompt',
  async (id: number, { rejectWithValue }) => {
    try {
      return await clonePromptAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deletePrompt = createAsyncThunk(
  'prompts/deletePrompt',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const promptState = state.prompt

      const deletedPrompt = promptState.prompts.find((p) => p.id === id)

      if (deletedPrompt) {
        const childPrompts = promptState.prompts.filter((p) => p.parent === id)

        await deletePromptAPI(id)

        const updatePromises = childPrompts.map((child) => {
          return updatePromptAPI(child.id, {
            ...child,
            parent: deletedPrompt.parent,
          })
        })

        await Promise.all(updatePromises)
      } else {
        await deletePromptAPI(id)
      }

      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
