import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialTagState } from "./initialState/tags";
import { Tag } from "./types/tags";
import { addTag, editTag, getTags, removeTag } from "./aynscThunks/tag";

const tagSlice = createSlice({
    name: "tags",
    initialState: initialTagState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getTags.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTags.fulfilled, (state, action) => {
                state.loading = false;
                state.tags = action.payload.results as Tag[];
            })
            .addCase(getTags.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addTag.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addTag.fulfilled, (state, action: PayloadAction<Tag>) => {
                state.loading = false;
                state.tags.push(action.payload);
            })
            .addCase(addTag.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(editTag.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editTag.fulfilled, (state, action: PayloadAction<Tag>) => {
                state.loading = false;
                state.tags = state.tags.map((tag) =>
                    tag.id === action.payload.id ? action.payload : tag
                );
            })
            .addCase(editTag.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(removeTag.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                removeTag.fulfilled,
                (state, action: PayloadAction<{ id: number }>) => {
                    state.loading = false;
                    state.tags = state.tags.filter(
                        (tag) => tag.id !== action.payload.id
                    );
                }
            )
            .addCase(removeTag.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default tagSlice.reducer;
