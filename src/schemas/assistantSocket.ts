/**
 * Zod schemas for the platform assistant: REST thread payload and the
 * `assistant` socket event (one event, discriminated by `type`).
 */

import { z } from 'zod'
import {
  AssistantMessageStatus,
  AssistantRole,
  AssistantStepStatus,
  ProposalActionStatus,
  ProposalActionType,
  ProposalStatus,
} from '@/utils/constants/assistant'

export const ProposalActionSchema = z.object({
  id: z.string(),
  type: z.enum(ProposalActionType),
  name: z.string(),
  isNew: z.boolean(),
  description: z.string(),
  files: z.array(z.object({ id: z.number(), name: z.string() })),
  conversations: z.array(z.object({ id: z.string(), title: z.string() })),
  status: z.enum(ProposalActionStatus),
  notes: z.array(z.string()),
})

export const AssistantProposalSchema = z.object({
  id: z.number(),
  status: z.enum(ProposalStatus),
  summary: z.string(),
  actions: z.array(ProposalActionSchema),
})

export const AssistantMessageSchema = z.object({
  id: z.number(),
  role: z.enum(AssistantRole),
  content: z.string(),
  status: z.enum(AssistantMessageStatus),
  toolCalls: z.array(
    z.object({
      name: z.string(),
      status: z.enum([
        AssistantStepStatus.COMPLETED,
        AssistantStepStatus.FAILED,
      ]),
      arguments: z.record(z.string(), z.unknown()),
      round: z.number(),
    })
  ),
  proposals: z.array(AssistantProposalSchema),
  createdAt: z.string(),
})

export const AssistantUsageSchema = z.object({
  usedToday: z.number(),
  dailyLimit: z.number(),
})

export const AssistantThreadSchema = z.object({
  id: z.number(),
  messages: z.array(AssistantMessageSchema),
  usage: AssistantUsageSchema,
})

export const AssistantEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('assistant_turn_started'),
    question: AssistantMessageSchema,
    reply: AssistantMessageSchema,
  }),
  z.object({
    type: z.literal('assistant_stream'),
    messageId: z.number(),
    content: z.string(),
  }),
  z.object({
    type: z.literal('tool_call_pending'),
    toolCallId: z.string(),
    toolName: z.string(),
  }),
  z.object({
    type: z.literal('tool_call_executing'),
    toolCallId: z.string(),
    toolName: z.string(),
    arguments: z.record(z.string(), z.unknown()),
  }),
  z.object({
    type: z.literal('tool_call_result'),
    toolCallId: z.string(),
    toolName: z.string(),
    status: z.enum([AssistantStepStatus.COMPLETED, AssistantStepStatus.FAILED]),
  }),
  z.object({
    type: z.literal('assistant_message'),
    message: AssistantMessageSchema,
  }),
  z.object({
    type: z.literal('assistant_error'),
    code: z.string(),
    message: z.string(),
  }),
])

export type AssistantMessage = z.infer<typeof AssistantMessageSchema>
export type AssistantUsage = z.infer<typeof AssistantUsageSchema>
export type AssistantThread = z.infer<typeof AssistantThreadSchema>
export type AssistantEvent = z.infer<typeof AssistantEventSchema>
export type AssistantToolCall = AssistantMessage['toolCalls'][number]
export type AssistantProposal = z.infer<typeof AssistantProposalSchema>
export type ProposalAction = z.infer<typeof ProposalActionSchema>
