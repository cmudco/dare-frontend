/**
 * Zod schemas for workflow socket events.
 *
 * These schemas validate the shape of every incoming WebSocket event
 * before it reaches Redux reducers. This catches backend contract
 * changes at the boundary instead of silently corrupting state.
 *
 * Event naming convention:
 *   - Backend sends snake_case event names (step_started, step_streaming, etc.)
 *   - All payload keys are camelCase (nodeId, label, startedAt, etc.)
 *   - Backend applies camelize() before socket emission, so the payload
 *     format is identical to REST API responses.
 */

import { z } from 'zod'

// ════════════════════════════════════════════════════════════════════════════
// SHARED SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

const TokensSchema = z.object({
  input: z.number(),
  output: z.number(),
})

const RouteOptionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

const SnippetSchema = z.object({
  id: z.number(),
  file: z.object({ id: z.number(), name: z.string() }).nullable(),
  text: z.string(),
  similarityScore: z.number(),
  chunkIndex: z.number(),
  vectorDbSource: z.string().optional(),
})

const WebSearchSourceSchema = z.object({
  id: z.number(),
  url: z.string(),
  title: z.string(),
  citedText: z.string(),
  pageAge: z.string().optional(),
  provider: z.string(),
})

const StepCompletedMetadataSchema = z
  .object({
    snippets: z.array(SnippetSchema).default([]),
    webSearchSources: z.array(WebSearchSourceSchema).default([]),
  })
  .passthrough()

// ════════════════════════════════════════════════════════════════════════════
// EVENT SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

export const StepStartedSchema = z.object({
  type: z.literal('step_started'),
  nodeId: z.string(),
  label: z.string().nullable().optional(),
  nodeType: z.string(),
  startedAt: z.string().optional(),
  workflowRunId: z.number().optional(),
})

export const StepStreamingSchema = z.object({
  type: z.literal('step_streaming'),
  nodeId: z.string(),
  chunk: z.string(),
  accumulatedTokens: z.number().optional(),
  workflowRunId: z.number().optional(),
})

export const StepCompletedSchema = z.object({
  type: z.literal('step_completed'),
  nodeId: z.string(),
  response: z.string(),
  status: z.enum(['completed', 'failed', 'skipped']),
  tokens: TokensSchema.optional(),
  metadata: StepCompletedMetadataSchema.optional(),
  workflowRunId: z.number().optional(),
})

export const ExecutionCompleteSchema = z.object({
  type: z.literal('execution_complete'),
  workflowRunId: z.number(),
  status: z.enum(['completed', 'failed', 'pending_human_input']),
  totalCost: z.number().optional(),
  totalTokens: TokensSchema.optional(),
  endedAt: z.string().optional(),
})

export const StepErrorSchema = z.object({
  type: z.literal('step_error'),
  error: z.string(),
  nodeId: z.string().optional(),
  errorType: z.string().optional(),
  workflowRunId: z.number().optional(),
})

export const ValidationRequiredSchema = z.object({
  type: z.literal('validation_required'),
  nodeId: z.string(),
  routes: z.array(RouteOptionSchema),
  context: z.object({ aiAnalysis: z.string().optional() }).optional(),
  aiRecommendation: z.string().optional(),
  workflowRunId: z.number().optional(),
})

export const BatchStartedSchema = z.object({
  type: z.literal('batch_started'),
  batchId: z.number(),
  totalFiles: z.number(),
  workflowId: z.number(),
})

export const BatchProgressSchema = z.object({
  type: z.literal('batch_progress'),
  batchId: z.number(),
  index: z.number(),
  total: z.number(),
  fileId: z.number(),
  fileName: z.string(),
  status: z.enum(['running', 'completed', 'failed']),
  workflowRunId: z.number().optional(),
})

export const BatchCompleteSchema = z.object({
  type: z.literal('batch_complete'),
  batchId: z.number(),
  completedCount: z.number(),
  failedCount: z.number(),
  totalFiles: z.number(),
})

// workflow_status: full WorkflowRunV2Serializer output.
// Backend applies camelize() before socket emission, so all keys are camelCase
// — identical to REST response format.
const PendingValidationSchema = z
  .object({
    nodeId: z.string(),
    routes: z.array(RouteOptionSchema),
    aiRecommendation: z.string().nullable().optional(),
    context: z
      .object({ aiAnalysis: z.string().nullable().optional() })
      .optional(),
  })
  .nullable()

const NodeStateSchema = z
  .object({
    stepId: z.number().nullable(),
    startedAt: z.string().nullable().optional(),
    nodeType: z.string(),
    status: z.string(),
    response: z.string().nullable(),
    error: z.string().nullable(),
    validationContext: z.unknown().nullable(),
    metadata: z.unknown().nullable(),
    snippets: z.array(SnippetSchema).default([]),
    webSearchSources: z.array(WebSearchSourceSchema).default([]),
  })
  .passthrough()

export const WorkflowStatusSchema = z
  .object({
    type: z.literal('workflow_status'),
    id: z.number(),
    status: z.string(),
    // All fields are camelCase — backend applies camelize() before socket emission
    startedAt: z.string().optional(),
    endedAt: z.string().nullable().optional(),
    workflowTitle: z.string().optional(),
    workflowDescription: z.string().optional(),
    isPartial: z.boolean().optional(),
    nodeStates: z.record(z.string(), NodeStateSchema).optional(),
    pendingValidation: PendingValidationSchema.optional(),
  })
  .passthrough()

// ════════════════════════════════════════════════════════════════════════════
// DISCRIMINATED UNION
// ════════════════════════════════════════════════════════════════════════════

export const WorkflowEventSchema = z.discriminatedUnion('type', [
  StepStartedSchema,
  StepStreamingSchema,
  StepCompletedSchema,
  ExecutionCompleteSchema,
  StepErrorSchema,
  ValidationRequiredSchema,
  BatchStartedSchema,
  BatchProgressSchema,
  BatchCompleteSchema,
])

// ════════════════════════════════════════════════════════════════════════════
// INFERRED TYPES
// ════════════════════════════════════════════════════════════════════════════

export type StepStartedEvent = z.infer<typeof StepStartedSchema>
export type StepStreamingEvent = z.infer<typeof StepStreamingSchema>
export type StepCompletedEvent = z.infer<typeof StepCompletedSchema>
export type ExecutionCompleteEvent = z.infer<typeof ExecutionCompleteSchema>
export type StepErrorEvent = z.infer<typeof StepErrorSchema>
export type ValidationRequiredEvent = z.infer<typeof ValidationRequiredSchema>
export type BatchStartedEvent = z.infer<typeof BatchStartedSchema>
export type BatchProgressEvent = z.infer<typeof BatchProgressSchema>
export type BatchCompleteEvent = z.infer<typeof BatchCompleteSchema>
export type WorkflowStatusEvent = z.infer<typeof WorkflowStatusSchema>
export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIBE RESPONSE SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

export const SubscribeWorkflowResponseSchema = z.object({
  success: z.boolean(),
  workflowId: z.number().optional(),
  latestRun: WorkflowStatusSchema.omit({ type: true })
    .extend({
      workflow: z.number().optional(),
      user: z.number().optional(),
    })
    .nullable()
    .optional(),
  latestBatchRun: z
    .object({
      batchId: z.number(),
      workflowId: z.number(),
      status: z.string(),
      totalFiles: z.number(),
      completedCount: z.number(),
      failedCount: z.number(),
      fileStatuses: z.array(
        z.object({
          fileId: z.number(),
          fileName: z.string(),
          status: z.enum(['running', 'completed', 'failed']),
          workflowRunId: z.number().optional(),
          index: z.number(),
        })
      ),
    })
    .nullable()
    .optional(),
  error: z.string().optional(),
})

export type SubscribeWorkflowResponse = z.infer<
  typeof SubscribeWorkflowResponseSchema
>
