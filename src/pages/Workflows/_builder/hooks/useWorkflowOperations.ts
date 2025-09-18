import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createOrUpdateWorkflow } from '@/redux/asyncThunks/workflow'
import { setSelectedWorkflowRun } from '@/redux/workflowSlice'
import { resetBuilder, setErrorsByNodeId } from '@/redux/workflowBuilderSlice'
import { WorkflowMode, type Workflow } from '@/redux/types/workflow'
import type { NodeErrors } from '@/redux/types/workflowBuilder'
import type { StepNodeData } from '../nodes/StepNode'
import { toast } from '@/utils/toast'

const normalizeIdValue = (value: unknown): string | null => {
  if (value == null || value === '') return null
  if (typeof value === 'object') {
    const maybeId =
      (value as { id?: unknown; value?: unknown }).id ??
      (value as { value?: unknown }).value
    if (maybeId == null || maybeId === '') return null
    return String(maybeId)
  }
  return String(value)
}

const toNumberOrNull = (value: unknown): number | null => {
  const normalized = normalizeIdValue(value)
  if (normalized == null) return null
  const asNumber = Number(normalized)
  return Number.isNaN(asNumber) ? null : asNumber
}

const toNumericArray = (values: unknown[] | undefined): number[] => {
  if (!Array.isArray(values)) return []
  return values
    .map((value) => toNumberOrNull(value))
    .filter((value): value is number => value != null)
}

interface UseWorkflowOperationsProps {
  initialWorkflow?: Workflow
  workflowId?: string
  onSaved?: (workflowId: string) => void
}

export const useWorkflowOperations = ({
  initialWorkflow,
  workflowId,
  onSaved,
}: UseWorkflowOperationsProps) => {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const edges = useAppSelector((state) => state.workflowBuilder.edges)

  const serializeAndSave = useCallback(() => {
    const start = nodes.find((n) => n.type === 'start')
    const startData = start?.data as
      | {
          title?: string
          description?: string
          mode?: 'sequential' | 'parallel'
        }
      | undefined
    const title = (startData?.title || '').trim()
    const description = (startData?.description || '').trim()
    const mode = (
      startData?.mode === 'parallel'
        ? WorkflowMode.Parallel
        : WorkflowMode.Serial
    ) as number

    // Client-side validation to produce field-level errors
    const nodeErrors: Record<string, NodeErrors> = {}
    if (!title) {
      const sid = start?.id || '1'
      nodeErrors[sid] = {
        ...(nodeErrors[sid] || {}),
        title: 'Title is required',
      }
    }
    if (!description) {
      const sid = start?.id || '1'
      nodeErrors[sid] = {
        ...(nodeErrors[sid] || {}),
        description: 'Description is required',
      }
    }
    const stepNodesRaw = nodes.filter((n) => n.type === 'step')
    stepNodesRaw.forEach((sn) => {
      const d = (sn.data as Partial<StepNodeData>) || {}
      if (!d?.prompt) {
        nodeErrors[sn.id] = {
          ...(nodeErrors[sn.id] || {}),
          prompt: 'Please select a prompt',
        }
      }
      if (!d?.llm) {
        nodeErrors[sn.id] = {
          ...(nodeErrors[sn.id] || {}),
          llm: 'Please select an LLM',
        }
      }
    })
    if (Object.keys(nodeErrors).length > 0) {
      dispatch(setErrorsByNodeId(nodeErrors))
      toast.error('Please fix the highlighted fields')
      return
    }

    // Build step sequence following edges from start
    const edgesBySource = edges.reduce<Record<string, string[]>>((acc, e) => {
      if (!acc[e.source]) acc[e.source] = []
      acc[e.source].push(e.target)
      return acc
    }, {})

    const visited = new Set<string>()
    const sequence: string[] = []

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      const node = nodes.find((n) => n.id === nodeId)
      if (node?.type === 'step') {
        sequence.push(nodeId)
      }
      edgesBySource[nodeId]?.forEach(traverse)
    }

    if (start) traverse(start.id)

    // Build step nodes with proper order and required fields
    const stepNodes = nodes
      .filter((n) => n.type === 'step')
      .sort((a, b) => {
        const aIdx = sequence.indexOf(a.id)
        const bIdx = sequence.indexOf(b.id)
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
      })
      .map((n, idx) => {
        const nodeData = n.data as Partial<StepNodeData>
        const stepData: {
          id?: string
          order: number
          prompt: string | null
          files?: number[]
          embeddings?: number[]
          llm?: number | null
          maxTokens?: number | null
          temperature?: number | null
          maxContextSnippets?: number | null
          documentSimilarityThreshold?: number | null
        } = {
          order: idx + 1,
          prompt: normalizeIdValue(nodeData?.prompt),
          files: toNumericArray(nodeData?.contentFiles),
          embeddings: toNumericArray(nodeData?.embeddingFiles),
          llm: toNumberOrNull(nodeData?.llm),
          maxTokens: nodeData?.maxTokens ?? null,
          temperature: nodeData?.temperature ?? null,
          maxContextSnippets: nodeData?.maxContextSnippets ?? null,
          documentSimilarityThreshold:
            nodeData?.documentSimilarityThreshold ?? null,
        }

        // Include step ID if this is an existing step (for updates)
        if (nodeData?.id) {
          stepData.id = nodeData.id
        }

        return stepData
      })

    const workflowData = {
      title,
      description,
      mode,
      steps: stepNodes,
    }

    // Additional guard (should be covered by field-level validation above)
    if (!title.trim()) {
      toast.error('Workflow title is required')
      return
    }

    // Save
    const targetId = initialWorkflow?.id?.toString() || workflowId || ''
    const action = targetId
      ? createOrUpdateWorkflow({ id: targetId, workflowData })
      : createOrUpdateWorkflow({ workflowData })

    dispatch(action)
      .unwrap()
      .then((saved) => {
        const savedId = String((saved as Workflow).id ?? targetId)
        toast.success(targetId ? 'Workflow updated!' : 'Workflow created!')
        // Clear any previously selected run so saving doesn't continue/pick up polling
        dispatch(setSelectedWorkflowRun(null))
        onSaved?.(savedId)
      })
      .catch((error: unknown) => {
        toast.error('Network error while saving workflow')
        console.error('Network error:', error)
      })
  }, [nodes, edges, initialWorkflow, workflowId, onSaved, dispatch])

  const clearWorkflow = useCallback(() => {
    dispatch(resetBuilder())
    toast.info('Workflow cleared')
  }, [dispatch])

  const validateWorkflow = useCallback(() => {
    const start = nodes.find((n) => n.type === 'start')
    const stepNodes = nodes.filter((n) => n.type === 'step')

    const errors: string[] = []

    if (!start) {
      errors.push('Start node is required')
    } else {
      const title = (
        (start?.data as { title?: string } | undefined)?.title || ''
      ).trim()
      if (!title) {
        errors.push('Workflow title is required')
      }
    }

    if (stepNodes.length === 0) {
      errors.push('At least one step is required')
    }

    stepNodes.forEach((step, idx) => {
      const stepData = step?.data as Partial<StepNodeData>
      const prompt = stepData?.prompt

      if (!prompt) {
        errors.push(`Step ${idx + 1} requires a prompt`)
      } else if (
        typeof prompt === 'object' &&
        prompt !== null &&
        !('id' in prompt)
      ) {
        errors.push(`Step ${idx + 1} has invalid prompt data`)
      } else if (typeof prompt === 'string' && !prompt.trim()) {
        errors.push(`Step ${idx + 1} requires a prompt`)
      }

      // Validate LLM
      if (!stepData?.llm) {
        errors.push(`Step ${idx + 1} requires an LLM selection`)
      }
    })

    return errors
  }, [nodes])

  return {
    serializeAndSave,
    clearWorkflow,
    validateWorkflow,
  }
}
