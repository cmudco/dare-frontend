import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getReleaseNotesAPI,
  getUnseenReleaseNotesAPI,
  markReleaseNoteSeenAPI,
} from '@/api/releaseNotes'
import type { ReleaseNote, ReleaseNotePage } from '../types/releaseNotes'

export const fetchUnseenReleaseNotes = createAsyncThunk<
  ReleaseNote[],
  void,
  { rejectValue: string }
>('releaseNotes/fetchUnseen', async (_, thunkAPI) => {
  try {
    return await getUnseenReleaseNotesAPI()
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

/** Marks the newest unseen release seen; the backend clears everything older with it. */
export const dismissReleaseNotes = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>('releaseNotes/dismiss', async (newestId, thunkAPI) => {
  try {
    await markReleaseNoteSeenAPI(newestId)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const fetchReleaseNoteHistory = createAsyncThunk<
  ReleaseNotePage,
  number,
  { rejectValue: string }
>('releaseNotes/fetchHistory', async (page, thunkAPI) => {
  try {
    return await getReleaseNotesAPI(page)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
