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
            return (await getPromptsAPI()) as Prompt[];
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

export const createPrompt = createAsyncThunk(
    "prompts/createaPrompt",
    async (
        promptData: { title: string; content: string },
        { rejectWithValue }
    ) => {
        try {
            return await createPromptAPI(promptData);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updatePrompt = createAsyncThunk(
    "prompts/updatePrompt",
    async (
        { id, promptData }: { id: string; promptData: Partial<Prompt> },
        { rejectWithValue }
    ) => {
        try {
            return await updatePromptAPI(id, promptData);
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
