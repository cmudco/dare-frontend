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
  isMedia?: boolean
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'generated_image'
  isGenerated?: boolean
  generationPrompt?: string
  revisedPrompt?: string
  generationParams?: {
    model: string
    size: string
    quality: string
    style: string
  }
  createdAt: string
  updatedAt: string
  sharedBy?: { id: number; name: string; initials: string }
  isSharedByMe?: boolean
  isSharedPublicly?: boolean
  // Document parsing. Headline numbers only — the elements behind them come
  // from the dedicated structure endpoint.
  pageCount?: number | null
  pagesWithoutText?: number
  parserName?: string | null
  structureCounts?: DocumentCounts | null
}

export interface DocumentCounts {
  pages: number
  sections: number
  tables: number
  pictures: number
  pagesWithoutText: number
  contentChars: number
}

/** Where an element sits on its page, as fractions of page width and height. */
export interface ElementBoundingBox {
  left: number
  top: number
  width: number
  height: number
}

export type DocumentElementKind = 'text' | 'table' | 'picture'

/**
 * One element of the parsed document, positioned in reading order.
 *
 * `order` is the document-wide index, not the row position: it is what lets a
 * description generated for a picture be placed back where the picture was.
 */
export interface DocumentElement {
  order: number
  kind: DocumentElementKind
  label: string
  pageNo: number | null
  text?: string
  section?: string
  caption?: string
  tableMarkdown?: string
  bbox?: ElementBoundingBox
}

export interface DocumentOutlineEntry {
  order: number
  pageNo: number | null
  text: string
}

export interface FileStructure {
  id: number
  name: string
  status: FileStatus
  parser: string | null
  pageCount: number | null
  pagesWithoutText: number
  counts: DocumentCounts
  outline: DocumentOutlineEntry[]
  elements: DocumentElement[]
  hasText: boolean
  needsOcr: boolean
}

export interface MyFolder {
  id: number
  user: number
  name: string
  files: MyFile[]
  fileCount: number
  updatedAt: string
}

export type MediaTypeFilter =
  | 'all'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'generated_image'

/** The view modes of the Sources page toggle. */
export type FileView = 'files' | 'folders' | 'media' | 'libraries'

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
  currentView: FileView
  isMoveModalOpen: boolean
  mediaTypeFilter: MediaTypeFilter
  sharedFiles: MyFile[]
  sharedFilesLoading: boolean
  sharedFilesError: string | null
  activeTab: 'my-files' | 'shared'
  shareModalFileId: number | null
  shareModalFileName: string
}

export interface FolderHeaderProps {
  onToggleView: (view: FileView) => void
}
