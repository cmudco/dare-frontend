import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState/websocket';
import { connectWebSocket, sendWebSocketMessage } from './aynscThunks/websocket';


const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      // console.log('Setting connection status:', action.payload);
      state.isConnected = action.payload;
    },
    setWebSocketError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWebSocket.fulfilled, (state) => {
        // console.log("WebSocket connection established");
        state.isConnected = true;
        state.error = null;
      })
      .addCase(connectWebSocket.rejected, (state, action) => {
        state.isConnected = false;
        state.error = action.error.message || 'WebSocket connection failed';
      })
      .addCase(sendWebSocketMessage.rejected, (state, action) => {
        state.error = action.error.message || 'WebSocket send message failed';
      });
  },
});

export const { setConnectionStatus, setWebSocketError } = websocketSlice.actions;
export default websocketSlice.reducer;