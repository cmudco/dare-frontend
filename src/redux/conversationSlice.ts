import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/conversation'
import {
  getConversations,
  fetchConversationById,
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
  updateConversationFeedbackTracking,
  deleteMessage,
  fetchConversationSummaries,
  fetchSharedConversations,
  toggleFavoriteConversation,
  publishConversation,
  forkConversation,
  fetchConversationMessages,
} from './asyncThunks/conversation'
import {
  Message,
  Conversation,
  ConversationSummary,
  LLMModel,
  ImageGenerationSettings,
  AudioTranscriptionSettings,
  ToolCallStatus,
  WalletMeta,
} from './types/conversation'
import { ServerSlug } from '@/utils/constants/dareTools'
import { ConversationTab } from '@/utils/constants/conversation'
import { MyFile, MyFolder } from './types/files'
import { Tag } from './types/tags'
import { Prompt } from './types/prompt'
import {
  selectAppropriateModel,
  syncModelsWithImageGenerationState,
  syncModelsWithAudioTranscriptionState,
} from './utils/modelSyncHelpers'

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
        // Update toggle states from conversation
        state.webSearchEnabled = action.payload.webSearchEnabled ?? false
        state.imageGenerationEnabled =
          action.payload.imageGenerationEnabled ?? false
        state.audioTranscriptionEnabled =
          action.payload.audioTranscriptionEnabled ?? false
        state.artifactsEnabled = action.payload.artifactsEnabled ?? false
        state.memoryEnabled = action.payload.memoryEnabled ?? false

        // Conversation persists only the DB-backed LLM PK (integer);
        // stringify to match the picker's opaque-id shape.
        const desired =
          action.payload.selectedModel != null
            ? String(action.payload.selectedModel)
            : null

        // Sync picker entries based on the active mode (priority: audio >
        // image > text).
        if (action.payload.audioTranscriptionEnabled) {
          syncModelsWithAudioTranscriptionState(state, true, desired)
        } else if (action.payload.imageGenerationEnabled) {
          syncModelsWithImageGenerationState(state, true, desired)
        } else {
          syncModelsWithImageGenerationState(state, false, desired)
        }
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
    updateSelectedModel(state, action: PayloadAction<string | null>) {
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
    updateMemoryEnabled(state, action: PayloadAction<boolean>) {
      state.memoryEnabled = action.payload
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
    updateReferencedSummaries(
      state,
      action: PayloadAction<ConversationSummary[]>
    ) {
      state.referencedSummaries = action.payload
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
      // Update global and conversation-level state
      state.imageGenerationEnabled = action.payload
      if (state.activeConversation) {
        state.activeConversation.imageGenerationEnabled = action.payload
      }

      // Sync available models and auto-select appropriate model
      syncModelsWithImageGenerationState(
        state,
        action.payload,
        state.selectedModel
      )
    },
    updateArtifactsEnabled(state, action: PayloadAction<boolean>) {
      // Update global and conversation-level state
      state.artifactsEnabled = action.payload
      if (state.activeConversation) {
        state.activeConversation.artifactsEnabled = action.payload
      }
    },
    updateSelectedMcpServers(state, action: PayloadAction<number[]>) {
      if (state.activeConversation) {
        state.activeConversation.selectedMcpServerIds = action.payload
      }
    },
    updateSelectedDareTools(state, action: PayloadAction<string[]>) {
      if (state.activeConversation) {
        state.activeConversation.selectedDareToolSlugs = action.payload
      }
    },
    updateSelectedAgent(
      state,
      action: PayloadAction<{
        agentId: number | null
        agentName: string | null
      }>
    ) {
      if (state.activeConversation) {
        state.activeConversation.selectedAgent = action.payload.agentId
        state.activeConversation.selectedAgentName = action.payload.agentName
      }
    },
    /**
     * Apply all agent settings to the active conversation in a single action.
     * This consolidates multiple individual updates for better performance and cleaner code.
     */
    applyAgentSettings(
      state,
      action: PayloadAction<{
        agentId: number
        agentName: string
        // Agent.llm is a numeric FK to a real DB-backed LLM — agents can't
        // route through LiteLLM today, so we just stringify the PK.
        llm?: number | null
        temperature: number
        maxTokens: number
        maxContextSnippets: number
        documentSimilarityThreshold: number
        enableWebSearch: boolean
      }>
    ) {
      if (!state.activeConversation) return

      const {
        agentId,
        agentName,
        llm,
        temperature,
        maxTokens,
        maxContextSnippets,
        documentSimilarityThreshold,
        enableWebSearch,
      } = action.payload

      // Update agent selection
      state.activeConversation.selectedAgent = agentId
      state.activeConversation.selectedAgentName = agentName

      // Apply all settings atomically
      if (llm != null) {
        state.selectedModel = String(llm)
      }
      state.activeConversation.temperature = temperature
      state.activeConversation.maxTokens = maxTokens
      state.activeConversation.maxContextSnippets = maxContextSnippets
      state.activeConversation.documentSimilarityThreshold =
        documentSimilarityThreshold
      state.webSearchEnabled = enableWebSearch
      state.activeConversation.webSearchEnabled = enableWebSearch
    },
    updateImageGenerationSettings(
      state,
      action: PayloadAction<ImageGenerationSettings>
    ) {
      state.imageGenerationSettings = action.payload
    },
    updateAudioTranscriptionEnabled(state, action: PayloadAction<boolean>) {
      // Update global and conversation-level state
      state.audioTranscriptionEnabled = action.payload
      if (state.activeConversation) {
        state.activeConversation.audioTranscriptionEnabled = action.payload
      }

      // Sync available models and auto-select appropriate model
      syncModelsWithAudioTranscriptionState(
        state,
        action.payload,
        state.selectedModel
      )
    },
    updateAudioTranscriptionSettings(
      state,
      action: PayloadAction<AudioTranscriptionSettings>
    ) {
      state.audioTranscriptionSettings = action.payload
    },
    setIsTranscribingAudio(state, action: PayloadAction<boolean>) {
      state.isTranscribingAudio = action.payload
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
      // Clear conversation and related data
      state.activeConversation = null
      state.activeConversationMessages = []
      state.selectedFiles = []
      state.selectedEmbeddings = []
      state.selectedTags = []
      state.selectedFolders = []
      state.memoryEnabled = false
      state.conversationInput = ''
      state.referencedConversations = []

      // Reset feature toggles
      state.imageGenerationEnabled = false
      state.audioTranscriptionEnabled = false
      state.webSearchEnabled = false
      state.artifactsEnabled = false

      // Reset to text models — no auto-select (conversationModel is undefined → null)
      syncModelsWithImageGenerationState(state, false)
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
    setHistorySidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.historySidebarCollapsed = action.payload
    },
    setImageGenerating(
      state,
      action: PayloadAction<{ generating: boolean; prompt: string | null }>
    ) {
      state.isGeneratingImage = action.payload.generating
      state.imageGenerationPrompt = action.payload.prompt
    },
    setActiveTab(state, action: PayloadAction<ConversationTab>) {
      state.activeTab = action.payload
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
        (
          state,
          action: PayloadAction<{
            models: LLMModel[]
            wallet: WalletMeta | null
          }>
        ) => {
          state.loading = false
          // Strip image-gen / audio-transcription models from the chat
          // picker (they belong on dedicated toggles). LiteLLM entries
          // already have those flags forced to false on the BE.
          state.pickerEntries = action.payload.models.filter(
            (m) => !m.isImageGenerator && !m.isAudioTranscriber
          )
          state.activeWalletMeta = action.payload.wallet
          // Reconcile selectedModel: if the previously selected id is no
          // longer in the wallet's catalog (e.g. user just toggled wallet),
          // fall back to the first available so the next chat send uses a
          // model the active wallet actually serves.
          state.selectedModel = selectAppropriateModel(
            state.selectedModel,
            state.pickerEntries
          )
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
        state.referencedSummaries = []
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchConversationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.loading = false
        state.activeConversation = action.payload

        const index = state.conversations.findIndex(
          (conv) => conv.conversationId === action.payload.conversationId
        )
        if (index !== -1) {
          state.conversations[index] = action.payload
        }
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
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
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false
        state.activeConversationMessages =
          state.activeConversationMessages.filter(
            (msg) => msg?.id?.toString() !== action.payload
          )
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false
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
      .addCase(
        updateConversationFeedbackTracking.fulfilled,
        (state, action) => {
          // Update the active conversation with new feedback tracking values
          if (
            state.activeConversation?.conversationId ===
            action.payload.conversationId
          ) {
            state.activeConversation.feedbackAutoPromptCount =
              action.payload.feedbackAutoPromptCount
            state.activeConversation.feedbackLastPromptMessageCount =
              action.payload.feedbackLastPromptMessageCount
            state.activeConversation.feedbackLastPromptTimestamp =
              action.payload.feedbackLastPromptTimestamp
          }

          // Also update in conversations array
          const idx = state.conversations.findIndex(
            (c) => c.conversationId === action.payload.conversationId
          )
          if (idx !== -1) {
            state.conversations[idx].feedbackAutoPromptCount =
              action.payload.feedbackAutoPromptCount
            state.conversations[idx].feedbackLastPromptMessageCount =
              action.payload.feedbackLastPromptMessageCount
            state.conversations[idx].feedbackLastPromptTimestamp =
              action.payload.feedbackLastPromptTimestamp
          }
        }
      )
      .addCase(
        updateConversationFeedbackTracking.rejected,
        (_state, action) => {
          console.error('Failed to update feedback tracking:', action.payload)
        }
      )
      // ─────────────────────────────────────────────────────────────────────
      // Conversation Sharing thunks
      // ─────────────────────────────────────────────────────────────────────
      .addCase(fetchSharedConversations.fulfilled, (state, action) => {
        state.sharedConversations = action.payload
      })
      .addCase(fetchConversationSummaries.fulfilled, (state, action) => {
        state.conversationSummaries = action.payload
      })
      .addCase(toggleFavoriteConversation.fulfilled, (state, action) => {
        const idx = state.conversations.findIndex(
          (conversation) =>
            conversation.conversationId === action.payload.conversationId
        )
        if (idx !== -1) {
          state.conversations[idx] = action.payload
        }
        if (
          state.activeConversation?.conversationId ===
          action.payload.conversationId
        ) {
          state.activeConversation = action.payload
        }
      })
      .addCase(publishConversation.fulfilled, (state, action) => {
        // Update in user's own conversations list
        const idx = state.conversations.findIndex(
          (c) => c.conversationId === action.payload.conversationId
        )
        if (idx !== -1) {
          state.conversations[idx] = action.payload
        }
        // Also update activeConversation if it's the same
        if (
          state.activeConversation?.conversationId ===
          action.payload.conversationId
        ) {
          state.activeConversation = action.payload
        }
      })
      .addCase(forkConversation.fulfilled, (state, action) => {
        // Add forked conversation to user's list and switch to "mine" tab
        state.conversations.unshift(action.payload)
        state.activeTab = ConversationTab.MINE
        state.activeConversation = action.payload
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.activeConversationMessages = action.payload
      })
      // ─────────────────────────────────────────────────────────────────────
      // Socket.IO message handlers (from socketMiddleware)
      // ─────────────────────────────────────────────────────────────────────
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: { conversationHistory: Message[] }
        } => action.type === 'socket/conversation_history',
        (state, action) => {
          if (action.payload.conversationHistory) {
            state.activeConversationMessages =
              action.payload.conversationHistory
          }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: Message & { regenerate?: boolean }
        } => action.type === 'socket/message',
        (state, action) => {
          const existingIndex = state.activeConversationMessages.findIndex(
            (msg) => msg.id === action.payload.id
          )

          if (existingIndex !== -1) {
            // Message exists - update it (handles regenerate and deduplication)
            state.activeConversationMessages[existingIndex] = {
              ...state.activeConversationMessages[existingIndex],
              ...action.payload,
            }
          } else {
            // New message - add it
            state.activeConversationMessages.push(action.payload)
          }
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: Partial<Message> } =>
          action.type === 'socket/ai_stream',
        (state, action) => {
          const index = state.activeConversationMessages.findIndex(
            (msg) => msg.id === action.payload.id
          )
          if (index !== -1) {
            state.activeConversationMessages[index] = {
              ...state.activeConversationMessages[index],
              ...action.payload,
            }
          }
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: { title: string } } =>
          action.type === 'socket/conversation_title',
        (state, action) => {
          if (state.activeConversation) {
            state.activeConversation.title = action.payload.title
            // Also update in conversations list
            const index = state.conversations.findIndex(
              (conv) =>
                conv.conversationId === state.activeConversation?.conversationId
            )
            if (index !== -1) {
              state.conversations[index].title = action.payload.title
            }
          }
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: Partial<Message> } =>
          action.type === 'socket/edit_message' ||
          action.type === 'socket/regenerate_response',
        (state, action) => {
          const index = state.activeConversationMessages.findIndex(
            (msg) => msg.id === action.payload.id
          )
          if (index !== -1) {
            state.activeConversationMessages[index] = {
              ...state.activeConversationMessages[index],
              ...action.payload,
            }
          }
        }
      )
      // Voice transcription - put text in input for user review
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: { text: string; status: string; error?: string }
        } => action.type === 'socket/voice_transcription',
        (state, action) => {
          const { status, text } = action.payload
          // Stop transcribing on complete or error
          if (status === 'complete' || status === 'error') {
            state.isTranscribingAudio = false
          }
          // Only set input text on successful completion
          if (status === 'complete' && text) {
            state.conversationInput = text
          }
        }
      )
      // MCP Tool Call - tool starts executing
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            messageId: number
            toolCallId: string
            toolName: string
            serverSlug: string
            status: ToolCallStatus
          }
        } => action.type === 'socket/mcp_tool_call',
        (state, action) => {
          const { messageId, toolCallId, toolName, serverSlug, status } =
            action.payload
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (msg) {
            // Initialize toolCalls array if not present
            if (!msg.mcpToolCalls) {
              msg.mcpToolCalls = []
            }
            // Add new tool call entry using the ID from backend
            msg.mcpToolCalls.push({
              id: toolCallId,
              toolName,
              serverSlug,
              status,
            })
          }
        }
      )
      // MCP Tool Result - tool completes (success or error)
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            messageId: number
            toolCallId: string
            toolName: string
            serverSlug: string
            status: 'success' | 'error'
            result?: unknown
            error?: string
          }
        } => action.type === 'socket/mcp_tool_result',
        (state, action) => {
          const { messageId, toolCallId, status, result, error } =
            action.payload
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (msg && msg.mcpToolCalls) {
            // Find the matching tool call by unique id only
            // (DO NOT fallback to toolName - multiple calls of same tool would match the wrong entry)
            const toolCall = msg.mcpToolCalls.find((tc) => tc.id === toolCallId)
            if (toolCall) {
              toolCall.status =
                status === 'success'
                  ? ToolCallStatus.COMPLETED
                  : ToolCallStatus.FAILED
              if (result) {
                // Store as mcpResult (MCP tools use this field)
                toolCall.mcpResult = result
              }
              if (error) {
                toolCall.error = error
              }
            }
          }
        }
      )
      // DARE Tool Call - tool starts executing
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            messageId: number
            toolCall: {
              id: string
              toolName: string
              toolSlug: string
              serverSlug: string
              status: ToolCallStatus
              arguments?: Record<string, unknown>
            }
          }
        } => action.type === 'socket/dareToolCall',
        (state, action) => {
          const { messageId, toolCall } = action.payload
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (msg) {
            // Initialize toolCalls array if not present
            if (!msg.mcpToolCalls) {
              msg.mcpToolCalls = []
            }
            // Add new tool call entry
            msg.mcpToolCalls.push({
              id: toolCall.id,
              toolName: toolCall.toolName,
              serverSlug: toolCall.serverSlug || ServerSlug.DARE,
              status: toolCall.status,
            })
          }
        }
      )
      // DARE Tool Result - tool completes (success or error)
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            messageId: number
            toolCall: {
              id: string
              toolName: string
              toolSlug: string
              serverSlug: string
              status: 'completed' | 'failed'
              result?: Record<string, unknown>
              arguments?: Record<string, unknown>
            }
          }
        } => action.type === 'socket/dareToolResult',
        (state, action) => {
          const { messageId, toolCall } = action.payload
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (msg && msg.mcpToolCalls) {
            // Find the matching tool call by unique id only
            // (DO NOT fallback to toolName - multiple calls of same tool would match the wrong entry)
            const existingToolCall = msg.mcpToolCalls.find(
              (tc) => tc.id === toolCall.id
            )
            if (existingToolCall) {
              existingToolCall.status =
                toolCall.status === 'completed'
                  ? ToolCallStatus.COMPLETED
                  : ToolCallStatus.FAILED
              if (toolCall.result) {
                // Store as dareResult (DARE tools use this field)
                // Result is already parsed and camelCased from BE
                existingToolCall.dareResult =
                  toolCall.result as unknown as import('@/redux/types/dareToolResults').DareToolResult

                // If result indicates failure, also set error
                if (!toolCall.result.success && toolCall.result.error) {
                  existingToolCall.error = toolCall.result.error as string
                }
              }
            }
          }
        }
      )
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
  updateMemoryEnabled,
  updateTemperature,
  updateMaxTokens,
  updateHistoryLimit,
  updateWebSearchEnabled,
  updateImageGenerationEnabled,
  updateAudioTranscriptionEnabled,
  updateArtifactsEnabled,
  updateImageGenerationSettings,
  updateAudioTranscriptionSettings,
  setIsTranscribingAudio,
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
  toggleDropdown,
  setHoveredModel,
  updateConversationInput,
  addMessage,
  clearConversation,
  updateMessage,
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
  updateReferencedSummaries,
  loadSelectedFilesFromIds,
  saveDraftForConversation,
  loadDraftForConversation,
  clearDraftForConversation,
  clearOldDrafts,
  setAutoSaveEnabled,
  addAttachedImage,
  removeAttachedImage,
  clearAttachedImages,
  setHistorySidebarCollapsed,
  setImageGenerating,
  updateSelectedMcpServers,
  updateSelectedDareTools,
  updateSelectedAgent,
  applyAgentSettings,
  setActiveTab,
} = conversationSlice.actions
export default conversationSlice.reducer
