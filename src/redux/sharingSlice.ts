import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SharingEntity, SharingState } from './types/sharing'
import {
  fetchRecipients,
  fetchSharedWithMe,
  revokeShare,
  shareItem,
  toggleEntityVisibility,
} from './asyncThunks/sharing'

const initialState: SharingState = {
  sharedWithMe: [],
  recipients: [],
  loading: false,
  recipientsLoading: false,
  error: null,
  isOpen: false,
  entity: null,
  lastShareResult: null,
}

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    openSharing: (state, action: PayloadAction<SharingEntity>) => {
      state.isOpen = true
      state.entity = action.payload
      state.lastShareResult = null
    },
    closeSharing: (state) => {
      state.isOpen = false
      state.entity = null
      state.lastShareResult = null
      state.recipients = []
    },
    clearSharingError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Share item
    builder.addCase(shareItem.pending, (state) => {
      state.loading = true
      state.error = null
      state.lastShareResult = null
    })
    builder.addCase(shareItem.fulfilled, (state, action) => {
      state.loading = false
      state.lastShareResult = action.payload
    })
    builder.addCase(shareItem.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch shared with me
    builder.addCase(fetchSharedWithMe.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchSharedWithMe.fulfilled, (state, action) => {
      state.loading = false
      state.sharedWithMe = action.payload
    })
    builder.addCase(fetchSharedWithMe.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch recipients
    builder.addCase(fetchRecipients.pending, (state) => {
      state.recipientsLoading = true
    })
    builder.addCase(fetchRecipients.fulfilled, (state, action) => {
      state.recipientsLoading = false
      state.recipients = action.payload
    })
    builder.addCase(fetchRecipients.rejected, (state, action) => {
      state.recipientsLoading = false
      state.error = action.payload as string
    })

    // Revoke share
    builder.addCase(revokeShare.fulfilled, (state, action) => {
      state.recipients = state.recipients.filter((r) => r.id !== action.payload)
      state.sharedWithMe = state.sharedWithMe.filter(
        (s) => s.id !== action.payload
      )
    })
    builder.addCase(revokeShare.rejected, (state, action) => {
      state.error = action.payload as string
    })

    // Toggle visibility
    builder.addCase(toggleEntityVisibility.pending, (state) => {
      state.loading = true
    })
    builder.addCase(toggleEntityVisibility.fulfilled, (state, action) => {
      state.loading = false
      if (state.entity) {
        state.entity.isPublished = action.payload
      }
    })
    builder.addCase(toggleEntityVisibility.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { openSharing, closeSharing, clearSharingError } =
  sharingSlice.actions

export default sharingSlice.reducer
