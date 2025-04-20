import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  uploadFileAPI,
  deleteFileAPI,
  getFilesAPI,
  checkJobStatusesAPI,
} from '../../api/files'
import { MyFile } from '../types/files'

const BATCH_SIZE = 5

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
  async ({ files, tags }: { files: File[]; tags: number[] }, thunkAPI) => {
    try {
      const batches: File[][] = []
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        batches.push(files.slice(i, i + BATCH_SIZE))
      }

      const responses: MyFile[] = []
      for (const batch of batches) {
        const formData = new FormData()
        batch.forEach((file) => {
          formData.append('files', file)
          formData.append('names', file.name)
        })
        if (tags && tags.length > 0) {
          formData.append('tags', JSON.stringify(tags))
        }
        const response = await uploadFileAPI(formData)
        response.forEach((file) => {
          responses.push(file)
        })
      }

      return responses
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
