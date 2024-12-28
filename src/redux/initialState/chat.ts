import { ChatState } from "../types/chat";

export const initialState: ChatState = {
  sessions: [],
  activeChat: null,
  loading: false,
  error: null,
  searchQuery: "",
  activeChatMessages: [],
  selectedModel: "default",
  selectedFiles: [],
  showDropdown: false,
  hoveredModel: null,
  chatInput: "",

};