import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  FileProcessingStage,
  FileProcessingJourneyResponse,
  FileStructure,
  MyFile,
  MyFolder,
} from '@/redux/types/files'
import { FileStatus } from '@/utils/constants/file'

export const getFilesAPI = async (): Promise<{ results: MyFile[] }> => {
  return await baseRequest<{ results: MyFile[] }>({
    url: 'api/files/',
    method: METHOD.GET,
  })
}

export const getFilesByOwnerAPI = async (
  ownerId: number
): Promise<{ results: MyFile[] }> => {
  return await baseRequest<{ results: MyFile[] }>({
    url: `api/files/by-owner/${ownerId}/`,
    method: METHOD.GET,
  })
}

export const uploadFileAPI = async (data: FormData): Promise<MyFile[]> => {
  return await baseRequest<MyFile[]>({
    url: 'api/files/',
    method: METHOD.POST,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const startFileOcrRunAPI = async (
  id: number,
  pageLimit: number
): Promise<MyFile> => {
  return await baseRequest<MyFile>({
    url: `api/files/${id}/approve-ocr/`,
    method: METHOD.POST,
    data: { pageLimit },
  })
}

/**
 * Fetch the parsed document model for a file.
 *
 * Pass `pageNo` to get only that page's elements — a long document has
 * hundreds, and the structure view only ever renders one page at a time.
 */
export const getFileStructureAPI = async (
  id: number,
  pageNo?: number | null
): Promise<FileStructure> => {
  return await baseRequest<FileStructure>({
    url: `api/files/${id}/structure/`,
    method: METHOD.GET,
    params: pageNo != null ? { page_no: pageNo } : undefined,
  })
}

export const getFileProcessingJourneyAPI = async (
  id: number
): Promise<FileProcessingJourneyResponse> => {
  return await baseRequest<FileProcessingJourneyResponse>({
    url: `api/files/${id}/processing-journey/`,
    method: METHOD.GET,
  })
}

/**
 * Render one element of a document as an image.
 *
 * `order` is the element's reading-order index from the structure endpoint;
 * the backend crops that region out of the original on demand.
 */
export const getElementImageAPI = async (
  id: number,
  order: number
): Promise<Blob> => {
  const { blob } = await baseRequest({
    url: `api/files/${id}/element-image/`,
    method: METHOD.GET,
    params: { order },
    responseType: 'blob',
  })
  return blob
}

export const deleteFileAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/files/${id}/`,
    method: METHOD.DELETE,
  })
}

export const deleteMultipleFilesAPI = async (
  fileIds: number[]
): Promise<void> => {
  await baseRequest<void>({
    url: 'api/files/bulk-delete/',
    method: METHOD.POST,
    data: { fileIds },
  })
}

export const checkJobStatusesAPI = async (
  fileIds: number[]
): Promise<
  {
    fileId: number
    status: string
    jobId?: string
    statusCode: FileStatus
    jobStatus: string
    processingStage?: FileProcessingStage
  }[]
> => {
  return await baseRequest<
    {
      fileId: number
      status: string
      jobId?: string
      statusCode: FileStatus
      jobStatus: string
      processingStage?: FileProcessingStage
    }[]
  >({
    url: 'api/files/job-statuses/',
    method: METHOD.POST,
    data: { fileIds },
  })
}

export const getFoldersAPI = async (): Promise<{ results: MyFolder[] }> => {
  return await baseRequest<{ results: MyFolder[] }>({
    url: 'api/folders/',
    method: METHOD.GET,
  })
}

export const createFolderAPI = async (name: string): Promise<MyFolder> => {
  return await baseRequest<MyFolder>({
    url: 'api/folders/',
    method: METHOD.POST,
    data: { name },
  })
}

export const deleteFolderAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/folders/${id}/`,
    method: METHOD.DELETE,
  })
}

export const updateFolderAPI = async (
  id: number,
  name: string
): Promise<MyFolder> => {
  return await baseRequest<MyFolder>({
    url: `api/folders/${id}/`,
    method: METHOD.PATCH,
    data: { name },
  })
}

export const moveFilesToFolderAPI = async (
  fileIds: number[],
  folderId: number
): Promise<void> => {
  await baseRequest<void>({
    url: 'api/files/move/',
    method: METHOD.POST,
    data: { fileIds, folderId },
  })
}

export const removeFileFromFolderAPI = async (
  fileId: number,
  folderId: number
): Promise<void> => {
  await baseRequest<void>({
    url: `api/folders/${folderId}/remove-files/`,
    method: METHOD.POST,
    data: { fileIds: [fileId] },
  })
}

export const updateFileTagsAPI = async (
  fileId: number,
  tagIds: number[]
): Promise<MyFile> => {
  return await baseRequest<MyFile>({
    url: `api/files/${fileId}/`,
    method: METHOD.PATCH,
    data: { tags: tagIds },
  })
}

export const uploadFolderAPI = async (data: FormData): Promise<MyFolder> => {
  return await baseRequest<MyFolder>({
    url: 'api/folders/',
    method: METHOD.POST,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getSharedFilesAPI = async (): Promise<{ results: MyFile[] }> => {
  return await baseRequest<{ results: MyFile[] }>({
    url: 'api/files/shared/',
    method: METHOD.GET,
  })
}

export const importSharedFileAPI = async (fileId: number): Promise<MyFile> => {
  return await baseRequest<MyFile>({
    url: `api/files/${fileId}/import/`,
    method: METHOD.POST,
  })
}

export const shareFileWithUserAPI = async (
  fileId: number,
  email: string
): Promise<void> => {
  await baseRequest<void>({
    url: `api/files/${fileId}/share/`,
    method: METHOD.POST,
    data: { email },
  })
}

export const togglePublicShareAPI = async (
  fileId: number,
  shareWithEveryone: boolean
): Promise<MyFile> => {
  return await baseRequest<MyFile>({
    url: `api/files/${fileId}/share-public/`,
    method: METHOD.PATCH,
    data: { shareWithEveryone },
  })
}

export interface FileShare {
  id: number
  email: string
  name: string
}

export const getFileSharesAPI = async (
  fileId: number
): Promise<{ shares: FileShare[] }> => {
  return await baseRequest<{ shares: FileShare[] }>({
    url: `api/files/${fileId}/shares/`,
    method: METHOD.GET,
  })
}

export const unshareFileAPI = async (
  fileId: number,
  email: string
): Promise<void> => {
  await baseRequest<void>({
    url: `api/files/${fileId}/share/`,
    method: METHOD.DELETE,
    data: { email },
  })
}
