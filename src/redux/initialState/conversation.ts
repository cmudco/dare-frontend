import { ConversationState } from '../types/conversation'
import { ConversationTab } from '../../utils/constants/conversation'
import { MyFile, MyFolder } from '../types/files'
import { Tag } from '../types/tags'
import { loadDraftsFromLocalStorage } from '../../utils/draftStorage'
import { DEFAULT_IMAGE_SETTINGS } from '../../utils/constants/imageGeneration'
import { DEFAULT_TRANSCRIPTION_SETTINGS } from '../../utils/constants/audioTranscription'

export const initialState: ConversationState = {
  conversations: [],
  conversationSummaries: [],
  activeConversation: null,
  loading: false,
  error: null,
  searchQuery: '',
  activeConversationMessages: [],
  selectedModel: null,
  pickerEntries: [],
  activeWalletMeta: null,
  selectedFiles: [] as MyFile[],
  selectedEmbeddings: [] as MyFile[],
  selectedMediaFiles: [] as MyFile[], // NEW: Persistent media files
  selectedTags: [] as Tag[],
  selectedFolders: [] as MyFolder[],
  memoryEnabled: false,
  selectedConversations: [],
  referencedConversations: [],
  referencedConversationHistoryLimit: 10,
  referencedSummaries: [],
  showDropdown: false,
  hoveredModel: null,
  conversationInput: '',
  allModels: [],
  conversationDrafts: loadDraftsFromLocalStorage(),
  autoSaveEnabled: true,
  attachedImages: [],
  webSearchEnabled: false,
  imageGenerationEnabled: false,
  audioTranscriptionEnabled: false,
  artifactsEnabled: false,
  isGeneratingImage: false,
  imageGenerationPrompt: null,
  imageGenerationSettings: DEFAULT_IMAGE_SETTINGS,
  isTranscribingAudio: false,
  audioTranscriptionSettings: DEFAULT_TRANSCRIPTION_SETTINGS,
  historySidebarCollapsed: false,
  // Sharing state
  sharedConversations: [],
  activeTab: ConversationTab.MINE,
}
