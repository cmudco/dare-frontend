import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import fileReducer from "./fileSlice";
import conversationReducer from "./conversationSlice";
import promptReducer from "./promptSlice";
import websocketReducer from "./websocketSlice"
import tagsReducer from "./tagslice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    conversation: conversationReducer,
    prompt: promptReducer,
    websocket: websocketReducer,
    tags: tagsReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
