import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Cog, Trash2, Gauge } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import {
  createNodeAtPosition,
  resetBuilder,
} from '@/redux/workflowBuilderSlice'

interface SidebarProps {
  disabled?: { start: boolean; step: boolean; output: boolean }
}

const nodeComponents = [
  {
    type: 'start',
    label: 'Start',
    description: 'Define workflow title and description',
    icon: Play,
    color: 'bg-primary',
  },
  {
    type: 'step',
    label: 'Step',
    description:
      'Configure prompt, files, embeddings and LLM (includes output)',
    icon: Cog,
    color: 'bg-primary',
  },
  {
    type: 'aggregator',
    label: 'Aggregator',
    description: 'Evaluate multiple inputs and route based on scoring',
    icon: Gauge,
    color: 'bg-orange-500',
  },
  // { type: 'chatOutput', label: 'Output', description: 'Configure how results are displayed', icon: Cog, color: 'bg-primary' },
]

export default function Sidebar({ disabled }: SidebarProps) {
  const dispatch = useAppDispatch()
  const { selectedWorkflowRun } = useAppSelector((state) => state.workflow)
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const isWorkflowRunning =
    selectedWorkflowRun?.status === WorkflowRunStepStatus.Running

  const hasStartNode = nodes.some((n) => n.type === 'start')
  const hasAggregatorNode = nodes.some((n) => n.type === 'aggregator')

  const calculateOptimalPosition = (type: string) => {
    const startNode = nodes.find((n) => n.type === 'start')
    const aggregatorNode = nodes.find((n) => n.type === 'aggregator')
    const mode =
      (startNode?.data as { mode?: 'sequential' | 'parallel' })?.mode ||
      'sequential'

    const startPosition = { x: 100, y: 200 }
    const stepSpacing = mode === 'parallel' ? 440 : 300

    if (type === 'start') return startPosition

    if (type === 'step') {
      // Enhanced logic when both start and aggregator exist
      if (startNode && aggregatorNode) {
        // Find rightmost node position
        const rightmostX = Math.max(...nodes.map((n) => n.position.x + 320)) // Add node width estimate
        const stepCount = nodes.filter((n) => n.type === 'step').length

        return {
          x: rightmostX + 100, // 100px spacing from rightmost node
          y: startPosition.y + stepCount * 150, // Tighter vertical spacing
        }
      }

      // Default positioning when no aggregator
      const stepCount = nodes.filter((n) => n.type === 'step').length
      return {
        x: startPosition.x + 400,
        y: startPosition.y + stepCount * stepSpacing,
      }
    }

    if (type === 'aggregator') {
      const aggregatorCount = nodes.filter(
        (n) => n.type === 'aggregator'
      ).length
      return {
        x: startPosition.x + 800,
        y: startPosition.y + aggregatorCount * stepSpacing,
      }
    }

    return { x: startPosition.x + 1200, y: startPosition.y }
  }

  const handleAddNode = (type: string) => {
    if (isWorkflowRunning) return
    const position = calculateOptimalPosition(type)
    dispatch(createNodeAtPosition({ type, position }))
  }

  return (
    <div className='w-80 border-r border-border bg-muted/30 p-4 backdrop-blur supports-[backdrop-filter]:bg-muted/20'>
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold text-foreground'>Components</h2>
        <Card className='border-dashed'>
          <CardContent className='py-3 text-xs text-muted-foreground'>
            {disabled?.start
              ? 'Add steps to build your workflow. Each step includes an output automatically.'
              : 'Start creating your workflow by adding a Start node first.'}
          </CardContent>
        </Card>
        {nodeComponents.map((component) => (
          <Card
            key={component.type}
            className='cursor-pointer transition-shadow hover:shadow-md'
          >
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <div className={`rounded p-1 ${component.color}`}>
                  <component.icon className='h-4 w-4 text-card' />
                </div>
                {component.label}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <p className='mb-3 text-xs text-muted-foreground'>
                {component.description}
              </p>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => handleAddNode(component.type)}
                className={`w-full ${isWorkflowRunning ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-50' : ''}`}
                disabled={
                  isWorkflowRunning ||
                  (component.type === 'start'
                    ? Boolean(disabled?.start) || hasStartNode
                    : component.type === 'aggregator'
                      ? Boolean(disabled?.step) ||
                        !hasStartNode ||
                        hasAggregatorNode
                      : component.type === 'chatOutput'
                        ? Boolean(disabled?.output) || !hasStartNode
                        : Boolean(disabled?.step) || !hasStartNode)
                }
              >
                Add to Canvas
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Clear All Button */}
        {nodes.length > 0 && (
          <Card className='border-destructive/20'>
            <CardContent className='py-3'>
              <Button
                size='sm'
                variant='destructive'
                onClick={() => dispatch(resetBuilder())}
                disabled={isWorkflowRunning}
                className={`w-full ${isWorkflowRunning ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Clear All Nodes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
