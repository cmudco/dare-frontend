import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearChat } from '../chatSlice';
import { ChatMessage } from '../types/chat';
import { AppDispatch, RootState } from '../store';
import { setConnectionStatus } from '../websocketSlice';
import { handleDataConditions, handleDataHistory, handleError } from '../../services/socketService';


let socket: WebSocket | null = null;

export const connectWebSocket = createAsyncThunk<void, { apiKey: string; sessionId: string; jwtKey: string }, { dispatch: AppDispatch; state: RootState }>(
  'websocket/connect',
  async ({ apiKey, sessionId, jwtKey }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      dispatch(clearChat());

      const socketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}/?api_key=${encodeURIComponent(apiKey)}&session_id=${sessionId}&jwt_key=${encodeURIComponent(jwtKey)}`;
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        resolve();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        try {
          handleDataHistory(data, dispatch);
          handleDataConditions(data, dispatch);

          if (data.error) {
            handleError(data, dispatch);
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
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
  async (message, { rejectWithValue, getState }) => {
    const state = getState();
    const file_paths = state.chat.selectedFiles
      .map((msg) => msg.file_name);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        prompt: message.message,
        file_paths: file_paths,
        use_rag: file_paths.length >= 1
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
          resolve();
        };
        socket.close();
      } else {
        resolve();
      }
    });
  }
);