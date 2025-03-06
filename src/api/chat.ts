import { getErrorMessage } from "../utils/errorHandler";
import { ChatSession, ChatSessionResponse, LLMModel, NewChatPayload } from "../redux/types/chat";
import axiosInstance from "@/utils/axios";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getChatSessionsAPI = async (): Promise<ChatSessionResponse> => {
    try {
        const response = await axiosInstance.get<ChatSessionResponse>(
            "/chats/api/conversations/",
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// Create a conversation with optional title
export const createConversationAPI = async () => {
    try {
        const response = await axiosInstance.post(
            "/chats/api/conversations/",
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// Get chat session details
export const getChatSessionAPI = async (sessionId: string) => {
    try {
        const response = await axiosInstance.get(
            `/chats/api/conversations/${sessionId}/`,
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// Update chat session (e.g., to change title)
export const updateChatSessionAPI = async (
    sessionId: string,
    updates: Partial<ChatSession>
) => {
    try {
        const response = await axiosInstance.patch(
            `/chats/api/conversations/${sessionId}/`,
            updates,
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// Delete/archive a chat session
export const deleteChatSessionAPI = async (sessionId: string) => {
    try {
        await axiosInstance.delete(`/chats/api/conversations/${sessionId}/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                Accept: "application/json",
            },
        });
        return sessionId;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// Get messages for a specific conversation
export const getMessagesAPI = async (conversationId: string) => {
    try {
        const response = await axiosInstance.get(
            `/chats/api/messages/?conversation=${conversationId}`,
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getModelsAPI = async (): Promise<LLMModel[]> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Authentication token is missing.");
    }

    try {
        const response = await axiosInstance.get("/chats/api/llms/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error in getModelsAPI:", error);
        throw error;
    }
};
