import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage } from "../types/chat";
import { addMessage } from "../chatSlice";
import { getChatSessionsAPI, getModelsAPI } from "../../api/chat";
import { AppDispatch, RootState } from "../store";
import { sendWebSocketMessage } from "./websocket";

// export const createChatSession = createAsyncThunk("chat/createChatSession", async (payload: NewChatPayload, thunkAPI) => {
//   try {
//     // Simulate API call for creating a new chat session
//     return payload;
//   } catch (error) {
//     return thunkAPI.rejectWithValue((error as Error).message);
//   }
// });

export const getAvailableModels = createAsyncThunk(
  "chat/getAvailableModels",
  async (_, thunkAPI) => {
    try {
      const models = await getModelsAPI();
      return models; // Transformed data is returned
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const getChatSessions = createAsyncThunk("chat/getChatSessions", async (_, thunkAPI) => {
  try {
    const sessions = await getChatSessionsAPI();
    return sessions;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});


export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (message: ChatMessage & { filePath?: string }, thunkAPI) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const activeChat = state.chat.activeChat;

    if (!activeChat) {
      return thunkAPI.rejectWithValue("API key or active chat session is missing");
    }

    try {
      thunkAPI.dispatch(addMessage(message));
      console.log('Streaming message with Claude:', message.message);
      dispatch(sendWebSocketMessage(message))

    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);