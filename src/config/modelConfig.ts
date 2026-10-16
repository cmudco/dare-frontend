export const MODEL_CONFIG = {
  maxTokens: 4096,
  adaptiveThinkingMaxTokens: 32768,
  /** Highest max-tokens a chat or agent can ask for; current models output well beyond 16k. */
  maxTokensCeiling: 65536,
  temperature: 0.7,
  maxContextSnippets: 4,
  documentSimilarityThreshold: 0.5,
  historyLimit: 20,
}
