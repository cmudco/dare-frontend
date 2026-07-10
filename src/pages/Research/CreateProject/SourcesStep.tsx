import { FileText, X } from 'lucide-react'
import type { ProjectDraft, ProjectDraftFile } from '@/redux/types/research'
import FileDropzone from './FileDropzone'
import StepHeading from './StepHeading'

interface Props {
  files: ProjectDraftFile[]
  onPatch: (patch: Partial<ProjectDraft>) => void
}

const SourcesStep = ({ files, onPatch }: Props) => {
  const handleAdd = (added: ProjectDraftFile[]) =>
    onPatch({ files: [...files, ...added] })

  const handleRemove = (id: string) =>
    onPatch({ files: files.filter((f) => f.id !== id) })

  return (
    <div className='space-y-6'>
      <StepHeading
        title='Bring your own sources'
        subtitle='Add the papers, notes and reports you already trust. Scout reads across these alongside the tools you pick next.'
      />

      <div className='max-w-2xl space-y-4'>
        <FileDropzone onAdd={handleAdd} />

        {files.length > 0 && (
          <ul className='space-y-2'>
            {files.map((file) => (
              <li
                key={file.id}
                className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3'
              >
                <div className='rounded-md bg-muted p-2'>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{file.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {file.kind} · {file.sizeLabel}
                  </p>
                </div>
                <button
                  type='button'
                  aria-label={`Remove ${file.name}`}
                  onClick={() => handleRemove(file.id)}
                  className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className='text-xs text-muted-foreground'>
          Optional — you can add sources any time from inside the workspace.
        </p>
      </div>
    </div>
  )
}

export default SourcesStep
