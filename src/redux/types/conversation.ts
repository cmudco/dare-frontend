import { SenderType } from "@/utils/constants/conversation";
import { MyFile } from "./files";

export interface Conversation {
    conversationId: string;
    title?: string;
    createdAt: string;
    user?: string;
}
export interface Message {
    id: string;
    message: string;
    senderType: SenderType;
    senderName: string;
    isSender: boolean;
    date: string;
    files?: MyFile[];
    modelId?: number;
    streaming?: boolean;
}

export interface LLMModel {
    id: number;
    name: string;
    identifier?: string;
    description: string | null;
}

export interface ConversationState {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    activeConversationMessages: Message[];
    selectedModel: number | null;
    selectedFiles: MyFile[];
    showDropdown: boolean;
    hoveredModel: string | null;
    conversationInput: string;
    availableModels: LLMModel[]
}

export interface ConversationResponse {
    results: Conversation[];
}
