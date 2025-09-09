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
import { setConnectionStatus, setCreditError } from '../websocketSlice'
import { WEBSOCKET_URL } from '../../api/config'
import { getWallet } from './billing'

let socket: WebSocket | null = null
let manualClose = false
let heartbeatInterval: number | null = null
let pongTimeout: number | null = null
let lastConnectArgs: { conversationId: string; jwtKey: string } | null = null
let onlineListenerAttached = false

const HEARTBEAT_INTERVAL_MS = 25000 // 25s
const PONG_TIMEOUT_MS = 10000 // 10s

function clearHeartbeat() {
  if (heartbeatInterval !== null) {
    window.clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
  if (pongTimeout !== null) {
    window.clearTimeout(pongTimeout)
    pongTimeout = null
  }
}

function startHeartbeat() {
  clearHeartbeat()
  heartbeatInterval = window.setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    try {
      const payload = { type: 'ping', ts: Date.now() }
      socket.send(JSON.stringify(payload))
      // Require a pong within timeout; if not, force-close to trigger reconnect
      if (pongTimeout !== null) window.clearTimeout(pongTimeout)
      pongTimeout = window.setTimeout(() => {
        try {
          socket?.close(4002, 'Heartbeat timeout')
        } catch (e) {
          console.warn('Failed to close WebSocket after heartbeat timeout', e)
        }
      }, PONG_TIMEOUT_MS)
    } catch (e) {
      console.warn('Heartbeat send failed:', e)
    }
  }, HEARTBEAT_INTERVAL_MS)
}

export const connectWebSocket = createAsyncThunk<
  void,
  { conversationId: string; jwtKey: string },
  { dispatch: AppDispatch; state: RootState }
>('websocket/connect', async ({ conversationId, jwtKey }, { dispatch }) => {
  return new Promise<void>((resolve, reject) => {
    manualClose = false
    lastConnectArgs = { conversationId, jwtKey }
    dispatch(clearConversation())
    const socketUrl = `${WEBSOCKET_URL}/conversations/${conversationId}/?jwt_key=${encodeURIComponent(
      jwtKey
    )}`

    socket = new WebSocket(socketUrl)

    socket.onopen = () => {
      dispatch(setConnectionStatus(true))
      startHeartbeat()
      resolve()
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // Heartbeat response
      if (data?.type === 'pong') {
        if (pongTimeout !== null) {
          window.clearTimeout(pongTimeout)
          pongTimeout = null
        }
        return
      }

      if (
        data.error === 'insufficient_credits' ||
        data.error === 'insufficient_balance'
      ) {
        dispatch(
          setCreditError({
            type: data.error,
            message: data.message,
            currentBalance: data.current_balance,
            requiredAmount: data.required_amount,
          })
        )
        return
      }

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
            dispatch(getWallet())
          } else {
            dispatch(addMessage(data as Message))
            dispatch(getWallet())
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
      // Allow onclose to schedule reconnect; reject only if we never opened
      if (socket?.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket error'))
      }
    }

    if (!onlineListenerAttached) {
      window.addEventListener('online', () => {
        if (manualClose) return
        if (socket && socket.readyState === WebSocket.OPEN) return
        const args = lastConnectArgs
        if (args) {
          dispatch(connectWebSocket(args))
        }
      })
      onlineListenerAttached = true
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
  const embeddingIds = state.conversation.selectedEmbeddings.map(
    (file) => file.id
  )
  const tagIds = state.conversation.selectedTags.map((tag) => tag.id)
  const folderIds = state.conversation.selectedFolders.map(
    (folder) => folder.id
  )
  const referencedConversationIds =
    state.conversation.referencedConversations.map(
      (conversation) => conversation.conversationId
    )
  const prompt = state.conversation.activeConversation?.prompt
  const temperature = state.conversation.activeConversation?.temperature
  const maxTokens = state.conversation.activeConversation?.maxTokens
  const maxContextSnippets =
    state.conversation.activeConversation?.maxContextSnippets
  const documentSimilarityThreshold =
    state.conversation.activeConversation?.documentSimilarityThreshold
  const historyLimit = state.conversation.activeConversation?.historyLimit
  const referencedConversationHistoryLimit =
    state.conversation.referencedConversationHistoryLimit

  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = {
      message: message.message,
      sender_type: 1,
      file_ids: fileIds,
      embedding_ids: embeddingIds,
      tag_ids: tagIds,
      folder_ids: folderIds,
      referenced_conversation_ids: referencedConversationIds,
      referenced_conversation_history_limit: referencedConversationHistoryLimit,
      llm_id: state.conversation.selectedModel,
      prompt_id: prompt?.id,
      temperature: temperature,
      max_tokens: maxTokens,
      max_context_snippets: maxContextSnippets,
      document_similarity_threshold: documentSimilarityThreshold,
      history_limit: historyLimit,
    }

    socket.send(JSON.stringify(payload))
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
  async ({ messageId }, { rejectWithValue, getState, dispatch }) => {
    const state = getState()
    const fileIds = state.conversation.selectedFiles.map((file) => file.id)
    const embeddingIds = state.conversation.selectedEmbeddings.map(
      (file) => file.id
    )
    const tagIds = state.conversation.selectedTags.map((tag) => tag.id)
    const folderIds = state.conversation.selectedFolders.map(
      (folder) => folder.id
    )
    const referencedConversationIds =
      state.conversation.referencedConversations.map(
        (conversation) => conversation.conversationId
      )
    const referencedConversationHistoryLimit =
      state.conversation.referencedConversationHistoryLimit
    const prompt = state.conversation.activeConversation?.prompt
    const temperature = state.conversation.activeConversation?.temperature
    const maxTokens = state.conversation.activeConversation?.maxTokens
    const maxContextSnippets =
      state.conversation.activeConversation?.maxContextSnippets
    const documentSimilarityThreshold =
      state.conversation.activeConversation?.documentSimilarityThreshold
    const historyLimit = state.conversation.activeConversation?.historyLimit

    dispatch(
      updateMessage({
        id: messageId,
        streaming: true,
        message: '',
      })
    )
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'regenerate_response',
          message_id: messageId,
          llm_id: state.conversation.selectedModel,
          file_ids: fileIds,
          embedding_ids: embeddingIds,
          tag_ids: tagIds,
          folder_ids: folderIds,
          referenced_conversation_ids: referencedConversationIds,
          referenced_conversation_history_limit:
            referencedConversationHistoryLimit,
          prompt_id: prompt?.id,
          temperature: temperature,
          max_tokens: maxTokens,
          max_context_snippets: maxContextSnippets,
          document_similarity_threshold: documentSimilarityThreshold,
          history_limit: historyLimit,
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
      manualClose = true
      clearHeartbeat()
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
