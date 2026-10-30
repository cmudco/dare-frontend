export interface AccessRequestInput {
  name: string
  email: string
  reason: string
}

export interface AccessRequestResponse {
  detail: string
}

export interface AccessRequestState {
  requestId: string | null
  loading: boolean
  error: string | null
  response: AccessRequestResponse | null
}
