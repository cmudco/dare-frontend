import { ConversationState } from '../types/conversation'
import { MyFile, MyFolder } from '../types/files'
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
  selectedFolders: [] as MyFolder[],
  showDropdown: false,
  hoveredModel: null,
  conversationInput: '',
  availableModels: [],
}
