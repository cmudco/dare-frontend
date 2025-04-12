import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/conversation'
import {
  getConversations,
  getAvailableModels,
  createConversation,
  deleteConversation,
} from './aynscThunks/conversation'
import { Message, Conversation, LLMModel } from './types/conversation'
import { MyFile } from './types/files'
import { Tag } from './types/tags'
import {
  getFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
} from '../utils/localStorage'
import { MODEL_CONFIG } from '@/config/modelConfig'

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    updateConversation(state, action: PayloadAction<Conversation | null>) {
      state.activeConversation = action.payload

      if (action.payload?.conversationId) {
        state.temperature = getFromLocalStorage(
          STORAGE_KEYS.TEMPERATURE,
          MODEL_CONFIG.temperature,
          action.payload.conversationId
        )
        state.maxTokens = getFromLocalStorage(
          STORAGE_KEYS.MAX_TOKENS,
          MODEL_CONFIG.maxTokens,
          action.payload.conversationId
        )
        state.maxContextSnippets = getFromLocalStorage(
          STORAGE_KEYS.MAX_CONTEXT_SNIPPETS,
          MODEL_CONFIG.maxContextSnippets,
          action.payload.conversationId
        )
        state.documentSimilarityThreshold = getFromLocalStorage(
          STORAGE_KEYS.DOCUMENT_SIMILARITY_THRESHOLD,
          MODEL_CONFIG.documentSimilarityThreshold,
          action.payload.conversationId
        )
      }
    },
    updateSelectedModel(state, action: PayloadAction<number>) {
      state.selectedModel = action.payload
    },
    updateSelectedFiles(state, action: PayloadAction<MyFile[]>) {
      state.selectedFiles = action.payload
    },
    updateSelectedTags(state, action: PayloadAction<Tag[]>) {
      state.selectedTags = action.payload
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
      state.temperature = action.payload
      saveToLocalStorage(STORAGE_KEYS.TEMPERATURE, action.payload)
      if (state.activeConversation?.conversationId) {
        saveToLocalStorage(
          STORAGE_KEYS.TEMPERATURE,
          action.payload,
          state.activeConversation.conversationId
        )
      }
    },
    updateMaxTokens(state, action: PayloadAction<number>) {
      state.maxTokens = action.payload
      saveToLocalStorage(STORAGE_KEYS.MAX_TOKENS, action.payload)
      if (state.activeConversation?.conversationId) {
        saveToLocalStorage(
          STORAGE_KEYS.MAX_TOKENS,
          action.payload,
          state.activeConversation.conversationId
        )
      }
    },
    updateMaxContextSnippets(state, action: PayloadAction<number>) {
      state.maxContextSnippets = action.payload
      saveToLocalStorage(STORAGE_KEYS.MAX_CONTEXT_SNIPPETS, action.payload)
      if (state.activeConversation?.conversationId) {
        saveToLocalStorage(
          STORAGE_KEYS.MAX_CONTEXT_SNIPPETS,
          action.payload,
          state.activeConversation.conversationId
        )
      }
    },
    updateDocumentSimilarityThreshold(state, action: PayloadAction<number>) {
      state.documentSimilarityThreshold = action.payload
      saveToLocalStorage(
        STORAGE_KEYS.DOCUMENT_SIMILARITY_THRESHOLD,
        action.payload
      )
      if (state.activeConversation?.conversationId) {
        saveToLocalStorage(
          STORAGE_KEYS.DOCUMENT_SIMILARITY_THRESHOLD,
          action.payload,
          state.activeConversation.conversationId
        )
      }
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
        (msg) => msg?.id === action.payload.id
      )
      if (index !== -1) {
        state.activeConversationMessages[index] = {
          ...state.activeConversationMessages[index],
          ...action.payload,
          message: `${state.activeConversationMessages[index].message}${action.payload.message}`,
        }
      }
    },
    setAvailableModels(state, action: PayloadAction<LLMModel[]>) {
      state.availableModels = action.payload
    },
    updateConversationTitle(state, action: PayloadAction<string>) {
      if (!state.activeConversation) {
        return
      }
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
    setPrompt(state, action) {
      state.prompt = action.payload
    },
    resetConversation(state) {
      state.activeConversation = null
      state.activeConversationMessages = []
      state.selectedFiles = []
      state.temperature = MODEL_CONFIG.temperature
      state.maxTokens = MODEL_CONFIG.maxTokens
      state.maxContextSnippets = MODEL_CONFIG.maxContextSnippets
      state.documentSimilarityThreshold =
        MODEL_CONFIG.documentSimilarityThreshold
      state.conversationInput = ''
      state.prompt = null
      state.selectedModel = state.availableModels[0]?.id
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
          state.availableModels = action.payload
          state.selectedModel = action.payload[0]?.id
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
        state.temperature = MODEL_CONFIG.temperature
        state.maxTokens = MODEL_CONFIG.maxTokens
        state.maxContextSnippets = MODEL_CONFIG.maxContextSnippets
        state.documentSimilarityThreshold =
          MODEL_CONFIG.documentSimilarityThreshold
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false
        state.conversations.unshift(action.payload)
        state.temperature = MODEL_CONFIG.temperature
        state.maxTokens = MODEL_CONFIG.maxTokens
        state.maxContextSnippets = MODEL_CONFIG.maxContextSnippets
        state.documentSimilarityThreshold =
          MODEL_CONFIG.documentSimilarityThreshold
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
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  updateSearchQuery,
  updateConversation,
  updateSelectedModel,
  updateSelectedFiles,
  updateSelectedTags,
  updateTemperature,
  updateMaxTokens,
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
  toggleDropdown,
  setHoveredModel,
  updateConversationInput,
  addMessage,
  clearConversation,
  updateMessage,
  setAvailableModels,
  updateConversationTitle,
  updateConversationHistory,
  setPrompt,
  resetConversation,
} = conversationSlice.actions
export default conversationSlice.reducer
