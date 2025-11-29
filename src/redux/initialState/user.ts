import { UserState, ConversationSettings } from '../types/user'

// Load conversation settings from localStorage with fallback
const getStoredConversationSettings = (): ConversationSettings => {
  try {
    const stored = localStorage.getItem('conversationSettings')
    return stored ? JSON.parse(stored) : { fontSize: 'sm' }
  } catch {
    return { fontSize: 'sm' }
  }
}

export const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  temp_token: '',
  token: '',
  userLoading: true,
  successMessage: null,
  stats: null,
  chunkSettings: null,
  conversationSettings: getStoredConversationSettings(),
}
