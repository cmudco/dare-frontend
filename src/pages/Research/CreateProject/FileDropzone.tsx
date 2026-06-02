import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_SOURCE_EXTENSIONS } from '@/utils/constants/research'
import type { ProjectDraftFile } from '@/redux/types/research'

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const extensionOf = (name: string): string =>
  name.split('.').pop()?.toLowerCase() ?? ''

interface Props {
  onAdd: (files: ProjectDraftFile[]) => void
}

const FileDropzone = ({ onAdd }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

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
    <div
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
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
        dragging ? 'border-primary bg-muted/40' : 'border-border'
      )}
    >
      <div className='mb-3 rounded-full bg-muted p-3'>
        <UploadCloud className='h-6 w-6 text-muted-foreground' />
      </div>
      <p className='text-sm font-medium'>
        Drag your sources here, or{' '}
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='text-primary hover:underline'
        >
          browse
        </button>
      </p>
      <p className='mt-1 text-xs text-muted-foreground'>
        PDF, DOCX, TXT or Markdown · up to 50&nbsp;MB each
      </p>
      <input
        ref={inputRef}
        type='file'
        multiple
        accept='.pdf,.doc,.docx,.txt,.md'
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
