/**
 * Memory Redux Slice
 *
 * State management for cross-conversation memory feature.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialMemoryState } from './initialState/memory'
import {
  applyMemoryProposal,
  getMemoryItems,
  getMemorySweep,
  getRetiredMemoryItems,
  deleteMemoryItem,
  updateMemoryItem,
  searchMemory,
  clearAllMemory,
} from './asyncThunks/memory'
import { MemoryItem, MemorySearchResult, MemorySweep } from './types/memory'

const memorySlice = createSlice({
  name: 'memory',
  initialState: initialMemoryState,
  reducers: {
    clearMemoryError: (state) => {
      state.error = null
    },
    clearSearchResults: (state) => {
      state.searchResults = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Memory Items
      .addCase(getMemoryItems.pending, (state) => {
        state.itemsLoading = true
        state.error = null
      })
      .addCase(
        getMemoryItems.fulfilled,
        (state, action: PayloadAction<MemoryItem[]>) => {
          state.itemsLoading = false
          state.items = action.payload
        }
      )
      .addCase(getMemoryItems.rejected, (state, action) => {
        state.itemsLoading = false
        state.error = action.payload as string
      })

      // Retired memories — fetched on demand, when the archive is opened
      .addCase(getRetiredMemoryItems.pending, (state) => {
        state.retiredLoading = true
      })
      .addCase(
        getRetiredMemoryItems.fulfilled,
        (state, action: PayloadAction<MemoryItem[]>) => {
          state.retiredLoading = false
          state.retired = action.payload
        }
      )
      .addCase(getRetiredMemoryItems.rejected, (state, action) => {
        state.retiredLoading = false
        state.error = action.payload as string
      })

      // The tidy-up sweep
      .addCase(getMemorySweep.pending, (state) => {
        state.sweepLoading = true
      })
      .addCase(
        getMemorySweep.fulfilled,
        (state, action: PayloadAction<MemorySweep>) => {
          state.sweepLoading = false
          state.sweep = action.payload
        }
      )
      .addCase(getMemorySweep.rejected, (state, action) => {
        state.sweepLoading = false
        state.error = action.payload as string
      })

      .addCase(applyMemoryProposal.pending, (state, action) => {
        state.applyingProposal = action.meta.arg.recordId
      })
      .addCase(applyMemoryProposal.fulfilled, (state, action) => {
        state.applyingProposal = null
        // Drop the one just applied rather than refetching: the rest of the
        // sweep is still valid, and re-running it would reshuffle the list
        // under the person mid-review.
        if (state.sweep) {
          state.sweep.proposals = state.sweep.proposals.filter(
            (item) => item.recordId !== action.payload.proposal.recordId
          )
        }
      })
      .addCase(applyMemoryProposal.rejected, (state, action) => {
        state.applyingProposal = null
        state.error = action.payload as string
      })

      // Delete Memory Item
      .addCase(deleteMemoryItem.pending, (state) => {
        state.error = null
      })
      .addCase(
        deleteMemoryItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          // Remove the deleted item from the list and any live search results
          state.items = state.items.filter((item) => item.id !== action.payload)
          if (state.searchResults) {
            state.searchResults.items = state.searchResults.items.filter(
              (item) => item.id !== action.payload
            )
          }
        }
      )
      .addCase(deleteMemoryItem.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Update Memory Item
      .addCase(updateMemoryItem.pending, (state, action) => {
        state.savingId = action.meta.arg.id
        state.error = null
      })
      .addCase(updateMemoryItem.fulfilled, (state, action) => {
        state.savingId = null
        // A rewritten profile line gets a new content-derived id, so the
        // edited row is matched on the id that was SENT, not the one that
        // came back.
        const editedId = action.meta.arg.id
        const replace = (item: MemoryItem) =>
          item.id === editedId ? { ...item, ...action.payload } : item
        state.items = state.items.map(replace)
        if (state.searchResults) {
          state.searchResults.items = state.searchResults.items.map(replace)
        }
      })
      .addCase(updateMemoryItem.rejected, (state, action) => {
        state.savingId = null
        state.error = action.payload as string
      })

      // Search Memory
      .addCase(searchMemory.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(
        searchMemory.fulfilled,
        (state, action: PayloadAction<MemorySearchResult>) => {
          state.searchLoading = false
          state.searchResults = action.payload
        }
      )
      .addCase(searchMemory.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload as string
      })

      // Clear All Memory
      .addCase(clearAllMemory.pending, (state) => {
        state.clearing = true
        state.error = null
      })
      .addCase(clearAllMemory.fulfilled, (state) => {
        state.clearing = false
        state.items = []
        state.searchResults = null
      })
      .addCase(clearAllMemory.rejected, (state, action) => {
        state.clearing = false
        state.error = action.payload as string
      })
  },
})

export const { clearMemoryError, clearSearchResults } = memorySlice.actions
export default memorySlice.reducer
