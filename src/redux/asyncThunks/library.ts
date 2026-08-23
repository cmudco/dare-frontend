import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getSharedLibrariesAPI,
  addLibraryAPI,
  removeLibraryAPI,
} from '../../api/library'

export const getSharedLibraries = createAsyncThunk(
  'library/getSharedLibraries',
  async (_, thunkAPI) => {
    try {
      return await getSharedLibrariesAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const addLibrary = createAsyncThunk(
  'library/addLibrary',
  async (id: number, thunkAPI) => {
    try {
      await addLibraryAPI(id)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const removeLibrary = createAsyncThunk(
  'library/removeLibrary',
  async (id: number, thunkAPI) => {
    try {
      await removeLibraryAPI(id)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
