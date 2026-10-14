import { createAsyncThunk } from '@reduxjs/toolkit'
import { ProposalCommand } from '@/utils/constants/assistant'
import {
  getAssistantThreadAPI,
  runProposalCommandAPI,
  startAssistantThreadAPI,
} from '@/api/assistant'
import type {
  AssistantProposal,
  AssistantThread,
} from '@/schemas/assistantSocket'
import type { RootState } from '../store'
import { getConversations } from './conversation'
import { getDeletedFiles, getFiles, getFolders } from './file'
import { fetchProjectChats, fetchProjects } from './project'
import { getTags } from './tag'

export const fetchAssistantThread = createAsyncThunk<
  AssistantThread,
  void,
  { rejectValue: string }
>('assistant/fetchThread', async (_, thunkAPI) => {
  try {
    return await getAssistantThreadAPI()
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const startAssistantThread = createAsyncThunk<
  AssistantThread,
  void,
  { rejectValue: string }
>('assistant/startThread', async (_, thunkAPI) => {
  try {
    return await startAssistantThreadAPI()
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export interface ProposalCommandRequest {
  proposalId: number
  command: ProposalCommand
  /** Apply or undo just these actions; omitted means all of them. */
  actionId?: string
}

export const runProposalCommand = createAsyncThunk<
  AssistantProposal,
  ProposalCommandRequest,
  { state: RootState; rejectValue: string }
>(
  'assistant/runProposalCommand',
  async ({ proposalId, command, actionId }, thunkAPI) => {
    try {
      const proposal = await runProposalCommandAPI(
        proposalId,
        command,
        actionId ? [actionId] : undefined
      )
      if (
        command === ProposalCommand.APPLY ||
        command === ProposalCommand.UNDO
      ) {
        // Files, chats and projects may all have changed; refresh their views.
        const { dispatch, getState } = thunkAPI
        dispatch(getFiles())
        dispatch(getDeletedFiles())
        dispatch(getFolders())
        dispatch(getTags())
        dispatch(fetchProjects())
        dispatch(getConversations())
        Object.keys(getState().project.chats).forEach((projectId) =>
          dispatch(fetchProjectChats(Number(projectId)))
        )
      }
      return proposal
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
