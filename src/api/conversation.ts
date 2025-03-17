import {
    Conversation,
    ConversationResponse,
    LLMModel,
} from "../redux/types/conversation";
import { baseRequest } from "@/utils/requests";
import { METHOD } from "@/utils/constants/requests";

export const getConversationsAPI = async (): Promise<ConversationResponse> => {
    return await baseRequest<ConversationResponse>({
        url: "api/conversations/",
        method: METHOD.GET,
    });
};

export const createConversationAPI = async () => {
    return await baseRequest<Conversation>({
        url: "api/conversations/",
        method: METHOD.POST,
    });
};

export const getConversationAPI = async (
    conversationId: string
): Promise<Conversation> => {
    return await baseRequest<Conversation>({
        url: `api/conversations/${conversationId}/`,
        method: METHOD.GET,
    });
};

export const updateConversationAPI = async (
    conversationId: string,
    updates: Partial<Conversation>
): Promise<Conversation> => {
    return await baseRequest<Conversation>({
        url: `api/conversations/${conversationId}/`,
        method: METHOD.PATCH,
        data: updates,
    });
};

export const deleteConversationAPI = async (
    conversationId: string
): Promise<void> => {
    await baseRequest<void>({
        url: `api/conversations/${conversationId}/`,
        method: METHOD.DELETE,
    });
};

export const getModelsAPI = async (): Promise<{ results: LLMModel[] }> => {
    return await baseRequest<{ results: LLMModel[] }>({
        url: "api/llms/",
        method: METHOD.GET,
    });
};
