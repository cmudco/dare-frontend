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
  async (id: string, { rejectWithValue }) => {
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
      id?: string
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
  async (id: string, { rejectWithValue }) => {
    try {
      return await clonePromptAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deletePrompt = createAsyncThunk(
  'prompts/deletePrompt',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const promptState = state.prompt

      // Find the prompt being deleted
      const deletedPrompt = promptState.prompts.find((p) => p.id === id)

      // If there's a prompt being deleted and it has children
      if (deletedPrompt) {
        // Find any prompts that had the deleted prompt as their parent
        const childPrompts = promptState.prompts.filter((p) => p.parent === id)

        // First delete the prompt from the backend
        await deletePromptAPI(id)

        // Then update each child's parent reference in the backend
        const updatePromises = childPrompts.map((child) => {
          return updatePromptAPI(child.id, {
            ...child,
            parent: deletedPrompt.parent, // Point to grandparent
          })
        })

        // Wait for all updates to complete
        await Promise.all(updatePromises)
      } else {
        // If no children to update, just delete the prompt
        await deletePromptAPI(id)
      }

      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
