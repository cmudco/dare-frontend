import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    getWorkflowsAPI,
    getWorkflowByIdAPI,
    createWorkflowAPI,
    updateWorkflowAPI,
    deleteWorkflowAPI,
} from "@/api/workflows";
import { Workflow } from "../types/workflow";

export const getWorkflows = createAsyncThunk(
    "workflows/getWorkflows",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getWorkflowsAPI();
            return response.results;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const getWorkflowById = createAsyncThunk(
    "workflows/getWorkflowById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await getWorkflowByIdAPI(id);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createOrUpdateWorkflow = createAsyncThunk(
    "workflows/createOrUpdateWorkflow",
    async (
        {
            id,
            workflowData,
        }: {
            id?: string;
            workflowData: {
                title: string;
                description: string;
                mode: number;
                steps: {
                    id?: string;
                    order: number;
                    prompt: string | null;
                    file?: number | null; 
                    llm?: number | null;
                }[];
            };
        },
        { rejectWithValue }
    ) => {
        try {
            let workflow: Workflow;

            if (id) {
                workflow = await updateWorkflowAPI(id, workflowData);
            } else {
                workflow = await createWorkflowAPI(workflowData);
            }

            return workflow;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteWorkflow = createAsyncThunk(
    "workflows/deleteWorkflow",
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteWorkflowAPI(id);
            return id;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);
