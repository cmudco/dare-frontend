import { createAsyncThunk } from "@reduxjs/toolkit";
import { createTag, updateTag, deleteTag, getTagsAPI } from "../../api/tags";
import { Tag } from "../types/tags";

export const getTags = createAsyncThunk("tags/getTags", async (_, thunkAPI) => {
        try {
            const response = await getTagsAPI();
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const addTag = createAsyncThunk(
    "tags/addTag",
    async (label: string, thunkAPI) => {
        try {
            const response = await createTag(label);
            return response || [];
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const editTag = createAsyncThunk(
    "tags/editTag",
    async (tagData: Tag, thunkAPI) => {
        try {
            const response = await updateTag(tagData.id, tagData);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const removeTag = createAsyncThunk(
    "tags/removeTag",
    async (id: number, thunkAPI) => {
        try {
            await deleteTag(id);
            return { id };
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
