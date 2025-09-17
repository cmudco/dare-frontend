import { useCallback, useEffect, forwardRef, useImperativeHandle, useState, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Sidebar from './components/Sidebar'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createOrUpdateWorkflow, getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { WorkflowMode, type Workflow } from '@/redux/types/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { toast } from '@/utils/toast'
import { getErrorMessage } from '@/utils/errorHandler'
import StartNode from './nodes/StartNode'
import StepNode from './nodes/StepNode'
import ChatOutputNode from './nodes/ChatOutputNode'
import { ErrorsContext, type NodeErrors } from './ErrorsContext'
import { workflowValidationSchema } from '@/pages/Workflows/validation'
import { Loader2 } from 'lucide-react'

const nodeTypes: NodeTypes = {
  start: StartNode,
  step: StepNode,
  chatOutput: ChatOutputNode,
}

const initialNodes: Node[] = []

const initialEdges: Edge[] = []

// Theme-aware default edge styling
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: 'hsl(var(--primary))', strokeOpacity: 0.5 },
}

export interface WorkflowBuilderHandle { save: () => void }
export interface WorkflowBuilderProps {
  initialWorkflow?: Workflow
  workflowId?: string
  onSaved?: (workflowId: string) => void
  disableEditing?: boolean
}

const WorkflowBuilder = forwardRef<WorkflowBuilderHandle, WorkflowBuilderProps>(function _WorkflowBuilder(props, ref) {
  const dispatch = useAppDispatch()
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const selectedRun = useAppSelector((s) => s.workflow.selectedWorkflowRun)
  const currentWorkflowId = (props.initialWorkflow?.id?.toString() || props.workflowId || '')
  const isWorkflowRunning = selectedRun?.status === WorkflowRunStepStatus.Running
  // Note: will use files/prompts/models from store in the next step
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  useEffect(() => {
    const originalError = console.error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as any).error = (...args: unknown[]) => {
      if ((args?.[0] as { includes?: (s: string) => boolean })?.includes?.('ResizeObserver loop completed')) {
        return
      }
      originalError.apply(console, args as [])
    }

    return () => {
      console.error = originalError
    }
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [errorsByNodeId, setErrorsByNodeId] = useState<Record<string, NodeErrors>>({})
  const [currentMode, setCurrentMode] = useState<'sequential' | 'parallel'>('sequential')
  const [lastWorkflowId, setLastWorkflowId] = useState<string | undefined>(undefined)
  const savedViewportRef = useRef<{ x: number; y: number; zoom: number } | null>(null)
  // selection state can be added later if needed
  const rf = useReactFlow()

  // Poll run status while running to reflect outputs on nodes
  useEffect(() => {
    if (!selectedRun?.id) return
    // Only poll if the run belongs to the workflow currently being edited
    if (String(selectedRun.workflow) !== String(currentWorkflowId)) return
    let timer: any
    if (selectedRun.status === WorkflowRunStepStatus.Running) {
      timer = setInterval(() => {
        dispatch(getWorkflowRunById(selectedRun.id))
      }, 3000)
    }
    return () => timer && clearInterval(timer)
  }, [dispatch, selectedRun?.id, selectedRun?.status, currentWorkflowId, selectedRun?.workflow])

  // Mirror run step responses into output nodes
  useEffect(() => {
    // Ensure we only mirror data for the current workflow's run
    if (!selectedRun || String(selectedRun.workflow) !== String(currentWorkflowId) || !selectedRun.steps?.length) {
      // No run or no steps: clear any previous responses from output nodes
      setNodes((nds) => nds.map((n) => n.type === 'chatOutput' ? { ...n, data: { ...(n.data as any), response: null } } : n))
      return
    }
    setNodes((nds) => {
      const next = nds.map((n) => ({ ...n }))
      // Map step order -> response
      const responses = new Map<number, string | null>()
      selectedRun.steps.forEach((st) => responses.set(st.order, st.response))
      // For each output node, set data.response based on its source step order
      const edgeLookup = new Map<string, string>()
      edges.forEach((e) => edgeLookup.set(e.target, e.source))
      next.forEach((n) => {
        if (n.type !== 'chatOutput') return
        const sourceStepId = edgeLookup.get(n.id)
        const stepNode = sourceStepId ? nds.find((nn) => nn.id === sourceStepId) : undefined
        const order = Number((stepNode?.data as any)?.stepNumber)
        if (!Number.isFinite(order)) return
        const resp = responses.get(order) || null
        n.data = { ...(n.data as any), response: resp }
      })
      return next
    })
  }, [selectedRun?.steps, edges])

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const startNode = nodes.find((n) => n.type === 'start')
      const modeValue = ((startNode?.data as any)?.mode || 'sequential') as 'sequential' | 'parallel'
      const sourceNode = nodes.find((n) => n.id === params.source)
      const targetNode = nodes.find((n) => n.id === params.target)

      // Normalize Start -> Step direction even if user dragged Step -> Start
      const involvesStartAndStep =
        (sourceNode?.type === 'start' && targetNode?.type === 'step') ||
        (sourceNode?.type === 'step' && targetNode?.type === 'start')

      if (involvesStartAndStep) {
        const normalized: Connection = {
          source: startNode?.id as string,
          target: (sourceNode?.type === 'step' ? params.source : params.target) as string,
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
        }

        if (modeValue === 'parallel') {
          // Preserve the handle the user used on Start (source or target depending on drag direction)
          const handleUsed = params.source === startNode?.id ? params.sourceHandle : params.targetHandle
          normalized.sourceHandle = handleUsed || null
          return addEdge(normalized, eds)
        } else {
          normalized.sourceHandle = null
        }
        const afterAdd = addEdge(normalized, eds)
        return afterAdd
      }

      // If connecting from Start in parallel mode, ensure each edge gets a unique handle
      const isFromStart = params.source === startNode?.id
      if (isFromStart && modeValue === 'parallel') {
        // Keep whichever handle the user started from (params.sourceHandle)
        return addEdge(params, eds)
      }
      // If connecting Step -> Output and that output already has an incoming Step edge,
      // clone a new Output node near the source Step and connect to that instead (avoid unintended joins)
      const srcNode = nodes.find((n) => n.id === params.source)
      const tgtNode = nodes.find((n) => n.id === params.target)
      const isStepToOutput = srcNode?.type === 'step' && tgtNode?.type === 'chatOutput'
      if (isStepToOutput && params.target) {
        const outputAlreadyUsedByAnotherStep = eds.some((e) => {
          if (e.target !== params.target) return false
          const sourceOfExisting = nodes.find((n) => n.id === e.source)
          return sourceOfExisting?.type === 'step' && e.source !== params.source
        })

        if (outputAlreadyUsedByAnotherStep) {
          const sourcePosition = srcNode?.position || { x: 0, y: 0 }
          const newOutputId = `${nodes.length + 1}`
          const newOutputNode: Node = {
            id: newOutputId,
            type: 'chatOutput',
            position: { x: sourcePosition.x + 420, y: sourcePosition.y },
            data: { label: 'Final Output' },
          }
          setNodes((nds) => [...nds, newOutputNode])
          const rerouted: Connection = { ...params, target: newOutputId }
          return addEdge(rerouted, eds)
        }
      }
      return addEdge(params, eds)
    })
  }, [setEdges, nodes])
  // const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNode(node), [])

  // Convert workflow from sequential to parallel structure
  const convertToParallel = useCallback(() => {
    setNodes((currentNodes) => {
      const newNodes = [...currentNodes]
      const stepNodes = newNodes.filter(n => n.type === 'step')
      const outputNodes = newNodes.filter(n => n.type === 'chatOutput')
      
      // Reposition nodes for parallel layout
      const baseY = 200
      const dy = 280 // vertical spacing for parallel mode

      // Order by stepNumber if present, else by X position
      const stepsInOrder = stepNodes
        .slice()
        .sort((a, b) => {
          const an = Number((a.data as any)?.stepNumber ?? Number.MAX_SAFE_INTEGER)
          const bn = Number((b.data as any)?.stepNumber ?? Number.MAX_SAFE_INTEGER)
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn
          return a.position.x - b.position.x
        })

      stepsInOrder.forEach((step, idx) => {
        const newY = baseY + (idx * dy)
        step.position = { x: 500, y: newY }
        
        // Position corresponding output to the right
        const correspondingOutput = outputNodes.find(out => 
          edges.some(e => e.source === step.id && e.target === out.id)
        )
        if (correspondingOutput) {
          correspondingOutput.position = { x: 900, y: newY }
        }
      })
      
      return newNodes
    })
    
    // Build edges on the next tick using the latest RF state to avoid races
    setTimeout(() => {
      const nodesNow = rf.getNodes()
      const edgesNow = rf.getEdges()
      const startNodeNow = nodesNow.find(n => n.type === 'start')
      if (!startNodeNow) return

      const idToNode = new Map(nodesNow.map(n => [n.id, n]))
      // Keep only step->output edges
      const stepToOutputEdges = edgesNow.filter(e => {
        const s = idToNode.get(e.source)
        const t = idToNode.get(e.target)
        return s?.type === 'step' && t?.type === 'chatOutput'
      })

      const stepNodesNow = nodesNow.filter(n => n.type === 'step')
      // Prefer ordering by stepNumber data
      const stepsInOrder = stepNodesNow
        .slice()
        .sort((a, b) => {
          const an = Number((a.data as any)?.stepNumber ?? Number.MAX_SAFE_INTEGER)
          const bn = Number((b.data as any)?.stepNumber ?? Number.MAX_SAFE_INTEGER)
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn
          return a.position.x - b.position.x
        })

      // Create edges without sourceHandle so they don't depend on handle count
      const startToStepEdgesInitial: Edge[] = stepsInOrder.map((step) => ({
        id: `e-start-${step.id}`,
        source: startNodeNow.id,
        target: step.id,
        type: 'smoothstep',
      }))

      const initialEdges = [...stepToOutputEdges, ...startToStepEdgesInitial]
      setEdges(initialEdges)
      rf.fitView({ padding: 0.2 })
    }, 0)
  }, [nodes, edges])

  // Convert workflow from parallel to sequential structure  
  const convertToSequential = useCallback(() => {
    setNodes((currentNodes) => {
      const newNodes = [...currentNodes]
      const stepNodes = newNodes.filter(n => n.type === 'step').sort((a, b) => {
        // Sort by current Y position to maintain order
        return a.position.y - b.position.y
      })
      const outputNodes = newNodes.filter(n => n.type === 'chatOutput')
      
      // Reposition nodes for sequential layout
      const baseX = 500
      const baseY = 200
      const dx = 520 // horizontal spacing for sequential mode
      
      stepNodes.forEach((step, idx) => {
        const newX = baseX + (idx * dx)
        step.position = { x: newX, y: baseY }
        
        // Position corresponding output to the right of step
        const correspondingOutput = outputNodes.find(out => 
          edges.some(e => e.source === step.id && e.target === out.id)
        )
        if (correspondingOutput) {
          correspondingOutput.position = { x: newX + 400, y: baseY }
        }
      })
      
      return newNodes
    })
    
    setEdges((currentEdges) => {
      const startNode = nodes.find(n => n.type === 'start')
      const stepNodes = nodes.filter(n => n.type === 'step').sort((a, b) => a.position.y - b.position.y)
      const outputNodes = nodes.filter(n => n.type === 'chatOutput')

      if (!startNode || stepNodes.length === 0) return currentEdges

      // Keep only step->output edges
      const stepToOutputEdges = currentEdges.filter(e => {
        const source = nodes.find(n => n.id === e.source)
        const target = nodes.find(n => n.id === e.target)
        return source?.type === 'step' && target?.type === 'chatOutput'
      })

      // Start connects only to first step
      const firstStep = stepNodes[0]
      const startToFirst: Edge = { id: `e-start-${firstStep.id}`, source: startNode.id, target: firstStep.id, type: 'smoothstep' }

      // Output of step i connects to step i+1
      const chainEdges: Edge[] = []
      stepNodes.forEach((step, idx) => {
        if (idx < stepNodes.length - 1) {
          const out = outputNodes.find(o => stepToOutputEdges.some(e => e.source === step.id && e.target === o.id))
          const nextStep = stepNodes[idx + 1]
          if (out && nextStep) {
            chainEdges.push({ id: `e-${out.id}-${nextStep.id}`, source: out.id, target: nextStep.id, type: 'smoothstep' })
          }
        }
      })

      return [startToFirst, ...stepToOutputEdges, ...chainEdges]
    })
    setTimeout(() => rf.fitView({ padding: 0.2 }), 0)
  }, [nodes, edges])

  // Monitor mode changes and trigger restructuring
  useEffect(() => {
    const startNode = nodes.find(n => n.type === 'start')
    const newMode = (startNode?.data as any)?.mode as 'sequential' | 'parallel'
    
    if (newMode && newMode !== currentMode) {
      console.log(`[WorkflowBuilder] Mode changed from ${currentMode} to ${newMode}`)
      
      if (currentMode === 'sequential' && newMode === 'parallel') {
        convertToParallel()
      } else if (currentMode === 'parallel' && newMode === 'sequential') {
        convertToSequential()
      }
      
      setCurrentMode(newMode)
    }
  }, [nodes, currentMode, convertToParallel, convertToSequential])

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      if (props.disableEditing) return
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
          position: { x: position.x + 400, y: position.y }, // Position output to the right of step
          data: { label: `Step ${stepNumber} Output` },
        }
        
        // Create edge connecting step to output
        const stepToOutputEdge: Edge = {
          id: `e-${stepId}-${outputId}`,
          source: stepId,
          target: outputId,
          type: 'smoothstep',
        }
        
        setNodes((nds) => [...nds, stepNode, outputNode])
        setEdges((eds) => [...eds, stepToOutputEdge])
      } else {
        // Handle start node with a single spare handle initially
        const newNode: Node = {
          id: `${nodes.length + 1}`,
          type,
          position,
          data: type === 'start' ? { title: '', description: '', mode: 'sequential', spareHandle: true } : { label: type },
        }
        setNodes((nds) => [...nds, newNode])
      }
    },
    [nodes, setNodes, setEdges, props.disableEditing]
  )

  const getStartNode = () => nodes.find((n) => n.type === 'start')
  const getStepNodes = () => nodes.filter((n) => n.type === 'step')
  const getOutputNodes = () => nodes.filter((n) => n.type === 'chatOutput')

  // Deserialize backend workflow into nodes/edges (apply saved layout when available)
  useEffect(() => {
    const wf = props.initialWorkflow
    const workflowId = wf?.id?.toString() || props.workflowId
    
    if (!wf) {
      // Reset to default mode when no workflow is provided (create mode)
      console.log(`[WorkflowBuilder] Create mode - resetting to sequential`)
      setCurrentMode('sequential')
      setLastWorkflowId(undefined)
      return
    }

    const modeStr = wf.mode === WorkflowMode.Parallel ? 'parallel' : 'sequential'
    
    // Check if we're loading a different workflow (compare both workflowId and lastWorkflowId)
    const isNewWorkflow = workflowId !== lastWorkflowId
    if (isNewWorkflow) {
      console.log(`[WorkflowBuilder] Loading new workflow: ${workflowId} (was: ${lastWorkflowId}) - Mode: ${modeStr}`)
      // Reset mode immediately to prevent conversion logic from triggering inappropriately
      setCurrentMode(modeStr)
      setLastWorkflowId(workflowId)
      
      // Clear any existing nodes/edges from previous workflow to prevent interference
      setNodes([])
      setEdges([])

      // Attempt to hydrate viewport from storage for this workflow
      try {
        const raw = workflowId ? localStorage.getItem(`wfViewport:${workflowId}`) : null
        if (raw) {
          const vp = JSON.parse(raw) as { x: number; y: number; zoom: number }
          savedViewportRef.current = vp
        } else {
          savedViewportRef.current = null
        }
      } catch {}
    } else {
      console.log(`[WorkflowBuilder] Same workflow reloaded: ${workflowId} - Mode: ${modeStr}`)
    }
    const startNode: Node = {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 200 },
      data: { title: wf.title || '', description: wf.description || '', mode: modeStr, instanceKey: workflowId, spareHandle: false },
    }

    const stepNodes: Node[] = []
    const outputNodes: Node[] = []
    const newEdges: Edge[] = []

    const sortedSteps = (wf.steps || [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    // Layout constants for better spacing
    const baseX = 500
    const baseY = 200
    const dx = 520 // horizontal gap between steps in sequential mode
    const dy = 280 // vertical gap between steps in parallel mode

    sortedSteps.forEach((step, idx) => {
      const stepId = `step-${idx + 1}`
      const outId = `out-${idx + 1}`
      // defaults before applying layout
      const posY = baseY + (props.initialWorkflow?.mode === WorkflowMode.Parallel ? idx * dy : 0)
      const posX = baseX + (props.initialWorkflow?.mode === WorkflowMode.Parallel ? 0 : idx * dx)

      stepNodes.push({
        id: stepId,
        type: 'step',
        position: { x: posX, y: posY },
        data: {
          instanceKey: workflowId,
          backendId: step.id,
          prompt: step.prompt ? String((step as any).prompt.id ?? step.prompt) : null,
          contentFiles: (step.files || []).map((f: any) => String(f.id ?? f)),
          embeddingFiles: (step.embeddings || []).map((f: any) => String(f.id ?? f)),
          llm: step.llm ? ((step.llm as any).id ?? (step.llm as any).identifier ?? null) : null,
          stepNumber: idx + 1,
          maxTokens: step.maxTokens,
          temperature: step.temperature,
          maxContextSnippets: step.maxContextSnippets,
          documentSimilarityThreshold: step.documentSimilarityThreshold,
        },
      })

      outputNodes.push({
        id: outId,
        type: 'chatOutput',
        position: { x: posX + 420, y: posY },
        data: { label: 'Final Output' },
      })

      // edges
      if (wf.mode === WorkflowMode.Parallel) {
        newEdges.push({ 
          id: `e-start-${stepId}`, 
          source: 'start', 
          sourceHandle: `output-${idx + 1}`, // Assign specific handle for parallel
          target: stepId, 
          type: 'smoothstep' 
        })
      } else {
        if (idx === 0) newEdges.push({ id: `e-start-${stepId}`, source: 'start', target: stepId, type: 'smoothstep' })
      }
      newEdges.push({ id: `e-${stepId}-${outId}`, source: stepId, target: outId, type: 'smoothstep' })
      if (wf.mode === WorkflowMode.Serial && idx < sortedSteps.length - 1) {
        const nextStepId = `step-${idx + 2}`
        newEdges.push({ id: `e-${outId}-${nextStepId}`, source: outId, target: nextStepId, type: 'smoothstep' })
      }
    })

    // Apply saved layout (keys prefer backend ids; fallback to order)
    const withLayout = (() => {
      const layout = wf.layout as Record<string, { x: number; y: number }> | undefined
      if (!layout) return [startNode, ...stepNodes, ...outputNodes]
      
      // Debug: Log layout loading info
      if (import.meta.env.DEV) {
        console.log('[WorkflowBuilder] Loading workflow with layout:', {
          workflowId: wf.id,
          layoutKeys: Object.keys(layout),
          stepsCount: sortedSteps.length,
          layout
        })
      }
      
      const nodesCopy = [startNode, ...stepNodes, ...outputNodes].map((n) => ({ ...n }))
      // start
      if (layout.start) {
        const s = nodesCopy.find((n) => n.id === 'start')
        if (s) s.position = { x: layout.start.x, y: layout.start.y }
      }
      // steps and outputs
      sortedSteps.forEach((step, idx) => {
        const orderKey = String(idx + 1)
        const idKey = step.id ? String(step.id) : undefined
        const stepNode = nodesCopy.find((n) => n.id === `step-${idx + 1}`)
        const outNode = nodesCopy.find((n) => n.id === `out-${idx + 1}`)
        const sKey = idKey && layout[`step:${idKey}`]
          ? `step:${idKey}`
          : (layout[`step:${orderKey}`] ? `step:${orderKey}` : null)
        const oKey = idKey && layout[`output:${idKey}`]
          ? `output:${idKey}`
          : (layout[`output:${orderKey}`] ? `output:${orderKey}` : null)
        
        // Debug: Log each step's layout application
        if (import.meta.env.DEV) {
          console.log(`[WorkflowBuilder] Loading step ${idx + 1}:`, {
            stepId: step.id,
            orderKey,
            idKey,
            sKey,
            oKey,
            stepNodeFound: !!stepNode,
            outNodeFound: !!outNode
          })
        }
        
        if (sKey && stepNode) stepNode.position = { x: layout[sKey].x, y: layout[sKey].y }
        if (oKey && outNode) outNode.position = { x: layout[oKey].x, y: layout[oKey].y }
      })
      return nodesCopy
    })()

    setNodes(withLayout)
    setEdges(newEdges)
    // Set initial mode to match loaded workflow (only if not already set above)
    if (!isNewWorkflow) {
      setCurrentMode(modeStr)
    }
    // Restore viewport if available; otherwise fit to view
    setTimeout(() => {
      const vp = savedViewportRef.current
      if (vp) {
        try { rf.setViewport(vp, { duration: 0 }) } catch { rf.fitView({ padding: 0.2 }) }
      } else {
        rf.fitView({ padding: 0.2 })
      }
    }, 0)
  }, [props.initialWorkflow, props.workflowId, lastWorkflowId])

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    const start = getStartNode()
    const modeValue = (start?.data as any)?.mode || 'sequential'
    const sourceNode = nodes.find((n) => n.id === connection.source)
    const targetNode = nodes.find((n) => n.id === connection.target)
    if (!sourceNode || !targetNode) return false

    // Prevent connecting to self
    if (connection.source === connection.target) return false

    // Only allow edges from Start -> Step, Step -> Output, (sequential) Output -> Step
    const sType = sourceNode.type
    const tType = targetNode.type

    // Allow Start <-> Step regardless of drag direction
    if ((sType === 'start' && tType === 'step') || (sType === 'step' && tType === 'start')) {
      if (modeValue === 'sequential') {
        const existing = edges.filter((e) => e.source === start?.id)
        if (existing.length >= 1) return false
      }
      // In parallel, allow multiple edges per handle and any direction between Start and Step
      return true
    }

    if (sType === 'step') {
      // step can only go to output
      return tType === 'chatOutput'
    }

    if (sType === 'chatOutput') {
      // output can only go to step in sequential; in parallel, no outgoing edges
      if (modeValue === 'parallel') return false
      return tType === 'step'
    }
    return false
  }, [nodes, edges])

  const serializeAndSave = () => {
    const start = nodes.find((n) => n.type === 'start')
    const title = ((start?.data as any)?.title || '').trim()
    const description = ((start?.data as any)?.description || '').trim()
    const mode = ((start?.data as any)?.mode === 'parallel' ? WorkflowMode.Parallel : WorkflowMode.Serial) as number

    // naive order: follow edges from start to assign step order; fallback to existing stepNumber
    const edgesBySource = edges.reduce<Record<string, string[]>>((acc, e) => {
      if (!acc[e.source]) acc[e.source] = []
      acc[e.source].push(e.target)
      return acc
    }, {})
    const visited = new Set<string>()
    const sequence: string[] = []
    const dfs = (id?: string) => {
      if (!id || visited.has(id)) return
      visited.add(id)
      const targets = edgesBySource[id] || []
      targets.forEach((t) => {
        const node = nodes.find((n) => n.id === t)
        if (node?.type === 'step') sequence.push(t)
        dfs(t)
      })
    }
    dfs(start?.id)

    const orderedStepNodes = nodes
      .filter((n) => n.type === 'step')
      .sort((a, b) => sequence.indexOf(a.id) - sequence.indexOf(b.id))

    const steps = orderedStepNodes.map((n, idx) => {
      const d: any = n.data
      return {
        ...(d?.backendId ? { id: String(d.backendId) } : {}),
        order: idx + 1,
        prompt: d?.prompt ?? null,
        files: (d?.contentFiles || []).map((x: string) => Number(x)).filter(Boolean),
        embeddings: (d?.embeddingFiles || []).map((x: string) => Number(x)).filter(Boolean),
        llm: (() => {
          const raw = d?.llm
          if (raw == null) return null
          if (typeof raw === 'number') return raw
          const asNum = /^\d+$/.test(String(raw)) ? Number(raw) : null
          if (asNum) return asNum
          const match = availableModels.find((m) => m.identifier === raw || m.name === raw)
          return match ? match.id : null
        })(),
        ...(d?.execution_type != null ? { execution_type: d.execution_type } : {}),
        ...(d?.maxTokens != null ? { max_tokens: Number(d.maxTokens) } : {}),
        ...(d?.temperature != null ? { temperature: Number(d.temperature) } : {}),
        ...(d?.maxContextSnippets != null ? { max_context_snippets: Number(d.maxContextSnippets) } : {}),
        ...(d?.documentSimilarityThreshold != null ? { document_similarity_threshold: Number(d.documentSimilarityThreshold) } : {}),
      }
    })

    // Graph validation
    const startCount = nodes.filter((n) => n.type === 'start').length
    const stepCount = getStepNodes().length
    const outputCount = getOutputNodes().length
    if (startCount !== 1) {
      toast.error('There must be exactly one Start node.')
      return
    }
    if (stepCount < 1) {
      toast.error('Add at least one Step node.')
      return
    }
    if (outputCount < 1) {
      toast.error('Add at least one Output node.')
      return
    }

    // start connections based on mode
    const startOut = edges.filter((e) => e.source === start?.id)
    if ((start?.data as any)?.mode === 'sequential') {
      if (startOut.length !== 1) {
        toast.error('Sequential mode: Start must connect to exactly one Step.')
        return
      }
    } else {
      // parallel
      if (startOut.length < 1) {
        toast.error('Parallel mode: Start must connect to one or more Steps.')
        return
      }
    }

    // Mode-specific validation
    if ((start?.data as any)?.mode === 'parallel') {
      // Parallel: each step must be connected FROM start and TO output
      const stepNodes = getStepNodes()
      const startConnections = edges.filter((e) => e.source === start?.id)
      const stepsConnectedFromStart = startConnections.map((e) => e.target)
      
      // Check that all steps are connected FROM start
      for (const step of stepNodes) {
        if (!stepsConnectedFromStart.includes(step.id)) {
          toast.error('Parallel mode: All Steps must be connected from the Start node.')
          return
        }
        
        // Check that each step connects TO output
        const out = edges.filter((e) => e.source === step.id)
        const hasOutputEdge = out.every((e) => nodes.find((n) => n.id === e.target)?.type === 'chatOutput') && out.length >= 1
        if (!hasOutputEdge) {
          toast.error('Parallel mode: Each Step must connect to an Output node.')
          return
        }
      }
      
      const bad = edges.some((e) => nodes.find((n) => n.id === e.source)?.type === 'chatOutput' && nodes.find((n) => n.id === e.target)?.type === 'step')
      if (bad) {
        toast.error('Parallel mode: Output nodes cannot connect to Steps.')
        return
      }
    } else {
      // Sequential: validate the chain from start to end
      // Build adjacency list
      const adjList: Record<string, string[]> = {}
      edges.forEach((e) => {
        if (!adjList[e.source]) adjList[e.source] = []
        adjList[e.source].push(e.target)
      })
      
      // Follow the path from start
      const visited = new Set<string>()
      const queue = [start!.id]
      let hasValidEnd = false
      
      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        
        const currentNode = nodes.find((n) => n.id === current)
        const neighbors = adjList[current] || []
        
        if (currentNode?.type === 'step') {
          // Step must connect to output
          const outputTargets = neighbors.filter((id) => nodes.find((n) => n.id === id)?.type === 'chatOutput')
          if (outputTargets.length === 0) {
            toast.error('Sequential mode: Each Step must connect to an Output node.')
            return
          }
          queue.push(...outputTargets)
        } else if (currentNode?.type === 'chatOutput') {
          // Output can connect to next step or be the end
          const stepTargets = neighbors.filter((id) => nodes.find((n) => n.id === id)?.type === 'step')
          if (stepTargets.length === 0) {
            hasValidEnd = true // This output is a valid end point
          } else {
            queue.push(...stepTargets)
          }
        } else if (currentNode?.type === 'start') {
          queue.push(...neighbors)
        }
      }
      
      if (!hasValidEnd) {
        toast.error('Sequential mode: The workflow must end with an Output node.')
        return
      }
      
      // Check that all step and output nodes are reachable from start
      const allStepsAndOutputs = [...getStepNodes(), ...getOutputNodes()]
      const unreachable = allStepsAndOutputs.filter((n) => !visited.has(n.id))
      if (unreachable.length > 0) {
        toast.error('Please connect all workflow nodes. Each step and output must be reachable from the Start node.')
        return
      }
    }

    // start node required fields
    if (!title || !description) {
      const startNode = nodes.find((n) => n.type === 'start')
      if (startNode) {
        const errs: NodeErrors = {}
        if (!title) errs.title = 'Title is required'
        if (!description) errs.description = 'Description is required'
        setErrorsByNodeId({ [startNode.id]: errs })
      }
      toast.error('Please fix the highlighted errors.')
      return
    }

    // Build ordered step nodes (used for validation and mapping errors)
    // already computed orderedStepNodes above

    // Hard guard: prompt must be selected for each step (schema allows nullable in legacy form)
    const firstMissingIdx = orderedStepNodes.findIndex((n) => !(n.data as any)?.prompt)
    if (firstMissingIdx !== -1) {
      const offending = orderedStepNodes[firstMissingIdx]
      setErrorsByNodeId({ [offending.id]: { prompt: 'Prompt is required' } })
      toast.error('Please fix the highlighted errors.')
      return
    }

    // Validate using legacy schema (parity with old modal, now that prompts are present)
    try {
      const stepsForYup = orderedStepNodes.map((n, idx) => {
        const d: any = n.data
        return {
          prompt: d?.prompt ?? null,
          order: idx + 1,
          files: [],
          embeddings: [],
          llm: null,
          maxTokens: d?.maxTokens,
          temperature: d?.temperature,
        }
      })
      const payloadForYup = {
        title,
        description,
        mode,
        steps: stepsForYup,
      }
      workflowValidationSchema.validateSync(payloadForYup, { abortEarly: false })
      setErrorsByNodeId({})
    } catch (e: any) {
      const map: Record<string, NodeErrors> = {}
      if (Array.isArray(e?.inner)) {
        e.inner.forEach((err: any) => {
          if (err.path?.startsWith('steps[')) {
            const m = err.path.match(/steps\[(\d+)\]\.([^\]]+)/)
            const idx = m ? Number(m[1]) : -1
            const field = m ? m[2] : undefined
            if (idx >= 0 && field === 'prompt') {
              const stepNode = nodes.filter((n) => n.type === 'step')[idx]
              if (stepNode) {
                map[stepNode.id] = { ...(map[stepNode.id] || {}), prompt: err.message }
              }
            }
          }
        })
      }
      setErrorsByNodeId(map)
      toast.error('Please fix the highlighted errors.')
      return
    }

    // Build layout object strictly from current canvas positions.
    // This avoids accidental reordering/relayout during save and guarantees
    // the reloaded layout matches what the user sees.
    const layout: Record<string, { x: number; y: number }> = {}
    const startNode = nodes.find((n) => n.type === 'start')
    if (startNode) layout.start = { x: startNode.position.x, y: startNode.position.y }

    // Map each step -> its output node (if any)
    const stepIdToOutputNode: Record<string, Node | undefined> = {}
    nodes.forEach((n) => {
      if (n.type !== 'step') return
      const outEdge = edges.find((e) => e.source === n.id && nodes.find((m) => m.id === e.target)?.type === 'chatOutput')
      stepIdToOutputNode[n.id] = outEdge ? nodes.find((m) => m.id === outEdge.target) : undefined
    })

    orderedStepNodes.forEach((stepNode, idx) => {
      const backendId = (stepNode.data as any)?.backendId
      const orderKey = String(idx + 1)

      // Always save both keys to ensure compatibility on reload
      if (backendId) layout[`step:${backendId}`] = { x: stepNode.position.x, y: stepNode.position.y }
      layout[`step:${orderKey}`] = { x: stepNode.position.x, y: stepNode.position.y }

      const outNode = stepIdToOutputNode[stepNode.id]
      if (outNode) {
        if (backendId) layout[`output:${backendId}`] = { x: outNode.position.x, y: outNode.position.y }
        layout[`output:${orderKey}`] = { x: outNode.position.x, y: outNode.position.y }
      }
    })

    // Debug: Log final layout object
    if (import.meta.env.DEV) {
      console.log('[WorkflowBuilder] Final layout object:', layout)
    }

    dispatch(
      createOrUpdateWorkflow({
        id: props.workflowId,
        workflowData: { title, description, mode, layout, steps: steps.map((s, i) => ({
          // include backend id when present
          ...(nodes.find((n) => n.id === sequence[i])?.data as any)?.backendId ? { id: (nodes.find((n) => n.id === sequence[i])?.data as any).backendId } : {},
          ...s,
        })) },
      })
    ).unwrap()
      .then((wf) => {
        toast.success('Workflow saved')
        if (!props.workflowId && props.onSaved && (wf as any)?.id) {
          props.onSaved(String((wf as any).id))
        }
      })
      .catch((err: unknown) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[WorkflowBuilder.save] error', err)
        }
        const msg = (err as any)?.message || getErrorMessage(err)
        toast.error(msg)
      })
  }

  useImperativeHandle(ref, () => ({ save: serializeAndSave }), [nodes, edges])

  return (
    <ErrorsContext.Provider value={{ errorsByNodeId, clearNodeError: (nodeId: string, field?: keyof NodeErrors) => {
      setErrorsByNodeId((prev) => {
        const next = { ...prev }
        if (!next[nodeId]) return prev
        if (field) {
          const { [field]: _removed, ...rest } = next[nodeId]
          if (Object.keys(rest).length) next[nodeId] = rest
          else delete next[nodeId]
        } else {
          delete next[nodeId]
        }
        return next
      })
    } }}>
    <div className='flex h-full w-full min-h-0'>
      {isWorkflowRunning && (
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 rounded-md bg-card border border-border px-3 py-2 text-sm text-foreground shadow-lg ring-1 ring-yellow-200 dark:ring-yellow-800'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>Workflow run in progress...</span>
        </div>
      )}
      <Sidebar
        onAddNode={addNode}
        disabled={{
          start: nodes.some((n) => n.type === 'start'),
          step: !nodes.some((n) => n.type === 'start'),
          output: false, // No longer used since output is auto-created
        }}
      />
      <div className='relative flex-1 min-h-0'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={props.disableEditing ? undefined : onNodesChange}
          onEdgesChange={props.disableEditing ? undefined : onEdgesChange}
          onConnect={props.disableEditing ? undefined : onConnect}
          onMoveEnd={(_, viewport) => {
            try {
              const wfId = props.initialWorkflow?.id?.toString() || props.workflowId
              if (viewport && wfId) {
                savedViewportRef.current = viewport
                localStorage.setItem(`wfViewport:${wfId}`, JSON.stringify(viewport))
              }
            } catch {}
          }}
          // onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          isValidConnection={isValidConnection}
          nodesDraggable={!props.disableEditing}
          nodesConnectable={!props.disableEditing}
          elementsSelectable={!props.disableEditing}
          fitView
          className='bg-background'
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.5 }}
        >
          <Controls className='text-muted-foreground [&_button]:border-border [&_button]:bg-card [&_button:hover]:bg-muted' />
          <MiniMap
            maskColor='hsl(var(--background))'
            nodeStrokeColor='hsl(var(--muted-foreground))'
            nodeColor='hsl(var(--muted))'
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color='hsl(var(--muted-foreground))' />
        </ReactFlow>
      </div>
    </div>
    </ErrorsContext.Provider>
  )
})

export default WorkflowBuilder
