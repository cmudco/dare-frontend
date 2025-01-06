import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearChat, updateMessage } from '../chatSlice';
import { ChatMessage } from '../types/chat';
import { AppDispatch, RootState } from '../store';
import { setConnectionStatus } from '../websocketSlice';
import { handleDataHistory,  } from '../../services/socketService';


let socket: WebSocket | null = null;
let partialBuffer = '';
let currentMessageId: string | null = null;

export const connectWebSocket = createAsyncThunk<void, { apiKey: string; sessionId: string; jwtKey: string }, { dispatch: AppDispatch; state: RootState }>(
  'websocket/connect',
  async ({ apiKey, sessionId, jwtKey }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      dispatch(clearChat());
      partialBuffer = '';
      currentMessageId = Date.now().toString();

      const socketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}/?api_key=${encodeURIComponent(apiKey)}&session_id=${sessionId}&jwt_key=${encodeURIComponent(jwtKey)}`;
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        resolve();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        try {
          handleDataHistory(data, dispatch);

          if (data.title || data.partial_response) {
            const messageId = currentMessageId || Date.now().toString();


            if (data.title) {
              if (partialBuffer == '') {
                return;
              }
              dispatch(updateMessage({
                id: messageId,
                message: partialBuffer,
                isSender: false,
                date: new Date().toISOString(),
                streaming: false
              }));
              partialBuffer = '';
              currentMessageId = null;
              return;
            }
            currentMessageId = messageId;
            partialBuffer += data.partial_response;

            dispatch(updateMessage({
              id: messageId,
              message: partialBuffer,
              isSender: false,
              date: new Date().toISOString(),
              streaming: true
            }));

            return;
          }

          if (data.error) {
            console.error('WebSocket error:', data.error);
            if (currentMessageId) {
              dispatch(updateMessage({
                id: currentMessageId,
                message: partialBuffer || "An error occurred while processing your request",
                isSender: false,
                date: new Date().toISOString(),
                streaming: false
              }));
            }
            partialBuffer = '';
            currentMessageId = null;
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