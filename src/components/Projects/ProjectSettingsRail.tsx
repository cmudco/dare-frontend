import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { useAppSelector } from '@/redux/hooks'
import type { Project } from '@/redux/types/project'
import { ProjectMemoryScope } from '@/utils/constants/project'
import type { ProjectSettingsSection } from './ProjectSettingsDialog'

interface Props {
  project: Project
  onEditSettings: (section: ProjectSettingsSection) => void
  onPinWorkflows: () => void
  onUnpinWorkflow: (workflowId: number) => void
}

const Section = ({
  title,
  action,
  children,
}: {
  title: string
  action: React.ReactNode
  children: React.ReactNode
}) => (
  <section className='border-b border-border py-4 last:border-b-0'>
    <div className='flex items-start justify-between gap-3'>
      <div className='min-w-0 flex-1'>
        <h3 className='text-sm font-medium'>{title}</h3>
        <div className='mt-0.5 text-sm text-muted-foreground'>{children}</div>
      </div>
      {action}
    </div>
  </section>
)

/** At-a-glance project settings beside the chat list; edits open the settings dialog. */
const ProjectSettingsRail = ({
  project,
  onEditSettings,
  onPinWorkflows,
  onUnpinWorkflow,
}: Props) => {
  const enableMemory = useFeatureFlag('enableMemory')
  const workflows = useAppSelector((state) => state.workflow.workflows)
  const modelName = useAppSelector(
    (state) =>
      state.conversation.pickerEntries.find(
        (entry) => entry.id === String(project.defaultModel)
      )?.name
  )
  const pinned = workflows.filter((workflow) =>
    project.workflowIds.includes(workflow.id)
  )
  const tools = [
    project.webSearchEnabled && 'web search',
    project.artifactsEnabled && 'artifacts',
    enableMemory && project.memoryEnabled && 'memory',
  ].filter(Boolean)

  const editButton = (label: string, section: ProjectSettingsSection) => (
    <Button
      variant='outline'
      size='sm'
      className='h-8 rounded-full px-3'
      onClick={() => onEditSettings(section)}
    >
      {label}
    </Button>
  )

  return (
    <aside
      aria-label='Project settings'
      className='rounded-2xl border border-border bg-card px-5 py-1'
    >
      <Section
        title='Instructions'
        action={editButton(
          project.instructions ? 'Edit' : 'Add',
          'instructions'
        )}
      >
        <p className='line-clamp-3 whitespace-pre-line'>
          {project.instructions ||
            'Tell DARE how to respond in this project. Saved as a prompt you can reuse.'}
        </p>
      </Section>
      <Section title='Chat defaults' action={editButton('Edit', 'defaults')}>
        <p>
          {modelName ?? 'Model chosen per chat'}
          {tools.length > 0 && ` · ${tools.join(', ')}`}
        </p>
      </Section>
      {enableMemory && (
        <Section title='Memory' action={editButton('Edit', 'memory')}>
          <p>
            {project.memoryScope === ProjectMemoryScope.PROJECT
              ? 'Project-only: recalls what was learned here.'
              : 'Default: shares memory with your other chats.'}
          </p>
        </Section>
      )}
      <Section
        title='Workflows'
        action={
          <Button
            variant='outline'
            size='sm'
            className='h-8 rounded-full px-3'
            onClick={onPinWorkflows}
          >
            {pinned.length ? 'Manage' : 'Add'}
          </Button>
        }
      >
        {pinned.length === 0 ? (
          <p>Pin workflows you run for this project.</p>
        ) : (
          <ul className='mt-1 flex flex-col gap-0.5'>
            {pinned.map((workflow) => (
              <li
                key={workflow.id}
                className='group flex items-center gap-1 rounded-md hover:bg-accent'
              >
                <Link
                  to={`/workflows/${workflow.id}/edit`}
                  className='flex min-w-0 flex-1 items-center gap-1 px-1.5 py-1 text-foreground'
                >
                  <span className='truncate'>
                    {workflow.title || 'Untitled workflow'}
                  </span>
                  <ArrowUpRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                </Link>
                <button
                  aria-label={`Unpin ${workflow.title || 'workflow'}`}
                  onClick={() => onUnpinWorkflow(workflow.id)}
                  className='mr-1 rounded p-1 opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-foreground sm:opacity-0'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </aside>
  )
}

export default ProjectSettingsRail
