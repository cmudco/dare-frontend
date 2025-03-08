import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearChat, updateMessage, addMessage, updateConversationTitle, updateConversationHistory } from "../chatSlice";
import { ChatMessage } from "../types/chat";
import { AppDispatch, RootState } from "../store";
import { setConnectionStatus } from "../websocketSlice";
import { WEBSOCKET_URL } from "../../api/config";

let socket: WebSocket | null = null;

export const connectWebSocket = createAsyncThunk<
    void,
    { conversationId: string; jwtKey: string },
    { dispatch: AppDispatch; state: RootState }
>("websocket/connect", async ({ conversationId, jwtKey }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
        dispatch(clearChat());

        const socketUrl = `${WEBSOCKET_URL}/conversations/${conversationId}/?jwt_key=${encodeURIComponent(
            jwtKey
        )}`;

        socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            dispatch(setConnectionStatus(true));
            console.log("WebSocket connected:", socketUrl);
            resolve();
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket received:", data);

            switch (data.type) {
                case "chat_history":
                    if (data.chatHistory) dispatch(updateConversationHistory(data.chatHistory));
                    break;

                case "message":
                    dispatch(addMessage(data as ChatMessage));
                    break;
                case "ai_stream":
                    dispatch(updateMessage(data as Partial<ChatMessage>));
                    break;

                case "conversation_title":
                    dispatch(updateConversationTitle(data.title));
                    break;

                default:
                    console.warn("Unknown WebSocket message type:", data.type);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            dispatch(setConnectionStatus(false));
            reject(new Error("WebSocket error"));
        };

        socket.onclose = (event) => {
            console.log("WebSocket closed:", event.code, event.reason);
            dispatch(setConnectionStatus(false));
        };
    });
});

export const sendWebSocketMessage = createAsyncThunk<
    void,
    Partial<ChatMessage>,
    { dispatch: AppDispatch; state: RootState }
>(
    "websocket/sendMessage",
    async (message, { rejectWithValue, getState, }) => {
        const state = getState();
        const fileIds = state.chat.selectedFiles.map((file) => file.id);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    message: message.message,
                    sender_type: 1,
                    file_ids: fileIds,
                })
            );
        } else {
            return rejectWithValue("WebSocket is not connected");
        }
    }
);

export const disconnectWebSocket = createAsyncThunk<
    void,
    void,
    { dispatch: AppDispatch }
>("websocket/disconnect", async (_, { dispatch }) => {
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
});
