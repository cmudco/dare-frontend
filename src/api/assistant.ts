import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { ProposalDecision } from '@/utils/constants/assistant'
import {
  AssistantThreadSchema,
  FileOrganizationProposalSchema,
  type AssistantThread,
  type FileOrganizationProposal,
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

export const decideAssistantProposalAPI = async (
  proposalId: number,
  decision: ProposalDecision
): Promise<FileOrganizationProposal> =>
  FileOrganizationProposalSchema.parse(
    await baseRequest<unknown>({
      url: `api/assistant/proposals/${proposalId}/${decision}/`,
      method: METHOD.POST,
    })
  )
