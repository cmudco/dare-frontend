import { MyFile } from "./files";


export interface ChatSession {
  session_id: string;
  created_at: string;
}

export interface NewChatPayload {
  session_id: string;
}

export interface ChatMessage {
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
  selectedModel: string; // New property
  selectedFiles: MyFile[];
  showDropdown: boolean; // New property
  hoveredModel: string | null; // New property
  chatInput: string; // New property
  availableModels: { id: string; name: string; description: string }[]; // New property
}
