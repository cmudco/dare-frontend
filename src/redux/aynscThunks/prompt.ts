import { createAsyncThunk } from "@reduxjs/toolkit";
import { Prompt } from "../types/prompt";
import {
    createPromptAPI,
    deletePromptAPI,
    getPromptByIdAPI,
    getPromptsAPI,
    updatePromptAPI,
} from "@/api/prompts";

export const getPrompts = createAsyncThunk(
    "prompts/getPrompts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getPromptsAPI();
            return response.results;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const getPromptById = createAsyncThunk(
    "prompts/getPromptById",
    async (id: string, { rejectWithValue }) => {
        try {
            return (await getPromptByIdAPI(id)) as Prompt;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createOrUpdatePrompt = createAsyncThunk(
    "prompts/createOrUpdatePrompt",
    async (
        {
            id,
            promptData,
        }: {
            id?: string;
            promptData: {
                title: string;
                content: string;
                version?: number;
                parent?: string;
            };
        },
        { rejectWithValue }
    ) => {
        try {
            if (id) {
                return await updatePromptAPI(id, promptData);
            } else {
                return await createPromptAPI(promptData);
            }
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deletePrompt = createAsyncThunk(
    "prompts/deletePrompt",
    async (id: string, { rejectWithValue }) => {
        try {
            await deletePromptAPI(id);
            return id;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);
