import { MyFile } from "./files";

export interface ChatSession {
    conversationId: string;
    title?: string;
    createdAt: string;
    user?: string;
}
export interface ChatMessage {
    id: string;
    message: string;
    senderType: number;
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

export interface ChatState {
    sessions: ChatSession[];
    activeChat: ChatSession | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    activeChatMessages: ChatMessage[];
    selectedModel: number | null;
    selectedFiles: MyFile[];
    showDropdown: boolean;
    hoveredModel: string | null;
    chatInput: string;
    availableModels: LLMModel[]
}

export interface ChatSessionResponse {
    results: ChatSession[];
}
