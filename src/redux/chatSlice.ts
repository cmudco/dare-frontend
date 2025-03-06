import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/chat";
import { getChatSessions, getAvailableModels, createConversation } from "./aynscThunks/chat";
import {
    ChatMessage,
    ChatSession,
    LLMModel,
} from "./types/chat";
import { MyFile } from "./types/files";

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        updateSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
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
            const index = state.activeChatMessages.findIndex(
                (msg) => msg?.id === action.payload.id
            );
        
            if (index !== -1) {
                // Merge updates instead of replacing the whole message
                state.activeChatMessages[index] = {
                    ...state.activeChatMessages[index], 
                    ...action.payload, 
                };
            } else {
                state.activeChatMessages.push(action.payload);
            }
        },        
        setAvailableModels(
            state,
            action: PayloadAction<
                { id: string; name: string; description: string }[]
            >
        ) {
            state.availableModels = action.payload;
        },
        setApiKey(state, action: PayloadAction<string>) {
            state.apiKey = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getChatSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getChatSessions.fulfilled,
                (state, action: PayloadAction<ChatSession[]>) => {
                    state.loading = false;
                    state.sessions = action.payload;
                }
            )
            .addCase(getChatSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getAvailableModels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getAvailableModels.fulfilled,
                (state, action: PayloadAction<LLMModel[]>) => {
                    state.loading = false;
                    state.availableModels = action.payload; // This should now be the results array directly
                    console.log("Models loaded into state:", action.payload); // Debug log
                }
            )
            .addCase(getAvailableModels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.error("Failed to load models:", action.payload); // Debug log
            })
            .addCase(createConversation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConversation.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions.push(action.payload)
            }
            )
            .addCase(createConversation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            }
            )
    },
});

export const {
    updateSearchQuery,
    updateChatSession,
    updateSelectedModel,
    updateSelectedFiles,
    toggleDropdown,
    setHoveredModel,
    updateChatInput,
    addMessage,
    clearChat,
    updateMessage,
    setAvailableModels,
    setApiKey,
} = chatSlice.actions;
export default chatSlice.reducer;
