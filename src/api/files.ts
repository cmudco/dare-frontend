import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { FileStructure, MyFile, MyFolder } from '@/redux/types/files'
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
  }[]
> => {
  return await baseRequest<
    {
      fileId: number
      status: string
      jobId?: string
      statusCode: FileStatus
      jobStatus: string
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
