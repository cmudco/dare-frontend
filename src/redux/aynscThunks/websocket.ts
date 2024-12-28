import { createAsyncThunk } from '@reduxjs/toolkit';
import { addMessage, clearChat } from '../chatSlice';
import { ChatMessage } from '../types/chat';
import { AppDispatch, RootState } from '../store';
import { setConnectionStatus } from '../websocketSlice';

let socket: WebSocket | null = null;
let partialBuffer = '';
let currentMessageId: string | null = null;

export const connectWebSocket = createAsyncThunk<void, { apiKey: string; sessionId: string; jwtKey: string }, { dispatch: AppDispatch; state: RootState }>(
  'websocket/connect',
  async ({ apiKey, sessionId, jwtKey }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      // Clear existing chat before connecting
      dispatch(clearChat());
      partialBuffer = '';
      currentMessageId = null;

      const socketUrl = `ws://localhost:8000/ws/claude/?api_key=${encodeURIComponent(apiKey)}&session_id=${sessionId}&jwt_key=${encodeURIComponent(jwtKey)}`;
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        resolve();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.history) {
          data.history.forEach((msg: { user_message: string; bot_response: string }) => {
            const baseTimestamp = Date.now();

            if (msg.user_message?.trim()) {
              dispatch(addMessage({
                id: baseTimestamp.toString(),
                message: msg.user_message,
                isSender: true,
                date: new Date(baseTimestamp).toISOString(),
              }));
            }

            if (msg.bot_response?.trim()) {
              dispatch(addMessage({
                id: (baseTimestamp + 1).toString(),
                message: msg.bot_response,
                isSender: false,
                date: new Date(baseTimestamp + 1).toISOString(),
              }));
            }
          });
          return;
        }

        // Handle real-time messages
        if (data.error) {
          const errorMessage: ChatMessage = {
            id: currentMessageId || Date.now().toString(),
            message: partialBuffer || "An error occurred while processing your request",
            isSender: false,
            date: new Date().toISOString(),
          };
          dispatch(addMessage(errorMessage));
          partialBuffer = '';
          currentMessageId = null;
          return;
        }

        if (data.partial_response) {
          partialBuffer += data.partial_response;
        }

        // Check if this is the last message in stream
        if (data.partial_response && data.partial_response.endsWith('!')) {
          const finalMessage: ChatMessage = {
            id: currentMessageId || Date.now().toString(),
            message: partialBuffer,
            isSender: false,
            date: new Date().toISOString(),
          };
          dispatch(addMessage(finalMessage));
          partialBuffer = '';
          currentMessageId = null;
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
      socket.send(JSON.stringify({
        prompt: message.message,
      }));
    } else {
      return rejectWithValue('WebSocket is not connected');
    }
  }
);

export const disconnectWebSocket = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'websocket/disconnect',
  async (_, { dispatch }) => {
    return new Promise<void>((resolve) => {
      if (socket) {
        socket.onclose = () => {
          socket = null;
          dispatch(setConnectionStatus(false));
          partialBuffer = ''; // clear buffer on disconnect
          resolve();
        };
        socket.close();
      } else {
        resolve();
      }
    });
  }
);