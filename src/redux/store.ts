import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import fileReducer from "./fileSlice";
import chatReducer from "./chatSlice";
import promptReducer from "./promptSlice"; // Import the prompt reducer

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    chat: chatReducer,
    prompt: promptReducer, // Add the prompt reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
