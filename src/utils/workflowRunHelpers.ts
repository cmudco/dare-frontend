import {
  WorkflowRun,
  WorkflowRunStep,
  PendingValidation,
} from '@/redux/types/workflow'

/**
 * ============================================================================
 * WORKFLOW RUN DATA HELPERS
 * ============================================================================
 *
 * These helpers provide a clean, consistent way to retrieve data from
 * workflow runs for display in output nodes.
 *
 * DATA FLOW OVERVIEW:
 *
 * NORMAL MODE (viewing completed runs):
 * - Display run comes from selectedRunIds[nodeId] or currentRun
 * - Shows historical data from completed workflow executions
 *
 * MANUAL MODE (partial execution):
 * - Display run is always currentRun (the active partial run)
 * - Shows live data as steps are manually executed
 *
 * RUNNING MODE (full execution):
 * - Display run is always currentRun
 * - Shows live updates via polling
 */

/**
 * Get the workflow run to display for a specific node.
 *
 * This is the primary function for determining which run's data to show.
 * It handles all three execution modes automatically.
 *
 * @param nodeId - The node requesting run data
 * @param selectedRunIds - Map of node IDs to selected run IDs (from version dropdown)
 * @param availableRuns - All available runs for the workflow
 * @param currentRun - The currently active/selected run
 * @returns The run to display, or null if none found
 *
 * @example
 * ```tsx
 * const displayRun = getDisplayRun(
 *   nodeId,
 *   selectedRunIds,
 *   availableRuns,
 *   currentRun
 * )
 * const stepRun = getStepFromRun(displayRun, stepNumber)
 * ```
 */
export function getDisplayRun(
  nodeId: string,
  selectedRunIds: Record<string, number>,
  availableRuns: WorkflowRun[],
  currentRun: WorkflowRun | null
): WorkflowRun | null {
  // If user explicitly selected a version for this node, use it
  if (selectedRunIds[nodeId]) {
    return (
      availableRuns.find((run) => run.id === selectedRunIds[nodeId]) || null
    )
  }

  // Otherwise, default to current run
  return currentRun
}

/**
 * Find the step data for a specific node from a workflow run.
 *
 * STEP MATCHING STRATEGY:
 * - Standard nodes: Match by stepNumber (order field)
 * - Conditional nodes: Match by stepNumber AND verify metadata.availableRoutes exists
 *
 * @param run - The workflow run containing steps
 * @param stepNumber - The step number to find
 * @param options - Optional configuration
 * @param options.isConditional - Whether this is a conditional node (requires route metadata)
 * @returns The matching step, or null if not found
 *
 * @example
 * ```tsx
 * // For chat output or structured output nodes
 * const stepRun = getStepFromRun(displayRun, stepNumber)
 *
 * // For conditional nodes
 * const stepRun = getStepFromRun(displayRun, stepNumber, { isConditional: true })
 * ```
 */
export function getStepFromRun(
  run: WorkflowRun | null,
  stepNumber: number | undefined,
  options: { isConditional?: boolean } = {}
): WorkflowRunStep | null {
  if (!run || !run.steps || stepNumber === undefined) return null

  const { isConditional = false } = options

  if (isConditional) {
    // Conditional nodes need availableRoutes metadata
    return (
      run.steps.find(
        (s) =>
          s.order === stepNumber && s.metadata?.availableRoutes !== undefined
      ) || null
    )
  }

  // Standard step lookup by order or stepNode
  return run.steps.find((s) => (s.order || s.stepNode) === stepNumber) || null
}

/**
 * Extract output data from a step run for display in output nodes.
 *
 * This provides a consistent interface for accessing step execution data,
 * with null-safe defaults.
 *
 * @param stepRun - The step run containing execution data
 * @returns Structured output data ready for display
 *
 * @example
 * ```tsx
 * const stepRun = getStepFromRun(displayRun, stepNumber)
 * const { response, status, error } = extractStepOutputData(stepRun)
 *
 * return (
 *   <div>
 *     {error ? <Error message={error} /> : <Response content={response} />}
 *     <StatusBadge status={status} />
 *   </div>
 * )
 * ```
 */
export interface StepOutputData {
  response: string | null
  status: string | null | undefined
  error: string | null
  metadata: Record<string, unknown> | null
}

export function extractStepOutputData(
  stepRun: WorkflowRunStep | null
): StepOutputData {
  if (!stepRun) {
    return {
      response: null,
      status: null,
      error: null,
      metadata: null,
    }
  }

  return {
    response: stepRun.response ?? null,
    status: stepRun.status ?? null,
    error: stepRun.error ?? null,
    metadata: stepRun.metadata ?? null,
  }
}

/**
 * Extract routing decision data from conditional/structured output nodes.
 *
 * This handles the complex logic of retrieving routing information from
 * either pending validations (during human approval) or step metadata
 * (after execution).
 *
 * @param stepRun - The step run containing routing decision
 * @param pendingValidation - Optional pending validation data (for human validation flow)
 * @returns Routing decision information
 *
 * @example
 * ```tsx
 * const stepRun = getStepFromRun(displayRun, stepNumber, { isConditional: true })
 * const routingData = extractRoutingDecision(stepRun, pendingValidation)
 *
 * return (
 *   <div>
 *     <p>Selected Route: {routingData.selectedRoute}</p>
 *     {routingData.aiAnalysis && <p>AI Analysis: {routingData.aiAnalysis}</p>}
 *     {routingData.isHumanValidated && <Badge>Human Validated</Badge>}
 *   </div>
 * )
 * ```
 */
export interface RoutingDecisionData {
  selectedRoute: string | null
  aiAnalysis: string | null
  aiRecommendation: string | null
  isHumanValidated: boolean
  userChoice: string | null
}

export function extractRoutingDecision(
  stepRun: WorkflowRunStep | null,
  pendingValidation?: PendingValidation
): RoutingDecisionData {
  if (!stepRun && !pendingValidation) {
    return {
      selectedRoute: null,
      aiAnalysis: null,
      aiRecommendation: null,
      isHumanValidated: false,
      userChoice: null,
    }
  }

  const metadata = stepRun?.metadata

  return {
    selectedRoute: metadata?.selectedRoute || stepRun?.response || null,
    aiAnalysis: pendingValidation?.aiAnalysis || metadata?.analysis || null,
    aiRecommendation:
      pendingValidation?.aiRecommendation || metadata?.aiRecommendation || null,
    isHumanValidated: metadata?.isHumanValidated || false,
    userChoice: metadata?.userChoice || null,
  }
}
