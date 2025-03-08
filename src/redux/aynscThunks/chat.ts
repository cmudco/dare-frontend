import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChatMessage } from "../types/chat";
import {
    getModelsAPI,
    createConversationAPI,
    getMessagesAPI,
    getConversationsAPI,
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
        return response || [];
    } catch (error) {
        console.error("Error fetching models:", error); 
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const getConversations = createAsyncThunk(
    "chat/getConversations",
    async (_, thunkAPI) => {
        try {
            const sessions = await getConversationsAPI();
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
    async (message: Partial<ChatMessage> & { filePath?: string }, thunkAPI) => {
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
