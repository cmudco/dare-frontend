import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Brain, GitBranch, Trash2 } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { useReactFlow } from '@xyflow/react'
import {
  createNodeAtPosition,
  resetBuilder,
} from '@/redux/workflowBuilderSlice'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { useState } from 'react'
import { WorkflowNodeType } from '@/utils/constants/workflows'

interface SidebarProps {
  disabled?: { start: boolean; step: boolean; output: boolean }
}

const nodeComponents = [
  {
    type: 'start',
    label: 'Start',
    description: 'Entry point',
    icon: Play,
    color: 'bg-green-500',
  },
  {
    type: 'step',
    label: 'Step',
    description: 'LLM processing',
    icon: Brain,
    color: 'bg-primary',
  },
  {
    type: 'structuredOutput',
    label: 'Conditional',
    description: 'Route decision',
    icon: GitBranch,
    color: 'bg-purple-500',
  },
]

export default function Sidebar({ disabled }: SidebarProps) {
  const dispatch = useAppDispatch()
  const reactFlowInstance = useReactFlow()
  const { nodes, isRunning: isWorkflowRunning } = useAppSelector(
    (state) => state.workflowBuilder
  )

  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false)

  const handleClearNodes = () => {
    dispatch(resetBuilder())
    setIsClearConfirmationOpen(false)
  }

  const hasStartNode = nodes.some((n) => n.type === WorkflowNodeType.Start)

  const getViewportCenterPosition = () => {
    try {
      const reactFlowElement = document.querySelector('.react-flow')
      if (!reactFlowElement) {
        return { x: 400, y: 300 }
      }
      const bounds = reactFlowElement.getBoundingClientRect()
      const centerX = bounds.width * 0.8
      const centerY = bounds.height / 2
      const graphPosition = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      })
      return graphPosition
    } catch {
      return { x: 400, y: 300 }
    }
  }

  const handleAddNode = (type: string) => {
    if (isWorkflowRunning) return
    const position = getViewportCenterPosition()
    dispatch(createNodeAtPosition({ type, position }))
  }

  return (
    <div className='absolute left-4 top-20 z-10 flex w-48 flex-col rounded-lg border border-border/50 bg-white/80 shadow-lg backdrop-blur-sm'>
      <div className='border-b border-border/50 px-3 py-2'>
        <h2 className='text-xs font-semibold text-foreground'>Components</h2>
      </div>
      <div className='overflow-y-auto p-2'>
        <div className='space-y-1.5'>
          {nodeComponents.map((component) => (
            <Card
              key={component.type}
              className='cursor-pointer border-border/50 bg-white/60 transition-all hover:border-primary/30 hover:bg-white hover:shadow-md'
              onClick={() => {
                if (
                  !isWorkflowRunning &&
                  !(component.type === WorkflowNodeType.Start
                    ? Boolean(disabled?.start)
                    : Boolean(disabled?.step) || !hasStartNode)
                ) {
                  handleAddNode(component.type)
                }
              }}
            >
              <CardContent className='p-2.5'>
                <div className='flex items-center gap-2.5'>
                  <div className={`rounded-md p-1.5 ${component.color}`}>
                    <component.icon className='h-3.5 w-3.5 text-white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-xs font-medium text-foreground'>
                      {component.label}
                    </div>
                    <div className='truncate text-[10px] text-muted-foreground'>
                      {component.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Clear button at bottom */}
      {nodes.length > 0 && (
        <div className='border-t border-border/50 p-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setIsClearConfirmationOpen(true)}
            disabled={isWorkflowRunning}
            className='h-7 w-full text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          >
            <Trash2 className='mr-1.5 h-3 w-3' />
            Clear All
          </Button>
        </div>
      )}

      <DeleteConfirmation
        isOpen={isClearConfirmationOpen}
        onClose={() => setIsClearConfirmationOpen(false)}
        onDelete={handleClearNodes}
        title='Clear All Nodes'
        description='Are you sure you want to clear all nodes? This action cannot be undone.'
        confirmText='Clear All'
      />
    </div>
  )
}
