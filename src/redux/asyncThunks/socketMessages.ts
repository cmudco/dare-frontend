/**
 * Socket.IO Message Thunks
 *
 * Async thunks for sending messages via Socket.IO.
 * These thunks build the payload from Redux state and dispatch socket actions.
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from '../store'
import type { Message } from '../types/conversation'
import { RagMode } from '../types/conversation'
import {
  socketSendMessage,
  socketEditMessage,
  socketRegenerate,
} from '../middleware/socketMiddleware'

// ════════════════════════════════════════════════════════════════════════════
// SEND MESSAGE
// ════════════════════════════════════════════════════════════════════════════

export const sendSocketMessage = createAsyncThunk<
  void,
  Partial<Message>,
  { dispatch: AppDispatch; state: RootState }
>(
  'socket/sendMessageThunk',
  async (message, { dispatch, getState, rejectWithValue }) => {
    const state = getState()

    // Check socket connection
    if (!state.socket.connected) {
      return rejectWithValue('Socket is not connected')
    }

    const { conversation, artifact } = state
    const {
      activeConversation,
      selectedFiles,
      selectedEmbeddings,
      selectedMediaFiles,
      selectedTags,
      selectedFolders,
      selectedLibraries,
      memoryEnabled,
      referencedConversations,
      referencedConversationHistoryLimit,
      referencedSummaries,
      selectedModel,
      attachedImages,
      webSearchEnabled,
      imageGenerationEnabled,
      imageGenerationSettings,
      audioTranscriptionEnabled,
      audioTranscriptionSettings,
      artifactsEnabled,
    } = conversation

    if (!activeConversation) {
      return rejectWithValue('No active conversation')
    }

    // Artifact context for modification
    const { activeArtifactId, artifacts, sidecarOpen } = artifact
    const activeArtifact = activeArtifactId ? artifacts[activeArtifactId] : null
    const shouldSendArtifactContext =
      artifactsEnabled &&
      sidecarOpen &&
      activeArtifact &&
      activeArtifact.status === 'completed'

    // Build payload
    const payload = {
      message: message.message,
      sender_type: 1,
      file_ids: selectedFiles.map((file) => file.id),
      embedding_ids: selectedEmbeddings.map((file) => file.id),
      media_ids: selectedMediaFiles.map((file) => file.id),
      tag_ids: selectedTags.map((tag) => tag.id),
      folder_ids: selectedFolders.map((folder) => folder.id),
      library_ids: (selectedLibraries || []).map((library) => library.id),
      use_memory: memoryEnabled,
      referenced_conversation_ids: referencedConversations.map(
        (conv) => conv.conversationId
      ),
      referenced_conversation_history_limit: referencedConversationHistoryLimit,
      referenced_summary_ids: referencedSummaries.map((s) => s.id),
      // Opaque dispatch id — the BE inverts the encoding in
      // `parse_model_id` (DB-PK string or `litellm:<key>:<model>`).
      model_id: selectedModel,
      prompt_id: activeConversation.prompt?.id,
      temperature: activeConversation.temperature,
      effort: activeConversation.effort,
      max_tokens: activeConversation.maxTokens,
      max_context_snippets: activeConversation.maxContextSnippets,
      document_similarity_threshold:
        activeConversation.documentSimilarityThreshold,
      rag_mode: activeConversation.ragMode ?? RagMode.ADVANCED,
      history_limit: activeConversation.historyLimit,
      web_search_enabled: webSearchEnabled,
      web_fetch_enabled:
        activeConversation.webFetchEnabled ??
        state.conversation.webFetchEnabled,
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
      mcp_server_ids: activeConversation.selectedMcpServerIds || [],
      dare_tool_slugs: activeConversation.selectedDareToolSlugs || [],
    }

    dispatch(socketSendMessage(activeConversation.conversationId, payload))
  }
)

// ════════════════════════════════════════════════════════════════════════════
// EDIT MESSAGE
// ════════════════════════════════════════════════════════════════════════════

export const editSocketMessage = createAsyncThunk<
  void,
  { messageId: string; newContent: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'socket/editMessageThunk',
  async (
    { messageId, newContent },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState()

    if (!state.socket.connected) {
      return rejectWithValue('Socket is not connected')
    }

    const conversationId = state.conversation.activeConversation?.conversationId
    if (!conversationId) {
      return rejectWithValue('No active conversation')
    }

    dispatch(socketEditMessage(conversationId, messageId, newContent))
  }
)

// ════════════════════════════════════════════════════════════════════════════
// REGENERATE RESPONSE
// ════════════════════════════════════════════════════════════════════════════

export const regenerateSocketResponse = createAsyncThunk<
  void,
  { messageId: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'socket/regenerateThunk',
  async ({ messageId }, { dispatch, getState, rejectWithValue }) => {
    const state = getState()

    if (!state.socket.connected) {
      return rejectWithValue('Socket is not connected')
    }

    const { conversation } = state
    const {
      activeConversation,
      selectedFiles,
      selectedEmbeddings,
      selectedMediaFiles,
      selectedLibraries,
      selectedModel,
      webSearchEnabled,
      audioTranscriptionEnabled,
      audioTranscriptionSettings,
    } = conversation

    if (!activeConversation) {
      return rejectWithValue('No active conversation')
    }

    const options = {
      file_ids: selectedFiles.map((file) => file.id),
      embedding_ids: selectedEmbeddings.map((file) => file.id),
      media_ids: selectedMediaFiles.map((file) => file.id),
      library_ids: selectedLibraries.map((library) => library.id),
      // Opaque dispatch id — the BE inverts the encoding in
      // `parse_model_id` (DB-PK string or `litellm:<key>:<model>`).
      model_id: selectedModel,
      prompt_id: activeConversation.prompt?.id,
      temperature: activeConversation.temperature,
      effort: activeConversation.effort,
      max_tokens: activeConversation.maxTokens,
      max_context_snippets: activeConversation.maxContextSnippets,
      document_similarity_threshold:
        activeConversation.documentSimilarityThreshold,
      rag_mode: activeConversation.ragMode ?? RagMode.ADVANCED,
      history_limit: activeConversation.historyLimit,
      web_search_enabled: webSearchEnabled,
      audio_transcription_enabled: audioTranscriptionEnabled,
      audio_transcription_settings: {
        language: audioTranscriptionSettings.language,
      },
    }

    dispatch(
      socketRegenerate(activeConversation.conversationId, messageId, options)
    )
  }
)
