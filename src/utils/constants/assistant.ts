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

export const START_PAGE_TOUR_TOOL = 'start_page_tour'

export enum ProposalStatus {
  PENDING = 'pending',
  PARTIALLY_APPLIED = 'partially_applied',
  APPLIED = 'applied',
  DISCARDED = 'discarded',
}

export enum ProposalActionStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
}

export enum ProposalActionType {
  ADD_TO_FOLDER = 'add_to_folder',
  REMOVE_FROM_FOLDER = 'remove_from_folder',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
  DELETE_FILES = 'delete_files',
  CREATE_PROJECT = 'create_project',
  ADD_TO_PROJECT = 'add_to_project',
  REMOVE_FROM_PROJECT = 'remove_from_project',
  DELETE_PROJECT = 'delete_project',
  DELETE_CONVERSATIONS = 'delete_conversations',
}

/** What the user can do to a proposal; each is its own endpoint. */
export enum ProposalCommand {
  APPLY = 'apply',
  UNDO = 'undo',
  DISCARD = 'discard',
  RESTORE = 'restore',
}
