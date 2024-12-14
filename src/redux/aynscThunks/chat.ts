import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage, ChatSession, NewChatPayload } from "../types/chat";
import { addMessage } from "../chatSlice";
import { fetchOpenAIResponse } from "../../api/chat";

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
  async (message: ChatMessage, thunkAPI) => {
    try {
      thunkAPI.dispatch(addMessage(message));
      const responseMessage = await fetchOpenAIResponse(message.message);
      return responseMessage;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);