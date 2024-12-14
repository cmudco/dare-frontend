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
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { selectedTags, selectedFile, filename } = state.files;

    if (!selectedFile) {
      return thunkAPI.rejectWithValue("No file selected");
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tags', JSON.stringify(selectedTags));
    formData.append('filename', filename);

    try {
      const response = await uploadFile(formData);
      return response;
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
