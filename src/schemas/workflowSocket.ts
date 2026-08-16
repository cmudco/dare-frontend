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

const ToolCallSchema = z
  .object({
    id: z.number().optional(),
    toolCallId: z.string(),
    serverSlug: z.string(),
    origin: z.string(),
    toolName: z.string(),
    arguments: z.record(z.string(), z.unknown()).optional(),
    roundIndex: z.number().optional(),
    status: z.string(),
    result: z.string().nullable().optional(),
    error: z.string().nullable().optional(),
    executionTimeMs: z.number().optional(),
  })
  .passthrough()

const StepCompletedMetadataSchema = z
  .object({
    snippets: z.array(SnippetSchema).default([]),
    webSearchSources: z.array(WebSearchSourceSchema).default([]),
    toolCalls: z.array(ToolCallSchema).default([]),
    retrievalTrace: z.unknown().nullable().optional(),
    contextTrace: z.unknown().nullable().optional(),
  })
  .passthrough()

// Correlation keys carried by every workflow tool event (same payloads as
// chat's tool events, with workflow correlation instead of messageId).
const workflowToolCorrelation = {
  workflowRunId: z.number(),
  nodeId: z.string(),
  runStepId: z.number(),
}

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
  context: z
    .object({ aiAnalysis: z.string().nullable().optional() })
    .optional(),
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

// ── Tool-loop events (unified vocabulary shared with chat) ──────────────────

export const WorkflowToolCallPendingSchema = z
  .object({
    type: z.literal('tool_call_pending'),
    ...workflowToolCorrelation,
    toolCallId: z.string(),
    toolName: z.string(),
    serverSlug: z.string(),
    origin: z.string(),
    round: z.number(),
    status: z.literal('pending'),
  })
  .passthrough()

export const WorkflowToolCallArgsProgressSchema = z
  .object({
    type: z.literal('tool_call_args_progress'),
    ...workflowToolCorrelation,
    toolCallId: z.string(),
    argsChars: z.number(),
  })
  .passthrough()

export const WorkflowToolCallExecutingSchema = z
  .object({
    type: z.literal('tool_call_executing'),
    ...workflowToolCorrelation,
    toolCallId: z.string(),
    toolName: z.string(),
    serverSlug: z.string(),
    origin: z.string(),
    round: z.number(),
    status: z.literal('executing'),
    arguments: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()

export const WorkflowToolCallResultSchema = z
  .object({
    type: z.literal('tool_call_result'),
    ...workflowToolCorrelation,
    toolCallId: z.string(),
    toolName: z.string(),
    serverSlug: z.string(),
    origin: z.string(),
    round: z.number(),
    status: z.enum(['completed', 'failed']),
    error: z.string().nullable().optional(),
    dareResult: z.unknown().optional(),
    mcpResult: z.unknown().optional(),
    providerResult: z.unknown().optional(),
  })
  .passthrough()

export const WorkflowToolRoundsCappedSchema = z
  .object({
    type: z.literal('tool_rounds_capped'),
    ...workflowToolCorrelation,
    round: z.number(),
  })
  .passthrough()

export const WorkflowContextTraceSchema = z
  .object({
    type: z.literal('context_trace'),
    ...workflowToolCorrelation,
    trace: z.object({ stages: z.array(z.unknown()) }).passthrough(),
  })
  .passthrough()

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
    toolCalls: z.array(ToolCallSchema).default([]),
    retrievalTrace: z.unknown().nullable().optional(),
    contextTrace: z.unknown().nullable().optional(),
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
  WorkflowToolCallPendingSchema,
  WorkflowToolCallArgsProgressSchema,
  WorkflowToolCallExecutingSchema,
  WorkflowToolCallResultSchema,
  WorkflowToolRoundsCappedSchema,
  WorkflowContextTraceSchema,
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
export type WorkflowToolCallPendingEvent = z.infer<
  typeof WorkflowToolCallPendingSchema
>
export type WorkflowToolCallExecutingEvent = z.infer<
  typeof WorkflowToolCallExecutingSchema
>
export type WorkflowToolCallResultEvent = z.infer<
  typeof WorkflowToolCallResultSchema
>
export type WorkflowContextTraceEvent = z.infer<
  typeof WorkflowContextTraceSchema
>
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
