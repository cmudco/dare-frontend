import axios, { AxiosError } from 'axios'

type ErrorResponse = {
  message?: string
  nonFieldErrors?: string[]
  [key: string]: string[] | string | undefined
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>

    if (axiosError.response?.data) {
      const errorData = axiosError.response.data

      // Handle workflow validation errors (camelCase from backend)
      if (
        errorData.validationErrors &&
        Array.isArray(errorData.validationErrors)
      ) {
        const errors = errorData.validationErrors as string[]
        if (errors.length === 1) {
          return errors[0]
        } else if (errors.length > 1) {
          return errors
            .map((err: string, i: number) => `${i + 1}. ${err}`)
            .join('\n')
        }
      }

      if (errorData.message) {
        return errorData.message
      }

      if (errorData.error) {
        return errorData.error as string
      }

      if (errorData.nonFieldErrors && errorData.nonFieldErrors.length > 0) {
        return errorData.nonFieldErrors.join('. ')
      }

      for (const key in errorData) {
        if (Array.isArray(errorData[key])) {
          const errorArray = errorData[key] as string[]
          if (errorArray.length > 0) {
            return errorArray.join('. ')
          }
        }
      }
    }

    return axiosError.message || 'An unexpected error occurred'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}
