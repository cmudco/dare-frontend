import {
  Activity,
  ArrowLeft,
  Compass,
  Inbox,
  Library,
  MessagesSquare,
  Shapes,
  Telescope,
  Waypoints,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavSection } from '../types'

interface NavDef {
  key: NavSection
  label: string
  icon: React.ElementType
}

const NAV: NavDef[] = [
  { key: 'overview', label: 'Overview', icon: Compass },
  { key: 'scout', label: 'Ask Scout', icon: Telescope },
  { key: 'chat', label: 'Chat', icon: MessagesSquare },
  { key: 'review', label: 'Review Inbox', icon: Inbox },
  { key: 'memory', label: 'Context', icon: Library },
  { key: 'graph', label: 'Maps', icon: Waypoints },
  { key: 'artifacts', label: 'Artifacts', icon: Shapes },
  { key: 'runs', label: 'Runs', icon: Activity },
]

interface Props {
  active: NavSection
  onNavigate: (s: NavSection) => void
  pendingCount: number
  approvedCount: number
  center: React.ReactNode
  context: React.ReactNode
  /** Overrides the demo project title (falls back to the mock project). */
  projectTitle?: string
  /** Secondary line under the title, e.g. the field of study. */
  projectMeta?: string
  /** When provided, renders a "back to projects" affordance in the header. */
  onBack?: () => void
}

const WorkspaceShell = ({
  active,
  onNavigate,
  pendingCount,
  approvedCount,
  center,
  context,
  projectTitle,
  projectMeta,
  onBack,
}: Props) => {
  return (
    <div className='min-h-screen bg-background font-sans text-foreground'>
      {/* Top bar */}
      <header className='sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10'>
          <div className='min-w-0'>
            {onBack && (
              <button
                onClick={onBack}
                className='mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                <ArrowLeft className='h-3.5 w-3.5' /> All projects
              </button>
            )}
            <div className='flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
              <span className='bg-dare-gradient bg-clip-text text-transparent'>
                DARE
              </span>
              <span className='text-border'>/</span>
              <span>Research Workspace</span>
            </div>
            <h1 className='mt-0.5 truncate text-lg font-semibold tracking-tight'>
              {projectTitle ?? 'Research project'}
            </h1>
            <p className='truncate text-xs text-muted-foreground'>
              {projectMeta ?? ''}
            </p>
          </div>

          {/* Quiet status indicators — not a metrics wall */}
          <div className='flex items-center gap-5 text-sm'>
            <Stat value='4' label='AI helpers' tone='neutral' />
            <Stat
              value={String(pendingCount)}
              label='to review'
              tone={pendingCount > 0 ? 'attention' : 'neutral'}
            />
            <Stat value={String(approvedCount)} label='approved' tone='good' />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className='mx-auto max-w-[1600px] gap-8 px-6 py-8 lg:flex lg:px-10'>
        {/* Left nav */}
        <nav className='mb-6 shrink-0 lg:mb-0 lg:w-52'>
          <ul className='flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible'>
            {NAV.map((item) => {
              const isActive = active === item.key
              const Icon = item.icon
              const badge = item.key === 'review' ? pendingCount : 0
              return (
                <li key={item.key} className='shrink-0'>
                  <button
                    onClick={() => onNavigate(item.key)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-muted font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className='h-4 w-4 shrink-0' />
                    <span>{item.label}</span>
                    {badge > 0 && (
                      <span className='ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-dare-gradient px-1.5 text-xs font-semibold text-white'>
                        {badge}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Center + context */}
        <div className='flex min-w-0 flex-1 flex-col gap-6 lg:flex-row'>
          <main className='min-w-0 flex-1'>{center}</main>
          {context}
        </div>
      </div>
    </div>
  )
}

const Stat = ({
  value,
  label,
  tone,
}: {
  value: string
  label: string
  tone: 'neutral' | 'attention' | 'good'
}) => (
  <div className='text-right'>
    <div
      className={cn(
        'text-base leading-none font-semibold tabular-nums',
        tone === 'attention' && 'text-amber-600 dark:text-amber-400',
        tone === 'good' && 'text-green-600 dark:text-green-400'
      )}
    >
      {value}
    </div>
    <div className='text-[11px] text-muted-foreground'>{label}</div>
  </div>
)

export default WorkspaceShell
