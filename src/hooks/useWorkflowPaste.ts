import { useCallback, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { importNodes } from '@/redux/workflowBuilder'
import {
  importWorkflowFromString,
  type ImportOptions,
} from '@/utils/workflowBuilder/importWorkflow'
import { WORKFLOW_EXPORT_MARKER } from '@/utils/workflowBuilder/exportWorkflow'
import { toast } from '@/utils/toast'

interface UseWorkflowPasteOptions {
  /** When true, paste functionality is disabled */
  disabled?: boolean
}

interface UseWorkflowPasteResult {
  /** Whether paste is currently enabled */
  isEnabled: boolean
}

/**
 * Custom hook that handles workflow paste functionality.
 *
 * Listens for paste events on the document and imports valid Dare workflow
 * JSON from the clipboard. Automatically centers imported nodes at the
 * current viewport position.
 *
 * Features:
 * - Validates clipboard content for Dare workflow marker
 * - Regenerates IDs to avoid collisions
 * - Centers nodes at viewport
 * - Shows toast notifications
 * - Ignores paste when inputs are focused or workflow is running
 *
 * @param options - Configuration options
 * @returns Object with paste state information
 *
 * @example
 * ```tsx
 * const WorkflowBuilder = ({ disableEditing }) => {
 *   const { isEnabled } = useWorkflowPaste({ disabled: disableEditing })
 *   return <ReactFlow ... />
 * }
 * ```
 */
export const useWorkflowPaste = (
  options: UseWorkflowPasteOptions = {}
): UseWorkflowPasteResult => {
  const { disabled = false } = options

  const dispatch = useAppDispatch()
  const reactFlowInstance = useReactFlow()
  const isWorkflowRunning = useAppSelector(
    (state) => state.workflowBuilder.execution.isRunning
  )

  // Paste is enabled when not disabled and workflow is not running
  const isEnabled = !disabled && !isWorkflowRunning

  /**
   * Calculates the center of the current viewport in flow coordinates.
   */
  const getViewportCenter = useCallback((): { x: number; y: number } => {
    try {
      const reactFlowElement = document.querySelector('.react-flow')
      if (!reactFlowElement) {
        return { x: 400, y: 300 }
      }

      const bounds = reactFlowElement.getBoundingClientRect()
      const centerX = bounds.width / 2
      const centerY = bounds.height / 2

      return reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      })
    } catch (error) {
      console.warn('Failed to get viewport center:', error)
      return { x: 400, y: 300 }
    }
  }, [reactFlowInstance])

  /**
   * Handles paste events to import workflows from clipboard.
   */
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      // Don't process paste if an input/textarea is focused
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return
      }

      // Don't process paste if disabled or workflow is running
      if (!isEnabled) {
        return
      }

      // Get clipboard text
      const clipboardText = event.clipboardData?.getData('text/plain')
      if (!clipboardText) {
        return
      }

      // Quick check: does it look like our workflow export?
      if (!clipboardText.includes(WORKFLOW_EXPORT_MARKER)) {
        return
      }

      // Prevent default paste behavior since we're handling it
      event.preventDefault()

      // Calculate where to place the imported nodes
      const viewportCenter = getViewportCenter()

      const importOptions: ImportOptions = {
        viewportCenter,
        offsetToCenter: true,
      }

      // Import the workflow
      const result = importWorkflowFromString(clipboardText, importOptions)

      if (!result.success) {
        toast.error(result.error || 'Failed to import workflow')
        return
      }

      if (result.nodes.length === 0) {
        toast.info('The pasted workflow has no nodes')
        return
      }

      // Dispatch the import action
      dispatch(importNodes({ nodes: result.nodes, edges: result.edges }))

      toast.success(
        `Imported ${result.nodes.length} nodes and ${result.edges.length} connections`
      )
    },
    [dispatch, isEnabled, getViewportCenter]
  )

  // Listen for paste events on the document
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  return { isEnabled }
}
