import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  Code2,
  FlaskConical,
  Folder,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  PenLine,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectIconKey } from '@/utils/constants/project'

const PROJECT_ICONS: Record<ProjectIconKey, LucideIcon> = {
  [ProjectIconKey.FOLDER]: Folder,
  [ProjectIconKey.BOOK]: BookOpen,
  [ProjectIconKey.FLASK]: FlaskConical,
  [ProjectIconKey.BRIEFCASE]: Briefcase,
  [ProjectIconKey.GRADUATION]: GraduationCap,
  [ProjectIconKey.CHART]: BarChart3,
  [ProjectIconKey.CODE]: Code2,
  [ProjectIconKey.LIGHTBULB]: Lightbulb,
  [ProjectIconKey.PEN]: PenLine,
  [ProjectIconKey.GLOBE]: Globe,
  [ProjectIconKey.HEART]: Heart,
  [ProjectIconKey.CALENDAR]: CalendarDays,
}

interface Props {
  icon: ProjectIconKey
  /** Framed tile for lists and headers; bare glyph inline. */
  tile?: boolean
  className?: string
}

const ProjectIcon = ({ icon, tile = false, className }: Props) => {
  const Glyph = PROJECT_ICONS[icon]
  if (!tile) return <Glyph aria-hidden className={cn('h-4 w-4', className)} />
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground',
        className
      )}
    >
      <Glyph className='h-[18px] w-[18px]' />
    </span>
  )
}

export default ProjectIcon
