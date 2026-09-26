import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  fetchFileViewerCapabilities,
  reprocessFile,
  getFiles,
  deleteFile,
  deleteMultipleFiles,
  uploadNewFile,
  checkJobStatuses,
  getFolders,
  createFolder,
  deleteFolder,
  updateFolder,
  moveFilesToFolder,
  removeFileFromFolder,
  uploadFolder,
  updateFileTags,
  getSharedFiles,
  importSharedFile,
  fetchVisionModels,
  updateVisionModel,
  shareFileWithUser,
  togglePublicShare,
  startFileOcrRun,
  bulkTagFiles,
  searchFileContents,
} from './asyncThunks/file'
import { initialState } from './initialState/files'
import { needsAttention } from '@/utils/files'
import type { RootState } from './store'
import { ContentMatch, MediaTypeFilter, MyFolder } from './types/files'

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
    openMoveModal: (state) => {
      state.isMoveModalOpen = true
    },
    closeMoveModal: (state) => {
      state.isMoveModalOpen = false
    },
    setMediaTypeFilter: (state, action: PayloadAction<MediaTypeFilter>) => {
      state.mediaTypeFilter = action.payload
    },
    openShareModal: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      state.shareModalFileId = action.payload.id
      state.shareModalFileName = action.payload.name
    },
    closeShareModal: (state) => {
      state.shareModalFileId = null
      state.shareModalFileName = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reprocessFile.pending, (state, action) => {
        state.reprocessingRequests[action.meta.arg.fileId] = {
          pending: true,
          error: null,
        }
      })
      .addCase(reprocessFile.fulfilled, (state, action) => {
        state.reprocessingRequests[action.meta.arg.fileId] = {
          pending: false,
          error: null,
        }
        const index = state.files.findIndex(
          (file) => file.id === action.payload.id
        )
        if (index !== -1) state.files[index] = action.payload
        delete state.viewerCapabilities[action.payload.id]
        state.jobStatuses[action.payload.id] = {
          status: action.payload.status,
          jobId: action.payload.jobId,
          processingStage: action.payload.processingStage,
        }
      })
      .addCase(reprocessFile.rejected, (state, action) => {
        state.reprocessingRequests[action.meta.arg.fileId] = {
          pending: false,
          error: (action.payload as string) || 'Could not start processing.',
        }
      })
    builder
      .addCase(fetchFileViewerCapabilities.pending, (state, action) => {
        state.viewerCapabilityRequests[action.meta.arg] = action.meta.requestId
        delete state.viewerCapabilities[action.meta.arg]
      })
      .addCase(fetchFileViewerCapabilities.fulfilled, (state, action) => {
        if (
          state.viewerCapabilityRequests[action.meta.arg] !==
          action.meta.requestId
        )
          return
        delete state.viewerCapabilityRequests[action.meta.arg]
        state.viewerCapabilities[action.meta.arg] = action.payload
      })
      .addCase(fetchFileViewerCapabilities.rejected, (state, action) => {
        if (
          state.viewerCapabilityRequests[action.meta.arg] !==
          action.meta.requestId
        )
          return
        delete state.viewerCapabilityRequests[action.meta.arg]
        delete state.viewerCapabilities[action.meta.arg]
      })
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
      .addCase(startFileOcrRun.pending, (state) => {
        state.error = null
      })
      .addCase(startFileOcrRun.fulfilled, (state, action) => {
        const index = state.files.findIndex(
          (file) => file.id === action.payload.id
        )
        if (index !== -1) state.files[index] = action.payload
        state.jobStatuses[action.payload.id] = {
          status: action.payload.status,
          jobId: action.payload.jobId,
          processingStage: action.payload.processingStage,
        }
      })
      .addCase(startFileOcrRun.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(fetchVisionModels.fulfilled, (state, action) => {
        state.visionModels = action.payload
        state.visionModelsError = null
      })
      .addCase(fetchVisionModels.rejected, (state, action) => {
        state.visionModelsError =
          (action.payload as string) || 'Could not load vision models'
      })
      .addCase(updateVisionModel.fulfilled, (state, action) => {
        state.visionModels = action.payload
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
      .addCase(deleteMultipleFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMultipleFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = state.files.filter(
          (file) => !action.payload.includes(file.id)
        )
        state.selectedItems = []
      })
      .addCase(deleteMultipleFiles.rejected, (state, action) => {
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
            processingStage: item.processingStage,
          }
          const fileIndex = state.files.findIndex((f) => f.id === item.fileId)
          if (fileIndex !== -1) {
            state.files[fileIndex].status = item.status
            state.files[fileIndex].jobId = item.jobId
            state.files[fileIndex].processingStage = item.processingStage
            if (item.parserName !== undefined) {
              state.files[fileIndex].parserName = item.parserName
            }
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
      .addCase(updateFileTags.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFileTags.fulfilled, (state, action) => {
        state.loading = false
        const updatedFile = action.payload
        const index = state.files.findIndex(
          (file) => file.id === updatedFile.id
        )
        if (index !== -1) {
          state.files[index] = updatedFile
        }
      })
      .addCase(updateFileTags.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getSharedFiles.pending, (state) => {
        state.sharedFilesLoading = true
        state.sharedFilesError = null
      })
      .addCase(getSharedFiles.fulfilled, (state, action) => {
        state.sharedFilesLoading = false
        state.sharedFiles = action.payload.results
      })
      .addCase(getSharedFiles.rejected, (state, action) => {
        state.sharedFilesLoading = false
        state.sharedFilesError = action.payload as string
      })
      .addCase(importSharedFile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(importSharedFile.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importSharedFile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(shareFileWithUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(shareFileWithUser.fulfilled, (state, action) => {
        state.loading = false
        const fileId = action.payload
        const index = state.files.findIndex((file) => file.id === fileId)
        if (index !== -1) {
          state.files[index].isSharedByMe = true
        }
      })
      .addCase(shareFileWithUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(togglePublicShare.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(togglePublicShare.fulfilled, (state, action) => {
        state.loading = false
        const updatedFile = action.payload
        const index = state.files.findIndex(
          (file) => file.id === updatedFile.id
        )
        if (index !== -1) {
          state.files[index].isSharedPublicly = updatedFile.isSharedPublicly
          state.files[index].isSharedByMe = true
        }
      })
      .addCase(bulkTagFiles.fulfilled, (state, action) => {
        const tagsById = new Map(
          action.payload.files.map((file) => [file.id, file.tags])
        )
        for (const file of state.files) {
          file.tags = tagsById.get(file.id) ?? file.tags
        }
      })
      .addCase(searchFileContents.fulfilled, (state, action) => {
        // A slower, older search must not replace the current one.
        if (action.meta.arg !== state.searchQuery.trim()) return
        state.contentSearch = {
          query: action.meta.arg,
          matches: action.payload,
        }
      })
      .addCase(togglePublicShare.rejected, (state, action) => {
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
  setSearchQuery,
  setSelectedTags,
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  setSelectedItems,
  openMoveModal,
  closeMoveModal,
  setMediaTypeFilter,
  openShareModal,
  closeShareModal,
} = fileSlice.actions

const selectFiles = (state: RootState) => state.files.files
const selectFolders = (state: RootState) => state.files.folders
const selectUser = (state: RootState) => state.user.user

/** The user's library: documents in their active vector store, plus media. */
export const selectLibraryFiles = createSelector(
  [selectFiles, selectUser],
  (files, user) => {
    if (!user) return []
    // SyftBox files carry no vectorDbSource.
    if (user.isSyftboxFileStorage) return files
    if (user.vectorDb === undefined) return []
    return files.filter(
      (file) => file.isMedia || file.vectorDbSource === user.vectorDb
    )
  }
)

/** A file can sit in several folders. */
export const selectFoldersByFileId = createSelector(
  [selectFolders],
  (folders) => {
    const byFile = new Map<number, MyFolder[]>()
    for (const folder of folders) {
      for (const file of folder.files) {
        byFile.set(file.id, [...(byFile.get(file.id) ?? []), folder])
      }
    }
    return byFile
  }
)

export const selectSourceCounts = createSelector(
  [selectLibraryFiles, selectFoldersByFileId],
  (files, foldersByFile) => ({
    all: files.length,
    unfiled: files.filter((file) => !foldersByFile.has(file.id)).length,
    attention: files.filter(needsAttention).length,
  })
)

/** Content-search matches by file id, empty until they answer the current search. */
export const selectContentMatches = createSelector(
  [
    (state: RootState) => state.files.contentSearch,
    (state: RootState) => state.files.searchQuery,
  ],
  (search, searchQuery) =>
    new Map<number, ContentMatch>(
      search.query === searchQuery.trim()
        ? search.matches.map((match) => [match.fileId, match])
        : []
    )
)

export default fileSlice.reducer
