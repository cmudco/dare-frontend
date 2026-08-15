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
  processingStage?: FileProcessingStage
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
  describedFigures?: number
  transcribedPages?: number
  enrichmentFailures?: number
}

export type FileProcessingStage =
  | 'parsing'
  | 'enriching'
  | 'embedding'
  | 'indexing'
  | 'complete'

export type ProcessingJourneyStageStatus =
  | 'running'
  | 'complete'
  | 'partial'
  | 'skipped'
  | 'failed'

export interface ProcessingJourneyStage {
  key: 'parsing' | 'enriching' | 'embedding' | 'indexing'
  label: string
  status: ProcessingJourneyStageStatus
  startedAt: string
  completedAt?: string
  durationSeconds?: number
  details: Record<string, string | number | boolean | null>
  error?: string
}

export interface ProcessingJourneyAttempt {
  number: number
  status: 'processing' | 'complete' | 'failed'
  outcome?: string
  startedAt: string
  completedAt?: string
  durationSeconds?: number
  error?: string
  stages: ProcessingJourneyStage[]
}

export interface FileProcessingJourney {
  version: number
  attempts: ProcessingJourneyAttempt[]
}

export interface FileProcessingJourneyResponse {
  id: number
  name: string
  status: FileStatus
  statusLabel: string
  processingStage: FileProcessingStage
  stageLabel: string
  errorMessage?: string | null
  parserName?: string | null
  pageCount?: number | null
  journey: FileProcessingJourney
  createdAt: string
  updatedAt: string
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
  treeDepth?: number
  headingContext?: DocumentHeadingContext[]
  classifications?: DocumentClassification[]
  contentSha256?: string
  enrichment?: DocumentElementEnrichment
}

export interface DocumentHeadingContext {
  order: number
  pageNo: number | null
  text: string
}

export interface DocumentClassification {
  label: string
  confidence: number
}

export interface DocumentElementEnrichment {
  status: 'complete' | 'skipped' | 'error'
  kind: 'figure_description'
  description?: string
  visibleText?: string
  uncertainty?: string
  reason?: string
  error?: string
  model?: string
  cacheHit?: boolean
  provenance: 'machine_generated' | 'machine_routing'
}

export interface DocumentPageEnrichment {
  pageNo: number
  status: 'complete' | 'error'
  kind: 'page_transcription'
  transcriptionMarkdown?: string
  summary?: string
  uncertainty?: string
  error?: string
  model?: string
  cacheHit?: boolean
  provenance: 'machine_generated'
}

export interface DocumentEnrichmentSummary {
  status: 'not_needed' | 'complete' | 'partial' | 'unavailable'
  model?: string
  describedFigures: number
  transcribedPages: number
  attemptedCalls?: number
  visualOperations?: number
  providerRequests?: number
  cacheHits?: number
  failedCalls?: number
  reason?: string
  durationSeconds?: number
  provenance: 'machine_generated'
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
  enrichment: DocumentEnrichmentSummary
  pageEnrichments: DocumentPageEnrichment[]
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
    [fileId: number]: {
      status: FileStatus
      jobId?: string
      jobStatus?: string
      processingStage?: FileProcessingStage
    }
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
