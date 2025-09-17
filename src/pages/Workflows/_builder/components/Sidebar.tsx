import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Cog } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

interface SidebarProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void
  disabled?: { start: boolean; step: boolean; output: boolean }
}

const nodeComponents = [
  { type: 'start', label: 'Start', description: 'Define workflow title and description', icon: Play, color: 'bg-primary' },
  { type: 'step', label: 'Step', description: 'Configure prompt, files, embeddings and LLM (includes output)', icon: Cog, color: 'bg-primary' },
]

export default function Sidebar({ onAddNode, disabled }: SidebarProps) {
  const { selectedWorkflowRun } = useAppSelector((state) => state.workflow)
  const isWorkflowRunning = selectedWorkflowRun?.status === WorkflowRunStepStatus.Running
  
  const handleAddNode = (type: string) => {
    if (isWorkflowRunning) return // Prevent adding nodes when workflow is running
    const position = { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 }
    onAddNode(type, position)
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
          <Card key={component.type} className='cursor-pointer transition-shadow hover:shadow-md'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <div className={`rounded p-1 ${component.color}`}>
                  <component.icon className='h-4 w-4 text-card' />
                </div>
                {component.label}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <p className='mb-3 text-xs text-muted-foreground'>{component.description}</p>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => handleAddNode(component.type)}
                className={`w-full ${isWorkflowRunning ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground' : ''}`}
                disabled={
                  isWorkflowRunning ||
                  (component.type === 'start'
                    ? Boolean(disabled?.start)
                    : Boolean(disabled?.step))
                }
              >
                Add to Canvas
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


