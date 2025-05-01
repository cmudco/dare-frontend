import { createAsyncThunk } from '@reduxjs/toolkit'
import { Conversation, Message, MessageReaction } from '../types/conversation'
import {
  getModelsAPI,
  createConversationAPI,
  getConversationsAPI,
  deleteConversationAPI,
  updateConversationAPI,
  updateMessageAPI,
} from '../../api/conversation'
import { AppDispatch } from '../store'
import { sendWebSocketMessage } from './websocket'
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

export const sendMessage = createAsyncThunk(
  'conversation/sendMessage',
  async (message: Partial<Message> & { filePath?: string }, thunkAPI) => {
    const dispatch = thunkAPI.dispatch as AppDispatch
    try {
      dispatch(sendWebSocketMessage(message))
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
