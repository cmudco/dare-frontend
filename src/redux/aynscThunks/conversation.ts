import { createAsyncThunk } from "@reduxjs/toolkit";
import { Message } from "../types/conversation";
import {
    getModelsAPI,
    createConversationAPI,
    getConversationsAPI,
} from "../../api/conversation";
import { AppDispatch, RootState } from "../store";
import { sendWebSocketMessage } from "./websocket";
import { LLMModel } from "../types/conversation";

export const getAvailableModels = createAsyncThunk<
    LLMModel[],
    void,
    { rejectValue: string }
>("conversation/getAvailableModels", async (_, thunkAPI) => {
    try {
        const response = await getModelsAPI();
        return response || [];
    } catch (error) {
        console.error("Error fetching models:", error); 
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const getConversations = createAsyncThunk(
    "conversation/getConversations",
    async (_, thunkAPI) => {
        try {
            const conversations = await getConversationsAPI();
            return conversations.results;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
export const createConversation = createAsyncThunk(
    "conversation/createConversation",
    async (_, thunkAPI) => {
        try {
            const newConversation = await createConversationAPI();
            return newConversation;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const sendMessage = createAsyncThunk(
    "conversation/sendMessage",
    async (message: Partial<Message> & { filePath?: string }, thunkAPI) => {
        const dispatch = thunkAPI.dispatch as AppDispatch;
        try {
            dispatch(sendWebSocketMessage(message));
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
