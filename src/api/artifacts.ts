import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type {
  ArtifactListResponse,
  ArtifactDetailResponse,
  ArtifactStatus,
} from '@/redux/types/artifact'

export interface ArtifactStatusResponse {
  id: number
  status: ArtifactStatus
  currentSection: number
  estimatedSections: number
}

/**
 * Get all artifacts for a conversation
 */
export const getArtifactsAPI = async (
  conversationId: string
): Promise<ArtifactListResponse> => {
  return await baseRequest<ArtifactListResponse>({
    url: `api/conversations/${conversationId}/artifacts/`,
    method: METHOD.GET,
  })
}

/**
 * Get specific artifact with full content
 */
export const getArtifactAPI = async (
  conversationId: string,
  artifactId: number | string
): Promise<ArtifactDetailResponse> => {
  return await baseRequest<ArtifactDetailResponse>({
    url: `api/conversations/${conversationId}/artifacts/${artifactId}/`,
    method: METHOD.GET,
  })
}

/**
 * Get checkpoints for an artifact
 */
export const getArtifactCheckpointsAPI = async (
  artifactId: number | string
): Promise<{
  results: Array<{
    id: number
    contentSnapshot: string
    currentSection: number
    createdAt: string
  }>
}> => {
  return await baseRequest({
    url: `api/artifacts/${artifactId}/checkpoints/`,
    method: METHOD.GET,
  })
}

/**
 * Delete an artifact
 */
export const deleteArtifactAPI = async (
  conversationId: string,
  artifactId: number | string
): Promise<void> => {
  await baseRequest<void>({
    url: `api/conversations/${conversationId}/artifacts/${artifactId}/`,
    method: METHOD.DELETE,
  })
}

/**
 * Update artifact status via REST API
 * Used for pause/resume when WebSocket is blocked by streaming
 */
export const updateArtifactStatusAPI = async (
  artifactId: number | string,
  status: ArtifactStatus
): Promise<ArtifactStatusResponse> => {
  return await baseRequest<ArtifactStatusResponse>({
    url: `api/artifacts/${artifactId}/status/`,
    method: METHOD.PATCH,
    data: { status },
  })
}
