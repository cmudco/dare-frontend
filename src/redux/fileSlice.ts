import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFiles, deleteFile, uploadNewFile } from "./aynscThunks/file";
import { initialState } from "./initialState/files";

const fileSlice = createSlice({
    name: "files",
    initialState,
    reducers: {
        updateFileArchive: (state, action: PayloadAction<number>) => {
            const id = action.payload;
            state.files = state.files.filter((file) => file.id !== id);
        },
        updateTagChange: (state, action: PayloadAction<number>) => {
            const tag = action.payload;
            state.selectedTags = state.selectedTags.includes(tag)
                ? state.selectedTags
                : [...state.selectedTags, tag];
        },
        updateRemoveTag: (state, action: PayloadAction<number>) => {
            const tag = action.payload;
            state.selectedTags = state.selectedTags.filter((t) => t !== tag);
        },
        updateFilename: (state, action: PayloadAction<string>) => {
            state.filename = action.payload;
        },
        openModal: (state) => {
            state.isModalOpen = true;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
        },
        resetSelectedTags: (state) => {
            state.selectedTags = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.files = action.payload.results;
            })
            .addCase(getFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(uploadNewFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadNewFile.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(uploadNewFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.loading = false;
                state.files = state.files.filter(
                    (file) => file.id !== action.payload
                );
            })
            .addCase(deleteFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    updateFileArchive,
    updateTagChange,
    updateRemoveTag,
    updateFilename,
    openModal,
    closeModal,
    resetSelectedTags,
} = fileSlice.actions;

export default fileSlice.reducer;
