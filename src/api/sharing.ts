import {
  ShareableEntityType,
  ShareRecipient,
  ShareRequest,
  ShareResponse,
  ShareWithGroupRequest,
  SharedItem,
} from '../redux/types/sharing'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export const shareItemAPI = async (
  data: ShareRequest
): Promise<ShareResponse> => {
  return await baseRequest<ShareResponse>({
    url: 'api/sharing/',
    method: METHOD.POST,
    data,
  })
}

export const getSharedWithMeAPI = async (
  type?: ShareableEntityType
): Promise<{ results: SharedItem[] }> => {
  const params = type ? `?type=${type}` : ''
  return await baseRequest<{ results: SharedItem[] }>({
    url: `api/sharing/shared-with-me/${params}`,
    method: METHOD.GET,
  })
}

export const getSharedByMeAPI = async (
  type?: ShareableEntityType
): Promise<{ results: SharedItem[] }> => {
  const params = type ? `?type=${type}` : ''
  return await baseRequest<{ results: SharedItem[] }>({
    url: `api/sharing/shared-by-me/${params}`,
    method: METHOD.GET,
  })
}

export const getRecipientsAPI = async (
  type: ShareableEntityType,
  objectId: string | number
): Promise<{ results: ShareRecipient[] }> => {
  return await baseRequest<{ results: ShareRecipient[] }>({
    url: `api/sharing/recipients/?type=${type}&object_id=${objectId}`,
    method: METHOD.GET,
  })
}

export const revokeShareAPI = async (shareId: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/sharing/${shareId}/`,
    method: METHOD.DELETE,
  })
}

export const shareWithAccessCodeGroupAPI = async (
  data: ShareWithGroupRequest
): Promise<ShareRecipient> => {
  return await baseRequest<ShareRecipient>({
    url: 'api/sharing/share-with-group/',
    method: METHOD.POST,
    data: {
      contentType: data.contentType,
      objectId: data.objectId,
      message: data.message,
    },
  })
}
