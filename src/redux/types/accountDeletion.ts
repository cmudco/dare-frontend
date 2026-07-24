export interface AccountDeletionResponse {
  detail: string
}

export interface AccountDeletionState {
  deleting: boolean
  deleted: boolean
  error: string | null
}
