import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Cog, Trash2, GitBranch, Split } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { useReactFlow } from '@xyflow/react'
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
    description:
      'Define workflow configuration (multiple starts for comparison)',
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
    type: 'conditional',
    label: 'Conditional',
    description: 'AI-powered routing with custom evaluation criteria',
    icon: GitBranch,
    color: 'bg-blue-500',
  },
  {
    type: 'structuredOutput',
    label: 'Structured Output',
    description: 'Define multiple output paths with specific route values',
    icon: Split,
    color: 'bg-purple-500',
  },
  // { type: 'chatOutput', label: 'Output', description: 'Configure how results are displayed', icon: Cog, color: 'bg-primary' },
]

export default function Sidebar({ disabled }: SidebarProps) {
  const dispatch = useAppDispatch()
  const reactFlowInstance = useReactFlow()
  const { selectedWorkflowRun } = useAppSelector((state) => state.workflow)
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const isWorkflowRunning =
    selectedWorkflowRun?.status === WorkflowRunStepStatus.Running

  const hasStartNode = nodes.some((n) => n.type === 'start')
  const startNodeCount = nodes.filter((n) => n.type === 'start').length

  const getViewportCenterPosition = () => {
    try {
      // Get the React Flow wrapper element
      const reactFlowElement = document.querySelector('.react-flow')

      if (!reactFlowElement) {
        // Fallback to default position if React Flow element not available
        return { x: 400, y: 300 }
      }

      const bounds = reactFlowElement.getBoundingClientRect()

      // Calculate the center point, but account for sidebar by moving more to the right
      // The sidebar is 320px (w-80 = 320px), so we adjust the center accordingly
      const centerX = bounds.width * 0.8 // Move more toward right side of canvas
      const centerY = bounds.height / 2

      // Convert the center point from screen coordinates to flow coordinates
      // screenToFlowPosition expects coordinates relative to the React Flow element
      const graphPosition = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      })

      return graphPosition
    } catch (error) {
      console.warn(
        'Failed to get viewport center, using fallback position:',
        error
      )
      // Fallback position if anything goes wrong
      return { x: 400, y: 300 }
    }
  }

  const handleAddNode = (type: string) => {
    if (isWorkflowRunning) return

    // Get the center position of the current viewport
    const position = getViewportCenterPosition()

    dispatch(createNodeAtPosition({ type, position }))
  }

  return (
    <div className='flex h-full w-64 flex-col overflow-hidden border-r border-border bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/20'>
      <div className='flex-shrink-0 p-3'>
        <h2 className='text-base font-semibold text-foreground'>Components</h2>
      </div>
      <div className='flex-1 overflow-y-auto px-3 pb-3'>
        <div className='space-y-3'>
          <Card className='border-dashed'>
            <CardContent className='py-2 text-xs text-muted-foreground'>
              {disabled?.start
                ? 'Add steps to build your workflow. Each step includes an output automatically.'
                : startNodeCount > 0
                  ? `${startNodeCount} start node${startNodeCount > 1 ? 's' : ''} added. Add more start nodes to compare different approaches.`
                  : 'Start creating your workflow by adding a Start node first.'}
            </CardContent>
          </Card>
          {nodeComponents.map((component) => (
            <Card
              key={component.type}
              className='cursor-pointer transition-shadow hover:shadow-md'
            >
              <CardHeader className='pb-1 pt-3'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <div className={`rounded p-1 ${component.color}`}>
                    <component.icon className='h-3.5 w-3.5 text-card' />
                  </div>
                  {component.label}
                </CardTitle>
              </CardHeader>
              <CardContent className='pb-3 pt-0'>
                <p className='mb-2 text-xs text-muted-foreground'>
                  {component.description}
                </p>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => handleAddNode(component.type)}
                  className={`h-7 w-full text-xs ${isWorkflowRunning ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-50' : ''}`}
                  disabled={
                    isWorkflowRunning ||
                    (component.type === 'start'
                      ? Boolean(disabled?.start)
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
              <CardContent className='py-2'>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => dispatch(resetBuilder())}
                  disabled={isWorkflowRunning}
                  className={`h-7 w-full text-xs ${isWorkflowRunning ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Trash2 className='mr-2 h-3.5 w-3.5' />
                  Clear All Nodes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
