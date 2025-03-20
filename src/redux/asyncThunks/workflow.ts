import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    getWorkflowsAPI,
    getWorkflowByIdAPI,
    createWorkflowAPI,
    updateWorkflowAPI,
    deleteWorkflowAPI,
    deleteStepAPI,
    updateStepAPI,
    createStepAPI,
} from "@/api/workflows";
import { Workflow, Step } from "../types/workflow";
import { RootState } from "../store";

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
                steps_ids?: string[];
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

export const createStep = createAsyncThunk(
    "workflows/createStep",
    async (
        {
            promptId,
            order,
        }: {
            promptId: string;
            order: number;
        },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.id;

            return await createStepAPI({
                prompt: promptId,
                order,
                user: userId,
            });
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateStep = createAsyncThunk(
    "workflows/updateStep",
    async (
        {
            stepId,
            stepData,
        }: {
            stepId: string;
            stepData: Partial<Step>;
        },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const userId = state.user.user?.id;

            const step = await updateStepAPI(stepId, {
                ...stepData,
                user: userId, 
            });
            return step;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteStep = createAsyncThunk(
    "workflows/deleteStep",
    async (
        {
            stepId,
        }: {
            stepId: string;
        },
        { rejectWithValue }
    ) => {
        try {
            await deleteStepAPI(stepId);
            return { stepId };
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);
