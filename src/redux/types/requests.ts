export interface APIResponse<T> {
  success: boolean
  data: T | null
  error: {
    message: string
    statusCode?: number
  } | null
}
