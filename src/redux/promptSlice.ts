import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/prompt";
import { fetchPrompts } from "./aynscThunks/prompt";
import { Prompt } from "./types/prompt";

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setPrompts(state, action: PayloadAction<Prompt[]>) {
      state.prompts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action: PayloadAction<Prompt[]>) => {
        state.loading = false;
        state.prompts = action.payload;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPrompts } = promptSlice.actions;
export default promptSlice.reducer;
