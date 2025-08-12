import { ConversationDraft } from '../redux/types/conversation'

const DRAFTS_STORAGE_KEY = 'dare-conversation-drafts'

export const saveDraftsToLocalStorage = (drafts: ConversationDraft[]): void => {
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.warn('Failed to save drafts to localStorage:', error)
  }
}

export const loadDraftsFromLocalStorage = (): ConversationDraft[] => {
  try {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load drafts from localStorage:', error)
  }
  return []
}

export const clearDraftsFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(DRAFTS_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear drafts from localStorage:', error)
  }
}
