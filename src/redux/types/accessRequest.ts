export interface AccessRequestInput {
  name: string
  email: string
  reason: string
}

export interface AccessRequestResponse {
  detail: string
}

export interface SignupOptions {
  approvalSignupEnabled: boolean
}

export interface AccessRequestState {
  options: SignupOptions | null
  optionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  optionsRequestId: string | null
  requestId: string | null
  loading: boolean
  error: string | null
  response: AccessRequestResponse | null
}
