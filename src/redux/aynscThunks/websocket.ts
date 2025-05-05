import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  clearConversation,
  updateMessage,
  addMessage,
  updateConversationTitle,
  updateConversationHistory,
} from '../conversationSlice'
import { Message } from '../types/conversation'
import { AppDispatch, RootState } from '../store'
import { setConnectionStatus } from '../websocketSlice'
import { WEBSOCKET_URL } from '../../api/config'

let socket: WebSocket | null = null

export const connectWebSocket = createAsyncThunk<
  void,
  { conversationId: string; jwtKey: string },
  { dispatch: AppDispatch; state: RootState }
>('websocket/connect', async ({ conversationId, jwtKey }, { dispatch }) => {
  return new Promise<void>((resolve, reject) => {
    dispatch(clearConversation())

    const socketUrl = `${WEBSOCKET_URL}/conversations/${conversationId}/?jwt_key=${encodeURIComponent(
      jwtKey
    )}`

    socket = new WebSocket(socketUrl)

    socket.onopen = () => {
      dispatch(setConnectionStatus(true))
      resolve()
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'conversation_history':
          if (data.conversationHistory)
            dispatch(updateConversationHistory(data.conversationHistory))
          break
        case 'message':
          if (data.regenerate) {
            dispatch(
              updateMessage({
                ...(data as Partial<Message>),
                message: data.message || '',
                streaming: false,
              })
            )
          } else {
            dispatch(addMessage(data as Message))
          }
          break
        case 'ai_stream':
          dispatch(
            updateMessage({
              ...(data as Partial<Message>),
              message: (data as Partial<Message>).message || '',
            })
          )
          break
        case 'conversation_title':
          dispatch(updateConversationTitle(data.title))
          break
        case 'edit_message':
        case 'regenerate_response':
          dispatch(updateMessage(data as Partial<Message>))
          break
        default:
          console.warn('Unknown WebSocket message type:', data.type)
      }
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      dispatch(setConnectionStatus(false))
      reject(new Error('WebSocket error'))
    }
  })
})

export const sendWebSocketMessage = createAsyncThunk<
  void,
  Partial<Message>,
  { dispatch: AppDispatch; state: RootState }
>('websocket/sendMessage', async (message, { rejectWithValue, getState }) => {
  const state = getState()
  const fileIds = state.conversation.selectedFiles.map((file) => file.id)
  const tagIds = state.conversation.selectedTags.map((tag) => tag.id)
  const prompt = state.conversation.activeConversation?.prompt
  const temperature = state.conversation.activeConversation?.temperature
  const maxTokens = state.conversation.activeConversation?.maxTokens
  const maxContextSnippets =
    state.conversation.activeConversation?.maxContextSnippets
  const documentSimilarityThreshold =
    state.conversation.activeConversation?.documentSimilarityThreshold

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        message: message.message,
        sender_type: 1,
        file_ids: fileIds,
        tag_ids: tagIds,
        llm_id: state.conversation.selectedModel,
        prompt_id: prompt?.id,
        temperature: temperature,
        max_tokens: maxTokens,
        max_context_snippets: maxContextSnippets,
        document_similarity_threshold: documentSimilarityThreshold,
      })
    )
  } else {
    return rejectWithValue('WebSocket is not connected')
  }
})

export const editMessage = createAsyncThunk<
  void,
  { messageId: string; newContent: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'websocket/editMessage',
  async ({ messageId, newContent }, { rejectWithValue }) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'edit_message',
          message_id: messageId,
          message: newContent,
        })
      )
    } else {
      return rejectWithValue('WebSocket is not connected')
    }
  }
)

export const regenerateResponse = createAsyncThunk<
  void,
  { messageId: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'websocket/regenerateResponse',
  async ({ messageId }, { rejectWithValue, getState }) => {
    const state = getState()
    const fileIds = state.conversation.selectedFiles.map((file) => file.id)
    const tagIds = state.conversation.selectedTags.map((tag) => tag.id)
    const prompt = state.conversation.activeConversation?.prompt
    const temperature = state.conversation.activeConversation?.temperature
    const maxTokens = state.conversation.activeConversation?.maxTokens
    const maxContextSnippets =
      state.conversation.activeConversation?.maxContextSnippets
    const documentSimilarityThreshold =
      state.conversation.activeConversation?.documentSimilarityThreshold

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'regenerate_response',
          message_id: messageId,
          llm_id: state.conversation.selectedModel,
          file_ids: fileIds,
          tag_ids: tagIds,
          prompt_id: prompt?.id,
          temperature: temperature,
          max_tokens: maxTokens,
          max_context_snippets: maxContextSnippets,
          document_similarity_threshold: documentSimilarityThreshold,
        })
      )
    } else {
      return rejectWithValue('WebSocket is not connected')
    }
  }
)

export const disconnectWebSocket = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>('websocket/disconnect', async (_, { dispatch }) => {
  return new Promise<void>((resolve) => {
    if (socket) {
      socket.onclose = () => {
        socket = null
        dispatch(setConnectionStatus(false))
        resolve()
      }
      socket.close()
    } else {
      resolve()
    }
  })
})
