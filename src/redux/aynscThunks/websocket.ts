import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearChat, updateMessage, addMessage } from "../chatSlice";
import { ChatMessage } from "../types/chat";
import { AppDispatch, RootState } from "../store";
import { setConnectionStatus } from "../websocketSlice";
import { handleChatHistory } from "../../services/socketService";
import { WEBSOCKET_URL } from "../../api/config";

let socket: WebSocket | null = null;
let partialBuffer = "";

export const connectWebSocket = createAsyncThunk<
    void,
    { sessionId: string; jwtKey: string },
    { dispatch: AppDispatch; state: RootState }
>("websocket/connect", async ({ sessionId, jwtKey }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
        dispatch(clearChat());
        partialBuffer = "";

        // WebSocket URL for chat session
        const socketUrl = `${WEBSOCKET_URL}/chats/${sessionId}/?jwt_key=${encodeURIComponent(
            jwtKey
        )}`;

        // Close existing socket if one exists
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
        }

        socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            dispatch(setConnectionStatus(true));
            console.log("WebSocket connected:", socketUrl);
            resolve();
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket received:", data);
        
            try {
                // ✅ Handle chat history
                if (data.chat_history) {
                    handleChatHistory(data.chat_history, dispatch);
                    return;
                }
        
                const messageId = data.id;
                if (!messageId) return; // ✅ Ignore messages without IDs
        
                if (data.partial_response !== undefined) {
                    partialBuffer += data.partial_response;
        
                    dispatch(updateMessage({
                        id: messageId,       // Use message_id to identify the correct message
                        message: partialBuffer,  // Append the new chunk to the existing message
                        streaming: true,      // Mark the message as streaming
                        date: new Date().toISOString(),
                        isSender: data.is_sender,
                    }));
                    return;
                }
        
                if (data.message) {
                    dispatch(updateMessage({
                        id: messageId,
                        message: data.message,  // Full message after streaming
                        sender_name: data.sender || "AI Assistant", // Sender's name
                        streaming: false,     // Mark as not streaming anymore
                        date: data.timestamp || new Date().toISOString(),
                        isSender: data.is_sender,
                    }));
                    partialBuffer = "";

                    return;
                }
            } catch (err) {
                console.error("Error processing WebSocket message:", err);
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
    ChatMessage,
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
