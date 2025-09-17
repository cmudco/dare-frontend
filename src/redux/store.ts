import { configureStore, Middleware } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'
import userReducer from './userSlice'
import fileReducer from './fileSlice'
import conversationReducer from './conversationSlice'
import promptReducer from './promptSlice'
import websocketReducer from './websocketSlice'
import tagsReducer from './tagslice'
import workflowReducer from './workflowSlice'
import workflowBuilderReducer from './workflowBuilderSlice'
import billingReducer from './billingSlice'
import themeReducer from './themeSlice'
import notificationReducer from './notificationSlice'
import { saveDraftsToLocalStorage } from '../utils/draftStorage'
const sentryReduxEnhancer = Sentry.createReduxEnhancer({})

const draftPersistenceMiddleware: Middleware =
  (store) => (next) => (action) => {
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
      const state = store.getState() as ReturnType<typeof store.getState>
      saveDraftsToLocalStorage(state.conversation.conversationDrafts)
    }

    return result
  }

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    conversation: conversationReducer,
    prompt: promptReducer,
    websocket: websocketReducer,
    tags: tagsReducer,
    workflow: workflowReducer,
    workflowBuilder: workflowBuilderReducer,
    billing: billingReducer,
    theme: themeReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(draftPersistenceMiddleware),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(sentryReduxEnhancer),
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
