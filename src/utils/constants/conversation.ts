export enum SenderType {
  PLAYER = 1,
  AI_ASSISTANT = 2,
}

export enum Provider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  LLAMA = 'llama',
}

export enum FeedbackType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

// ─────────────────────────────────────────────────────────────
// Conversation Sharing
// ─────────────────────────────────────────────────────────────

export enum ConversationTab {
  MINE = 'mine',
  SHARED = 'shared',
}

/** Error codes returned by the sharing API (matches BE SharingErrorCode). */
export enum SharingErrorCode {
  PERMISSION_DENIED = 'permission_denied',
  NOT_FOUND = 'not_found',
  CANNOT_PUBLISH_FORKED = 'cannot_publish_forked',
  FORK_FAILED = 'fork_failed',
}
