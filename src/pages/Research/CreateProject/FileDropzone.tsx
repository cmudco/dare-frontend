import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ACCEPTED_SOURCE_EXTENSIONS } from '@/utils/constants/research'
import type { ProjectDraftFile } from '@/redux/types/research'

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const extensionOf = (name: string): string =>
  name.split('.').pop()?.toLowerCase() ?? ''

// Single source of truth for the input's `accept` filter — derived from the
// shared allowlist so the two can't drift apart.
const ACCEPT_ATTR = ACCEPTED_SOURCE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

interface Props {
  onAdd: (files: ProjectDraftFile[]) => void
}

const FileDropzone = ({ onAdd }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const openPicker = () => inputRef.current?.click()

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const allowed = ACCEPTED_SOURCE_EXTENSIONS as readonly string[]
    const accepted: ProjectDraftFile[] = Array.from(fileList)
      .filter((file) => allowed.includes(extensionOf(file.name)))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        sizeLabel: formatBytes(file.size),
        kind: extensionOf(file.name).toUpperCase(),
      }))
    if (accepted.length > 0) onAdd(accepted)
  }

  return (
    // The whole zone is a click target (mouse convenience); the visible
    // "Browse files" button is the real keyboard-accessible control, so the
    // outer div intentionally carries no button role to avoid nesting two
    // interactive elements.
    <div
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
        dragging
          ? 'border-primary bg-muted/40'
          : 'border-border hover:border-primary/60 hover:bg-muted/30'
      )}
    >
      <div
        className={cn(
          'mb-3 rounded-full p-3 transition-colors',
          dragging ? 'bg-primary/10' : 'bg-muted'
        )}
      >
        <UploadCloud
          className={cn(
            'h-6 w-6 transition-colors',
            dragging ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      </div>
      <p className='text-sm font-medium'>
        {dragging ? 'Drop to add your sources' : 'Drag your sources here'}
      </p>
      <p className='mt-1 mb-4 text-xs text-muted-foreground'>
        Documents, slides, spreadsheets, web &amp; data files · up to 50&nbsp;MB
        each
      </p>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={(e) => {
          // Stop the click from bubbling to the zone's onClick, which would
          // open the file picker a second time.
          e.stopPropagation()
          openPicker()
        }}
      >
        <UploadCloud aria-hidden='true' />
        Browse files
      </Button>
      <input
        ref={inputRef}
        type='file'
        multiple
        accept={ACCEPT_ATTR}
        className='hidden'
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default FileDropzone
