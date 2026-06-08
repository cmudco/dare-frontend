import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Plug } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getMcpConnections } from '@/redux/asyncThunks/mcp'
import {
  availableResearchTools,
  WEB_SEARCH_TOOL_SLUG,
} from '@/utils/constants/research'
import type { ProjectDraft } from '@/redux/types/research'
import StepHeading from './StepHeading'

interface Props {
  enabledTools: string[]
  onPatch: (patch: Partial<ProjectDraft>) => void
}

const ToolsStep = ({ enabledTools, onPatch }: Props) => {
  const dispatch = useAppDispatch()
  const connections = useAppSelector((state) => state.mcp.connections)
  const loading = useAppSelector((state) => state.mcp.connectionsLoading)

  useEffect(() => {
    dispatch(getMcpConnections())
  }, [dispatch])

  const tools = availableResearchTools(connections)
  const hasConnections = tools.length > 1 // anything beyond the web built-in

  const toggle = (slug: string) => {
    const next = enabledTools.includes(slug)
      ? enabledTools.filter((t) => t !== slug)
      : [...enabledTools, slug]
    onPatch({ enabledTools: next })
  }

  return (
    <div className='space-y-6'>
      <StepHeading
        title='Where should Scout look?'
        subtitle='Choose from the integrations you’ve connected. Every tool is opt-in — nothing runs until you ask it to.'
      />

      <div className='grid max-w-2xl gap-3 sm:grid-cols-2'>
        {tools.map((tool) => {
          const Icon = tool.slug === WEB_SEARCH_TOOL_SLUG ? Globe : Plug
          const isOn = enabledTools.includes(tool.slug)
          return (
            <div
              key={tool.slug}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-colors',
                isOn ? 'border-foreground/20 bg-muted/30' : 'border-border'
              )}
            >
              <div className='rounded-lg bg-muted p-2'>
                <Icon className='h-5 w-5 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-medium'>{tool.name}</p>
                  <Switch
                    checked={isOn}
                    onCheckedChange={() => toggle(tool.slug)}
                    aria-label={`Toggle ${tool.name}`}
                  />
                </div>
                {tool.description && (
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {tool.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!loading && !hasConnections && (
        <p className='max-w-2xl text-xs text-muted-foreground'>
          Web search is ready out of the box. To let Scout search more sources,{' '}
          <Link to='/mcp' className='text-primary hover:underline'>
            connect an integration
          </Link>{' '}
          and it’ll show up here.
        </p>
      )}
    </div>
  )
}

export default ToolsStep
