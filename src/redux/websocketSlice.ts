import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/websocket'

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      if (action.payload) {
        state.error = null
        state.creditError = null
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setCreditError: (
      state,
      action: PayloadAction<{
        type: string
        message: string
        currentBalance: string
        requiredAmount: string
      } | null>
    ) => {
      state.creditError = action.payload
    },
    clearCreditError: (state) => {
      state.creditError = null
    },
  },
})

export const {
  setConnectionStatus,
  setError,
  clearError,
  setCreditError,
  clearCreditError,
} = websocketSlice.actions
export default websocketSlice.reducer
