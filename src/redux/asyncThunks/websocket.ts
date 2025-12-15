import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  clearConversation,
  updateMessage,
  addMessage,
  updateConversationTitle,
  updateConversationHistory,
} from '../conversationSlice'
import {
  initArtifact,
  initModifyArtifact,
  appendContent,
  updateProgress,
  setCurrentSection,
  setStatus,
  setSectionsRemaining,
  setWordCount,
  setArtifactError,
  loadArtifact,
  loadArtifacts,
  setActiveArtifact,
  openSidecar,
} from '../artifactSlice'
import type { Artifact } from '../types/artifact'
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
          if (data.conversationHistory) {
            dispatch(updateConversationHistory(data.conversationHistory))
            // Load any artifacts from conversation history
            // These are lightweight (no content/outline) - full data fetched on click
            if (data.artifacts && Array.isArray(data.artifacts)) {
              const mappedArtifacts: Artifact[] = data.artifacts.map(
                (a: Record<string, unknown>) => ({
                  id: String(a.id),
                  title: String(a.title || ''),
                  outline: String(a.outline || ''), // May be empty from list serializer
                  content: String(a.content || ''), // May be empty from list serializer
                  artifactType:
                    (a.artifactType as Artifact['artifactType']) || 'document',
                  status: (a.status as Artifact['status']) || 'completed',
                  estimatedSections: Number(a.estimatedSections) || 1,
                  currentSection: Number(a.currentSection) || 1,
                  progress: Number(a.progress) || 1,
                  wordCount: a.wordCount ? Number(a.wordCount) : undefined,
                  language: a.language ? String(a.language) : undefined,
                  version: Number(a.version) || 1,
                  parentArtifactId: a.parentArtifactId
                    ? String(a.parentArtifactId)
                    : undefined,
                  artifactGroupId: a.artifactGroupId
                    ? String(a.artifactGroupId)
                    : undefined,
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

        // Artifact message handlers
        case 'artifact_init':
          dispatch(
            initArtifact({
              id: data.artifactId,
              title: data.title,
              outline: data.outline,
              estimatedSections: data.estimatedSections,
            })
          )
          // Link artifact to the message and update title if messageId is provided
          if (data.messageId) {
            dispatch(
              updateMessage({
                id: data.messageId,
                artifactId: data.artifactId,
                message: `Generated artifact: ${data.title}`,
                streaming: true, // Keep streaming true until complete
              })
            )
          }
          // Open the sidecar to show artifact generation
          dispatch(setActiveArtifact(data.artifactId))
          dispatch(openSidecar())
          break

        case 'artifact_modify_init':
          dispatch(
            initModifyArtifact({
              id: data.artifactId,
              parentArtifactId: data.parentArtifactId,
              artifactGroupId: data.artifactGroupId,
              title: data.title,
              outline: data.outline,
              fullOutline: data.fullOutline,
              totalEstimatedSections: data.totalEstimatedSections,
              currentSection: data.currentSection,
              existingContent: data.existingContent,
              newVersion: data.newVersion,
            })
          )
          // Link artifact to the message and update title if messageId is provided
          if (data.messageId) {
            dispatch(
              updateMessage({
                id: data.messageId,
                artifactId: data.artifactId,
                message: `Generated artifact v${data.newVersion}: ${data.title}`,
                streaming: true, // Keep streaming true until complete
              })
            )
          }
          // Open the sidecar to show artifact modification
          dispatch(setActiveArtifact(data.artifactId))
          dispatch(openSidecar())
          break

        case 'artifact_stream':
          dispatch(
            appendContent({
              artifactId: data.artifactId,
              chunk: data.chunk,
            })
          )
          dispatch(
            updateProgress({
              artifactId: data.artifactId,
              progress: data.progress,
            })
          )
          dispatch(
            setCurrentSection({
              artifactId: data.artifactId,
              section: data.section,
            })
          )
          break

        case 'artifact_pause':
          dispatch(
            setStatus({
              artifactId: data.artifactId,
              status: 'paused',
            })
          )
          dispatch(
            setSectionsRemaining({
              artifactId: data.artifactId,
              sectionsRemaining: data.sectionsRemaining,
            })
          )
          break

        case 'artifact_complete':
          // Set status to completed
          dispatch(
            setStatus({
              artifactId: data.artifactId,
              status: 'completed',
            })
          )
          // Set currentSection to final value so all section tabs are clickable
          dispatch(
            setCurrentSection({
              artifactId: data.artifactId,
              section: data.estimatedSections || 0,
            })
          )
          // Set progress to 100%
          dispatch(
            updateProgress({
              artifactId: data.artifactId,
              progress: 1.0,
            })
          )
          dispatch(
            setWordCount({
              artifactId: data.artifactId,
              wordCount: data.totalWords,
            })
          )
          dispatch(getWallet())
          break

        case 'artifact_error':
          dispatch(
            setArtifactError({
              artifactId: data.artifactId,
              error: data.errorMessage,
            })
          )
          break

        // Section rewrite events
        case 'artifact_rewrite_init':
          // Rewrite started - set generating status
          dispatch(
            setStatus({
              artifactId: data.artifactId,
              status: 'generating',
            })
          )
          // Open sidecar to show progress
          dispatch(setActiveArtifact(data.artifactId))
          dispatch(openSidecar())
          break

        case 'artifact_rewrite_stream':
          // We don't update content during rewrite streaming
          // The full content comes with artifact_rewrite_complete
          break

        case 'artifact_rewrite_complete':
          // Load the new artifact version with rewritten content
          dispatch(
            loadArtifact({
              id: data.artifactId,
              title: data.title || 'Rewritten Artifact',
              outline: data.outline || '',
              content: data.content,
              artifactType: data.artifactType || 'document',
              status: 'completed',
              estimatedSections: data.estimatedSections || 0,
              currentSection: data.currentSection || 0,
              progress: 1.0,
              version: data.version,
              parentArtifactId: data.parentArtifactId,
              artifactGroupId: data.artifactGroupId,
            })
          )
          // Switch to the new version
          dispatch(setActiveArtifact(data.artifactId))
          dispatch(openSidecar())
          dispatch(getWallet())
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
    artifactsEnabled,
  } = conversation

  // Get active artifact info for potential modification
  const { activeArtifactId, artifacts, sidecarOpen } = artifact
  const activeArtifact = activeArtifactId ? artifacts[activeArtifactId] : null
  // Send artifact context if sidecar is open with a completed or paused artifact
  // (paused artifacts can also be modified - e.g., "make it shorter")
  const shouldSendArtifactContext =
    artifactsEnabled &&
    sidecarOpen &&
    activeArtifact &&
    (activeArtifact.status === 'completed' ||
      activeArtifact.status === 'paused')

  const payload = {
    message: message.message,
    sender_type: 1,
    file_ids: selectedFiles.map((file) => file.id),
    embedding_ids: selectedEmbeddings.map((file) => file.id),
    media_ids: selectedMediaFiles.map((file) => file.id), // NEW: Media file IDs
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
    images: attachedImages.map(({ preview, name, type }) => ({
      preview,
      name,
      type,
    })),
    artifacts_enabled: artifactsEnabled,
    // Artifact modification context - auto-detection mode
    // Backend will use heuristics to determine if user wants to modify
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
    ) // NEW: Media file IDs
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
          media_ids: mediaIds, // NEW: Media file IDs
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

// Continue a paused artifact
export const continueArtifact = createAsyncThunk<
  void,
  { artifactId: number },
  { dispatch: AppDispatch; state: RootState }
>(
  'websocket/continueArtifact',
  async ({ artifactId }, { rejectWithValue, dispatch }) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      dispatch(
        setStatus({
          artifactId,
          status: 'generating',
        })
      )
      socket.send(
        JSON.stringify({
          action: 'continue_artifact',
          artifact_id: artifactId,
        })
      )
    } else {
      return rejectWithValue('WebSocket is not connected')
    }
  }
)

// Note: pauseArtifact has been moved to @/redux/asyncThunks/artifact.ts
// It uses REST API instead of WebSocket because the WebSocket receive handler
// is blocked during artifact streaming (single-threaded message processing)
