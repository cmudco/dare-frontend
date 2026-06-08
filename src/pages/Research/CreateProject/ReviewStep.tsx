import { BookOpen, FileText, ScrollText, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppSelector } from '@/redux/hooks'
import { resolveToolMeta, STANDARDS_PRESETS } from '@/utils/constants/research'
import type { ProjectDraft } from '@/redux/types/research'
import StepHeading from './StepHeading'

interface Props {
  draft: ProjectDraft
}

const ReviewStep = ({ draft }: Props) => {
  const connections = useAppSelector((state) => state.mcp.connections)
  const tools = draft.enabledTools.map((slug) =>
    resolveToolMeta(slug, connections)
  )
  const standards = STANDARDS_PRESETS.find(
    (p) => p.key === draft.standardsTemplate
  )

  return (
    <div className='space-y-6'>
      <StepHeading
        title='Review & create'
        subtitle='Confirm the setup. You can change any of this from inside the workspace later.'
      />

      <div className='max-w-2xl space-y-4'>
        <div className='rounded-xl border border-border bg-card p-5'>
          <div className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            <BookOpen className='h-3.5 w-3.5' /> Project
          </div>
          <h3 className='mt-2 text-lg font-semibold tracking-tight'>
            {draft.title || 'Untitled project'}
          </h3>
          {draft.question && (
            <p className='mt-1 text-sm text-muted-foreground'>
              {draft.question}
            </p>
          )}
          {draft.field && (
            <Badge variant='gray' className='mt-3'>
              {draft.field}
            </Badge>
          )}
        </div>

        <Row icon={<FileText className='h-3.5 w-3.5' />} label='Sources'>
          {draft.files.length > 0
            ? `${draft.files.length} file${draft.files.length > 1 ? 's' : ''} added`
            : 'None yet'}
        </Row>

        <Row icon={<Wrench className='h-3.5 w-3.5' />} label='Tools'>
          {tools.length > 0 ? (
            <div className='flex flex-wrap gap-1.5'>
              {tools.map((tool) => (
                <Badge key={tool.slug} variant='blue'>
                  {tool.name}
                </Badge>
              ))}
            </div>
          ) : (
            'No tools enabled'
          )}
        </Row>

        <Row icon={<ScrollText className='h-3.5 w-3.5' />} label='Standards'>
          {standards?.name ?? '—'}
        </Row>
      </div>
    </div>
  )
}

const Row = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) => (
  <div className='flex items-start gap-4 rounded-xl border border-border bg-card p-4'>
    <div className='flex w-24 shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
      {icon}
      {label}
    </div>
    <div className='min-w-0 flex-1 text-sm'>{children}</div>
  </div>
)

export default ReviewStep
