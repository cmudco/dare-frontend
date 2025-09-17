import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setNodes,
  setEdges,
  setLastWorkflowId,
} from '@/redux/workflowBuilderSlice'
import {
  getWorkflowRunById,
  getWorkflowById,
} from '@/redux/asyncThunks/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import {
  type Workflow,
  type WorkflowRun,
  type WorkflowRunStep,
  type Step as ApiStep,
} from '@/redux/types/workflow'
import type { MyFile } from '@/redux/types/files'
import { type Node, type Edge } from '@xyflow/react'

interface UseWorkflowLoadingProps {
  initialWorkflow?: Workflow
  workflowId?: string
}

const toIdString = (value: unknown): string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'object') {
    const maybeId = (value as { id?: unknown }).id
    if (maybeId != null) return String(maybeId)
  }
  return String(value)
}

const getWorkflowVersionToken = (workflow?: Workflow): string => {
  if (!workflow) return ''
  return (
    workflow.updatedAt ||
    (workflow as unknown as { updated_at?: string }).updated_at ||
    workflow.createdAt ||
    (workflow as unknown as { created_at?: string }).created_at ||
    ''
  )
}

export const useWorkflowLoading = ({
  initialWorkflow,
  workflowId,
}: UseWorkflowLoadingProps) => {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const edges = useAppSelector((state) => state.workflowBuilder.edges)
  const selectedRun = useAppSelector((s) => s.workflow.selectedWorkflowRun)
  const lastWorkflowId = useAppSelector(
    (state) => state.workflowBuilder.lastWorkflowId
  )
  const workflowFromStore = useAppSelector((s) => s.workflow.selectedWorkflow)

  const currentWorkflowId = initialWorkflow?.id?.toString() || workflowId || ''
  const isWorkflowRunning =
    selectedRun?.status === WorkflowRunStepStatus.Running

  // Fetch workflow if we have ID but no initial workflow data
  useEffect(() => {
    if (workflowId && !initialWorkflow && workflowId !== lastWorkflowId) {
      dispatch(getWorkflowById(workflowId))
    }
  }, [workflowId, initialWorkflow, lastWorkflowId, dispatch])

  // Load workflow when initialWorkflow or workflowId changes
  useEffect(() => {
    const workflowToLoad = initialWorkflow || workflowFromStore
    const targetId = workflowToLoad?.id?.toString() || workflowId

    console.log('🔧 WORKFLOW LOADING DEBUG:', {
      workflowToLoad,
      targetId,
      initialWorkflow,
      workflowFromStore,
      lastWorkflowId,
    })

    if (!targetId) {
      console.log('❌ No targetId, returning')
      return
    }

    if (!workflowToLoad) {
      console.log('❌ No workflowToLoad, returning')
      return
    }

    // Allow reloading if the workflow data has changed
    if (targetId === lastWorkflowId) {
      // For now, let's reload anyway to ensure data consistency
    }

    // Create nodes from workflow steps
    const workflowSteps = (workflowToLoad?.steps || []) as ApiStep[]
    let workflowVersion = getWorkflowVersionToken(workflowToLoad)
    if (!workflowVersion) {
      workflowVersion = JSON.stringify(
        workflowSteps.map((step: ApiStep) => ({
          id: step.id,
          updatedAt:
            (step as unknown as { updated_at?: string }).updated_at ||
            step.updatedAt,
          prompt: toIdString(step.prompt),
          llm: toIdString(step.llm),
          files: (step.files || []).map(
            (f: MyFile | string | number) => (f as MyFile)?.id ?? f
          ),
          embeddings: (step.embeddings || []).map(
            (e: MyFile | string | number) => (e as MyFile)?.id ?? e
          ),
        }))
      )
    }
    const workflowInstanceKey = `workflow-${targetId}-${workflowVersion}`

    // If we're already showing this workflow instance, avoid re-hydration
    const existingStart = nodes.find((n) => n.type === 'start')
    const existingKey = (
      existingStart?.data as { instanceKey?: string } | undefined
    )?.instanceKey
    if (existingKey && existingKey === workflowInstanceKey) {
      return
    }

    console.log('📋 WORKFLOW STEPS:', workflowSteps)
    console.log('🎯 START NODE DATA:', {
      title: workflowToLoad?.title,
      description: workflowToLoad?.description,
      mode: workflowToLoad?.mode,
      modeConverted: workflowToLoad?.mode === 2 ? 'parallel' : 'sequential',
    })

    const startNode: Node = {
      id: '0',  // Start node is always "0"
      type: 'start',
      position: { x: 100, y: 100 },
      data: {
        title: workflowToLoad?.title || '',
        description: workflowToLoad?.description || '',
        mode: workflowToLoad?.mode === 2 ? 'parallel' : 'sequential',
        spareHandle: true,
        instanceKey: workflowInstanceKey,
      },
    }

    const stepNodes: Node[] = workflowSteps.map(
      (step: ApiStep, idx: number) => {
        const stepVersion =
          step.updatedAt ||
          (step as unknown as { updated_at?: string }).updated_at ||
          step.createdAt ||
          (step as unknown as { created_at?: string }).created_at ||
          workflowVersion

        const stepData = {
          stepNumber: step.order || idx + 1,
          apiId: step.id,  // Store API ID here
          prompt: toIdString(step.prompt) || '',
          contentFiles: (step.files || []).map((f: MyFile | string | number) =>
            String(((f as MyFile)?.id ?? f) as string | number)
          ),
          embeddingFiles: (step.embeddings || []).map(
            (e: MyFile | string | number) =>
              String(((e as MyFile)?.id ?? e) as string | number)
          ),
          llm: toIdString(step.llm) || '',
          maxTokens: typeof step.maxTokens === 'number' ? step.maxTokens : 2048,
          temperature:
            typeof step.temperature === 'number' ? step.temperature : 0.7,
          maxContextSnippets:
            typeof step.maxContextSnippets === 'number'
              ? step.maxContextSnippets
              : 4,
          documentSimilarityThreshold:
            typeof step.documentSimilarityThreshold === 'number'
              ? step.documentSimilarityThreshold
              : 0.2,
          usePreviousStepFiles: Boolean(step.usePreviousStepFiles),
          usePreviousStepEmbeddings: Boolean(step.usePreviousStepEmbeddings),
          instanceKey: `step-${step.id || idx}-${stepVersion}`,
          originalStepId: step.id,
        }

        console.log(`🔢 STEP ${idx + 1} DATA:`, {
          originalStep: step,
          mappedStepData: stepData,
          promptType: typeof stepData.prompt,
          llmType: typeof stepData.llm,
          promptValue: stepData.prompt,
          llmValue: stepData.llm,
        })

        return {
          id: (idx + 1).toString(),  // "1", "2", "3"
          type: 'step',
          position: { x: 300 + idx * 400, y: 100 },
          data: stepData,
        }
      }
    )

    let outputNodes: Node[] = workflowSteps.map(
      (step: ApiStep, idx: number) => {
        const stepVersion =
          step.updatedAt ||
          (step as unknown as { updated_at?: string }).updated_at ||
          step.createdAt ||
          (step as unknown as { created_at?: string }).created_at ||
          workflowVersion

        return {
          id: `${idx + 1}o`,  // "1o", "2o", "3o"
          type: 'chatOutput',
          position: { x: 300 + idx * 400, y: 300 },
          data: {
            label: `Step ${step.order || idx + 1} Output`,
            stepNumber: step.order || idx + 1,
            instanceKey: `output-${step.id || idx}-${stepVersion}`,
          },
        }
      }
    )

    // If workflow comes with a latestRun, populate output nodes with its responses
    const latestRun: WorkflowRun | null | undefined = workflowToLoad.latestRun
    const runSteps: WorkflowRunStep[] | undefined = latestRun?.steps
    if (Array.isArray(runSteps) && runSteps.length) {
      const pickStepNumber = (runStep: WorkflowRunStep) => {
        const raw = runStep?.step_number ?? runStep?.order ?? runStep?.step
        const parsed = Number(raw)
        return Number.isNaN(parsed) ? undefined : parsed
      }
      const findRunFor = (num: number) =>
        runSteps.find((rs) => pickStepNumber(rs) === num)
      outputNodes = outputNodes.map((outNode, idx) => {
        const stepNode = stepNodes[idx]
        const stepNum = Number(
          (stepNode?.data as { stepNumber?: number } | undefined)?.stepNumber
        )
        if (!stepNum) return outNode
        const rs = findRunFor(stepNum)
        if (!rs) return outNode
        return {
          ...outNode,
          data: {
            ...outNode.data,
            response: rs.response,
            status: rs.status,
          },
        }
      })
    }

    // Create edges: Start -> Steps, Steps -> Outputs
    const startToStepEdges: Edge[] = (() => {
      const isParallel = workflowToLoad?.mode === 2
      if (isParallel) {
        return stepNodes.map((step, idx) => ({
          id: `e-start-${step.id}`,
          source: '0',  // Start node is always "0"
          target: step.id,
          type: 'smoothstep',
          sourceHandle: `output-${idx + 1}`,
        }))
      }
      // sequential: only connect to the first step
      if (stepNodes.length === 0) return []
      const first = stepNodes
        .slice()
        .sort(
          (a, b) =>
            Number(
              (a.data as { stepNumber?: number } | undefined)?.stepNumber
            ) -
            Number((b.data as { stepNumber?: number } | undefined)?.stepNumber)
        )[0]
      return [
        {
          id: `e-start-${first.id}`,
          source: '0',  // Start node is always "0"
          target: first.id,
          type: 'smoothstep',
          sourceHandle: null,
        },
      ]
    })()

    const stepToOutputEdges: Edge[] = stepNodes.map((step, idx) => ({
      id: `e-${step.id}-${outputNodes[idx].id}`,
      source: step.id,
      target: outputNodes[idx].id,
      type: 'smoothstep',
    }))

    // Sequential mode: connect outputs to next steps
    const outputToStepEdges: Edge[] = []
    if (workflowToLoad?.mode !== 2 && stepNodes.length > 1) {
      for (let i = 0; i < stepNodes.length - 1; i++) {
        outputToStepEdges.push({
          id: `e-output-${i}-step-${i + 1}`,
          source: outputNodes[i].id,
          target: stepNodes[i + 1].id,
          type: 'smoothstep',
        })
      }
    }

    const allNodes = [startNode, ...stepNodes, ...outputNodes]
    const allEdges = [
      ...startToStepEdges,
      ...stepToOutputEdges,
      ...outputToStepEdges,
    ]

    console.log('🚀 DISPATCHING NODES:', allNodes)
    console.log('🔗 DISPATCHING EDGES:', allEdges)

    dispatch(setNodes(allNodes))
    dispatch(setEdges(allEdges))
    dispatch(setLastWorkflowId(targetId))
  }, [initialWorkflow, workflowFromStore, workflowId, dispatch, nodes])

  // Poll run status while running
  useEffect(() => {
    if (!selectedRun?.id) return
    // Only poll if the run belongs to the workflow currently being edited
    if (String(selectedRun.workflow) !== String(currentWorkflowId)) return

    let timer: ReturnType<typeof setInterval> | undefined
    if (selectedRun.status === WorkflowRunStepStatus.Running) {
      timer = setInterval(() => {
        dispatch(getWorkflowRunById(selectedRun.id))
      }, 3000)
    }
    return () => timer && clearInterval(timer)
  }, [
    dispatch,
    selectedRun?.id,
    selectedRun?.status,
    currentWorkflowId,
    selectedRun?.workflow,
  ])

  // Mirror run step responses into output nodes
  useEffect(() => {
    if (!selectedRun?.steps) return

    const nodesMap = new Map(nodes.map((n) => [n.id, n]))
    const pickStepNumber = (runStep: WorkflowRunStep) => {
      const raw = runStep?.step_number ?? runStep?.order ?? runStep?.step
      const parsed = Number(raw)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    let changed = false
    const next = nodes.map((node) => {
      if (node.type !== 'chatOutput') return node

      const edgesToThisOutput = edges.filter((e) => e.target === node.id)
      const sourceStepNode = edgesToThisOutput.find((e) => {
        const sourceNode = nodesMap.get(e.source)
        return sourceNode?.type === 'step'
      })

      if (!sourceStepNode) return node
      const sourceStep = nodesMap.get(sourceStepNode.source)
      const stepNumber = Number(
        (sourceStep?.data as { stepNumber?: number } | undefined)?.stepNumber
      )
      if (!stepNumber) return node

      const runStep = selectedRun.steps.find(
        (rs: WorkflowRunStep) => pickStepNumber(rs) === stepNumber
      )
      if (!runStep) return node

      const prevResp = (node.data as { response?: string } | undefined)
        ?.response
      const prevStatus = (node.data as { status?: string } | undefined)?.status
      const nextResp = runStep.response
      const nextStatus = runStep.status
      if (prevResp === nextResp && prevStatus === nextStatus) return node

      changed = true
      return {
        ...node,
        data: {
          ...node.data,
          response: nextResp,
          status: nextStatus,
        },
      }
    })

    if (changed) {
      dispatch(setNodes(next))
    }
  }, [selectedRun?.steps, edges, nodes, dispatch])

  return {
    isWorkflowRunning,
    currentWorkflowId,
  }
}
