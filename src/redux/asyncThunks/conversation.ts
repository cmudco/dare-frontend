import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  Conversation,
  ConversationSortOrder,
  Message,
  MessageReaction,
} from '../types/conversation'
import {
  getModelsAPI,
  getAllModelsAPI,
  createConversationAPI,
  getConversationsAPI,
  deleteConversationAPI,
  updateConversationAPI,
  updateMessageAPI,
  updateConversationSortOrderAPI,
  deleteMultipleConversationsAPI,
  cloneConversationAPI,
  deleteMessageAPI,
  getSharedConversationsAPI,
  publishConversationAPI,
  forkConversationAPI,
  getConversationMessagesAPI,
} from '../../api/conversation'
import { AppDispatch, RootState } from '../store'
import { sendWebSocketMessage } from './websocket'
import { sendSocketMessage } from './socketMessages'
import { config } from '@/config/environment'
import { LLMModel } from '../types/conversation'

export const getAvailableModels = createAsyncThunk<
  LLMModel[],
  void,
  { rejectValue: string }
>('conversation/getAvailableModels', async (_, thunkAPI) => {
  try {
    const response = await getModelsAPI()
    return response.results || []
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

export const createConversation = createAsyncThunk<
  Conversation,
  void,
  { rejectValue: string }
>('conversation/createConversation', async (_, thunkAPI) => {
  try {
    const newConversation = await createConversationAPI()
    return newConversation
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const deleteConversation = createAsyncThunk(
  'conversation/deleteConversation',
  async (conversationId: string, thunkAPI) => {
    try {
      await deleteConversationAPI(conversationId)
      return conversationId
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

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
  },
  { rejectValue: string }
>(
  'conversation/updateConversationSelectedIds',
  async (
    { conversationId, selectedEmbeddingIds, selectedFileIds, selectedMediaIds },
    thunkAPI
  ) => {
    try {
      const updatedConversation = await updateConversationAPI(conversationId, {
        selectedEmbeddingIds,
        selectedFileIds,
        selectedMediaIds,
      })
      return updatedConversation
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const sendMessage = createAsyncThunk<
  void,
  Partial<Message> & { filePath?: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'conversation/sendMessage',
  async (message, { dispatch, rejectWithValue }) => {
    try {
      if (config.features.enableSocketIO) {
        dispatch(sendSocketMessage(message))
      } else {
        dispatch(sendWebSocketMessage(message))
      }
    } catch (error) {
      return rejectWithValue((error as Error).message)
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
  { rejectValue: string }
>(
  'conversation/deleteMultipleConversations',
  async (conversationIds, thunkAPI) => {
    try {
      await deleteMultipleConversationsAPI(conversationIds)
      return conversationIds
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const cloneConversation = createAsyncThunk(
  'conversation/cloneConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await cloneConversationAPI(conversationId)
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
      const rawMessages = await getConversationMessagesAPI(conversationId)
      // DRF's CamelCaseJSONRenderer auto-camelizes the REST response,
      // so most fields already match the frontend Message interface.
      // We only need to remap the few fields where the WebSocket path
      // (fetch_chat_history_from_db) uses different names:
      //   - createdAt → date
      //   - llm (PK) → llmId
      //   - isSender (not in serializer, derived from senderType)
      //   - mcpToolCalls → toolCalls
      interface RawSerializerMessage extends Omit<
        Message,
        'date' | 'llmId' | 'isSender' | 'toolCalls' | 'senderType'
      > {
        createdAt?: string
        date?: string
        llm?: number | null
        llmId?: number | null
        senderType?: number
        isSender?: boolean
        mcpToolCalls?: Message['toolCalls']
        toolCalls?: Message['toolCalls']
      }
      return (rawMessages as RawSerializerMessage[]).map((msg) => ({
        ...msg,
        date: msg.createdAt ?? msg.date ?? '',
        llmId: msg.llm ?? msg.llmId,
        isSender: msg.isSender ?? msg.senderType === 1,
        toolCalls: msg.mcpToolCalls ?? msg.toolCalls ?? [],
      })) as Message[]
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
