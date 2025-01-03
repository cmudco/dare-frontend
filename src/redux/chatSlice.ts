import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/chat";
import { fetchChatMessages, getChatSessions, fetchDummyMessage, fetchAvailableModels } from "./aynscThunks/chat";
import { ChatMessage, ChatSession, NewChatPayload } from "./types/chat";
import { MyFile } from "./types/files";

export const chatSlice = createSlice({
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
    updateSelectedFiles(state, action: PayloadAction<MyFile[]>) {
      state.selectedFiles = action.payload;
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
    clearChat(state) {
      state.activeChatMessages = [];
    },
    updateMessage(state, action: PayloadAction<ChatMessage>) {
      if (!action.payload?.id) return;

      const index = state.activeChatMessages.findIndex(
        msg => msg?.id === action.payload.id
      );

      if (index !== -1) {
        state.activeChatMessages[index] = action.payload;
      } else {
        state.activeChatMessages.push(action.payload);
      }
    },
    setAvailableModels(state, action: PayloadAction<{ id: string; name: string; description: string }[]>) {
      state.availableModels = action.payload;
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
      })
      .addCase(fetchAvailableModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableModels.fulfilled, (state, action: PayloadAction<{ id: string; name: string; description: string }[]>) => {
        state.loading = false;
        state.availableModels = action.payload; // Properly assign the transformed data
      })
      .addCase(fetchAvailableModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      ;

  },
});

export const { updateSearchQuery, createNewChat, updateChatSession, updateSelectedModel, updateSelectedFiles, toggleDropdown, setHoveredModel, updateChatInput, addMessage, clearChat, updateMessage, setAvailableModels } = chatSlice.actions;
export default chatSlice.reducer;