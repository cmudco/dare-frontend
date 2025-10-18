import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GitBranch, Info, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateNodeDataById } from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { renderStatusPill } from '@/utils/workflowUtils'

export interface StructuredOutputRoute {
  name: string
  description: string
}

export type StructuredOutputNodeData = {
  routes: StructuredOutputRoute[]
  stepNumber: number
  selectedRoute?: string // Store which route was selected during execution
  id?: string
}

export default function StructuredOutputNode({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData =
    (data as StructuredOutputNodeData) || ({} as StructuredOutputNodeData)
  const { errorsByNodeId } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)
  const updateNodeInternals = useUpdateNodeInternals()

  const routes = nodeData.routes || [
    { name: '1', description: 'First route' },
    { name: '2', description: 'Second route' },
  ]

  // Structured Output node config only; Step hosts outward connectors
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)

  // Find the step node that this structured output node is connected to
  const connectedStepEdge = edges.find((edge) => {
    return edge.source === id && edge.target
  })

  const connectedStepNode = connectedStepEdge
    ? nodes.find((n) => n.id === connectedStepEdge.target)
    : undefined

  const connectedStepNumber = connectedStepNode?.data?.stepNumber

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<StructuredOutputNodeData>) => {
    dispatch(updateNodeDataById({ nodeId: id, newData: updates }))
  }

  // Route management functions
  const addRoute = () => {
    const newRoutes = [
      ...routes,
      {
        name: `${routes.length + 1}`,
        description: '',
      },
    ]
    updateNodeData({ routes: newRoutes })
  }

  const removeRoute = (index: number) => {
    if (routes.length <= 2) return // Minimum 2 routes
    const newRoutes = routes.filter((_, i) => i !== index)
    updateNodeData({ routes: newRoutes })
  }

  const updateRoute = (
    index: number,
    field: 'name' | 'description',
    value: string
  ) => {
    const newRoutes = routes.map((route, i) =>
      i === index ? { ...route, [field]: value } : route
    )
    updateNodeData({ routes: newRoutes })
  }

  const routeNames = routes.map((r) => r.name).join(',')

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, routes.length, routeNames, edges])

  // Get the step run for the connected step node
  const stepRun = currentRun?.steps?.find(
    (s) => s.order === connectedStepNumber
  )

  const stepStatus = stepRun?.status || null
  const selectedRoute = stepRun?.metadata?.selectedRoute || null

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 dark:bg-purple-500/20'>
              <GitBranch className='h-3 w-3 text-purple-600' />
            </div>
            Structured Output
          </div>
          {renderStatusPill(stepStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Execution Result Display */}
        {stepStatus === 'completed' && selectedRoute && (
          <div className='rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
                <span className='text-xs font-bold text-green-600 dark:text-green-400'>
                  ✓
                </span>
              </div>
              <span className='font-semibold text-green-900 dark:text-green-100'>
                Output Route Selected
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-green-700 dark:text-green-300'>
                Selected Route:
              </span>
              <span className='rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white'>
                {selectedRoute}
              </span>
            </div>
          </div>
        )}

        {/* Route Configuration */}
        <div className='space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
          <div className='flex items-center justify-between'>
            <Label className='text-xs font-medium'>
              Output Routes ({routes.length})
            </Label>
            <Button
              size='sm'
              variant='outline'
              onClick={addRoute}
              className='h-6 px-2 text-xs'
            >
              <Plus className='mr-1 h-3 w-3' />
              Add Route
            </Button>
          </div>

          {/* Dynamic Routes */}
          {routes.map((route, index) => (
            <div
              key={index}
              className='space-y-2 rounded-md border border-muted bg-white/80 p-3 dark:bg-background/50'
            >
              <div className='flex items-center justify-between'>
                <Label className='text-xs text-muted-foreground'>
                  Route {index + 1}
                </Label>
                {routes.length > 2 && (
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => removeRoute(index)}
                    className='h-5 w-5 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                )}
              </div>
              <Input
                placeholder='Route value (e.g., "1", "2", "success")'
                value={route.name}
                onChange={(e) => updateRoute(index, 'name', e.target.value)}
                className='text-sm'
              />
              <Input
                placeholder='Description (optional)'
                value={route.description}
                onChange={(e) =>
                  updateRoute(index, 'description', e.target.value)
                }
                className='text-sm'
              />
            </div>
          ))}

          {/* Instructions Section */}
          <div className='space-y-2 rounded-md border border-purple-300 bg-purple-100/50 p-3 dark:border-purple-700 dark:bg-purple-900/30'>
            <Label className='flex items-center gap-2 text-xs font-medium text-purple-900 dark:text-purple-100'>
              <Info className='h-3 w-3' />
              How It Works
            </Label>
            <div className='space-y-1 text-xs text-purple-700 dark:text-purple-300'>
              <p>
                Connect this node to a Step node. The LLM response should return
                one of the route values defined above.
              </p>
              <p className='font-medium'>Example routes:</p>
              <ul className='ml-4 list-disc space-y-0.5'>
                {routes.map((route, index) => {
                  const colors = [
                    'text-blue-600',
                    'text-purple-600',
                    'text-orange-600',
                    'text-green-600',
                    'text-pink-600',
                  ]
                  return (
                    <li key={index} className={colors[index % colors.length]}>
                      <span className='font-medium'>{route.name}</span>
                      {route.description && (
                        <span className='text-muted-foreground'>
                          : {route.description}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Connection validation errors */}
        {fieldErrors.connections && (
          <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3'>
            <p className='text-xs font-medium text-destructive'>
              Connection Error
            </p>
            <div className='mt-1 text-xs text-destructive'>
              <pre className='whitespace-pre-wrap font-sans'>
                {fieldErrors.connections}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      {/* Top handle - connects to Step node's top target handle */}
      <Handle
        type='source'
        position={Position.Top}
        id='output-to-step'
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        className='h-3 w-3 bg-purple-500'
      />
    </Card>
  )
}
