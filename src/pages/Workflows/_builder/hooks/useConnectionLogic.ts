import { useCallback } from 'react'
import { addEdge, type Connection, type Edge, type Node } from '@xyflow/react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setNodes, setEdges } from '@/redux/workflowBuilderSlice'

export const useConnectionLogic = () => {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const edges = useAppSelector((state) => state.workflowBuilder.edges)

  const getStartNode = useCallback(() => {
    return nodes.find((n) => n.type === 'start')
  }, [nodes])

  type Mode = 'sequential' | 'parallel'
  const getMode = (startNode?: Node): Mode => {
    const m = (startNode?.data as { mode?: Mode } | undefined)?.mode
    return m === 'parallel' ? 'parallel' : 'sequential'
  }
  const getStepNumber = (node?: Node): number | undefined => {
    const num = (node?.data as { stepNumber?: number } | undefined)?.stepNumber
    return typeof num === 'number' ? num : undefined
  }

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const start = getStartNode()
      const modeValue = getMode(start)
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) return false

      // Prevent connecting to self
      if (connection.source === connection.target) return false

      const sType = sourceNode.type
      const tType = targetNode.type

      // Allow Start <-> Step regardless of drag direction
      if (
        (sType === 'start' && tType === 'step') ||
        (sType === 'step' && tType === 'start')
      ) {
        if (modeValue === 'sequential') {
          const existing = edges.filter((e) => e.source === start?.id)
          if (existing.length >= 1) return false
        }
        return true
      }

      if (sType === 'step') {
        return tType === 'chatOutput'
      }

      if (sType === 'chatOutput') {
        if (modeValue === 'parallel') return false
        if (tType !== 'step') return false

        // Sequential: enforce output -> next step only
        const chatOutputId = connection.source as string
        // find the step that feeds this output
        const incomingFromStep = edges.find(
          (e) =>
            e.target === chatOutputId &&
            nodes.find((n) => n.id === e.source)?.type === 'step'
        )
        if (!incomingFromStep) return false
        const sourceStep = nodes.find((n) => n.id === incomingFromStep.source)
        const targetStep = targetNode
        const srcNum = getStepNumber(sourceStep)
        const tgtNum = getStepNumber(targetStep)
        if (!Number.isFinite(srcNum) || !Number.isFinite(tgtNum)) return false

        // Allow only linking to immediate next step
        if (tgtNum !== srcNum + 1) return false

        // Disallow multiple next links from the same output
        const alreadyHasNext = edges.some(
          (e) =>
            e.source === chatOutputId &&
            nodes.find((n) => n.id === e.target)?.type === 'step'
        )
        if (alreadyHasNext) return false

        // Disallow multiple previous outputs into the same step
        const targetHasPrev = edges.some(
          (e) =>
            e.target === targetStep.id &&
            nodes.find((n) => n.id === e.source)?.type === 'chatOutput'
        )
        if (targetHasPrev) return false

        return true
      }

      return false
    },
    [nodes, edges, getStartNode]
  )

  const handleConnection = useCallback(
    (params: Connection) => {
      const startNode = getStartNode()
      const modeValue = getMode(startNode)
      const sourceNode = nodes.find((n) => n.id === params.source)
      const targetNode = nodes.find((n) => n.id === params.target)

      // Normalize Start -> Step direction even if user dragged Step -> Start
      const involvesStartAndStep =
        (sourceNode?.type === 'start' && targetNode?.type === 'step') ||
        (sourceNode?.type === 'step' && targetNode?.type === 'start')

      if (involvesStartAndStep) {
        const normalized: Connection = {
          source: startNode?.id as string,
          target: (sourceNode?.type === 'step'
            ? params.source
            : params.target) as string,
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
        }

        if (modeValue === 'parallel') {
          const handleUsed =
            params.source === startNode?.id
              ? params.sourceHandle
              : params.targetHandle
          normalized.sourceHandle = handleUsed || null
          const newEdges = addEdge(normalized, edges)
          dispatch(setEdges(newEdges))
          return
        } else {
          normalized.sourceHandle = null
        }

        const afterAdd = addEdge(normalized, edges)
        dispatch(setEdges(afterAdd))
        return
      }

      // Handle Step -> Output with cloning logic for reused outputs
      const srcNode = nodes.find((n) => n.id === params.source)
      const tgtNode = nodes.find((n) => n.id === params.target)
      const isStepToOutput =
        srcNode?.type === 'step' && tgtNode?.type === 'chatOutput'

      if (isStepToOutput && params.target) {
        const outputAlreadyUsedByAnotherStep = edges.some((e) => {
          if (e.target !== params.target) return false
          const sourceOfExisting = nodes.find((n) => n.id === e.source)
          return sourceOfExisting?.type === 'step'
        })

        if (outputAlreadyUsedByAnotherStep) {
          const srcPos = srcNode.position
          const tgtPos = tgtNode.position
          const newOutputId = `${nodes.length + 1}`
          const newOutputNode: Node = {
            id: newOutputId,
            type: 'chatOutput',
            position: { x: tgtPos.x, y: srcPos.y },
            data: tgtNode.data,
          }

          dispatch(setNodes([...nodes, newOutputNode]))

          const newEdge: Edge = {
            id: `e-${params.source}-${newOutputId}`,
            source: params.source!,
            target: newOutputId,
            type: 'smoothstep',
          }

          dispatch(setEdges([...edges, newEdge]))
          return
        }
      }

      // Default connection
      const newEdges = addEdge(params, edges)
      dispatch(setEdges(newEdges))
    },
    [nodes, edges, dispatch, getStartNode]
  )

  return {
    handleConnection,
    isValidConnection,
    getStartNode,
  }
}
