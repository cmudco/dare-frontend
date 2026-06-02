import type { ElementType } from 'react'
import { BarChart3, Globe, Quote, Stethoscope } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { RESEARCH_TOOLS, ResearchTool } from '@/utils/constants/research'
import type { ProjectDraft } from '@/redux/types/research'
import StepHeading from './StepHeading'

const TOOL_ICONS: Record<ResearchTool, ElementType> = {
  [ResearchTool.PUBMED]: Stethoscope,
  [ResearchTool.SCITE]: Quote,
  [ResearchTool.CONSENSUS]: BarChart3,
  [ResearchTool.WEB]: Globe,
}

interface Props {
  enabledTools: ResearchTool[]
  onPatch: (patch: Partial<ProjectDraft>) => void
}

const ToolsStep = ({ enabledTools, onPatch }: Props) => {
  const toggle = (key: ResearchTool) => {
    const next = enabledTools.includes(key)
      ? enabledTools.filter((t) => t !== key)
      : [...enabledTools, key]
    onPatch({ enabledTools: next })
  }

  return (
    <div className='space-y-6'>
      <StepHeading
        title='Where should Scout look?'
        subtitle='Choose the sources Scout may search. Every tool is opt-in — nothing runs until you ask it to.'
      />

      <div className='grid max-w-2xl gap-3 sm:grid-cols-2'>
        {RESEARCH_TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.key]
          const isOn = enabledTools.includes(tool.key)
          return (
            <div
              key={tool.key}
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
                    onCheckedChange={() => toggle(tool.key)}
                    aria-label={`Toggle ${tool.name}`}
                  />
                </div>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {tool.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ToolsStep
