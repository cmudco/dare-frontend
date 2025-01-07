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
  async ({ file }: { file: File }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { selectedTags, filename } = state.files;

    const formData = new FormData();
    formData.append("file", file); 
    formData.append("directory", selectedTags.join("/"));
    formData.append("filename", filename);

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