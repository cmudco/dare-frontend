import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from './store'
import type { ReleaseNote } from './types/releaseNotes'
import {
  dismissReleaseNotes,
  fetchReleaseNoteHistory,
  fetchUnseenReleaseNotes,
} from './asyncThunks/releaseNotes'
import { userLogin, userLogout } from './asyncThunks/user'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ReleaseNoteHistory {
  notes: ReleaseNote[]
  page: number
  hasMore: boolean
  status: RequestStatus
  error: string | null
}

interface ReleaseNotesState {
  /** Newest first; drives the What's New dialog that opens on app load. */
  unseen: ReleaseNote[]
  unseenStatus: RequestStatus
  history: ReleaseNoteHistory
}

const initialState: ReleaseNotesState = {
  unseen: [],
  unseenStatus: 'idle',
  history: { notes: [], page: 0, hasMore: true, status: 'idle', error: null },
}

const releaseNotesSlice = createSlice({
  name: 'releaseNotes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogout.pending, () => initialState)
      .addCase(userLogin.pending, () => initialState)
      .addCase(fetchUnseenReleaseNotes.pending, (state) => {
        state.unseenStatus = 'loading'
      })
      .addCase(fetchUnseenReleaseNotes.fulfilled, (state, action) => {
        state.unseen = action.payload
        state.unseenStatus = 'succeeded'
      })
      .addCase(fetchUnseenReleaseNotes.rejected, (state) => {
        state.unseenStatus = 'failed'
      })
      // Close at once; if the request fails the backend still has them unseen
      // and the dialog returns on the next load.
      .addCase(dismissReleaseNotes.pending, (state) => {
        state.unseen = []
      })
      .addCase(fetchReleaseNoteHistory.pending, (state) => {
        state.history.status = 'loading'
        state.history.error = null
      })
      .addCase(fetchReleaseNoteHistory.fulfilled, (state, action) => {
        const page = action.meta.arg
        state.history.notes =
          page === 1
            ? action.payload.results
            : [...state.history.notes, ...action.payload.results]
        state.history.page = page
        state.history.hasMore = action.payload.next !== null
        state.history.status = 'succeeded'
      })
      .addCase(fetchReleaseNoteHistory.rejected, (state, action) => {
        state.history.status = 'failed'
        state.history.error = action.payload ?? 'Could not load release notes.'
      })
  },
})

export const selectUnseenReleaseNotes = (state: RootState) =>
  state.releaseNotes.unseen
export const selectUnseenReleaseNotesStatus = (state: RootState) =>
  state.releaseNotes.unseenStatus
export const selectReleaseNoteHistory = (state: RootState) =>
  state.releaseNotes.history

export default releaseNotesSlice.reducer
