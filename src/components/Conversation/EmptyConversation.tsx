import { useAppSelector } from '@/redux/hooks'
import { selectProjectById } from '@/redux/projectSlice'
import ProjectIcon from '../Projects/ProjectIcon'
import { projectSourceCount } from '../Projects/projectSources'

const EmptyConversation: React.FC = () => {
  const project = useAppSelector((state) =>
    selectProjectById(
      state,
      state.conversation.activeConversation?.project ?? null
    )
  )

  if (project) {
    const sourceCount = projectSourceCount(project)
    const applied = [
      project.instructions && 'instructions',
      sourceCount > 0 &&
        `${sourceCount} ${sourceCount === 1 ? 'source' : 'sources'}`,
    ].filter(Boolean)

    return (
      <div className='flex h-full flex-col items-center justify-center gap-3 px-6 text-center'>
        <ProjectIcon icon={project.icon} tile className='h-12 w-12' />
        <h3 className='text-2xl font-semibold text-foreground'>
          New chat in {project.name}
        </h3>
        <p className='max-w-md text-sm text-muted-foreground'>
          {applied.length > 0
            ? `This chat uses the project's ${applied.join(' and ')}.`
            : 'Add instructions or sources in project settings to shape every chat here.'}
        </p>
      </div>
    )
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <h3 className='mb-4 text-center text-2xl font-semibold text-foreground'>
        Start the conversation by typing a message!
      </h3>
    </div>
  )
}

export default EmptyConversation
