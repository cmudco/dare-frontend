import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchFiles, uploadFile, archiveFileAPI } from "../../api/files";
import { RootState } from "../store";

export const getFiles = createAsyncThunk("files/getFiles", async (_, thunkAPI) => {
  try {
    const response = await fetchFiles();
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

export const uploadNewFile = createAsyncThunk(
  "files/uploadNewFile",
  async ({ files }: { files: File[] }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { selectedTags } = state.files;

    const formData = new FormData();
    files.forEach((file) => formData.append("files[]", file)); // Use 'files[]' as the key
    formData.append("directory", selectedTags.join("/")); // Set directory path from selectedTags

    try {
      const response = await uploadFile(formData); // API call
      return response.data; // Assuming response contains the uploaded file data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);


export const archiveFile = createAsyncThunk("files/archiveFile", async (id: number, thunkAPI) => {
  try {
    const response = await archiveFileAPI(id);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});