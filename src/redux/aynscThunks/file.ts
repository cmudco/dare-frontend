import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchFiles, uploadFile, deleteFileAPI } from "../../api/files";

export const getFiles = createAsyncThunk(
    "files/getFiles",
    async (_, thunkAPI) => {
        try {
            const response = await fetchFiles();
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const uploadNewFile = createAsyncThunk(
    "files/uploadNewFile",
    async (
        { files, name, tags }: { files: File[]; name: string; tags: string[] },
        thunkAPI
    ) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("file", file));
        formData.append("name", name);
        formData.append("tags", JSON.stringify(tags));

        try {
            const response = await uploadFile(formData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const deleteFile = createAsyncThunk(
    "files/archiveFile",
    async (id: number, thunkAPI) => {
        try {
            const response = await deleteFileAPI(id);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
