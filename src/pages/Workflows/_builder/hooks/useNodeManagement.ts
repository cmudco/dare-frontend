import { useCallback } from 'react'
import { type Node, type Edge } from '@xyflow/react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setNodes, setEdges } from '@/redux/workflowBuilderSlice'
import { toast } from '@/utils/toast'

interface UseNodeManagementProps {
  disableEditing?: boolean
}

export const useNodeManagement = ({
  disableEditing,
}: UseNodeManagementProps = {}) => {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const edges = useAppSelector((state) => state.workflowBuilder.edges)

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      if (disableEditing) return

      const hasStart = nodes.some((n) => n.type === 'start')
      if (!hasStart && type !== 'start') {
        toast.error('Add a Start node first.')
        return
      }
      if (hasStart && type === 'start') {
        toast.info('Only one Start node is allowed.')
        return
      }

      if (type === 'step') {
        // Auto-create step + output node pair
        const stepNumber = nodes.filter((n) => n.type === 'step').length + 1
        const stepId = `${nodes.length + 1}`
        const outputId = `${nodes.length + 2}`

        const stepNode: Node = {
          id: stepId,
          type: 'step',
          position,
          data: { label: 'step', stepNumber },
        }

        const outputNode: Node = {
          id: outputId,
          type: 'chatOutput',
          position: { x: position.x + 400, y: position.y },
          data: { label: `Step ${stepNumber} Output` },
        }

        // Create edge connecting step to output
        const stepToOutputEdge: Edge = {
          id: `e-${stepId}-${outputId}`,
          source: stepId,
          target: outputId,
          type: 'smoothstep',
        }

        const nextNodes = [...nodes, stepNode, outputNode]

        // Start with step -> output edge
        let nextEdges = [...edges, stepToOutputEdge]

        // If in sequential mode, auto-wire previous output -> this step
        const start = nodes.find((n) => n.type === 'start')
        const mode: 'sequential' | 'parallel' =
          (start?.data as { mode?: 'sequential' | 'parallel' } | undefined)
            ?.mode === 'parallel'
            ? 'parallel'
            : 'sequential'
        if (mode === 'sequential') {
          const prevStepNumber = stepNumber - 1
          if (prevStepNumber >= 1) {
            // Find previous step node by stepNumber
            const prevStep = nodes.find(
              (n) =>
                n.type === 'step' &&
                Number(
                  (n.data as { stepNumber?: number } | undefined)?.stepNumber
                ) === prevStepNumber
            )
            if (prevStep) {
              // Find its output node via existing edge source=prevStep.id -> target chatOutput
              const prevStepToOutput = edges.find(
                (e) =>
                  e.source === prevStep.id &&
                  nodes.find((n) => n.id === e.target)?.type === 'chatOutput'
              )
              const prevOutputId = prevStepToOutput?.target
              if (prevOutputId) {
                const exists = edges.some(
                  (e) => e.source === prevOutputId && e.target === stepId
                )
                if (!exists) {
                  nextEdges = [
                    ...nextEdges,
                    {
                      id: `e-${prevOutputId}-${stepId}`,
                      source: prevOutputId,
                      target: stepId,
                      type: 'smoothstep',
                    },
                  ]
                }
              }
            }
          }
        }

        dispatch(setNodes(nextNodes))
        dispatch(setEdges(nextEdges))
      } else {
        // Handle start node with initial data
        const newNode: Node = {
          id: `${nodes.length + 1}`,
          type,
          position,
          data:
            type === 'start'
              ? {
                  title: '',
                  description: '',
                  mode: 'sequential',
                  spareHandle: true,
                }
              : { label: type },
        }

        dispatch(setNodes([...nodes, newNode]))
      }
    },
    [nodes, edges, dispatch, disableEditing]
  )

  const removeNode = useCallback(
    (nodeId: string) => {
      if (disableEditing) return

      const updatedNodes = nodes.filter((node) => node.id !== nodeId)
      const updatedEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )

      dispatch(setNodes(updatedNodes))
      dispatch(setEdges(updatedEdges))
    },
    [nodes, edges, dispatch, disableEditing]
  )

  const updateNodeData = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      if (disableEditing) return

      const updatedNodes = nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )

      dispatch(setNodes(updatedNodes))
    },
    [nodes, dispatch, disableEditing]
  )

  return {
    addNode,
    removeNode,
    updateNodeData,
  }
}
