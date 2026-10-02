import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  decideAssistantProposalAPI,
  getAssistantThreadAPI,
  startAssistantThreadAPI,
} from '@/api/assistant'
import type {
  AssistantThread,
  FileOrganizationProposal,
} from '@/schemas/assistantSocket'
import { getFiles, getFolders } from './file'
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

export const decideAssistantProposal = createAsyncThunk<
  FileOrganizationProposal,
  { proposalId: number; decision: 'apply' | 'discard' },
  { rejectValue: string }
>('assistant/decideProposal', async ({ proposalId, decision }, thunkAPI) => {
  try {
    const proposal = await decideAssistantProposalAPI(proposalId, decision)
    if (decision === 'apply') {
      // Folders and tags changed; refresh the Sources views that show them.
      thunkAPI.dispatch(getFiles())
      thunkAPI.dispatch(getFolders())
      thunkAPI.dispatch(getTags())
    }
    return proposal
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
