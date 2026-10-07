import React, { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  FileText,
  Folder,
  Library,
  Plus,
  Upload,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/hooks'
import { selectLibraries } from '@/redux/librarySlice'
import type { Project, ProjectUpdate } from '@/redux/types/project'
import { FileStatus } from '@/utils/constants/file'
import { formatRelativeDate } from '@/utils/dateUtils'
import { getFileExtension } from '@/utils/files'

interface Props {
  project: Project
  onChooseExisting: () => void
  onUpload: (files: File[]) => void
  onRemove: (update: ProjectUpdate) => void
  uploading: boolean
}

interface SourceRow {
  key: string
  name: string
  detail: string
  icon: React.ReactNode
  status: 'processing' | 'failed' | null
  remove: ProjectUpdate
}

const STATUS_LABEL = { processing: 'Processing', failed: 'Failed' } as const

const ProjectSourceList = ({
  project,
  onChooseExisting,
  onUpload,
  onRemove,
  uploading,
}: Props) => {
  const files = useAppSelector((state) => state.files.files)
  const folders = useAppSelector((state) => state.files.folders)
  const libraries = useAppSelector(selectLibraries)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragDepth, setDragDepth] = useState(0)

  const rows = useMemo<SourceRow[]>(
    () => [
      ...folders
        .filter((folder) => project.folderIds.includes(folder.id))
        .map((folder) => ({
          key: `folder-${folder.id}`,
          name: folder.name,
          detail: `Folder · ${folder.fileCount} ${folder.fileCount === 1 ? 'file' : 'files'}`,
          icon: <Folder className='h-4 w-4' />,
          status: null,
          remove: {
            folderIds: project.folderIds.filter((id) => id !== folder.id),
          },
        })),
      ...files
        .filter((file) => project.fileIds.includes(file.id))
        .map((file) => ({
          key: `file-${file.id}`,
          name: file.name,
          detail: `${getFileExtension(file.name).toUpperCase() || 'File'} · ${formatRelativeDate(file.createdAt)}`,
          icon: <FileText className='h-4 w-4' />,
          status:
            file.status === FileStatus.PROCESSING
              ? ('processing' as const)
              : file.status === FileStatus.FAILED
                ? ('failed' as const)
                : null,
          remove: { fileIds: project.fileIds.filter((id) => id !== file.id) },
        })),
      ...libraries
        .filter((library) => project.libraryIds.includes(library.id))
        .map((library) => ({
          key: `library-${library.id}`,
          name: library.name,
          detail: `Shared library · ${library.curator}`,
          icon: <Library className='h-4 w-4' />,
          status: null,
          remove: {
            libraryIds: project.libraryIds.filter((id) => id !== library.id),
          },
        })),
    ],
    [files, folders, libraries, project]
  )

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragDepth(0)
    if (event.dataTransfer.files.length) {
      onUpload(Array.from(event.dataTransfer.files))
    }
  }

  return (
    <div
      onDragEnter={(e) => {
        if (e.dataTransfer.types.includes('Files')) setDragDepth((d) => d + 1)
      }}
      onDragLeave={() => setDragDepth((d) => Math.max(0, d - 1))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-2xl transition-colors',
        dragDepth > 0 &&
          'bg-primary/5 outline-2 outline-primary/40 outline-dashed'
      )}
    >
      {dragDepth > 0 && (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl text-sm font-medium text-primary'>
          Drop documents to add them to this project
        </div>
      )}
      <input
        ref={inputRef}
        type='file'
        multiple
        hidden
        accept='.pdf,.doc,.docx,.txt,.md,.json,.csv,.xls,.xlsx,.ipynb'
        onChange={(e) => {
          if (e.target.files?.length) onUpload(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
      <ul className={cn('flex flex-col', dragDepth > 0 && 'opacity-40')}>
        <li>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={uploading}
                className='flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60'
              >
                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-muted'>
                  <Plus className='h-4 w-4' />
                </span>
                {uploading ? 'Uploading…' : 'Add sources'}
                <span className='ml-auto hidden text-xs sm:inline'>
                  or drop files here
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-60'>
              <DropdownMenuItem onSelect={() => inputRef.current?.click()}>
                <Upload className='mr-2 h-4 w-4' />
                Upload documents
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onChooseExisting}>
                <Folder className='mr-2 h-4 w-4' />
                Choose from your sources
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
        {rows.map((row) => (
          <li key={row.key} className='group relative border-t border-border'>
            <div className='flex items-center gap-3 px-3 py-3 pr-12'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground'>
                {row.icon}
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-sm font-medium'>
                  {row.name}
                </span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {row.detail}
                </span>
              </span>
              {row.status && (
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs',
                    row.status === 'failed'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {STATUS_LABEL[row.status]}
                </span>
              )}
            </div>
            <button
              aria-label={`Remove ${row.name} from project`}
              onClick={() => onRemove(row.remove)}
              className='absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-100 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-foreground sm:opacity-0'
            >
              <X className='h-4 w-4' />
            </button>
          </li>
        ))}
      </ul>
      <div className='mt-2 px-3'>
        <Link
          to='/files'
          className='inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground'
        >
          Manage all files in Sources <ArrowUpRight className='h-3 w-3' />
        </Link>
      </div>
    </div>
  )
}

export default ProjectSourceList
