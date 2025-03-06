import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage } from "../types/chat";
import { addMessage } from "../chatSlice";
import {
    getModelsAPI,
    createConversationAPI,
    getMessagesAPI,
    getChatSessionsAPI,
} from "../../api/chat";
import { AppDispatch, RootState } from "../store";
import { sendWebSocketMessage } from "./websocket";
import { LLMModel } from "../types/chat";

export const getAvailableModels = createAsyncThunk<
    LLMModel[],
    void,
    { rejectValue: string }
>("chat/getAvailableModels", async (_, thunkAPI) => {
    try {
        const response = await getModelsAPI();
        console.log("Models API response:", response); // Debug log
        // Return just the results array
        return response.results || [];
    } catch (error) {
        console.error("Error fetching models:", error); // Debug log
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const getChatSessions = createAsyncThunk(
    "chat/getChatSessions",
    async (_, thunkAPI) => {
        try {
            const sessions = await getChatSessionsAPI();
            return sessions.results;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
export const createConversation = createAsyncThunk(
    "chat/createConversation",
    async (_, thunkAPI) => {
        try {
            const newConversation = await createConversationAPI();
            return newConversation;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const getChatMessages = createAsyncThunk(
    "chat/getChatMessages",
    async (conversationId: string, thunkAPI) => {
        try {
            const messages = await getMessagesAPI(conversationId);
            return messages;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async (message: ChatMessage & { filePath?: string }, thunkAPI) => {
        const dispatch = thunkAPI.dispatch as AppDispatch;
        const state = thunkAPI.getState() as RootState;
        const activeChat = state.chat.activeChat;

        if (!activeChat) {
            return thunkAPI.rejectWithValue(
                "API key or active chat session is missing"
            );
        }

        try {
            dispatch(sendWebSocketMessage(message));
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
