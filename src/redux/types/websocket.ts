export interface WebSocketState {
  isConnected: boolean
  error: string | null
  creditError?: {
    type: string
    message: string
    currentBalance: string
    requiredAmount: string
  } | null
}
