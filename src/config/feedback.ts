export const FEEDBACK_AUTO_TRIGGER_CONFIG = {
  // Maximum auto-prompts per conversation (1 = once only, 0 = disabled)
  MAX_AUTO_PROMPTS_PER_CONVERSATION: 1,

  // Minimum messages between auto-prompts (e.g., 10 = every 10 messages)
  MIN_MESSAGES_BETWEEN_AUTO_PROMPTS: 10,

  // Minimum time between prompts (milliseconds) - to not overwhelm user
  MIN_TIME_BETWEEN_PROMPTS_MS: 60 * 1000 * 5, // 5 minutes

  // Enable/disable auto-triggering globally
  ENABLE_AUTO_TRIGGER: false,
}
