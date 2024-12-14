import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/chat";
import { fetchChatMessages, getChatSessions, fetchDummyMessage } from "./aynscThunks/chat";
import { ChatMessage, ChatSession, NewChatPayload } from "./types/chat";

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    createNewChat(state, action: PayloadAction<NewChatPayload>) {
      state.sessions.push({ session_id: action.payload.session_id, created_at: new Date().toISOString() });
    },
    updateChatSession(state, action: PayloadAction<ChatSession | null>) {
      state.activeChat = action.payload;
    },
    updateSelectedModel(state, action: PayloadAction<string>) {
      state.selectedModel = action.payload;
    },
    toggleDropdown(state) {
      state.showDropdown = !state.showDropdown;
    },
    setHoveredModel(state, action: PayloadAction<string | null>) {
      state.hoveredModel = action.payload;
    },
    updateChatInput(state, action: PayloadAction<string>) {
      state.chatInput = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.activeChatMessages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChatSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatSessions.fulfilled, (state, action: PayloadAction<ChatSession[]>) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(getChatSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action: PayloadAction<ChatMessage[]>) => {
        state.loading = false;
        state.activeChatMessages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDummyMessage.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.activeChatMessages.push(action.payload);
      });
  },
});

export const { updateSearchQuery, createNewChat, updateChatSession, updateSelectedModel, toggleDropdown, setHoveredModel, updateChatInput, addMessage } = chatSlice.actions;
export default chatSlice.reducer;