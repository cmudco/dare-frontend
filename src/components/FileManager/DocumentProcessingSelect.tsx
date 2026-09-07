import { useId } from 'react'
import {
  DocumentProcessingMode,
  DOCUMENT_PROCESSING_OPTIONS,
} from '@/utils/constants/file'

interface Props {
  value: DocumentProcessingMode
  onChange: (value: DocumentProcessingMode) => void
  legend: string
  disabled?: boolean
}

export default function DocumentProcessingSelect({
  value,
  onChange,
  legend,
  disabled = false,
}: Props) {
  const id = useId()

  return (
    <fieldset disabled={disabled} className='space-y-2'>
      <legend className='text-sm font-medium'>{legend}</legend>
      <div className='grid grid-cols-2 gap-1 rounded-lg bg-muted p-1'>
        {Object.values(DocumentProcessingMode).map((mode) => (
          <label key={mode} className='relative'>
            <input
              type='radio'
              name={id}
              value={mode}
              checked={value === mode}
              onChange={() => onChange(mode)}
              aria-describedby={`${id}-description`}
              className='peer sr-only'
            />
            <span className='flex min-h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:text-foreground motion-reduce:transition-none'>
              {DOCUMENT_PROCESSING_OPTIONS[mode].label}
            </span>
          </label>
        ))}
      </div>
      <p id={`${id}-description`} className='text-xs text-muted-foreground'>
        {DOCUMENT_PROCESSING_OPTIONS[value].description}
      </p>
    </fieldset>
  )
}
