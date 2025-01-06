import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import fileReducer from "./fileSlice";
import chatReducer from "./chatSlice";
import promptReducer from "./promptSlice";
import websocketReducer from "./websocketSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    chat: chatReducer,
    prompt: promptReducer,
    websocket: websocketReducer
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
