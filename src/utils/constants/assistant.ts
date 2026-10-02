// Mirrors assistant/constants.py on the backend.

export enum AssistantRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum AssistantMessageStatus {
  STREAMING = 'streaming',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  FAILED = 'failed',
}

/** A tool call's state; persisted calls are only ever completed or failed. */
export enum AssistantStepStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ProposalStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  DISCARDED = 'discarded',
}

export enum ProposalDecision {
  APPLY = 'apply',
  DISCARD = 'discard',
}
