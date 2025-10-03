import { ConversationState } from '../types/conversation'
import { MyFile, MyFolder } from '../types/files'
import { Tag } from '../types/tags'
import { loadDraftsFromLocalStorage } from '../../utils/draftStorage'

export const initialState: ConversationState = {
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,
  searchQuery: '',
  activeConversationMessages: [],
  selectedModel: null,
  selectedFiles: [] as MyFile[],
  selectedEmbeddings: [] as MyFile[],
  selectedTags: [] as Tag[],
  selectedFolders: [] as MyFolder[],
  selectedConversations: [],
  referencedConversations: [],
  referencedConversationHistoryLimit: 10,
  showDropdown: false,
  hoveredModel: null,
  conversationInput: '',
  availableModels: [],
  allModels: [],
  conversationDrafts: loadDraftsFromLocalStorage(),
  autoSaveEnabled: true,
  attachedImages: [],
  webSearchEnabled: false,
}
