import { createAsyncThunk } from '@reduxjs/toolkit';
import { addMessage } from '../chatSlice';
import { ChatMessage } from '../types/chat';
import { AppDispatch, RootState } from '../store';
import { setConnectionStatus } from '../websocketSlice';

let socket: WebSocket | null = null;

export const connectWebSocket = createAsyncThunk<void, { apiKey: string; sessionId: string }, { dispatch: AppDispatch; state: RootState }>(
  'websocket/connect',
  async ({ apiKey, sessionId }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      const socketUrl = `ws://localhost:8000/ws/claude/?api_key=${encodeURIComponent(apiKey)}&session_id=${sessionId}`;

      console.log('Connecting to WebSocket:', socketUrl);
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        resolve();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.partial_response || data.response) {
          const message: ChatMessage = {
            message: data.partial_response || data.response,
            isSender: false,
            date: new Date().toISOString(),
          };
          dispatch(addMessage(message));
        }
      };

      socket.onerror = () => {
        reject(new Error('WebSocket error'));
      };

      socket.onclose = () => {
        dispatch(setConnectionStatus(false));
      };
    });
  }
);

export const sendWebSocketMessage = createAsyncThunk<void, ChatMessage, { dispatch: AppDispatch; state: RootState }>(
  'websocket/sendMessage',
  async (message, { rejectWithValue }) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      return rejectWithValue('WebSocket is not connected');
    }
  }
);

export const disconnectWebSocket = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'websocket/disconnect',
  async (_, { dispatch }) => {
    if (socket) {
      socket.close();
      socket = null;
      dispatch(setConnectionStatus(false));
    }
  }
);