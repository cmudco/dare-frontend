import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  uploadFileAPI,
  deleteFileAPI,
  deleteMultipleFilesAPI,
  getFilesAPI,
  checkJobStatusesAPI,
  getFoldersAPI,
  createFolderAPI,
  deleteFolderAPI,
  updateFolderAPI,
  moveFilesToFolderAPI,
  removeFileFromFolderAPI,
  uploadFolderAPI,
  updateFileTagsAPI,
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

export const updateFileTags = createAsyncThunk(
  'files/updateFileTags',
  async (
    { fileId, tagIds }: { fileId: number; tagIds: number[] },
    thunkAPI
  ) => {
    try {
      const response = await updateFileTagsAPI(fileId, tagIds)
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

export const deleteMultipleFiles = createAsyncThunk(
  'files/deleteMultipleFiles',
  async (fileIds: number[], thunkAPI) => {
    try {
      await deleteMultipleFilesAPI(fileIds)
      return fileIds
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

export const getFolders = createAsyncThunk(
  'files/getFolders',
  async (_, thunkAPI) => {
    try {
      const response = await getFoldersAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const createFolder = createAsyncThunk(
  'files/createFolder',
  async (name: string, thunkAPI) => {
    try {
      const response = await createFolderAPI(name)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const deleteFolder = createAsyncThunk(
  'files/deleteFolder',
  async (id: number, thunkAPI) => {
    try {
      await deleteFolderAPI(id)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const updateFolder = createAsyncThunk(
  'files/updateFolder',
  async ({ id, name }: { id: number; name: string }, thunkAPI) => {
    try {
      const response = await updateFolderAPI(id, name)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const moveFilesToFolder = createAsyncThunk(
  'files/moveFilesToFolder',
  async (
    { fileIds, folderId }: { fileIds: number[]; folderId: number },
    thunkAPI
  ) => {
    try {
      await moveFilesToFolderAPI(fileIds, folderId)
      return { fileIds, folderId }
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const removeFileFromFolder = createAsyncThunk(
  'files/removeFileFromFolder',
  async (
    { fileId, folderId }: { fileId: number; folderId: number },
    thunkAPI
  ) => {
    try {
      await removeFileFromFolderAPI(fileId, folderId)
      return { fileId, folderId }
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const uploadFolder = createAsyncThunk(
  'files/uploadFolder',
  async (
    { files, folderName }: { files: File[]; folderName: string },
    thunkAPI
  ) => {
    try {
      const formData = new FormData()

      files.forEach((file) => {
        formData.append('files', file)
        const relativePath = file.webkitRelativePath || file.name
        const fileName = relativePath.split('/').pop() || file.name
        formData.append('names', fileName)
      })

      formData.append('name', folderName)

      const folder = await uploadFolderAPI(formData)

      return folder
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
