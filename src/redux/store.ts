import { configureStore } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'
import userReducer from './userSlice'
import fileReducer from './fileSlice'
import conversationReducer from './conversationSlice'
import promptReducer from './promptSlice'
import agentReducer from './agentSlice'
import websocketReducer from './websocketSlice'
import tagsReducer from './tagslice'
import workflowReducer from './workflowSlice'
import workflowBuilderReducer from './workflowBuilderSlice'
import billingReducer from './billingSlice'
import themeReducer from './themeSlice'
import notificationReducer from './notificationSlice'
import apiKeysReducer from './apiKeysSlice'
import artifactReducer from './artifactSlice'
import socketReducer from './slices/socketSlice'
import { socketMiddleware } from './middleware/socketMiddleware'
import { saveDraftsToLocalStorage } from '../utils/draftStorage'
import { config } from '@/config/environment'

const sentryReduxEnhancer = Sentry.createReduxEnhancer({})

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    conversation: conversationReducer,
    prompt: promptReducer,
    agent: agentReducer,
    websocket: websocketReducer,
    tags: tagsReducer,
    workflow: workflowReducer,
    workflowBuilder: workflowBuilderReducer,
    billing: billingReducer,
    theme: themeReducer,
    notification: notificationReducer,
    apiKeys: apiKeysReducer,
    artifact: artifactReducer,
    socket: socketReducer,
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

    const middlewares = getDefaultMiddleware().concat(
      draftPersistenceMiddleware
    )

    // Add Socket.IO middleware if enabled
    if (config.features.enableSocketIO) {
      console.log('🔌 Socket.IO middleware enabled')
      return middlewares.concat(socketMiddleware)
    }

    return middlewares
  },
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(sentryReduxEnhancer),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
