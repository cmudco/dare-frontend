import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { ProposalCommand } from '@/utils/constants/assistant'
import { z } from 'zod'
import {
  AssistantProposalSchema,
  AssistantThreadSchema,
  AssistantThreadSummarySchema,
  type AssistantProposal,
  type AssistantThread,
  type AssistantThreadSummary,
} from '@/schemas/assistantSocket'

export const getAssistantThreadAPI = async (): Promise<AssistantThread> =>
  AssistantThreadSchema.parse(
    await baseRequest<unknown>({
      url: 'api/assistant/thread/',
      method: METHOD.GET,
    })
  )

export const startAssistantThreadAPI = async (): Promise<AssistantThread> =>
  AssistantThreadSchema.parse(
    await baseRequest<unknown>({
      url: 'api/assistant/thread/new/',
      method: METHOD.POST,
    })
  )

export const getAssistantHistoryAPI = async (): Promise<
  AssistantThreadSummary[]
> =>
  z.array(AssistantThreadSummarySchema).parse(
    await baseRequest<unknown>({
      url: 'api/assistant/threads/',
      method: METHOD.GET,
    })
  )

export const openAssistantThreadAPI = async (
  threadId: number
): Promise<AssistantThread> =>
  AssistantThreadSchema.parse(
    await baseRequest<unknown>({
      url: `api/assistant/threads/${threadId}/open/`,
      method: METHOD.POST,
    })
  )

export const runProposalCommandAPI = async (
  proposalId: number,
  command: ProposalCommand,
  actionIds?: string[]
): Promise<AssistantProposal> =>
  AssistantProposalSchema.parse(
    await baseRequest<unknown>({
      url: `api/assistant/proposals/${proposalId}/${command}/`,
      method: METHOD.POST,
      data: actionIds ? { actionIds } : {},
    })
  )
