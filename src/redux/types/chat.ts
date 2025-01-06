import { MyFile } from "./files";


export interface ChatSession {
  session_id: string;
  created_at: string;
}

export interface NewChatPayload {
  session_id: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  isSender: boolean;
  date: string;
  partial?: boolean;
  streaming?: boolean;
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
  availableModels: { id: string; name: string; description: string }[];
}
