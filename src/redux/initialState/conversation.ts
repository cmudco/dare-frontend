import { ConversationState } from "../types/conversation";

export const initialState: ConversationState = {
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,
  searchQuery: "",
  activeConversationMessages: [],
  selectedModel: null,
  selectedFiles: [],
  showDropdown: false,
  hoveredModel: null,
  conversationInput: "",
  availableModels: [],
  prompt: null
};