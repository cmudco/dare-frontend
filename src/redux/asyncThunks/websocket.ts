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
      reject(new Error('WebSocket error'))
    }
  })
})

export const sendWebSocketMessage = createAsyncThunk<
  void,
  Partial<Message>,
  { dispatch: AppDispatch; state: RootState }
>('websocket/sendMessage', async (message, { rejectWithValue, getState }) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return rejectWithValue('WebSocket is not connected')
  }

  const state = getState()
  const { conversation } = state
  const {
    activeConversation,
    selectedFiles,
    selectedEmbeddings,
    selectedTags,
    selectedFolders,
    referencedConversations,
    referencedConversationHistoryLimit,
    selectedModel,
    attachedImages,
  } = conversation

  const payload = {
    message: message.message,
    sender_type: 1,
    file_ids: selectedFiles.map((file) => file.id),
    embedding_ids: selectedEmbeddings.map((file) => file.id),
    tag_ids: selectedTags.map((tag) => tag.id),
    folder_ids: selectedFolders.map((folder) => folder.id),
    referenced_conversation_ids: referencedConversations.map(
      (conv) => conv.conversationId
    ),
    referenced_conversation_history_limit: referencedConversationHistoryLimit,
    llm_id: selectedModel,
    prompt_id: activeConversation?.prompt?.id,
    temperature: activeConversation?.temperature,
    max_tokens: activeConversation?.maxTokens,
    max_context_snippets: activeConversation?.maxContextSnippets,
    document_similarity_threshold:
      activeConversation?.documentSimilarityThreshold,
    history_limit: activeConversation?.historyLimit,
    images: attachedImages.map(({ preview, name, type }) => ({
      preview,
      name,
      type,
    })),
  }

  socket.send(JSON.stringify(payload))
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
