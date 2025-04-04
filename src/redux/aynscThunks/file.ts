import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  uploadFileAPI,
  deleteFileAPI,
  getFilesAPI,
  checkJobStatusesAPI,
} from '../../api/files'

export const getFiles = createAsyncThunk(
  'files/getFiles',
  async (_, thunkAPI) => {
    try {
      const response = await getFilesAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const uploadNewFile = createAsyncThunk(
  'files/uploadNewFile',
  async (
    { files, name, tags }: { files: File[]; name: string; tags: number[] },
    thunkAPI
  ) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('file', file))
    formData.append('name', name)

    if (tags && tags.length > 0) {
      tags.forEach((tagId) => {
        formData.append('tags', tagId.toString())
      })
    }

    try {
      const response = await uploadFileAPI(formData)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const deleteFile = createAsyncThunk(
  'files/archiveFile',
  async (id: number, thunkAPI) => {
    try {
      await deleteFileAPI(id)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const checkJobStatuses = createAsyncThunk(
  'files/checkJobStatuses',
  async (fileIds: number[], thunkAPI) => {
    try {
      const response = await checkJobStatusesAPI(fileIds)
      return response.map((item) => ({
        fileId: item.fileId,
        status: item.statusCode,
        jobId: item.jobId,
        jobStatus: item.jobStatus,
      }))
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
