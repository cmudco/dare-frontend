/**
 * Zod schemas for the platform assistant: REST thread payload and the
 * `assistant` socket event (one event, discriminated by `type`).
 */

import { z } from 'zod'

const PlanFileSchema = z.object({ id: z.number(), name: z.string() })

export const FileOrganizationProposalSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'applied', 'discarded']),
  summary: z.string(),
  plan: z.object({
    folders: z.array(
      z.object({
        name: z.string(),
        isNew: z.boolean(),
        files: z.array(PlanFileSchema),
      })
    ),
    tags: z.array(
      z.object({
        label: z.string(),
        isNew: z.boolean(),
        files: z.array(PlanFileSchema),
      })
    ),
  }),
  outcome: z.object({
    foldersCreated: z.number().optional(),
    filesFiled: z.number().optional(),
    tagsCreated: z.number().optional(),
    filesTagged: z.number().optional(),
    skipped: z.array(z.string()).optional(),
  }),
})

export const AssistantMessageSchema = z.object({
  id: z.number(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  status: z.enum(['streaming', 'completed', 'stopped', 'failed']),
  toolCalls: z.array(
    z.object({
      name: z.string(),
      status: z.string(),
      round: z.number(),
    })
  ),
  proposals: z.array(FileOrganizationProposalSchema),
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
    type: z.literal('tool_call_executing'),
    toolName: z.string(),
  }),
  z.object({
    type: z.literal('tool_call_result'),
    toolName: z.string(),
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
export type FileOrganizationProposal = z.infer<
  typeof FileOrganizationProposalSchema
>
