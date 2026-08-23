/**
 * QuillPicker Component
 *
 * Allows users to select a CMU document template (quill) for the
 * conversation. Styled consistently with DareToolSelector.
 */

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Feather, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getQuillmarkQuillsAPI, Quill } from '@/api/quillmark'

interface QuillPickerProps {
  selectedQuill: string | null
  onChange: (quillName: string | null) => void
  disabled?: boolean
}

/**
 * Pretty display name for a quill, e.g. "trip_report" -> "Trip Report"
 */
const getQuillDisplayName = (name: string): string =>
  name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

export const QuillPicker: React.FC<QuillPickerProps> = ({
  selectedQuill,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [quills, setQuills] = useState<Quill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closedBySelectionRef = useRef(false)

  // Read the catalog through the user's live MCP connection. Refreshing on
  // every open avoids showing templates from a previous connection/session.
  useEffect(() => {
    if (!open) return

    setLoading(true)
    setError(null)
    getQuillmarkQuillsAPI()
      .then((response) => {
        setQuills(response.quills)
      })
      .catch((err) => {
        console.error('Failed to fetch quills:', err)
        setError('Failed to load document templates')
      })
      .finally(() => setLoading(false))
  }, [open])

  // Single-select toggle: clicking the selected quill deselects it.
  // Close the popover on selection so keyboard focus can return to the
  // composer — otherwise the next Enter is captured by the popover and
  // never reaches the textarea's send handler.
  const handleToggleQuill = (name: string) => {
    onChange(selectedQuill === name ? null : name)
    closedBySelectionRef.current = true
    setOpen(false)
  }

  const displayLabel = selectedQuill
    ? getQuillDisplayName(selectedQuill)
    : 'Documents'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          disabled={disabled}
          className={`flex max-w-[140px] min-w-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-all sm:max-w-[180px] ${
            selectedQuill
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          title='CMU Documents'
        >
          <Feather className='h-4 w-4 shrink-0' />
          <span className='truncate'>{displayLabel}</span>
          <ChevronDown className='h-3 w-3 shrink-0 opacity-60' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-3 shadow-2xl'
        align='start'
        onCloseAutoFocus={(event) => {
          // When closed by selecting a quill, keep focus where the parent
          // put it (the composer textarea) instead of the trigger button.
          if (closedBySelectionRef.current) {
            closedBySelectionRef.current = false
            event.preventDefault()
          }
        }}
      >
        <div className='mb-1.5 flex items-center gap-2'>
          <Feather className='h-[18px] w-[18px] text-primary' />
          <span className='text-sm font-semibold text-foreground'>
            CMU Documents
          </span>
        </div>
        <div className='mb-3 text-xs text-muted-foreground'>
          Generate a formatted document from a template
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Loading templates...</span>
          </div>
        ) : error ? (
          <div className='py-6 text-center text-sm text-destructive'>
            {error}
          </div>
        ) : quills.length === 0 ? (
          <div className='py-6 text-center text-sm text-muted-foreground'>
            No templates available
          </div>
        ) : (
          <div className='flex flex-col gap-1'>
            {quills.map((quill) => {
              const isSelected = selectedQuill === quill.name
              return (
                <button
                  key={quill.name}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-transparent hover:border-border hover:bg-accent'
                  }`}
                  onClick={() => handleToggleQuill(quill.name)}
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                    <FileText className='h-4 w-4 text-primary' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-0.5 text-[13px] font-medium text-foreground'>
                      {getQuillDisplayName(quill.name)}
                    </div>
                    <div className='line-clamp-2 text-[11px] leading-relaxed text-muted-foreground'>
                      {quill.description}
                    </div>
                  </div>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                    {isSelected && <Check className='h-4 w-4 text-primary' />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default QuillPicker
