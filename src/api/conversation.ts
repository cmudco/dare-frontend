import { getErrorMessage } from "../utils/errorHandler";
import { Conversation, ConversationResponse, LLMModel, } from "../redux/types/conversation";
import axiosInstance from "@/utils/axios";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getConversationsAPI = async (): Promise<ConversationResponse> => {
    try {
        const response = await axiosInstance.get<ConversationResponse>(
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

export const getConversationAPI = async (conversationId: string) => {
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

export const updateConversationAPI = async (
    conversationId: string,
    updates: Partial<Conversation>
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

export const deleteConversationAPI = async (conversationId: string) => {
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
