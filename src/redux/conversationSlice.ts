import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/conversation";
import { getConversations, getAvailableModels, createConversation } from "./aynscThunks/conversation";
import {
    Message,
    Conversation,
    LLMModel,
} from "./types/conversation";
import { MyFile } from "./types/files";

export const conversationSlice = createSlice({
    name: "conversation",
    initialState,
    reducers: {
        updateSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        updateConversation(state, action: PayloadAction<Conversation | null>) {
            state.activeConversation = action.payload;
        },
        updateSelectedModel(state, action: PayloadAction<number>) {
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
        updateConversationInput(state, action: PayloadAction<string>) {
            state.conversationInput = action.payload;
        },
        clearConversation(state) {
            state.activeConversationMessages = [];
        },
        addMessage(state, action: PayloadAction<Message>) {
            const index = state.activeConversationMessages.findIndex((msg) => msg?.id === action.payload.id);
            if (index !== -1) {
                state.activeConversationMessages[index] = action.payload;
            } else {
                state.activeConversationMessages.push(action.payload);
            }
        },
        updateMessage(state, action: PayloadAction<Partial<Message>>) { 
            const index = state.activeConversationMessages.findIndex((msg) => msg?.id === action.payload.id);
            if (index !== -1) {
                state.activeConversationMessages[index] = {
                    ...state.activeConversationMessages[index], 
                    ...action.payload,
                    message: `${state.activeConversationMessages[index].message}${action.payload.message}`
                };
            }
        },      
        setAvailableModels(state, action: PayloadAction<LLMModel[]>) {
            state.availableModels = action.payload;
        },
        updateConversationTitle(state, action: PayloadAction<string>) {
            console.log(state.activeConversation, action.payload);
            if (!state.activeConversation) {return}
            state.activeConversation.title = action.payload;
            const index = state.conversations.findIndex((conv) => conv.conversationId === state.activeConversation?.conversationId);
            if (index !== -1) {
                state.conversations[index] = {
                    ...state.conversations[index],
                    title: action.payload
                }
            }
        },
        updateConversationHistory(state, action: PayloadAction<Message[]>) {
            state.activeConversationMessages = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getConversations.fulfilled,
                (state, action: PayloadAction<Conversation[]>) => {
                    state.loading = false;
                    state.conversations = action.payload;
                }
            )
            .addCase(getConversations.rejected, (state, action) => {
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
                    state.availableModels = action.payload;
                    console.log("Models loaded into state:", action.payload);
                }
            )
            .addCase(getAvailableModels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.error("Failed to load models:", action.payload);
            })
            .addCase(createConversation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConversation.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations.unshift(action.payload); 
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
    updateConversation,
    updateSelectedModel,
    updateSelectedFiles,
    toggleDropdown,
    setHoveredModel,
    updateConversationInput,
    addMessage,
    clearConversation,
    updateMessage,
    setAvailableModels,
    updateConversationTitle,
    updateConversationHistory,
} = conversationSlice.actions;
export default conversationSlice.reducer;
