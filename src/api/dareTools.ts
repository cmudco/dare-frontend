/**
 * DARE Tools API module
 */

import { DareTool, DareToolExecution } from '@/redux/types/dareTools'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

/**
 * Paginated response from DRF
 */
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Get all available DARE tools
 */
export const getDareToolsAPI = async (): Promise<DareTool[]> => {
  const response = await baseRequest<PaginatedResponse<DareTool>>({
    url: 'dare/api/tools/',
    method: METHOD.GET,
  })
  return response.results
}

/**
 * Get DARE tool execution history
 */
export const getDareToolExecutionsAPI = async (params?: {
  tool?: string
  status?: string
}): Promise<DareToolExecution[]> => {
  const searchParams = new URLSearchParams()
  if (params?.tool) searchParams.append('tool', params.tool)
  if (params?.status) searchParams.append('status', params.status)

  const queryString = searchParams.toString()
  const response = await baseRequest<PaginatedResponse<DareToolExecution>>({
    url: `dare/api/executions/${queryString ? `?${queryString}` : ''}`,
    method: METHOD.GET,
  })
  return response.results
}
