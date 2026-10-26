import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { SourceSizeState } from '@/hooks/useSourceSize'
import { ProjectSourceMode } from '@/utils/constants/project'
import { formatTokenEstimate } from './projectSources'

interface Props {
  value: ProjectSourceMode
  onChange: (mode: ProjectSourceMode) => void
  sizeState: SourceSizeState
  hasFiles: boolean
}

const fullFilesNote = (sizeState: SourceSizeState, hasFiles: boolean) => {
  if (!hasFiles) return 'Pick files or folders to read in full.'
  switch (sizeState.status) {
    case 'ready': {
      const { size } = sizeState
      const estimate = formatTokenEstimate(size.estimatedTokens)
      return size.fitsFullFiles
        ? `Sends every file whole each turn (${estimate}). Best for a few short files.`
        : `Too large to read in full: ${estimate}, limit ${formatTokenEstimate(size.tokenLimit)}.`
    }
    case 'error':
      return 'Could not measure these files. Try again.'
    default:
      return 'Measuring files…'
  }
}

/** How new project chats use the chosen files and folders. */
const SourceModeChoice = ({ value, onChange, sizeState, hasFiles }: Props) => {
  const fullAllowed =
    hasFiles && sizeState.status === 'ready' && sizeState.size.fitsFullFiles
  const options = [
    {
      mode: ProjectSourceMode.SEARCH,
      label: 'Search relevant passages',
      note: 'Finds the passages that match each question. Best for many or large files.',
      disabled: false,
    },
    {
      mode: ProjectSourceMode.FULL,
      label: 'Read full files',
      note: fullFilesNote(sizeState, hasFiles),
      disabled: !fullAllowed && value !== ProjectSourceMode.FULL,
    },
  ]

  return (
    <fieldset className='flex flex-col gap-2'>
      <legend className='mb-2 text-sm font-medium'>
        How should chats use these sources?
      </legend>
      <RadioGroup
        value={value}
        onValueChange={(mode) => onChange(mode as ProjectSourceMode)}
        className='gap-1'
      >
        {options.map((option) => (
          <Label
            key={option.mode}
            htmlFor={`source-mode-${option.mode}`}
            className='flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 font-normal hover:bg-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:hover:bg-transparent'
          >
            <RadioGroupItem
              id={`source-mode-${option.mode}`}
              value={option.mode}
              disabled={option.disabled}
              className='mt-0.5'
            />
            <span className='flex flex-col gap-0.5'>
              <span className='text-sm'>{option.label}</span>
              <span className='text-xs text-muted-foreground'>
                {option.note}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <p className='px-2 text-xs text-muted-foreground'>
        Shared libraries are always searched.
      </p>
    </fieldset>
  )
}

export default SourceModeChoice
