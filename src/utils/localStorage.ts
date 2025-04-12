type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export const STORAGE_KEYS = {
  TEMPERATURE: 'dare_temperature',
  MAX_TOKENS: 'dare_max_tokens',
  MAX_CONTEXT_SNIPPETS: 'dare_max_context_snippets',
  DOCUMENT_SIMILARITY_THRESHOLD: 'dare_document_similarity_threshold',
} as const

export const getConversationStorageKey = (
  baseKey: string,
  conversationId?: string
): string => {
  return conversationId ? `${baseKey}_${conversationId}` : baseKey
}

export const saveToLocalStorage = (
  key: string,
  value: JsonValue,
  conversationId?: string
): void => {
  try {
    const storageKey = getConversationStorageKey(key, conversationId)
    localStorage.setItem(storageKey, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`)
  }
}

export const getFromLocalStorage = <T extends JsonValue>(
  key: string,
  defaultValue: T,
  conversationId?: string
): T => {
  try {
    const storageKey = getConversationStorageKey(key, conversationId)
    const item = localStorage.getItem(storageKey)

    if (!item && conversationId) {
      const globalItem = localStorage.getItem(key)
      return globalItem ? JSON.parse(globalItem) : defaultValue
    }

    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`)
    return defaultValue
  }
}

export const clearConversationSettings = (conversationId: string): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      const storageKey = getConversationStorageKey(key, conversationId)
      localStorage.removeItem(storageKey)
    })
  } catch (error) {
    console.error(`Error clearing conversation settings: ${error}`)
  }
}
