import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/conversation'
import {
  getConversations,
  fetchConversationById,
  getAvailableModels,
  getAllModels,
  getActiveModels,
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
  applyAgentToConversation,
} from './asyncThunks/conversation'
import {
  deleteProject,
  moveConversationsToProject,
} from './asyncThunks/project'
import {
  ModelSettings,
  ConversationState,
  Message,
  Conversation,
  ConversationSummary,
  LLMModel,
  PickerModel,
  ImageGenerationSettings,
  AudioTranscriptionSettings,
  ToolCallStatus,
  WalletMeta,
  RagMode,
  MemoryWriteData,
  EnsembleBriefs,
  EnsembleDepth,
  EnsembleRole,
} from './types/conversation'
import { ToolCallOrigin, ToolLoopState } from '@/utils/constants/dareTools'
import { ConversationTab } from '@/utils/constants/conversation'
import { EMPTY_BRIEFS } from '@/utils/ensemble'
import type {
  ToolCallPendingEvent,
  ToolCallArgsProgressEvent,
  ToolCallExecutingEvent,
  ToolCallResultEvent,
  ToolRoundsCappedEvent,
  ContextTraceEvent,
  DeliberationEvent,
} from './types/toolEvents'
import { MyFile, MyFolder } from './types/files'
import { Tag } from './types/tags'
import { SharedLibrary } from './types/library'
import { Prompt } from './types/prompt'
import {
  selectAppropriateModel,
  syncModelsWithImageGenerationState,
  syncModelsWithAudioTranscriptionState,
} from './utils/modelSyncHelpers'
import { userLogin, userLogout } from './asyncThunks/user'

/** Make `conversation` the active chat and mirror its toggles and model choice. */
function setActiveConversation(
  state: ConversationState,
  conversation: Conversation | null
) {
  state.activeConversation = conversation
  if (conversation) {
    // Update toggle states from conversation
    state.webSearchEnabled = conversation.webSearchEnabled ?? false
    state.webFetchEnabled = conversation.webFetchEnabled ?? false
    state.codeSandboxEnabled = conversation.codeSandboxEnabled ?? false
    state.imageGenerationEnabled = conversation.imageGenerationEnabled ?? false
    state.audioTranscriptionEnabled =
      conversation.audioTranscriptionEnabled ?? false
    state.artifactsEnabled = conversation.artifactsEnabled ?? false
    state.memoryEnabled = conversation.memoryEnabled ?? false

    const desired = conversation.selectedModelRef ?? null

    // Sync picker entries based on the active mode (priority: audio >
    // image > text).
    if (conversation.audioTranscriptionEnabled) {
      syncModelsWithAudioTranscriptionState(state, true, desired)
    } else if (conversation.imageGenerationEnabled) {
      syncModelsWithImageGenerationState(state, true, desired)
    } else {
      syncModelsWithImageGenerationState(state, false, desired)
    }
    // Preserve the saved choice until the catalog arrives and validates it.
    if (!state.pickerEntries.length) state.selectedModel = desired
  }
}

function selectModel(state: ConversationState, modelId: string | null) {
  state.selectedModel = modelId
  const selectedEntry = state.pickerEntries.find(
    (entry) => entry.id === modelId
  )
  if (
    selectedEntry?.supportsEffort &&
    state.activeConversation &&
    state.activeConversation.effort == null
  ) {
    state.activeConversation.effort = selectedEntry.defaultEffort
  }
}

function selectSources(
  state: ConversationState,
  files: MyFile[],
  fileIds: number[],
  embeddingIds: number[]
) {
  state.selectedFiles = files.filter((file) => fileIds.includes(file.id))
  state.selectedEmbeddings = files.filter((file) =>
    embeddingIds.includes(file.id)
  )
}

function selectLibraries(
  state: ConversationState,
  libraries: SharedLibrary[],
  libraryIds: number[]
) {
  state.selectedLibraries = libraries.filter((library) =>
    libraryIds.includes(library.id)
  )
}

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
      setActiveConversation(state, action.payload)
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

      selectSources(state, files, selectedFileIds, selectedEmbeddingIds)
      if (selectedMediaIds) {
        state.selectedMediaFiles = files.filter((file) =>
          selectedMediaIds.includes(file.id)
        )
      }
    },
    loadSelectedLibrariesFromIds(
      state,
      action: PayloadAction<{
        libraries: SharedLibrary[]
        selectedLibraryIds: number[]
      }>
    ) {
      const { libraries, selectedLibraryIds } = action.payload
      selectLibraries(state, libraries, selectedLibraryIds)
    },
    updateSelectedModel(state, action: PayloadAction<string | null>) {
      selectModel(state, action.payload)
    },
    setEnsembleDepth(state, action: PayloadAction<EnsembleDepth>) {
      state.ensemble.depth = action.payload
      if (action.payload === 'single') return
      // Leaving single mode seeds the panel with the current model so the
      // picker never opens on an empty bench.
      if (!state.ensemble.responderIds.length && state.selectedModel) {
        state.ensemble.responderIds = [state.selectedModel]
      }
      if (!state.ensemble.chairmanId) {
        state.ensemble.chairmanId = state.selectedModel
      }
    },
    toggleEnsembleResponder(state, action: PayloadAction<string>) {
      const { responderIds, briefs } = state.ensemble
      const index = responderIds.indexOf(action.payload)
      // Angles are positional: a seat's angle leaves with the seat, and a
      // preset's spare angles wait for the next seat to be filled.
      if (index === -1) {
        responderIds.push(action.payload)
        // A bench seated without a single model selected still needs someone
        // to fuse the answers.
        state.ensemble.chairmanId ??= action.payload
      } else {
        responderIds.splice(index, 1)
        if (index < briefs.angles.length) briefs.angles.splice(index, 1)
      }
    },
    setEnsembleChairman(state, action: PayloadAction<string | null>) {
      state.ensemble.chairmanId = action.payload
    },
    setEnsembleBrief(
      state,
      action: PayloadAction<{ role: EnsembleRole; text: string | null }>
    ) {
      state.ensemble.briefs[action.payload.role] = action.payload.text
    },
    setEnsembleAngle(
      state,
      action: PayloadAction<{ seat: number; text: string }>
    ) {
      const { angles } = state.ensemble.briefs
      while (angles.length <= action.payload.seat) angles.push('')
      angles[action.payload.seat] = action.payload.text
    },
    applyEnsembleBriefs(state, action: PayloadAction<EnsembleBriefs>) {
      state.ensemble.briefs = {
        ...action.payload,
        angles: [...action.payload.angles],
      }
    },
    clearEnsemble(state) {
      state.ensemble = {
        depth: 'single',
        responderIds: [],
        chairmanId: null,
        briefs: EMPTY_BRIEFS,
      }
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
    updateSelectedLibraries(state, action: PayloadAction<SharedLibrary[]>) {
      state.selectedLibraries = action.payload
    },
    setSourcePickerOpen(state, action: PayloadAction<boolean>) {
      state.sourcePickerOpen = action.payload
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
    updateModelSettings(state, action: PayloadAction<Partial<ModelSettings>>) {
      const patch = action.payload
      if (patch.webSearchEnabled !== undefined) {
        state.webSearchEnabled = patch.webSearchEnabled
      }
      if (patch.webFetchEnabled !== undefined) {
        state.webFetchEnabled = patch.webFetchEnabled
      }
      if (patch.codeSandboxEnabled !== undefined) {
        state.codeSandboxEnabled = patch.codeSandboxEnabled
      }
      if (patch.artifactsEnabled !== undefined) {
        state.artifactsEnabled = patch.artifactsEnabled
      }
      if (state.activeConversation)
        Object.assign(state.activeConversation, patch)
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
    updateRagMode(state, action: PayloadAction<RagMode>) {
      if (state.activeConversation) {
        state.activeConversation.ragMode = action.payload
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
    /**
     * Apply all agent settings to the active conversation in a single action.
     * This consolidates multiple individual updates for better performance and cleaner code.
     */
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
      state.selectedLibraries = []
      state.memoryEnabled = false
      state.ensemble = { ...initialState.ensemble, responderIds: [] }
      state.conversationInput = ''
      state.referencedConversations = []

      // Reset feature toggles
      state.imageGenerationEnabled = false
      state.audioTranscriptionEnabled = false
      state.webSearchEnabled = false
      state.webFetchEnabled = false
      state.codeSandboxEnabled = false
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
      .addCase(userLogout.pending, (state) => {
        state.ensemble = initialState.ensemble
      })
      .addCase(userLogin.pending, (state) => {
        state.ensemble = initialState.ensemble
      })
    builder
      .addCase(getConversations.pending, (state) => {
        state.conversationListStatus = 'pending'
        state.loading = true
        state.error = null
      })
      .addCase(
        getConversations.fulfilled,
        (state, action: PayloadAction<Conversation[]>) => {
          state.conversationListStatus = 'succeeded'
          state.loading = false
          state.conversations = action.payload
        }
      )
      .addCase(getConversations.rejected, (state, action) => {
        state.conversationListStatus = 'failed'
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getAvailableModels.pending, (state) => {
        state.modelCatalogStatus = 'pending'
        state.loading = true
        state.error = null
      })
      .addCase(
        getAvailableModels.fulfilled,
        (
          state,
          action: PayloadAction<{
            models: PickerModel[]
            wallet: WalletMeta | null
          }>
        ) => {
          state.modelCatalogStatus = 'succeeded'
          state.loading = false
          // Strip image-gen / audio-transcription models from the chat
          // picker (they belong on dedicated toggles). LiteLLM entries
          // already have those flags forced to false on the BE.
          state.pickerEntries = action.payload.models.filter(
            (m) => !m.isImageGenerator && !m.isAudioTranscriber
          )
          state.activeWalletMeta = action.payload.wallet
          const seated = state.ensemble.responderIds.map((id) =>
            state.pickerEntries.some((entry) => entry.id === id)
          )
          state.ensemble.responderIds = state.ensemble.responderIds.filter(
            (_, i) => seated[i]
          )
          state.ensemble.briefs.angles = state.ensemble.briefs.angles.filter(
            (_, i) => seated[i] ?? true
          )
          // Reconcile selectedModel: if the previously selected id is no
          // longer in the wallet catalog, require a new explicit choice.
          state.selectedModel = selectAppropriateModel(
            state.selectedModel,
            state.pickerEntries
          )
          const selectedEntry = state.pickerEntries.find(
            (entry) => entry.id === state.selectedModel
          )
          if (
            selectedEntry?.supportsEffort &&
            state.activeConversation &&
            state.activeConversation.effort == null
          ) {
            state.activeConversation.effort = selectedEntry.defaultEffort
          }
        }
      )
      .addCase(getAvailableModels.rejected, (state, action) => {
        state.modelCatalogStatus = 'failed'
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
      .addCase(applyAgentToConversation.fulfilled, (state, action) => {
        const { conversation, modelRef, files, libraries } = action.payload
        const index = state.conversations.findIndex(
          (conv) => conv.conversationId === conversation.conversationId
        )
        if (index !== -1) state.conversations[index] = conversation
        if (
          state.activeConversation?.conversationId !==
          conversation.conversationId
        ) {
          return
        }
        setActiveConversation(state, conversation)
        if (modelRef) selectModel(state, modelRef)
        selectSources(
          state,
          files,
          conversation.selectedFileIds ?? [],
          conversation.selectedEmbeddingIds ?? []
        )
        selectLibraries(state, libraries, conversation.selectedLibraryIds ?? [])
      })
      .addCase(moveConversationsToProject.fulfilled, (state, action) => {
        action.payload.moved.forEach((moved) => {
          const index = state.conversations.findIndex(
            (conv) => conv.conversationId === moved.conversationId
          )
          if (index !== -1) {
            state.conversations[index] = moved
          }
          if (
            state.activeConversation?.conversationId === moved.conversationId
          ) {
            state.activeConversation = moved
          }
        })
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        const { projectId, deleteConversations } = action.payload
        if (deleteConversations) {
          state.conversations = state.conversations.filter(
            (conv) => conv.project !== projectId
          )
          if (state.activeConversation?.project === projectId) {
            state.activeConversation = null
          }
          return
        }
        state.conversations.forEach((conv) => {
          if (conv.project === projectId) conv.project = null
        })
        if (state.activeConversation?.project === projectId) {
          state.activeConversation.project = null
        }
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
      .addCase(
        getActiveModels.fulfilled,
        (state, action: PayloadAction<LLMModel[]>) => {
          state.activeModels = action.payload
        }
      )
      .addCase(getActiveModels.rejected, (_state, action) => {
        console.error('Failed to load active models:', action.payload)
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
        const pending = new Set(state.pendingActiveGenerationIds)
        state.activeConversationMessages.forEach((message) => {
          if (pending.has(String(message.id))) message.streaming = true
        })
        state.pendingActiveGenerationIds = []
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
          // Authenticated conversations are loaded through the REST messages API.
          // Socket history remains a fallback for public/auto-subscribed sessions.
          if (
            action.payload.conversationHistory &&
            state.activeConversationMessages.length === 0
          ) {
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
            const message = state.activeConversationMessages[existingIndex]
            if (
              !message.streaming &&
              message.toolLoopState !== ToolLoopState.INTERRUPTED
            ) {
              message.toolLoopState = undefined
              message.toolLoopNotice = undefined
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
      // A turn still running server-side when the user re-opens its chat:
      // persisted history only has the empty placeholder, so mark it live.
      .addMatcher(
        (action): action is { type: string; payload: { messageId: number } } =>
          action.type === 'socket/generation_active',
        (state, action) => {
          const id = String(action.payload.messageId)
          const message = state.activeConversationMessages.find(
            (msg) => String(msg.id) === id
          )
          if (message) {
            message.streaming = true
          } else if (!state.pendingActiveGenerationIds.includes(id)) {
            state.pendingActiveGenerationIds.push(id)
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
      // Tool Call Pending - the model started writing a tool call.
      // Also absorbs throttled args-progress updates for the same call.
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: ToolCallPendingEvent | ToolCallArgsProgressEvent
        } =>
          action.type === 'socket/tool_call_pending' ||
          action.type === 'socket/tool_call_args_progress',
        (state, action) => {
          const { messageId, toolCallId } = action.payload
          if (messageId == null) return
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          // Silently drop events for messages not in the store
          if (!msg) return
          if (!msg.toolCalls) {
            msg.toolCalls = []
          }
          msg.toolLoopState = ToolLoopState.ACTIVE
          msg.toolLoopNotice = undefined
          const existing = msg.toolCalls.find((tc) => tc.id === toolCallId)
          if (existing) {
            // Only update argsChars, and only while still PENDING —
            // late throttled updates must never undo EXECUTING
            if (
              existing.status === ToolCallStatus.PENDING &&
              'argsChars' in action.payload
            ) {
              existing.argsChars = action.payload.argsChars
            }
            return
          }
          // Only the full pending event carries tool identity — never
          // create an entry from an args-progress event alone
          if (action.type === 'socket/tool_call_pending') {
            const payload = action.payload as ToolCallPendingEvent
            msg.toolCalls.push({
              id: payload.toolCallId,
              toolName: payload.toolName,
              serverSlug: payload.serverSlug,
              origin: payload.origin,
              status: ToolCallStatus.PENDING,
              round: payload.round,
            })
          }
        }
      )
      // Tool Call Executing - arguments complete, tool is running
      .addMatcher(
        (action): action is { type: string; payload: ToolCallExecutingEvent } =>
          action.type === 'socket/tool_call_executing',
        (state, action) => {
          const { messageId, toolCallId } = action.payload
          if (messageId == null) return
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (!msg) return
          if (!msg.toolCalls) {
            msg.toolCalls = []
          }
          msg.toolLoopState = ToolLoopState.ACTIVE
          msg.toolLoopNotice = undefined
          // Find the matching tool call by unique id only
          // (DO NOT fallback to toolName - multiple calls of same tool would match the wrong entry)
          let toolCall = msg.toolCalls.find((tc) => tc.id === toolCallId)
          if (
            toolCall?.status === ToolCallStatus.COMPLETED ||
            toolCall?.status === ToolCallStatus.FAILED
          ) {
            return
          }
          if (!toolCall) {
            // Defensive upsert in case the pending event was missed
            toolCall = {
              id: action.payload.toolCallId,
              toolName: action.payload.toolName,
              serverSlug: action.payload.serverSlug,
              origin: action.payload.origin,
              status: ToolCallStatus.EXECUTING,
              round: action.payload.round,
            }
            msg.toolCalls.push(toolCall)
          }
          toolCall.status = ToolCallStatus.EXECUTING
          toolCall.arguments = action.payload.arguments
        }
      )
      // Tool Call Result - tool finished (completed or failed)
      .addMatcher(
        (action): action is { type: string; payload: ToolCallResultEvent } =>
          action.type === 'socket/tool_call_result',
        (state, action) => {
          const { messageId, toolCallId, status, origin, error } =
            action.payload
          if (messageId == null) return
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (!msg) return
          if (!msg.toolCalls) {
            msg.toolCalls = []
          }
          // Find the matching tool call by unique id only
          // (DO NOT fallback to toolName - multiple calls of same tool would match the wrong entry)
          let toolCall = msg.toolCalls.find((tc) => tc.id === toolCallId)
          if (!toolCall) {
            // Defensive upsert in case pending/executing events were missed
            toolCall = {
              id: action.payload.toolCallId,
              toolName: action.payload.toolName,
              serverSlug: action.payload.serverSlug,
              origin: action.payload.origin,
              status,
              round: action.payload.round,
            }
            msg.toolCalls.push(toolCall)
          }
          toolCall.status =
            status === ToolCallStatus.COMPLETED
              ? ToolCallStatus.COMPLETED
              : ToolCallStatus.FAILED
          // Exactly one result field is set, keyed by origin
          switch (origin) {
            case ToolCallOrigin.DARE:
              toolCall.dareResult = action.payload.dareResult
              // If the DARE result indicates failure, also surface its error
              if (
                action.payload.dareResult &&
                action.payload.dareResult.success === false &&
                action.payload.dareResult.error
              ) {
                toolCall.error = action.payload.dareResult.error
                toolCall.status = ToolCallStatus.FAILED
              }
              break
            case ToolCallOrigin.MCP:
              toolCall.mcpResult = action.payload.mcpResult
              break
            case ToolCallOrigin.PROVIDER:
              toolCall.providerResult = action.payload.providerResult
              break
          }
          if (error) {
            toolCall.error = error
          }
        }
      )
      // Context Trace - how the turn's prompt was assembled (once, pre-round-1)
      .addMatcher(
        (action): action is { type: string; payload: ContextTraceEvent } =>
          action.type === 'socket/context_trace',
        (state, action) => {
          const { messageId } = action.payload
          if (messageId == null) return
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          // Silently drop events for messages not in the store — the trace
          // is also persisted on the message, so a refresh recovers it.
          if (!msg) return
          msg.contextTrace = action.payload.trace
        }
      )
      // Deliberation - the multi-model panel/council behind the turn (snapshots)
      .addMatcher(
        (action): action is { type: string; payload: DeliberationEvent } =>
          action.type === 'socket/deliberation',
        (state, action) => {
          const { messageId } = action.payload
          if (messageId == null) return
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          if (!msg) return
          msg.deliberation = action.payload.deliberation
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: MemoryWriteData & { messageId: string | number }
        } => action.type === 'socket/memory_written',
        (state, action) => {
          const { messageId, ...write } = action.payload
          const msg = state.activeConversationMessages.find(
            (m) => m.id.toString() === messageId.toString()
          )
          // The writer runs long after the reply, so the conversation may
          // already be closed. Dropping is safe — this is stored on the
          // message too, and reopening the thread brings it back.
          if (!msg) return
          msg.memoryWriteData = write
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: ToolRoundsCappedEvent } =>
          action.type === 'socket/tool_rounds_capped',
        (state, action) => {
          const { messageId } = action.payload
          if (messageId == null) return
          const message = state.activeConversationMessages.find(
            (item) => item.id.toString() === messageId.toString()
          )
          if (!message) return
          message.toolLoopState = ToolLoopState.CAPPED
          message.toolLoopNotice =
            'The research limit was reached. DARE is preparing the best available answer.'
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: { artifactId: number; messageId?: number }
        } => action.type === 'socket/artifact_created',
        (state, action) => {
          const { artifactId, messageId } = action.payload
          if (messageId == null) return
          const message = state.activeConversationMessages.find(
            (item) => item.id.toString() === messageId.toString()
          )
          if (!message) return
          const ids = message.artifactIds?.length
            ? message.artifactIds
            : message.artifactId != null
              ? [message.artifactId]
              : []
          message.artifactIds = Array.from(new Set([...ids, artifactId]))
          message.artifactId ??= artifactId
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: { error?: string; message?: string }
        } =>
          action.type === 'socket/error' || action.type === 'websocket/error',
        (state, action) => {
          const notice =
            action.payload?.message ||
            action.payload?.error ||
            'The connection was interrupted before the tool could finish.'

          state.activeConversationMessages.forEach((message) => {
            const activeCalls = message.toolCalls?.filter(
              (toolCall) =>
                toolCall.status === ToolCallStatus.PENDING ||
                toolCall.status === ToolCallStatus.EXECUTING
            )
            if (!message.streaming && !activeCalls?.length) return

            message.streaming = false
            message.toolLoopState = ToolLoopState.INTERRUPTED
            message.toolLoopNotice = notice
            activeCalls?.forEach((toolCall) => {
              toolCall.status = ToolCallStatus.FAILED
              toolCall.error = notice
            })
          })
        }
      )
  },
})

export const {
  setEnsembleDepth,
  toggleEnsembleResponder,
  setEnsembleChairman,
  setEnsembleBrief,
  setEnsembleAngle,
  applyEnsembleBriefs,
  clearEnsemble,
  updateSearchQuery,
  updateActiveConversation,
  updateSelectedModel,
  updateSelectedFiles,
  updateSelectedEmbeddings,
  updateSelectedMediaFiles,
  updateSelectedTags,
  updateSelectedFolders,
  updateSelectedLibraries,
  setSourcePickerOpen,
  updateMemoryEnabled,
  updateImageGenerationEnabled,
  updateAudioTranscriptionEnabled,
  updateImageGenerationSettings,
  updateAudioTranscriptionSettings,
  setIsTranscribingAudio,
  updateModelSettings,
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
  updateRagMode,
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
  loadSelectedLibrariesFromIds,
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
  setActiveTab,
} = conversationSlice.actions
export default conversationSlice.reducer
