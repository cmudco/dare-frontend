import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import { getErrorMessage } from '@/utils/errorHandler'
import { METHOD } from '../constants/requests'
import { tokenExpirationService } from '@/services/tokenExpirationService'
import { config } from '@/config/environment'

const BASE_URL = config.apiUrl

interface BaseRequestParams {
  url: string
  method?: METHOD
  data?: object | FormData
  headers?: Record<string, string>
  params?: Record<string, unknown>
  includeAuthToken?: boolean
  responseType?: 'json' | 'blob'
}

interface BlobResponse {
  blob: Blob
  filename: string
}

// Overload signatures for different response types
export function baseRequest<T>(
  params: BaseRequestParams & { responseType?: 'json' }
): Promise<T>
export function baseRequest(
  params: BaseRequestParams & { responseType: 'blob' }
): Promise<BlobResponse>

export async function baseRequest<T>({
  url,
  method = METHOD.GET,
  data,
  headers = {},
  params,
  includeAuthToken = true,
  responseType = 'json',
}: BaseRequestParams): Promise<T | BlobResponse> {
  const axiosOptions: AxiosRequestConfig = {
    url: `${BASE_URL}/${url}`,
    method,
    headers,
    params,
    data,
    responseType: responseType === 'blob' ? 'blob' : 'json',
  }

  if (includeAuthToken) {
    try {
      const authToken = localStorage.getItem('token')
      if (authToken) {
        axiosOptions.headers = {
          ...axiosOptions.headers,
          Authorization: `Bearer ${authToken}`,
        }
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error)
      throw new Error('Authentication error')
    }
  }

  try {
    const response: AxiosResponse = await axios(axiosOptions)

    if (responseType === 'blob') {
      const contentDisposition = response.headers['content-disposition']
      let filename = ''
      if (contentDisposition) {
        const encodedFilenameMatch = contentDisposition.match(
          /filename\*=UTF-8''([^;]+)/i
        )
        const quotedFilenameMatch =
          contentDisposition.match(/filename="([^"]+)"/i)
        const plainFilenameMatch = contentDisposition.match(/filename=([^;]+)/i)

        if (encodedFilenameMatch?.[1]) {
          filename = decodeURIComponent(encodedFilenameMatch[1])
        } else if (quotedFilenameMatch?.[1]) {
          filename = quotedFilenameMatch[1]
        } else if (plainFilenameMatch?.[1]) {
          filename = plainFilenameMatch[1].trim()
        }
      }

      return { blob: response.data, filename } as BlobResponse
    }

    return response.data as T
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      if (includeAuthToken && tokenExpirationService.isCurrentlyMonitoring()) {
        tokenExpirationService.handleTokenExpiration()
      }
    }

    const errorMessage = getErrorMessage(error)
    throw new Error(errorMessage)
  }
}
