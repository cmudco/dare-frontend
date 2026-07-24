import { configureStore } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'
import userReducer from './userSlice'
import fileReducer from './fileSlice'
import conversationReducer from './conversationSlice'
import promptReducer from './promptSlice'
import promptsLibraryReducer from './promptsLibrarySlice'
import agentReducer from './agentSlice'
import tagsReducer from './tagslice'
import workflowReducer from './workflowSlice'
import workflowBuilderReducer from './workflowBuilder'
import billingReducer from './billingSlice'
import themeReducer from './themeSlice'
import notificationReducer from './notificationSlice'
import apiKeysReducer from './apiKeysSlice'
import artifactReducer from './artifactSlice'
import mcpReducer from './mcpSlice'
import dareToolsReducer from './dareToolsSlice'
import memoryReducer from './memorySlice'
import socketReducer from './slices/socketSlice'
import feedbackReducer from './feedbackSlice'
import sharingReducer from './sharingSlice'
import conversationTourReducer from './conversationTourSlice'
import featureFlagsReducer from './featureFlagsSlice'
import researchReducer from './researchSlice'
import dataExportReducer from './dataExportSlice'
import accountDeletionReducer from './accountDeletionSlice'
import { socketMiddleware } from './middleware/socketMiddleware'
import { workflowSocketMiddleware } from './middleware/workflowSocketMiddleware'
import { saveDraftsToLocalStorage } from '../utils/draftStorage'
import { debugLog, setDebugLogsAccessor } from '@/utils/debugLogger'

const sentryReduxEnhancer = Sentry.createReduxEnhancer({})

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    conversation: conversationReducer,
    prompt: promptReducer,
    promptsLibrary: promptsLibraryReducer,
    agent: agentReducer,
    tags: tagsReducer,
    workflow: workflowReducer,
    workflowBuilder: workflowBuilderReducer,
    billing: billingReducer,
    theme: themeReducer,
    notification: notificationReducer,
    apiKeys: apiKeysReducer,
    artifact: artifactReducer,
    socket: socketReducer,
    feedback: feedbackReducer,
    mcp: mcpReducer,
    dareTools: dareToolsReducer,
    memory: memoryReducer,
    sharing: sharingReducer,
    conversationTour: conversationTourReducer,
    featureFlags: featureFlagsReducer,
    research: researchReducer,
    dataExport: dataExportReducer,
    accountDeletion: accountDeletionReducer,
  },
  middleware: (getDefaultMiddleware) => {
    // Draft persistence middleware
    const draftPersistenceMiddleware: ReturnType<
      typeof getDefaultMiddleware
    >[number] = (storeApi) => (next) => (action) => {
      const result = next(action)
      if (
        typeof action === 'object' &&
        action &&
        'type' in action &&
        typeof action.type === 'string' &&
        action.type.startsWith('conversation/') &&
        (action.type.includes('saveDraftForConversation') ||
          action.type.includes('clearDraftForConversation') ||
          action.type.includes('clearOldDrafts'))
      ) {
        const state = storeApi.getState()
        saveDraftsToLocalStorage(state.conversation.conversationDrafts)
      }
      return result
    }

    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        // Ignore audioBlob in voice message actions (Blob is not serializable)
        ignoredActions: ['socket/sendVoiceMessage'],
        ignoredActionPaths: ['payload.audioBlob'],
      },
    }).concat(draftPersistenceMiddleware)

    debugLog('🔌 Socket.IO middleware registered')
    return middlewares.concat(socketMiddleware).concat(workflowSocketMiddleware)
  },
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(sentryReduxEnhancer),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Wire debugLogger to the store now that it's fully initialized. Doing this
// here (rather than via a circular import inside debugLogger.ts) keeps store
// exports out of TDZ during module evaluation.
setDebugLogsAccessor(
  () => store.getState().featureFlags.flags.enableDebugLogs === true
)
