import { configureStore } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'
import userReducer from './userSlice'
import fileReducer from './fileSlice'
import conversationReducer from './conversationSlice'
import promptReducer from './promptSlice'
import websocketReducer from './websocketSlice'
import tagsReducer from './tagslice'
import workflowReducer from './workflowSlice'
import billingReducer from './billingSlice'
import themeReducer from './themeSlice'
const sentryReduxEnhancer = Sentry.createReduxEnhancer({})

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    conversation: conversationReducer,
    prompt: promptReducer,
    websocket: websocketReducer,
    tags: tagsReducer,
    workflow: workflowReducer,
    billing: billingReducer,
    theme: themeReducer,
  },
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(sentryReduxEnhancer),
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
