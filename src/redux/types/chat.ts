import { MyFile } from "./files";

export interface ChatSession {
    sessionId: string;
    title?: string;
    createdAt: string;
    user?: string;
}
export interface ChatMessage {
    id: string;               // ✅ Unique message identifier
    message: string;          // ✅ Message content
    chat_session?: string;    // ✅ Associated chat session (optional)
    sender_type?: string;     // ✅ Type of sender (User or AI) (optional)
    sender_name?: string;     // ✅ Name of sender (optional)
    isSender?: boolean;        // ✅ True if message is from the user
    date: string;             // ✅ Timestamp of when the message was sent
    files?: MyFile[];         // ✅ Optional attached files
    partial?: boolean;        // ✅ Indicates partial message (optional)
    streaming?: boolean;      // ✅ Indicates message is still streaming
    created_at?: string;      // ✅ Timestamp of message creation (optional)
}

export interface LLMModel {
    id: string;
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
    selectedModel: string;
    selectedFiles: MyFile[];
    showDropdown: boolean;
    hoveredModel: string | null;
    chatInput: string;
    availableModels:
        | LLMModel[]
        | { id: string; name: string; description: string }[];
    apiKey: string;
}

export interface ChatSessionResponse {
    results: ChatSession[];
}
