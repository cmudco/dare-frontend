import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  clearConversation,
  updateMessage,
  addMessage,
  updateConversationTitle,
  updateConversationHistory,
} from '../conversationSlice'
import { loadArtifacts } from '../artifactSlice'
import type { Artifact } from '../types/artifact'
import { Message } from '../types/conversation'
import { AppDispatch, RootState } from '../store'
import { setConnectionStatus, setCreditError } from '../websocketSlice'
import { WEBSOCKET_URL } from '../../api/config'
import { getWallet } from './billing'

let socket: WebSocket | null = null

/**
 * WebSocket Async Thunks
 *
 * NOTE: Artifact events (artifact_start, artifact_stream, artifact_complete, artifact_error)
 * are now handled by socketMiddleware, not this file. This file only handles legacy
 * WebSocket connection for non-Socket.IO fallback.
 */

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
          if (data.conversationHistory) {
            dispatch(updateConversationHistory(data.conversationHistory))
            // Load any artifacts from conversation history
            if (data.artifacts && Array.isArray(data.artifacts)) {
              const mappedArtifacts: Artifact[] = data.artifacts.map(
                (a: Record<string, unknown>) => ({
                  id: Number(a.id),
                  messageId: a.messageId ? Number(a.messageId) : undefined,
                  title: String(a.title || ''),
                  content: String(a.content || ''),
                  artifactType:
                    (a.artifactType as Artifact['artifactType']) || 'document',
                  status: (a.status as Artifact['status']) || 'completed',
                  filename: String(a.filename || ''),
                  contentType: String(a.contentType || ''),
                  sourceTool: a.sourceTool ? String(a.sourceTool) : undefined,
                  metadata: a.metadata as Record<string, unknown> | undefined,
                  createdAt: a.createdAt ? String(a.createdAt) : undefined,
                })
              )
              dispatch(loadArtifacts(mappedArtifacts))
            }
          }
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
          // Ignore unknown types - artifact events handled by socketMiddleware
          break
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
  const { conversation, artifact } = state
  const {
    activeConversation,
    selectedFiles,
    selectedEmbeddings,
    selectedMediaFiles,
    selectedTags,
    selectedFolders,
    referencedConversations,
    referencedConversationHistoryLimit,
    selectedModel,
    attachedImages,
    webSearchEnabled,
    imageGenerationEnabled,
    imageGenerationSettings,
    audioTranscriptionEnabled,
    audioTranscriptionSettings,
    artifactsEnabled,
  } = conversation

  // Get active artifact info for potential modification
  const { activeArtifactId, artifacts, sidecarOpen } = artifact
  const activeArtifact = activeArtifactId ? artifacts[activeArtifactId] : null
  const shouldSendArtifactContext =
    artifactsEnabled &&
    sidecarOpen &&
    activeArtifact &&
    activeArtifact.status === 'completed'

  const payload = {
    message: message.message,
    sender_type: 1,
    file_ids: selectedFiles.map((file) => file.id),
    embedding_ids: selectedEmbeddings.map((file) => file.id),
    media_ids: selectedMediaFiles.map((file) => file.id),
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
    web_search_enabled: webSearchEnabled,
    image_generation_enabled: imageGenerationEnabled,
    image_generation_settings: {
      size: imageGenerationSettings.size,
      quality: imageGenerationSettings.quality,
      style: imageGenerationSettings.style,
    },
    audio_transcription_enabled: audioTranscriptionEnabled,
    audio_transcription_settings: {
      language: audioTranscriptionSettings.language,
    },
    images: attachedImages.map(({ preview, name, type }) => ({
      preview,
      name,
      type,
    })),
    artifacts_enabled: artifactsEnabled,
    artifact_action: shouldSendArtifactContext ? 'auto' : undefined,
    active_artifact_id: shouldSendArtifactContext
      ? activeArtifactId
      : undefined,
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
    const mediaIds = state.conversation.selectedMediaFiles.map(
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
    const webSearchEnabled = state.conversation.webSearchEnabled
    const imageGenerationEnabled = state.conversation.imageGenerationEnabled
    const imageGenerationSettings = state.conversation.imageGenerationSettings
    const audioTranscriptionEnabled =
      state.conversation.audioTranscriptionEnabled
    const audioTranscriptionSettings =
      state.conversation.audioTranscriptionSettings

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
          media_ids: mediaIds,
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
          web_search_enabled: webSearchEnabled,
          image_generation_enabled: imageGenerationEnabled,
          image_generation_settings: {
            size: imageGenerationSettings.size,
            quality: imageGenerationSettings.quality,
            style: imageGenerationSettings.style,
          },
          audio_transcription_enabled: audioTranscriptionEnabled,
          audio_transcription_settings: {
            language: audioTranscriptionSettings.language,
          },
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
