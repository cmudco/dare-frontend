/**
 * Shared routing components for workflow routing nodes.
 *
 * These components provide unified UI for ConditionalNode and StructuredOutputNode:
 * - RoutingDecisionDisplay: Shows completed routing decisions
 * - HumanValidationPrompt: Shows pending human validation UI
 * - RouteConfigPanel: Route name/description configuration inputs
 */

export { RoutingDecisionDisplay } from './RoutingDecisionDisplay'
export { HumanValidationPrompt } from './HumanValidationPrompt'
export { RouteConfigPanel, type Route } from './RouteConfigPanel'
