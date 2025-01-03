import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage, NewChatPayload } from "../types/chat";
import { addMessage } from "../chatSlice";
import { streamClaudeResponse, fetchChatSessions, fetchModelsAPI } from "../../api/chat";
import { AppDispatch, RootState } from "../store";

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

export const fetchAvailableModels = createAsyncThunk(
  "chat/fetchAvailableModels",
  async (_, thunkAPI) => {
    try {
      const models = await fetchModelsAPI();
      return models; // Transformed data is returned
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const getChatSessions = createAsyncThunk("chat/getChatSessions", async (_, thunkAPI) => {
  try {
    const sessions = await fetchChatSessions();
    return sessions;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const createChatSession = createAsyncThunk("chat/createChatSession", async (payload: NewChatPayload, thunkAPI) => {
  try {
    // Simulate API call for creating a new chat session
    return payload;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async (_, thunkAPI) => {
    try {
      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchDummyMessage = createAsyncThunk(
  "chat/fetchDummyMessage",
  async (message: ChatMessage & { filePath?: string }, thunkAPI) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const apiKey = CLAUDE_API_KEY;
    const activeChat = state.chat.activeChat;

    if (!apiKey || !activeChat) {
      return thunkAPI.rejectWithValue("API key or active chat session is missing");
    }

    try {
      thunkAPI.dispatch(addMessage(message));
      console.log('Streaming message with Claude:', message.message);
      streamClaudeResponse(dispatch, apiKey, activeChat.session_id, message.message);
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);