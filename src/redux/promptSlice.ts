import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/prompt";
import {
    getPrompts,
    getPromptById,
    createOrUpdatePrompt,
    deletePrompt,
} from "./aynscThunks/prompt";
import { sortPrompts } from "../utils/sortUtils";

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
            state.selectedPrompt =
                state.prompts.find((prompt) => prompt.id === action.payload) ||
                null;
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
            state.prompts = sortPrompts(action.payload);
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
        builder.addCase(createOrUpdatePrompt.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createOrUpdatePrompt.fulfilled, (state, action) => {
            state.loading = false;
            const updatedPrompt = action.payload;

            const index = state.prompts.findIndex(
                (prompt) => prompt.id === updatedPrompt.id
            );

            if (index !== -1) {
                state.prompts[index] = updatedPrompt;
            } else {
                state.prompts.push(updatedPrompt);
            }

            // Apply sorting after adding/updating a prompt
            state.prompts = sortPrompts(state.prompts);

            if (state.selectedPrompt?.id === updatedPrompt.id) {
                state.selectedPrompt = updatedPrompt;
            }
        });
        builder.addCase(createOrUpdatePrompt.rejected, (state, action) => {
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

            // // Find the deleted prompt before removing it from state
            // const deletedPrompt = state.prompts.find(
            //     (p) => p.id === deletedPromptId
            // );

            // // Find any prompts that had the deleted prompt as their parent
            // if (deletedPrompt) {
            //     const childPrompts = state.prompts.filter(
            //         (p) => p.parent === deletedPromptId
            //     );

            //     // Update each child's parent to be the deleted prompt's parent
            //     // This maintains the version chain
            //     childPrompts.forEach((child) => {
            //         const childIndex = state.prompts.findIndex(
            //             (p) => p.id === child.id
            //         );
            //         if (childIndex !== -1) {
            //             state.prompts[childIndex] = {
            //                 ...state.prompts[childIndex],
            //                 parent: deletedPrompt.parent, // Point to grandparent
            //             };
            //         }
            //     });
            // }

            // Now remove the deleted prompt
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

export default promptSlice.reducer;
