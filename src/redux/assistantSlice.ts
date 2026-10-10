import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  AssistantMessageStatus,
  AssistantStepStatus,
  ProposalCommand,
  START_PAGE_TOUR_TOOL,
} from '@/utils/constants/assistant'
import type {
  AssistantEvent,
  AssistantMessage,
  AssistantUsage,
} from '@/schemas/assistantSocket'
import type { RootState } from './store'
import {
  fetchAssistantThread,
  runProposalCommand,
  startAssistantThread,
} from './asyncThunks/assistant'
import { logout } from './userSlice'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

/** A tool call in the answer being streamed, keyed by its tool-call id. */
export interface AssistantLiveStep {
  id: string
  name: string
  status: AssistantStepStatus
  arguments: Record<string, unknown>
}
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed'

/** A tour the assistant asked for, by the assistant's page key. */
export interface AssistantTourRequest {
  page: string
}

interface AssistantState {
  messages: AssistantMessage[]
  usage: AssistantUsage | null
  threadStatus: RequestStatus
  connection: ConnectionStatus
  isAnswering: boolean
  liveSteps: AssistantLiveStep[]
  /** The proposal command in flight; actionId null when it covers every action. */
  busyProposal: {
    proposalId: number
    command: ProposalCommand
    actionId: string | null
  } | null
  pendingTour: AssistantTourRequest | null
  error: string | null
}

const initialState: AssistantState = {
  messages: [],
  usage: null,
  threadStatus: 'idle',
  connection: 'disconnected',
  isAnswering: false,
  liveSteps: [],
  busyProposal: null,
  pendingTour: null,
  error: null,
}

export const ASSISTANT_CONNECTION_ERROR =
  'Could not reach the assistant. Please try again.'

/** The tour a finished reply opened, if it called start_page_tour. */
export const tourRequestOf = (
  message: AssistantMessage
): AssistantTourRequest | null => {
  const call = message.toolCalls
    .filter(
      (item) =>
        item.name === START_PAGE_TOUR_TOOL &&
        item.status === AssistantStepStatus.COMPLETED
    )
    .pop()
  const page = call?.arguments.page
  return typeof page === 'string' && page ? { page } : null
}

const upsert = (state: AssistantState, message: AssistantMessage) => {
  const index = state.messages.findIndex((item) => item.id === message.id)
  if (index === -1) {
    state.messages.push(message)
  } else {
    state.messages[index] = message
  }
}

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    assistantConnecting(state) {
      state.connection = 'connecting'
    },
    assistantConnected(state) {
      state.connection = 'connected'
      state.error = null
    },
    assistantConnectionFailed(state) {
      state.connection = 'failed'
      state.isAnswering = false
      state.liveSteps = []
      state.error = ASSISTANT_CONNECTION_ERROR
    },
    assistantDisconnected(state) {
      state.connection = 'disconnected'
    },
    assistantSendRequested(state) {
      state.isAnswering = true
      state.error = null
    },
    assistantSendRejected(state, action: PayloadAction<string>) {
      state.isAnswering = false
      state.error = action.payload
    },
    assistantTourRequested(state, action: PayloadAction<AssistantTourRequest>) {
      state.pendingTour = action.payload
    },
    assistantTourHandled(state) {
      state.pendingTour = null
    },
    assistantEventReceived(state, action: PayloadAction<AssistantEvent>) {
      const event = action.payload
      switch (event.type) {
        case 'assistant_turn_started': {
          const isNewTurn = !state.messages.some(
            (item) => item.id === event.question.id
          )
          upsert(state, event.question)
          upsert(state, event.reply)
          if (isNewTurn) {
            state.liveSteps = []
            if (state.usage) state.usage.usedToday += 1
          }
          break
        }
        case 'assistant_stream': {
          const reply = state.messages.find(
            (item) => item.id === event.messageId
          )
          // A late chunk must not overwrite the persisted final reply.
          if (reply?.status === AssistantMessageStatus.STREAMING)
            reply.content = event.content
          break
        }
        case 'tool_call_pending':
          if (!state.liveSteps.some((step) => step.id === event.toolCallId)) {
            state.liveSteps.push({
              id: event.toolCallId,
              name: event.toolName,
              status: AssistantStepStatus.RUNNING,
              arguments: {},
            })
          }
          break
        case 'tool_call_executing': {
          const step = state.liveSteps.find(
            (item) => item.id === event.toolCallId
          )
          if (step) {
            step.arguments = event.arguments
          } else {
            state.liveSteps.push({
              id: event.toolCallId,
              name: event.toolName,
              status: AssistantStepStatus.RUNNING,
              arguments: event.arguments,
            })
          }
          break
        }
        case 'tool_call_result': {
          const step = state.liveSteps.find(
            (item) => item.id === event.toolCallId
          )
          if (step) step.status = event.status
          break
        }
        case 'assistant_message': {
          // Only the reply finishing opens its tour, never a repeated event.
          const wasStreaming =
            state.messages.find((item) => item.id === event.message.id)
              ?.status === AssistantMessageStatus.STREAMING
          upsert(state, event.message)
          state.liveSteps = []
          state.isAnswering = false
          const tour = tourRequestOf(event.message)
          if (
            tour &&
            wasStreaming &&
            event.message.status === AssistantMessageStatus.COMPLETED
          )
            state.pendingTour = tour
          break
        }
        case 'assistant_error':
          state.error = event.message
          state.liveSteps = []
          state.isAnswering = false
          break
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssistantThread.pending, (state) => {
        state.threadStatus = 'loading'
      })
      .addCase(fetchAssistantThread.fulfilled, (state, action) => {
        state.threadStatus = 'succeeded'
        state.messages = action.payload.messages
        state.usage = action.payload.usage
      })
      .addCase(fetchAssistantThread.rejected, (state) => {
        state.threadStatus = 'failed'
        state.error = ASSISTANT_CONNECTION_ERROR
      })
      .addCase(startAssistantThread.fulfilled, (state, action) => {
        state.messages = action.payload.messages
        state.usage = action.payload.usage
        state.liveSteps = []
        state.error = null
      })
      .addCase(startAssistantThread.rejected, (state) => {
        state.error = ASSISTANT_CONNECTION_ERROR
      })
      .addCase(runProposalCommand.pending, (state, action) => {
        state.busyProposal = {
          proposalId: action.meta.arg.proposalId,
          command: action.meta.arg.command,
          actionId: action.meta.arg.actionId ?? null,
        }
        state.error = null
      })
      .addCase(runProposalCommand.fulfilled, (state, action) => {
        state.busyProposal = null
        for (const message of state.messages) {
          const index = message.proposals.findIndex(
            (proposal) => proposal.id === action.payload.id
          )
          if (index !== -1) message.proposals[index] = action.payload
        }
      })
      .addCase(runProposalCommand.rejected, (state) => {
        state.busyProposal = null
        state.error = 'Could not make that change. Please try again.'
      })
      .addCase(logout, () => initialState)
  },
})

export const {
  assistantTourRequested,
  assistantTourHandled,
  assistantConnecting,
  assistantConnected,
  assistantConnectionFailed,
  assistantDisconnected,
  assistantSendRequested,
  assistantSendRejected,
  assistantEventReceived,
} = assistantSlice.actions

export const selectAssistant = (state: RootState) => state.assistant
export const selectAssistantLimitReached = (state: RootState) =>
  !!state.assistant.usage &&
  state.assistant.usage.usedToday >= state.assistant.usage.dailyLimit

export default assistantSlice.reducer
