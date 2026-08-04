/**
 * Quillmark API module
 *
 * Fetches the CMU document templates (quills) exposed by the
 * quillmark MCP server.
 */

import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

export interface Quill {
  name: string
  version: string
  description: string
}

export interface GetQuillmarkQuillsResponse {
  quills: Quill[]
}

/**
 * Get all available quillmark document templates
 */
export const getQuillmarkQuillsAPI =
  async (): Promise<GetQuillmarkQuillsResponse> => {
    return await baseRequest<GetQuillmarkQuillsResponse>({
      url: 'mcp/api/quillmark/quills/',
      method: METHOD.GET,
    })
  }
