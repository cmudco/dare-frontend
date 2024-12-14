import { ChatState } from "../types/chat";

export const initialState: ChatState = {
  sessions: [],
  activeChat: null,
  loading: false,
  error: null,
  searchQuery: "", // New property
  activeChatMessages: [], // New property
  selectedModel: "default", // New property
  showDropdown: false, // New property
  hoveredModel: null, // New property
  chatInput: "", // New property
};