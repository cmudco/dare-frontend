import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AssistantEvent,
  AssistantMessage,
  AssistantUsage,
} from '@/schemas/assistantSocket'
import type { RootState } from './store'
import {
  decideAssistantProposal,
  fetchAssistantThread,
  startAssistantThread,
} from './asyncThunks/assistant'
import { logout } from './userSlice'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

/** A tool call in the answer being streamed, keyed by its tool-call id. */
export interface AssistantLiveStep {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  arguments: Record<string, unknown>
}
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed'

interface AssistantState {
  messages: AssistantMessage[]
  usage: AssistantUsage | null
  threadStatus: RequestStatus
  connection: ConnectionStatus
  isAnswering: boolean
  liveSteps: AssistantLiveStep[]
  decidingProposalId: number | null
  error: string | null
}

const initialState: AssistantState = {
  messages: [],
  usage: null,
  threadStatus: 'idle',
  connection: 'disconnected',
  isAnswering: false,
  liveSteps: [],
  decidingProposalId: null,
  error: null,
}

export const ASSISTANT_CONNECTION_ERROR =
  'Could not reach the assistant. Please try again.'

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
          if (reply?.status === 'streaming') reply.content = event.content
          break
        }
        case 'tool_call_pending':
          if (!state.liveSteps.some((step) => step.id === event.toolCallId)) {
            state.liveSteps.push({
              id: event.toolCallId,
              name: event.toolName,
              status: 'running',
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
              status: 'running',
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
        case 'assistant_message':
          upsert(state, event.message)
          state.liveSteps = []
          state.isAnswering = false
          break
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
      .addCase(decideAssistantProposal.pending, (state, action) => {
        state.decidingProposalId = action.meta.arg.proposalId
        state.error = null
      })
      .addCase(decideAssistantProposal.fulfilled, (state, action) => {
        state.decidingProposalId = null
        for (const message of state.messages) {
          const index = message.proposals.findIndex(
            (proposal) => proposal.id === action.payload.id
          )
          if (index !== -1) message.proposals[index] = action.payload
        }
      })
      .addCase(decideAssistantProposal.rejected, (state) => {
        state.decidingProposalId = null
        state.error = 'Could not update your files. Please try again.'
      })
      .addCase(logout, () => initialState)
  },
})

export const {
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
