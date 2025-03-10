import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/prompt";
import {
    getPrompts,
    getPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
} from "./aynscThunks/prompt";
import { Prompt } from "./types/prompt";

const promptSlice = createSlice({
    name: "prompts",
    initialState: {
        ...initialState,
        isModalOpen: false,
    },
    reducers: {
        clearSelectedPrompt: (state) => {
            state.selectedPrompt = null;
        },
        clearPromptError: (state) => {
            state.error = null;
        },
        openModal: (state) => {
            state.isModalOpen = true;
        },
        openEditModal: (state, action: PayloadAction<string>) => {
            state.isModalOpen = true;
            state.selectedPrompt = { id: action.payload } as Prompt;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getPrompts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getPrompts.fulfilled, (state, action) => {
            state.loading = false;
            state.prompts = action.payload;
        });
        builder.addCase(getPrompts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(getPromptById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getPromptById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedPrompt = action.payload;
        });
        builder.addCase(getPromptById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(createPrompt.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createPrompt.fulfilled, (state, action) => {
            state.loading = false;
            state.prompts.push(action.payload);
        });
        builder.addCase(createPrompt.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(updatePrompt.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updatePrompt.fulfilled, (state, action) => {
            state.loading = false;
            const updatedPrompt = action.payload;
            const index = state.prompts.findIndex(
                (prompt) => prompt.id === updatedPrompt.id
            );
            if (index !== -1) {
                state.prompts[index] = updatedPrompt;
            }
            if (state.selectedPrompt?.id === updatedPrompt.id) {
                state.selectedPrompt = updatedPrompt;
            }
        });
        builder.addCase(updatePrompt.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(deletePrompt.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deletePrompt.fulfilled, (state, action) => {
            state.loading = false;
            const deletedPromptId = action.payload;
            state.prompts = state.prompts.filter(
                (prompt) => prompt.id !== deletedPromptId
            );
            if (state.selectedPrompt?.id === deletedPromptId) {
                state.selectedPrompt = null;
            }
        });
        builder.addCase(deletePrompt.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const {
    clearSelectedPrompt,
    clearPromptError,
    openModal,
    openEditModal,
    closeModal,
} = promptSlice.actions;

export const dispatchOpenModal = () => {
    const event = new CustomEvent("redux-action", {
        detail: { type: "prompts/openModal" },
    });
    document.dispatchEvent(event);
};

export const dispatchOpenEditModal = (id: string) => {
    const event = new CustomEvent("redux-action", {
        detail: { type: "prompts/openEditModal", payload: id },
    });
    document.dispatchEvent(event);
};

export default promptSlice.reducer;
