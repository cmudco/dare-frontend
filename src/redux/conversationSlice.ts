import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/conversation'
import {
  getConversations,
  getAvailableModels,
  getAllModels,
  createConversation,
  deleteConversation,
  updateConversation,
  updateMessageThunk,
  updateConversationSortOrder,
  deleteMultipleConversations,
  cloneConversation,
  updateConversationSelectedIds,
} from './asyncThunks/conversation'
import {
  Message,
  Conversation,
  LLMModel,
  ImageGenerationSettings,
} from './types/conversation'
import { MyFile, MyFolder } from './types/files'
import { Tag } from './types/tags'
import { Prompt } from './types/prompt'

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState: {
    ...initialState,
  },
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    updateActiveConversation(
      state,
      action: PayloadAction<Conversation | null>
    ) {
      state.activeConversation = action.payload
      if (action.payload) {
        state.webSearchEnabled = action.payload.webSearchEnabled ?? false
        state.imageGenerationEnabled =
          action.payload.imageGenerationEnabled ?? false
        state.selectedModel =
          action.payload.selectedModel ?? state.selectedModel
      }
    },
    loadSelectedFilesFromIds(
      state,
      action: PayloadAction<{
        files: MyFile[]
        selectedFileIds: number[]
        selectedEmbeddingIds: number[]
        selectedMediaIds?: number[]
      }>
    ) {
      const { files, selectedFileIds, selectedEmbeddingIds, selectedMediaIds } =
        action.payload

      state.selectedFiles = files.filter((file) =>
        selectedFileIds.includes(file.id)
      )
      state.selectedEmbeddings = files.filter((file) =>
        selectedEmbeddingIds.includes(file.id)
      )
      if (selectedMediaIds) {
        state.selectedMediaFiles = files.filter((file) =>
          selectedMediaIds.includes(file.id)
        )
      }
    },
    updateSelectedModel(state, action: PayloadAction<number>) {
      state.selectedModel = action.payload
    },
    updateSelectedFiles(state, action: PayloadAction<MyFile[]>) {
      state.selectedFiles = action.payload
    },
    updateSelectedEmbeddings(state, action: PayloadAction<MyFile[]>) {
      state.selectedEmbeddings = action.payload
    },
    updateSelectedMediaFiles(state, action: PayloadAction<MyFile[]>) {
      state.selectedMediaFiles = action.payload
    },
    updateSelectedTags(state, action: PayloadAction<Tag[]>) {
      state.selectedTags = action.payload
    },
    updateSelectedFolders(state, action: PayloadAction<MyFolder[]>) {
      state.selectedFolders = action.payload
    },
    updateReferencedConversations(
      state,
      action: PayloadAction<Conversation[]>
    ) {
      state.referencedConversations = action.payload
    },
    updateReferencedConversationHistoryLimit(
      state,
      action: PayloadAction<number>
    ) {
      state.referencedConversationHistoryLimit = action.payload
    },
    toggleDropdown(state) {
      state.showDropdown = !state.showDropdown
    },
    setHoveredModel(state, action: PayloadAction<string | null>) {
      state.hoveredModel = action.payload
    },
    updateConversationInput(state, action: PayloadAction<string>) {
      state.conversationInput = action.payload
    },
    clearConversation(state) {
      state.activeConversationMessages = []
    },
    updateTemperature(state, action: PayloadAction<number>) {
      if (state.activeConversation) {
        state.activeConversation.temperature = action.payload
      }
    },
    updateMaxTokens(state, action: PayloadAction<number>) {
      if (state.activeConversation) {
        state.activeConversation.maxTokens = action.payload
      }
    },
    updateMaxContextSnippets(state, action: PayloadAction<number>) {
      if (state.activeConversation) {
        state.activeConversation.maxContextSnippets = action.payload
      }
    },
    updateDocumentSimilarityThreshold(state, action: PayloadAction<number>) {
      if (state.activeConversation) {
        state.activeConversation.documentSimilarityThreshold = action.payload
      }
    },
    updateHistoryLimit(state, action: PayloadAction<number>) {
      if (state.activeConversation) {
        state.activeConversation.historyLimit = action.payload
      }
    },
    updateWebSearchEnabled(state, action: PayloadAction<boolean>) {
      state.webSearchEnabled = action.payload
      if (state.activeConversation) {
        state.activeConversation.webSearchEnabled = action.payload
      }
    },
    updateImageGenerationEnabled(state, action: PayloadAction<boolean>) {
      state.imageGenerationEnabled = action.payload
      if (state.activeConversation) {
        state.activeConversation.imageGenerationEnabled = action.payload
      }

      if (action.payload) {
        // Switching to image generation mode
        // Update availableModels to show only image generators
        const imageModels = state.allModels.filter(
          (model) => model.isImageGenerator === true
        )
        state.availableModels = imageModels
        // Select first image generator model
        if (imageModels[0]) {
          state.selectedModel = imageModels[0].id
        }
      } else {
        // Switching back from image generation mode
        // Update availableModels to show only non-image models
        const textModels = state.allModels.filter(
          (model) => !model.isImageGenerator
        )
        state.availableModels = textModels
        // Select first text model
        if (textModels[0]) {
          state.selectedModel = textModels[0].id
        }
      }
    },
    updateImageGenerationSettings(
      state,
      action: PayloadAction<ImageGenerationSettings>
    ) {
      state.imageGenerationSettings = action.payload
    },
    addMessage(state, action: PayloadAction<Message>) {
      const index = state.activeConversationMessages.findIndex(
        (msg) => msg?.id === action.payload.id
      )
      if (index !== -1) {
        state.activeConversationMessages[index] = action.payload
      } else {
        state.activeConversationMessages.push(action.payload)
      }
    },
    updateMessage(state, action: PayloadAction<Partial<Message>>) {
      const index = state.activeConversationMessages.findIndex(
        (msg) => msg?.id == action.payload.id
      )
      if (index !== -1) {
        state.activeConversationMessages[index] = {
          ...state.activeConversationMessages[index],
          ...action.payload,
          message: `${action.payload.message}`,
        }
      }
    },
    setAvailableModels(state, action: PayloadAction<LLMModel[]>) {
      state.availableModels = action.payload
      state.selectedModel = action.payload[0]?.id
    },
    setAllModels(state, action: PayloadAction<LLMModel[]>) {
      state.allModels = action.payload
    },
    updateConversationTitle(state, action: PayloadAction<string>) {
      if (!state.activeConversation) return
      state.activeConversation.title = action.payload
      const index = state.conversations.findIndex(
        (conv) =>
          conv.conversationId === state.activeConversation?.conversationId
      )
      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          title: action.payload,
        }
      }
    },
    updateConversationHistory(state, action: PayloadAction<Message[]>) {
      state.activeConversationMessages = action.payload
    },
    setPrompt(state, action: PayloadAction<Prompt | null>) {
      if (state.activeConversation) {
        state.activeConversation.prompt = action.payload
      }
    },
    resetConversation(state) {
      state.activeConversation = null
      state.activeConversationMessages = []
      state.selectedFiles = []
      state.selectedEmbeddings = []
      state.selectedTags = []
      state.selectedFolders = []
      state.conversationInput = ''
      state.selectedModel = state.availableModels[0]?.id
      state.referencedConversations = []
    },
    updateConversationOrder(state, action: PayloadAction<string[]>) {
      const orderedConversations: Conversation[] = []
      action.payload.forEach((conversationId, index) => {
        const conversation = state.conversations.find(
          (c) => c.conversationId === conversationId
        )
        if (conversation) {
          const updatedConversation = {
            ...conversation,
            sortOrder: (index + 1) * 10,
          }
          orderedConversations.push(updatedConversation)
        }
      })
      state.conversations = orderedConversations
    },
    toggleConversationSelection(state, action: PayloadAction<string>) {
      const conversationId = action.payload
      const index = state.selectedConversations.indexOf(conversationId)
      if (index > -1) {
        state.selectedConversations.splice(index, 1)
      } else {
        state.selectedConversations.push(conversationId)
      }
    },
    setSelectedConversations(state, action: PayloadAction<string[]>) {
      state.selectedConversations = action.payload
    },
    clearSelectedConversations(state) {
      state.selectedConversations = []
    },
    saveDraftForConversation(
      state,
      action: PayloadAction<{ conversationId: string; text: string }>
    ) {
      const { conversationId, text } = action.payload
      const existingIndex = state.conversationDrafts.findIndex(
        (d) => d.conversationId === conversationId
      )
      const draft = {
        conversationId,
        draft: text,
        timestamp: Date.now(),
      }

      if (existingIndex >= 0) {
        state.conversationDrafts[existingIndex] = draft
      } else {
        state.conversationDrafts.push(draft)
      }
    },
    loadDraftForConversation(state, action: PayloadAction<string>) {
      const conversationId = action.payload
      const draft = state.conversationDrafts.find(
        (d) => d.conversationId === conversationId
      )
      state.conversationInput = draft?.draft || ''
    },
    clearDraftForConversation(state, action: PayloadAction<string>) {
      const conversationId = action.payload
      state.conversationDrafts = state.conversationDrafts.filter(
        (d) => d.conversationId !== conversationId
      )
    },
    clearOldDrafts(state, action: PayloadAction<number>) {
      const maxAge = action.payload || 1 * 24 * 60 * 60 * 1000 // 1 day default
      const cutoffTime = Date.now() - maxAge
      state.conversationDrafts = state.conversationDrafts.filter(
        (d) => d.timestamp > cutoffTime
      )
    },
    setAutoSaveEnabled(state, action: PayloadAction<boolean>) {
      state.autoSaveEnabled = action.payload
    },
    addAttachedImage(
      state,
      action: PayloadAction<{
        id: string
        preview: string
        name: string
        size: number
        type: string
      }>
    ) {
      state.attachedImages.push(action.payload)
    },
    removeAttachedImage(state, action: PayloadAction<string>) {
      state.attachedImages = state.attachedImages.filter(
        (img) => img.id !== action.payload
      )
    },
    clearAttachedImages(state) {
      state.attachedImages = []
    },
    setImageGenerating(
      state,
      action: PayloadAction<{ generating: boolean; prompt: string | null }>
    ) {
      state.isGeneratingImage = action.payload.generating
      state.imageGenerationPrompt = action.payload.prompt
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getConversations.fulfilled,
        (state, action: PayloadAction<Conversation[]>) => {
          state.loading = false
          state.conversations = action.payload
        }
      )
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getAvailableModels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getAvailableModels.fulfilled,
        (state, action: PayloadAction<LLMModel[]>) => {
          state.loading = false
          // Filter out image generation models by default (they'll be shown when image mode is enabled)
          const nonImageModels = action.payload.filter(
            (model) => !model.isImageGenerator
          )
          state.availableModels = nonImageModels
          state.selectedModel = nonImageModels[0]?.id
        }
      )
      .addCase(getAvailableModels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        console.error('Failed to load models:', action.payload)
      })
      .addCase(createConversation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false
        state.conversations.unshift(action.payload)
        state.referencedConversations = []
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteConversation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = state.conversations.filter(
          (conv) => conv.conversationId !== action.payload
        )
        state.conversationDrafts = state.conversationDrafts.filter(
          (draft) => draft.conversationId !== action.payload
        )
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateConversation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateConversation.fulfilled, (state, action) => {
        state.loading = false
        const index = state.conversations.findIndex(
          (conv) => conv.conversationId === action.payload.conversationId
        )
        if (index !== -1) {
          state.conversations[index] = action.payload
        }
        if (
          state.activeConversation?.conversationId ===
          action.payload.conversationId
        ) {
          state.activeConversation = action.payload
        }
      })
      .addCase(updateConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateMessageThunk.fulfilled, (state, action) => {
        const messageIndex = state.activeConversationMessages.findIndex(
          (msg) => msg?.id == action.payload.id
        )
        if (messageIndex !== -1) {
          state.activeConversationMessages[messageIndex] = {
            ...state.activeConversationMessages[messageIndex],
            feedbackType: action.payload.feedbackType,
            feedbackText: action.payload.feedbackText,
          }
        }
      })
      .addCase(updateMessageThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateConversationSortOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(updateConversationSortOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateConversationSortOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteMultipleConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMultipleConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = state.conversations.filter(
          (conv) => !action.payload.includes(conv.conversationId)
        )
        state.conversationDrafts = state.conversationDrafts.filter(
          (draft) => !action.payload.includes(draft.conversationId)
        )
        state.selectedConversations = []
      })
      .addCase(deleteMultipleConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(cloneConversation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cloneConversation.fulfilled, (state, action) => {
        state.loading = false
        state.conversations.unshift(action.payload)
      })
      .addCase(cloneConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getAllModels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getAllModels.fulfilled,
        (state, action: PayloadAction<LLMModel[]>) => {
          state.loading = false
          state.allModels = action.payload
        }
      )
      .addCase(getAllModels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        console.error('Failed to load all models:', action.payload)
      })
      .addCase(updateConversationSelectedIds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateConversationSelectedIds.fulfilled, (state, action) => {
        state.loading = false
        // Update the active conversation with the new data
        if (
          state.activeConversation?.conversationId ===
          action.payload.conversationId
        ) {
          state.activeConversation = action.payload
        }
        // Update the conversation in the conversations list
        const index = state.conversations.findIndex(
          (conv) => conv.conversationId === action.payload.conversationId
        )
        if (index !== -1) {
          state.conversations[index] = action.payload
        }
      })
      .addCase(updateConversationSelectedIds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  updateSearchQuery,
  updateActiveConversation,
  updateSelectedModel,
  updateSelectedFiles,
  updateSelectedEmbeddings,
  updateSelectedMediaFiles,
  updateSelectedTags,
  updateSelectedFolders,
  updateTemperature,
  updateMaxTokens,
  updateHistoryLimit,
  updateWebSearchEnabled,
  updateImageGenerationEnabled,
  updateImageGenerationSettings,
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
  toggleDropdown,
  setHoveredModel,
  updateConversationInput,
  addMessage,
  clearConversation,
  updateMessage,
  setAvailableModels,
  setAllModels,
  updateConversationTitle,
  updateConversationHistory,
  setPrompt,
  resetConversation,
  updateConversationOrder,
  toggleConversationSelection,
  setSelectedConversations,
  clearSelectedConversations,
  updateReferencedConversations,
  updateReferencedConversationHistoryLimit,
  loadSelectedFilesFromIds,
  saveDraftForConversation,
  loadDraftForConversation,
  clearDraftForConversation,
  clearOldDrafts,
  setAutoSaveEnabled,
  addAttachedImage,
  removeAttachedImage,
  clearAttachedImages,
} = conversationSlice.actions
export default conversationSlice.reducer
