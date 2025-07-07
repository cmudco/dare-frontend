import { FileStatus } from '@/utils/constants/file'
import { VectorDbSource } from '@/utils/constants/user'

export interface MyFile {
  id: number
  user: string
  name: string
  file: string
  fileType: string
  size: number
  tags: number[]
  jobId?: string
  status: FileStatus
  vectorDbSource: VectorDbSource
  errorMessage?: string
}

export interface MyFolder {
  id: number
  user: number
  name: string
  files: MyFile[]
  fileCount: number
  updatedAt: string
}

export interface FileState {
  files: MyFile[]
  folders: MyFolder[]
  loading: boolean
  pollingLoading: boolean
  error: string | null
  selectedTags: number[]
  isModalOpen: boolean
  filename: string
  foldername: string
  expandedFolders: { [folderId: number]: boolean }
  jobStatuses: {
    [fileId: number]: { status: FileStatus; jobId?: string; jobStatus?: string }
  }
  searchQuery: string
  selectedItems: number[]
  currentView: 'files' | 'folders'
  isMoveModalOpen: boolean
}

export interface FolderHeaderProps {
  onToggleView: (view: 'files' | 'folders') => void
}
