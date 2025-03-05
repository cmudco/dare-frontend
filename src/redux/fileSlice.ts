import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFiles, deleteFile, uploadNewFile } from "./aynscThunks/file";
import { initialState } from "./initialState/files";
import { MyFile } from "./types/files";

const fileSlice = createSlice({
    name: "files",
    initialState,
    reducers: {
        updateFileEdit: (
            state,
            action: PayloadAction<{
                id: number;
                filename: string;
                tags: string[];
            }>
        ) => {
            const { id, filename, tags } = action.payload;
            state.files = state.files.map((file) =>
                file.id === id ? { ...file, file: filename, tags } : file
            );
        },
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
        updateSave: (
            state,
            action: PayloadAction<{ filename: string; tags: string[] }>
        ) => {
            const { filename, tags } = action.payload;
            state.files = state.files.map((file) =>
                file.file === filename ? { ...file, tags } : file
            );
        },
        updateFilename: (state, action: PayloadAction<string>) => {
            state.filename = action.payload;
        },
        updateSaveClick: (
            state,
            action: PayloadAction<{ filename: string; tags: string[] }>
        ) => {
            const { filename, tags } = action.payload;
            state.files = state.files.map((file) =>
                file.file === filename ? { ...file, tags } : file
            );
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
            .addCase(
                uploadNewFile.fulfilled,
                (state, _action) => {
                    state.loading = false;
                }
            )
            .addCase(uploadNewFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                deleteFile.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.files = state.files.filter(
                        (file) => file.id !== action.payload
                    );
                }
            )
            .addCase(deleteFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    updateFileEdit,
    updateFileArchive,
    updateTagChange,
    updateRemoveTag,
    updateSave,
    updateFilename,
    updateSaveClick,
    openModal,
    closeModal,
    resetSelectedTags,
} = fileSlice.actions;

export default fileSlice.reducer;
