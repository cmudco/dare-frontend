import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import { getErrorMessage } from '@/utils/errorHandler'
import { METHOD } from '../constants/requests'
import { tokenExpirationService } from '@/services/tokenExpirationService'

const BASE_URL = import.meta.env.VITE_DJANGO_BACKEND_URL

interface BaseRequestParams {
  url: string
  method?: METHOD
  data?: object | FormData
  headers?: Record<string, string>
  params?: Record<string, unknown>
  includeAuthToken?: boolean
}

export const baseRequest = async <T>({
  url,
  method = METHOD.GET,
  data,
  headers = {},
  params,
  includeAuthToken = true,
}: BaseRequestParams): Promise<T> => {
  const axiosOptions: AxiosRequestConfig = {
    url: `${BASE_URL}/${url}`,
    method,
    headers,
    params,
    data,
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
    const response = await axios(axiosOptions)
    return response.data
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
