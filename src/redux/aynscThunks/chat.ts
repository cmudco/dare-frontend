import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage, ChatSession, NewChatPayload } from "../types/chat";
import { addMessage } from "../chatSlice";
import { streamClaudeResponse } from "../../api/chat";
import { AppDispatch, RootState } from "../store";

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

export const getChatSessions = createAsyncThunk("chat/getChatSessions", async (_, thunkAPI) => {
  try {
    // Create two dummy chat sessions
    const dummySessions: ChatSession[] = [
      { session_id: "session_1", created_at: new Date().toISOString() },
      { session_id: "session_2", created_at: new Date().toISOString() },
    ];

    return dummySessions;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const createChatSession = createAsyncThunk("chat/createChatSession", async (payload: NewChatPayload, thunkAPI) => {
  try {
    // Simulate API call for creating a new chat sessio
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
  async (message: ChatMessage, thunkAPI) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const apiKey = CLAUDE_API_KEY; // Use the Claude API key from the environment variable
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