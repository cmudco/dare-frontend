import { ConversationState } from '../types/conversation'
import { MyFile } from '../types/files'
import { Tag } from '../types/tags'

export const initialState: ConversationState = {
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,
  searchQuery: '',
  activeConversationMessages: [],
  selectedModel: null,
  selectedFiles: [] as MyFile[],
  selectedTags: [] as Tag[],
  showDropdown: false,
  hoveredModel: null,
  conversationInput: '',
  availableModels: [],
}
