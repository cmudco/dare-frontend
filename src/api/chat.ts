import { getErrorMessage } from "../utils/errorHandler";
import { ChatSession, ChatSessionResponse, LLMModel, } from "../redux/types/chat";
import axiosInstance from "@/utils/axios";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getConversationsAPI = async (): Promise<ChatSessionResponse> => {
    try {
        const response = await axiosInstance.get<ChatSessionResponse>(
            "/api/conversations/",
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
            "/api/conversations/",
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
export const getChatSessionAPI = async (conversationId: string) => {
    try {
        const response = await axiosInstance.get(
            `/api/conversations/${conversationId}/`,
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
    conversationId: string,
    updates: Partial<ChatSession>
) => {
    try {
        const response = await axiosInstance.patch(
            `/api/conversations/${conversationId}/`,
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
export const deleteChatSessionAPI = async (conversationId: string) => {
    try {
        await axiosInstance.delete(`/api/conversations/${conversationId}/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                Accept: "application/json",
            },
        });
        return conversationId;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// Get messages for a specific conversation
export const getMessagesAPI = async (conversationId: string) => {
    try {
        const response = await axiosInstance.get(
            `/api/messages/?conversation=${conversationId}`,
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
        const response = await axiosInstance.get("/api/llms/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.results;
    } catch (error) {
        console.error("Error in getModelsAPI:", error);
        throw error;
    }
};
