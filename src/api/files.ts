import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { MyFile } from '@/redux/types/files'
import { FileStatus } from '@/utils/constants/file'

export const getFilesAPI = async (): Promise<{ results: MyFile[] }> => {
  return await baseRequest<{ results: MyFile[] }>({
    url: 'api/files/',
    method: METHOD.GET,
  })
}

export const uploadFileAPI = async (data: FormData): Promise<MyFile> => {
  return await baseRequest<MyFile>({
    url: 'api/files/',
    method: METHOD.POST,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteFileAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/files/${id}/`,
    method: METHOD.DELETE,
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
