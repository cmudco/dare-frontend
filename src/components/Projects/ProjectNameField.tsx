import {
  PROJECT_NAME_MAX_LENGTH,
  ProjectIconKey,
} from '@/utils/constants/project'
import ProjectIconPicker from './ProjectIconPicker'

interface Props {
  id: string
  name: string
  icon: ProjectIconKey
  onNameChange: (name: string) => void
  onIconChange: (icon: ProjectIconKey) => void
  autoFocus?: boolean
  invalid?: boolean
  describedBy?: string
}

/** Name input with the icon picker as its prefix. */
const ProjectNameField = ({
  id,
  name,
  icon,
  onNameChange,
  onIconChange,
  autoFocus,
  invalid,
  describedBy,
}: Props) => (
  <div className='flex h-11 overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring'>
    <ProjectIconPicker value={icon} onChange={onIconChange} />
    <input
      id={id}
      autoFocus={autoFocus}
      value={name}
      maxLength={PROJECT_NAME_MAX_LENGTH}
      placeholder='e.g. Grant proposal'
      aria-invalid={invalid}
      aria-describedby={describedBy}
      onChange={(e) => onNameChange(e.target.value)}
      className='min-w-0 flex-1 bg-transparent px-3 text-sm outline-hidden placeholder:text-muted-foreground'
    />
  </div>
)

export default ProjectNameField
