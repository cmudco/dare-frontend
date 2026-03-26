import { useAppSelector } from '@/redux/hooks'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import type { ValidationContext } from '@/redux/types/workflow'

/**
 * Pending validation data for HumanValidationModal (hook-specific shape).
 * Maps from V2 API ValidationContext to modal-compatible format.
 */
export interface HookPendingValidation {
  nodeId: string
  label: string
  customPrompt: string
  availableRoutes: { name: string; description: string }[]
  currentResponse: string
  stepId: number
  aiRecommendation: string | undefined
  aiAnalysis: string | undefined
}

/**
 * Return type for the useRoutingNode hook.
 */
export interface RoutingNodeState {
  /** Full node state from workflow run */
  nodeState: ReturnType<typeof getNodeState>
  /** Current step status (pending, running, completed, failed, etc.) */
  stepStatus: string | null
  /** The selected/chosen route after execution */
  selectedRoute: string | null
  /** Validation context data from backend */
  validationContext: ValidationContext | null
  /** Whether there's a pending human validation */
  hasPendingValidation: boolean
  /** Formatted pending validation data for HumanValidationModal */
  pendingValidation: HookPendingValidation | null
  /** AI analysis/explanation text */
  aiAnalysis: string | null
  /** AI recommended route */
  aiRecommendation: string | null
  /** Whether the decision was human-validated */
  isHumanValidated: boolean
  /** User's chosen route (for completed human-validated decisions) */
  userChoice: string | null
}

/**
 * Shared hook for routing node state (StructuredOutputNode).
 *
 * This hook provides a unified interface for accessing routing node state.
 *
 * @param nodeId - The ID of the routing node
 * @returns RoutingNodeState with all relevant routing data
 *
 * @example
 * ```tsx
 * const {
 *   stepStatus, selectedRoute, hasPendingValidation,
 *   pendingValidation, aiAnalysis, aiRecommendation
 * } = useRoutingNode(id)
 *
 * if (hasPendingValidation && pendingValidation) {
 *   return <HumanValidationModal validation={pendingValidation} />
 * }
 *
 * if (stepStatus === 'completed' && selectedRoute) {
 *   return <RoutingDecisionDisplay route={selectedRoute} analysis={aiAnalysis} />
 * }
 * ```
 */
export function useRoutingNode(nodeId: string): RoutingNodeState {
  const { currentRun, availableRuns, selectedRunIds } = useAppSelector(
    (s) => s.workflowBuilder
  )

  // Get the run to display (handles all modes automatically)
  const displayRun = getDisplayRun(
    nodeId,
    selectedRunIds,
    availableRuns,
    currentRun
  )

  // V2 API: Direct node state access
  const nodeState = getNodeState(displayRun, nodeId)

  // Extract data from nodeState
  const stepStatus = nodeState?.status ?? null
  const selectedRoute = nodeState?.response ?? null
  const validationContext =
    (nodeState?.validationContext as ValidationContext) ?? null

  // Get metadata for completed steps (contains AI analysis even after decision)
  const metadata = nodeState?.metadata ?? null

  // AI analysis: prefer validationContext (pending), fallback to metadata (completed)
  const aiAnalysis =
    validationContext?.aiAnalysis ?? metadata?.aiAnalysis ?? null
  const aiRecommendation =
    validationContext?.aiRecommendation ?? metadata?.aiRecommendation ?? null

  // Check if this node has a pending validation
  const hasPendingValidation =
    nodeState?.status === 'pending_human_input' &&
    !!nodeState?.validationContext

  // Build validation object from nodeState for HumanValidationModal compatibility
  // Backend guarantees availableRoutes is always [{name, description}] objects
  const pendingValidation: HookPendingValidation | null = hasPendingValidation
    ? {
        nodeId,
        label: validationContext?.label ?? '',
        customPrompt: validationContext?.customPrompt ?? '',
        availableRoutes: validationContext?.availableRoutes ?? [],
        currentResponse: nodeState?.response ?? '',
        stepId: nodeState?.stepId ?? 0,
        aiRecommendation: validationContext?.aiRecommendation ?? undefined,
        aiAnalysis: validationContext?.aiAnalysis ?? undefined,
      }
    : null

  // Check if this was a human-validated decision (from metadata or inferred from completion)
  const isHumanValidated = metadata?.isHumanValidated ?? false
  const userChoice =
    metadata?.userChoice ?? (isHumanValidated ? selectedRoute : null)

  return {
    nodeState,
    stepStatus,
    selectedRoute,
    validationContext,
    hasPendingValidation,
    pendingValidation,
    aiAnalysis,
    aiRecommendation,
    isHumanValidated,
    userChoice,
  }
}
