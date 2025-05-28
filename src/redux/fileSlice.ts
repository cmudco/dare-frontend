import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  getFiles,
  deleteFile,
  uploadNewFile,
  checkJobStatuses,
  getFolders,
  createFolder,
  deleteFolder,
  updateFolder,
  moveFilesToFolder,
  removeFileFromFolder,
  uploadFolder,
} from './aynscThunks/file'
import { initialState } from './initialState/files'

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    updateFileArchive: (state, action: PayloadAction<number>) => {
      const id = action.payload
      state.files = state.files.filter((file) => file.id !== id)
    },
    updateTagChange: (state, action: PayloadAction<number>) => {
      const tag = action.payload
      state.selectedTags = state.selectedTags.includes(tag)
        ? state.selectedTags
        : [...state.selectedTags, tag]
    },
    updateRemoveTag: (state, action: PayloadAction<number>) => {
      const tag = action.payload
      state.selectedTags = state.selectedTags.filter((t) => t !== tag)
    },
    updateFilename: (state, action: PayloadAction<string>) => {
      state.filename = action.payload
    },
    updateFoldername: (state, action: PayloadAction<string>) => {
      state.foldername = action.payload
    },
    openModal: (state) => {
      state.isModalOpen = true
    },
    closeModal: (state) => {
      state.isModalOpen = false
    },
    resetSelectedTags: (state) => {
      state.selectedTags = []
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    toggleFolderExpansion: (state, action: PayloadAction<number>) => {
      const folderId = action.payload
      state.expandedFolders[folderId] = !state.expandedFolders[folderId]
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSelectedTags: (state, action: PayloadAction<number[]>) => {
      state.selectedTags = action.payload
    },
    addSelectedItem: (state, action: PayloadAction<number>) => {
      const itemId = action.payload
      if (!state.selectedItems.includes(itemId)) {
        state.selectedItems.push(itemId)
      }
    },
    removeSelectedItem: (state, action: PayloadAction<number>) => {
      const itemId = action.payload
      state.selectedItems = state.selectedItems.filter((id) => id !== itemId)
    },
    clearSelectedItems: (state) => {
      state.selectedItems = []
    },
    setSelectedItems: (state, action: PayloadAction<number[]>) => {
      state.selectedItems = action.payload
    },
    setCurrentView: (state, action: PayloadAction<'files' | 'folders'>) => {
      state.currentView = action.payload
      state.selectedItems = []
    },
    openMoveModal: (state) => {
      state.isMoveModalOpen = true
    },
    closeMoveModal: (state) => {
      state.isMoveModalOpen = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload.results
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(uploadNewFile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadNewFile.fulfilled, (state, action) => {
        state.loading = false
        state.files.push(...action.payload)
        action.payload.forEach((file) => {
          state.jobStatuses[file.id] = {
            status: file.status,
            jobId: file.jobId,
          }
        })
      })
      .addCase(uploadNewFile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Failed to upload files'
      })
      .addCase(uploadFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadFolder.fulfilled, (state, action) => {
        state.loading = false
        state.folders.push(action.payload)
        action.payload.files.forEach((file) => {
          state.files.push(file)
          state.jobStatuses[file.id] = {
            status: file.status,
            jobId: file.jobId,
          }
        })
      })
      .addCase(uploadFolder.rejected, (state, action) => {
        state.loading = false
        console.log('Upload folder error:', action.payload)
        state.error = (action.payload as string) || 'Failed to upload folder'
      })
      .addCase(deleteFile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false
        state.files = state.files.filter((file) => file.id !== action.payload)
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(checkJobStatuses.pending, (state) => {
        state.pollingLoading = true
      })
      .addCase(checkJobStatuses.fulfilled, (state, action) => {
        state.pollingLoading = false
        action.payload.forEach((item) => {
          state.jobStatuses[item.fileId] = {
            status: item.status,
            jobId: item.jobId,
            jobStatus: item.jobStatus,
          }
          const fileIndex = state.files.findIndex((f) => f.id === item.fileId)
          if (fileIndex !== -1) {
            state.files[fileIndex].status = item.status
            state.files[fileIndex].jobId = item.jobId
          }
        })
      })
      .addCase(checkJobStatuses.rejected, (state, action) => {
        state.pollingLoading = false
        state.error = action.payload as string
      })
      .addCase(getFolders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getFolders.fulfilled, (state, action) => {
        state.loading = false
        state.folders = action.payload.results
      })
      .addCase(getFolders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false
        state.folders.push(action.payload)
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false
        state.folders = state.folders.filter(
          (folder) => folder.id !== action.payload
        )
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.loading = false
        const updatedFolder = action.payload
        const index = state.folders.findIndex(
          (folder) => folder.id === updatedFolder.id
        )
        if (index !== -1) {
          state.folders[index] = updatedFolder
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(moveFilesToFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(moveFilesToFolder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(moveFilesToFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(removeFileFromFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFileFromFolder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(removeFileFromFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  updateFileArchive,
  updateTagChange,
  updateRemoveTag,
  updateFilename,
  updateFoldername,
  openModal,
  closeModal,
  resetSelectedTags,
  setError,
  toggleFolderExpansion,
  setSearchQuery,
  setSelectedTags,
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  setSelectedItems,
  setCurrentView,
  openMoveModal,
  closeMoveModal,
} = fileSlice.actions

export default fileSlice.reducer
