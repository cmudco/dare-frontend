import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Cog } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { addNode, onConnect } from '@/redux/slices/flowSlice'
import { Node } from '@xyflow/react'

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
]

export default function SidebarNew() {
  const dispatch = useDispatch()
  const { nodes } = useSelector((state: RootState) => state.flow)

  const handleAddNode = (type: string) => {
    console.log('➕ Adding node:', type)

    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    }

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        ...(type === 'start' && {
          title: '',
          description: '',
          mode: 'sequential',
        }),
        ...(type === 'step' && {
          prompt: null,
          contentFiles: [],
          embeddingFiles: [],
          llm: null,
          stepNumber: nodes.filter((n) => n.type === 'step').length + 1,
          maxTokens: 2048,
          temperature: 0.7,
          maxContextSnippets: 4,
          documentSimilarityThreshold: 0.2,
        }),
      },
    }

    dispatch(addNode(newNode))

    // Auto-create and connect output node when step is added
    if (type === 'step') {
      const outputNodeId = `output-${Date.now()}`
      const outputNode: Node = {
        id: outputNodeId,
        type: 'output',
        position: { x: position.x + 450, y: position.y },
        data: {
          response: '',
          stepNumber: nodes.filter((n) => n.type === 'step').length + 1,
        },
      }

      // Add output node
      dispatch(addNode(outputNode))

      // Auto-connect step to output
      const connection = {
        source: newNode.id,
        target: outputNodeId,
        sourceHandle: null,
        targetHandle: null,
      }
      dispatch(onConnect(connection))
    }
  }

  const hasStart = nodes.some((n) => n.type === 'start')

  return (
    <div className='w-80 border-r border-border bg-muted/30 p-4 backdrop-blur supports-[backdrop-filter]:bg-muted/20'>
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold text-foreground'>Components</h2>
        <Card className='border-dashed'>
          <CardContent className='py-3 text-xs text-muted-foreground'>
            {hasStart
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
                className='w-full'
                disabled={component.type === 'start' ? hasStart : !hasStart}
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
