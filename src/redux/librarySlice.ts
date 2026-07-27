import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { SharedLibrary } from './types/library'
import {
  getSharedLibraries,
  addLibrary,
  removeLibrary,
} from './asyncThunks/library'

interface LibraryState {
  libraries: SharedLibrary[]
  loaded: boolean
  loading: boolean
}

const initialState: LibraryState = {
  libraries: [],
  loaded: false,
  loading: false,
}

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSharedLibraries.pending, (state) => {
        state.loading = true
      })
      .addCase(
        getSharedLibraries.fulfilled,
        (state, action: PayloadAction<{ results: SharedLibrary[] }>) => {
          state.libraries = action.payload.results
          state.loaded = true
          state.loading = false
        }
      )
      .addCase(getSharedLibraries.rejected, (state) => {
        state.loading = false
      })
      .addCase(addLibrary.fulfilled, (state, action: PayloadAction<number>) => {
        const library = state.libraries.find((l) => l.id === action.payload)
        if (library) library.isAdded = true
      })
      .addCase(
        removeLibrary.fulfilled,
        (state, action: PayloadAction<number>) => {
          const library = state.libraries.find((l) => l.id === action.payload)
          if (library) library.isAdded = false
        }
      )
  },
})

export const selectLibraries = (state: RootState) => state.library.libraries
export const selectAddedLibraries = (state: RootState) =>
  state.library.libraries.filter((library) => library.isAdded)
export const selectLibrariesLoaded = (state: RootState) => state.library.loaded

export default librarySlice.reducer
