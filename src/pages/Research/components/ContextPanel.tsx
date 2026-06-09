import { useState } from 'react'
import { ChevronRight, FileText, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/hooks'
import { resolveToolMeta } from '@/utils/constants/research'
import { MEMORY, SOUL_FILE } from '../mockData'

interface Props {
  question: string
  enabledTools: string[]
}

const ContextPanel = ({ question, enabledTools }: Props) => {
  const [open, setOpen] = useState(true)
  const connections = useAppSelector((state) => state.mcp.connections)
  const tools = enabledTools.map((slug) => resolveToolMeta(slug, connections))

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
                {question}
              </p>
            </Block>

            <Block label='Active tools'>
              {tools.length > 0 ? (
                <div className='flex flex-wrap gap-1.5'>
                  {tools.map((tool) => (
                    <span
                      key={tool.slug}
                      className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs'
                    >
                      <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                      {tool.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-xs text-muted-foreground'>
                  No tools enabled yet.
                </p>
              )}
            </Block>

            <Block label='Active memory'>
              <div className='space-y-2'>
                {MEMORY.map((m) => (
                  <div key={m.id} className='rounded-lg bg-muted/40 p-2.5'>
                    <p className='text-xs font-medium'>{m.label}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {m.detail}
                    </p>
                  </div>
                ))}
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
                    {SOUL_FILE.version} · {SOUL_FILE.updated}
                  </span>
                </div>
                <ul className='space-y-1.5'>
                  {SOUL_FILE.virtues.map((v) => (
                    <li key={v.rank} className='flex gap-2 text-xs'>
                      <span className='text-muted-foreground'>{v.rank}.</span>
                      <span>
                        <span className='font-medium'>{v.label}</span>
                        <span className='block text-muted-foreground'>
                          {v.note}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button className='mt-3 flex items-center gap-1 text-xs text-primary hover:underline'>
                  <FileText className='h-3 w-3' /> View full soul file
                </button>
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
