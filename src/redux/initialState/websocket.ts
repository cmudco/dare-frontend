import { WebSocketState } from '../types/websocket'

export const initialState: WebSocketState = {
  isConnected: false,
  error: null,
  creditError: null,
}
