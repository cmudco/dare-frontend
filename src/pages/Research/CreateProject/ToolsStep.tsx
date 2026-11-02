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
import { INTEGRATIONS_PATH } from '@/routes/paths'

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

  const tools = availableResearchTools(connections).filter(
    (tool) => tool.slug !== WEB_SEARCH_TOOL_SLUG
  )
  const hasConnections = tools.length > 0

  const toggle = (slug: string) => {
    const next = enabledTools.includes(slug)
      ? enabledTools.filter((t) => t !== slug)
      : [...enabledTools, slug]
    onPatch({ enabledTools: next })
  }

  return (
    <div className='space-y-6'>
      <StepHeading
        title='Where should Scouts look?'
        subtitle='Web search, paper search and the page reader are always on. Add any research tools you’ve connected.'
      />

      <div className='flex max-w-2xl items-start gap-3 rounded-xl border border-border bg-muted/30 p-4'>
        <div className='rounded-lg bg-muted p-2'>
          <Globe className='h-5 w-5 text-muted-foreground' />
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>Always on</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Web search, paper search (OpenAlex) and a page reader that finds
            free copies of paywalled papers. Every source is checked before it
            reaches your inbox.
          </p>
        </div>
      </div>

      <div className='grid max-w-2xl gap-3 sm:grid-cols-2'>
        {tools.map((tool) => {
          const Icon = Plug
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
          Want Scite, Consensus or another research tool too?{' '}
          <Link to={INTEGRATIONS_PATH} className='text-primary hover:underline'>
            connect an integration
          </Link>{' '}
          and it’ll show up here.
        </p>
      )}
    </div>
  )
}

export default ToolsStep
