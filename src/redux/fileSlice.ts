import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFiles, archiveFile, uploadNewFile } from "./aynscThunks/file";
import { initialState } from "./initialState/files";

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    updateFileEdit: (state, action: PayloadAction<{ id: number; filename: string; tags: string[] }>) => {
      const { id, filename, tags } = action.payload;
      state.files = state.files.map((file) =>
        file.id === id ? { ...file, file: filename, tags } : file
      );
    },
    updateFileArchive: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.files = state.files.filter((file) => file.id !== id);
    },
    updateTagChange: (state, action: PayloadAction<string>) => {
      const tag = action.payload;
      state.selectedTags = state.selectedTags.includes(tag)
        ? state.selectedTags
        : [...state.selectedTags, tag];
    },
    updateRemoveTag: (state, action: PayloadAction<string>) => {
      const tag = action.payload;
      state.selectedTags = state.selectedTags.filter((t) => t !== tag);
    },
    updateSave: (state, action: PayloadAction<{ filename: string; tags: string[] }>) => {
      const { filename, tags } = action.payload;
      state.files = state.files.map((file) =>
        file.file === filename ? { ...file, tags } : file
      );
    },
    updateFilename: (state, action: PayloadAction<string>) => {
      state.filename = action.payload;
    },
    // updateFileObject: (state, action: PayloadAction<File>) => {
    //   console.log(action.payload);

    //   state.selectedFile = action.payload;
    // },
    updateSaveClick: (state, action: PayloadAction<{ filename: string; tags: string[] }>) => {
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
        state.files = action.payload;
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadNewFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadNewFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.push(action.payload);
      })
      .addCase(uploadNewFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(archiveFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveFile.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
        state.loading = false;
        state.files = state.files.filter(file => file.id !== action.payload.id);
      })
      .addCase(archiveFile.rejected, (state, action) => {
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
  // updateFileObject
} = fileSlice.actions;

export default fileSlice.reducer;
