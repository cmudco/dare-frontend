import { useState } from 'react'
import { ChevronRight, FileText, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RESEARCH_TOOLS, ResearchTool } from '@/utils/constants/research'

interface ContextPanelProps {
  projectQuestion?: string
  enabledTools: ResearchTool[]
  sourceCount: number
  activeSoulFileTitle?: string
  activeSoulFileVersionNumber?: number | null
}

const toolName = (key: ResearchTool): string =>
  RESEARCH_TOOLS.find((tool) => tool.key === key)?.name ?? key

const ContextPanel = ({
  projectQuestion,
  enabledTools,
  sourceCount,
  activeSoulFileTitle,
  activeSoulFileVersionNumber,
}: ContextPanelProps) => {
  const [open, setOpen] = useState(true)

  return (
    <aside
      className={cn(
        'shrink-0 transition-all duration-300',
        open ? 'w-full lg:w-72' : 'w-full lg:w-12'
      )}
    >
      <div className='rounded-xl border border-border bg-card'>
        <button
          onClick={() => setOpen((v) => !v)}
          className='flex w-full items-center justify-between px-4 py-3 text-sm font-medium'
        >
          <span className={cn(!open && 'lg:hidden')}>Context</span>
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              open && 'rotate-90'
            )}
          />
        </button>

        {open && (
          <div className='space-y-5 border-t border-border p-4'>
            <Block label='Active question'>
              <p className='text-sm leading-relaxed text-foreground/80'>
                {projectQuestion || 'No research question loaded yet.'}
              </p>
            </Block>

            <Block label='Active tools'>
              <div className='flex flex-wrap gap-1.5'>
                {enabledTools.map((tool) => (
                  <span
                    key={tool}
                    className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs'
                  >
                    <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                    {toolName(tool)}
                  </span>
                ))}
              </div>
            </Block>

            <Block label='Project sources'>
              <div className='rounded-lg bg-muted/40 p-2.5'>
                <p className='text-xs font-medium'>{sourceCount} records</p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Source records are persisted now. File content ingestion and
                  agent-readable context come later.
                </p>
              </div>
            </Block>

            <Block
              label='Research standards'
              icon={<ScrollText className='h-3.5 w-3.5' />}
            >
              <div className='rounded-lg border border-border bg-muted/30 p-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-xs font-medium'>Soul file</span>
                  <span className='rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                    {activeSoulFileVersionNumber
                      ? `v${activeSoulFileVersionNumber}`
                      : 'Not selected'}
                  </span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {activeSoulFileTitle ||
                    'Create or select a soul file from Memory / Context.'}
                </p>
                <span className='mt-3 flex items-center gap-1 text-xs text-muted-foreground'>
                  <FileText className='h-3 w-3' /> Versioned standards active
                </span>
              </div>
            </Block>
          </div>
        )}
      </div>
    </aside>
  )
}

const Block = ({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) => (
  <div>
    <p className='mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
      {icon}
      {label}
    </p>
    {children}
  </div>
)

export default ContextPanel
