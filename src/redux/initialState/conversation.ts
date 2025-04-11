import { ConversationState } from '../types/conversation'
import { MODEL_CONFIG } from '../../config/modelConfig'

export const initialState: ConversationState = {
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,
  searchQuery: '',
  activeConversationMessages: [],
  selectedModel: null,
  selectedFiles: [],
  showDropdown: false,
  hoveredModel: null,
  conversationInput: '',
  availableModels: [],
  prompt: null,
  temperature: MODEL_CONFIG.temperature,
  maxTokens: MODEL_CONFIG.maxTokens,
  selectedTags: [],
}
