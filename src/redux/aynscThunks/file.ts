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
    const { selectedTags, filename } = state.files;
    const selectedFile = state.files.selectedFile;

    if (!selectedFile) {
      return thunkAPI.rejectWithValue("No file selected");
    }

    const formData = new FormData();
    formData.append('file', selectedFile); // Append the file directly
    formData.append('directory', selectedTags.join('/')); // Join tags with '/'
    formData.append('filename', filename);

    // Log the FormData content
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

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