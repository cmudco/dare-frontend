import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  Conversation,
  ConversationSummary,
  CreateConversationRequest,
  ConversationSortOrder,
  Message,
  MessageReaction,
} from '../types/conversation'
import {
  getModelsAPI,
  getAllModelsAPI,
  createConversationAPI,
  getConversationsAPI,
  getConversationAPI,
  deleteConversationAPI,
  updateConversationAPI,
  applyAgentAPI,
  updateMessageAPI,
  updateConversationSortOrderAPI,
  deleteMultipleConversationsAPI,
  cloneConversationAPI,
  deleteMessageAPI,
  getConversationSummariesAPI,
  getSharedConversationsAPI,
  toggleFavoriteConversationAPI,
  publishConversationAPI,
  forkConversationAPI,
  getConversationMessagesAPI,
} from '../../api/conversation'
import { AppDispatch, RootState } from '../store'
import { selectLibraries } from '../librarySlice'
import { Agent } from '../types/agent'
import { MyFile } from '../types/files'
import { SharedLibrary } from '../types/library'
import { sendSocketMessage } from './socketMessages'
import { fetchProjects } from './project'
import { LLMModel, PickerModel, WalletMeta } from '../types/conversation'
import { ProjectSourceMode } from '@/utils/constants/project'

interface PickerModelsPayload {
  models: PickerModel[]
  wallet: WalletMeta | null
}

// Fetch the chat model picker — wallet-scoped, returns the flat models list
// (every entry has an opaque string `id`) plus the wallet capability block.
export const getAvailableModels = createAsyncThunk<
  PickerModelsPayload,
  void,
  { rejectValue: string }
>('conversation/getAvailableModels', async (_, thunkAPI) => {
  try {
    const response = await getModelsAPI('active')
    return {
      models: response.models ?? [],
      wallet: response.wallet ?? null,
    }
  } catch (error) {
    console.error('Error fetching models:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const getAllModels = createAsyncThunk<
  LLMModel[],
  void,
  { rejectValue: string }
>('conversation/getAllModels', async (_, thunkAPI) => {
  try {
    const response = await getAllModelsAPI()
    return response || []
  } catch (error) {
    console.error('Error fetching all models:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const getActiveModels = createAsyncThunk<
  LLMModel[],
  void,
  { rejectValue: string }
>('conversation/getActiveModels', async (_, thunkAPI) => {
  try {
    const response = await getModelsAPI()
    return response.results || []
  } catch (error) {
    console.error('Error fetching active models:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const getConversations = createAsyncThunk(
  'conversation/getConversations',
  async (_, thunkAPI) => {
    try {
      const conversations = await getConversationsAPI()
      return conversations.results
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const fetchConversationById = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>('conversation/fetchConversationById', async (conversationId, thunkAPI) => {
  try {
    return await getConversationAPI(conversationId)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const createConversation = createAsyncThunk<
  Conversation,
  CreateConversationRequest | void,
  { rejectValue: string }
>('conversation/createConversation', async (request, thunkAPI) => {
  try {
    const newConversation = await createConversationAPI(request ?? {})
    if (newConversation.project !== null) {
      thunkAPI.dispatch(fetchProjects())
    }
    return newConversation
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

const anyInProject = (state: RootState, conversationIds: string[]) =>
  state.conversation.conversations.some(
    (conversation) =>
      conversation.project !== null &&
      conversationIds.includes(conversation.conversationId)
  )

export const deleteConversation = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('conversation/deleteConversation', async (conversationId, thunkAPI) => {
  try {
    const inProject = anyInProject(thunkAPI.getState(), [conversationId])
    await deleteConversationAPI(conversationId)
    if (inProject) {
      thunkAPI.dispatch(fetchProjects())
    }
    return conversationId
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const updateConversation = createAsyncThunk<
  Conversation,
  { conversationId: string; updates: Partial<Conversation> },
  { rejectValue: string }
>(
  'conversation/updateConversation',
  async ({ conversationId, updates }, thunkAPI) => {
    try {
      const updatedConversation = await updateConversationAPI(
        conversationId,
        updates
      )
      return updatedConversation
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export interface AppliedAgent {
  conversation: Conversation
  /** The agent's model, which wins over the model that last answered in the chat. */
  modelRef: string | null
  /** Catalogs the chat's selected sources are resolved against. */
  files: MyFile[]
  libraries: SharedLibrary[]
}

export const applyAgentToConversation = createAsyncThunk<
  AppliedAgent,
  { conversationId: string; agent: Agent | null },
  { state: RootState; rejectValue: string }
>(
  'conversation/applyAgent',
  async ({ conversationId, agent }, { getState, rejectWithValue }) => {
    try {
      const conversation = await applyAgentAPI(
        conversationId,
        agent?.id ?? null
      )
      const state = getState()
      return {
        conversation,
        modelRef: agent?.modelRef ?? null,
        files: state.files.files,
        libraries: selectLibraries(state),
      }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateMessageThunk = createAsyncThunk<
  Message,
  { messageId: string; reaction: MessageReaction },
  { rejectValue: string }
>('conversation/updateMessage', async ({ messageId, reaction }, thunkAPI) => {
  try {
    const updatedMessage = await updateMessageAPI(messageId, reaction)
    return updatedMessage
  } catch (error) {
    console.error('Error updating message:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const updateConversationSelectedIds = createAsyncThunk<
  Conversation,
  {
    conversationId: string
    selectedEmbeddingIds: number[]
    selectedFileIds: number[]
    selectedMediaIds: number[]
    selectedLibraryIds: number[]
  },
  { rejectValue: string }
>(
  'conversation/updateConversationSelectedIds',
  async (
    {
      conversationId,
      selectedEmbeddingIds,
      selectedFileIds,
      selectedMediaIds,
      selectedLibraryIds,
    },
    thunkAPI
  ) => {
    try {
      const updatedConversation = await updateConversationAPI(conversationId, {
        selectedEmbeddingIds,
        selectedFileIds,
        selectedMediaIds,
        selectedLibraryIds,
      })
      return updatedConversation
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export interface SwitchChatSourceModeRequest {
  /** The chat's project files; other selections are left alone. */
  fileIds: number[]
  mode: ProjectSourceMode
}

/** Move a project chat's files between search and full-file reading. */
export const switchChatSourceMode = createAsyncThunk<
  Conversation,
  SwitchChatSourceModeRequest,
  { state: RootState; rejectValue: string }
>('conversation/switchChatSourceMode', async (_request, thunkAPI) => {
  // The pending reducer has already moved the files; persist the result.
  const { conversation } = thunkAPI.getState()
  const active = conversation.activeConversation
  if (!active) return thunkAPI.rejectWithValue('No active chat.')
  try {
    return await updateConversationAPI(active.conversationId, {
      selectedFileIds: conversation.selectedFiles.map((file) => file.id),
      selectedEmbeddingIds: conversation.selectedEmbeddings.map(
        (file) => file.id
      ),
    })
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const sendMessage = createAsyncThunk<
  void,
  Partial<Message> & { filePath?: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'conversation/sendMessage',
  async (message, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(sendSocketMessage(message)).unwrap()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : String(error)
      )
    }
  }
)

export const updateConversationSortOrder = createAsyncThunk<
  void,
  ConversationSortOrder[],
  { rejectValue: string }
>('conversation/updateConversationSortOrder', async (updates, thunkAPI) => {
  try {
    await updateConversationSortOrderAPI(updates)
  } catch (error) {
    console.error('Error updating conversation sort order:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const deleteMultipleConversations = createAsyncThunk<
  string[],
  string[],
  { state: RootState; rejectValue: string }
>(
  'conversation/deleteMultipleConversations',
  async (conversationIds, thunkAPI) => {
    try {
      const inProject = anyInProject(thunkAPI.getState(), conversationIds)
      await deleteMultipleConversationsAPI(conversationIds)
      if (inProject) {
        thunkAPI.dispatch(fetchProjects())
      }
      return conversationIds
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const cloneConversation = createAsyncThunk(
  'conversation/cloneConversation',
  async (conversationId: string, { dispatch, rejectWithValue }) => {
    try {
      const clone = await cloneConversationAPI(conversationId)
      if (clone.project !== null) {
        dispatch(fetchProjects())
      }
      return clone
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateConversationFeedbackTracking = createAsyncThunk<
  Conversation,
  {
    conversationId: string
    feedbackAutoPromptCount?: number
    feedbackLastPromptMessageCount?: number
    feedbackLastPromptTimestamp?: string
  },
  { rejectValue: string }
>('conversation/updateFeedbackTracking', async (updates, thunkAPI) => {
  try {
    const updatedConversation = await updateConversationAPI(
      updates.conversationId,
      {
        feedbackAutoPromptCount: updates.feedbackAutoPromptCount,
        feedbackLastPromptMessageCount: updates.feedbackLastPromptMessageCount,
        feedbackLastPromptTimestamp: updates.feedbackLastPromptTimestamp,
      }
    )
    return updatedConversation
  } catch (error) {
    console.error('Error updating conversation feedback tracking:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const deleteMessage = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('conversation/deleteMessage', async (messageId, thunkAPI) => {
  try {
    await deleteMessageAPI(messageId)
    return messageId
  } catch (error) {
    console.error('Error deleting message:', error)
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const fetchSharedConversations = createAsyncThunk<
  Conversation[],
  void,
  { rejectValue: string }
>('conversation/fetchSharedConversations', async (_, thunkAPI) => {
  try {
    const response = await getSharedConversationsAPI()
    return response.results
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const fetchConversationSummaries = createAsyncThunk<
  ConversationSummary[],
  void,
  { rejectValue: string }
>('conversation/fetchConversationSummaries', async (_, thunkAPI) => {
  try {
    const response = await getConversationSummariesAPI()
    return response.results
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const toggleFavoriteConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>(
  'conversation/toggleFavoriteConversation',
  async (conversationId, thunkAPI) => {
    try {
      return await toggleFavoriteConversationAPI(conversationId)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const publishConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>('conversation/publishConversation', async (conversationId, thunkAPI) => {
  try {
    return await publishConversationAPI(conversationId)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const forkConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>('conversation/forkConversation', async (conversationId, thunkAPI) => {
  try {
    return await forkConversationAPI(conversationId)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const fetchConversationMessages = createAsyncThunk<
  Message[],
  string,
  { rejectValue: string }
>(
  'conversation/fetchConversationMessages',
  async (conversationId, thunkAPI) => {
    try {
      // BE MessageSerializer now returns date, llmId, isSender, toolCalls
      // alongside original fields — no client-side remapping needed.
      return await getConversationMessagesAPI(conversationId)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
