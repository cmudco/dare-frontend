/**
 * Memory Async Thunks
 *
 * Thunks for cross-conversation memory API operations.
 */
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { MemoryProposal } from '../types/memory'
import {
  applyMemoryProposalAPI,
  getMemoryItemsAPI,
  getMemorySweepAPI,
  getRetiredMemoryItemsAPI,
  deleteMemoryItemAPI,
  updateMemoryItemAPI,
  searchMemoryAPI,
  searchSessionsAPI,
  exportMemoryAPI,
  importMemoryAPI,
  importForeignMemoryAPI,
  clearAllMemoryAPI,
} from '../../api/memory'

/**
 * Fetch all memory items for the authenticated user
 */
export const getMemoryItems = createAsyncThunk(
  'memory/getMemoryItems',
  async (_, thunkAPI) => {
    try {
      const response = await getMemoryItemsAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Fetch retired memories — what the store used to believe
 */
export const getRetiredMemoryItems = createAsyncThunk(
  'memory/getRetiredMemoryItems',
  async (_, thunkAPI) => {
    try {
      return await getRetiredMemoryItemsAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Ask what the store would like to tidy
 */
export const getMemorySweep = createAsyncThunk(
  'memory/getMemorySweep',
  async (_, thunkAPI) => {
    try {
      return await getMemorySweepAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Approve one suggestion from the sweep
 */
export const applyMemoryProposal = createAsyncThunk(
  'memory/applyMemoryProposal',
  async (proposal: MemoryProposal, thunkAPI) => {
    try {
      const response = await applyMemoryProposalAPI(proposal)
      return { proposal, detail: response.detail }
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Delete a memory item by ID
 */
export const deleteMemoryItem = createAsyncThunk(
  'memory/deleteMemoryItem',
  async (itemId: string, thunkAPI) => {
    try {
      await deleteMemoryItemAPI(itemId)
      return itemId
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Rewrite a memory. The server may refuse — a rule whose new trigger collides
 * with another, a profile line that would cross the token ceiling — so the
 * rejection message is surfaced rather than swallowed.
 */
export const updateMemoryItem = createAsyncThunk(
  'memory/updateMemoryItem',
  async ({ id, content }: { id: string; content: string }, thunkAPI) => {
    try {
      return await updateMemoryItemAPI(id, content)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Search memories using vector similarity
 */
export const searchMemory = createAsyncThunk(
  'memory/searchMemory',
  async (query: string, thunkAPI) => {
    try {
      const response = await searchMemoryAPI(query)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Clear all memory items for the authenticated user
 */
export const clearAllMemory = createAsyncThunk(
  'memory/clearAllMemory',
  async (_, thunkAPI) => {
    try {
      const response = await clearAllMemoryAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Search the transcript layer — conversations word for word, by words
 * and/or a date range
 */
export const searchSessions = createAsyncThunk(
  'memory/searchSessions',
  async (params: { q?: string; since?: string; until?: string }, thunkAPI) => {
    try {
      return await searchSessionsAPI(params)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/** Download the whole store as one bundle */
export const exportMemory = createAsyncThunk(
  'memory/exportMemory',
  async (_, thunkAPI) => {
    try {
      return await exportMemoryAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/** Reinstate a bundle into an empty store */
export const importMemory = createAsyncThunk(
  'memory/importMemory',
  async (bundle: object, thunkAPI) => {
    try {
      return await importMemoryAPI(bundle)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/** Queue a paste from another AI through the writer pipeline */
export const importForeignMemory = createAsyncThunk(
  'memory/importForeignMemory',
  async (text: string, thunkAPI) => {
    try {
      return await importForeignMemoryAPI(text)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
