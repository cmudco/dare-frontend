import {
  Database,
  FileSearch,
  Image as ImageIcon,
  ScanText,
} from 'lucide-react'

import { ProcessingJourneyStageStatus } from '@/redux/types/files'

export const STAGE_ICONS = {
  parsing: FileSearch,
  enriching: ImageIcon,
  embedding: ScanText,
  indexing: Database,
} as const

/** Reader-facing names for the backend's journey detail keys. */
export const JOURNEY_DETAIL_LABELS: Record<string, string> = {
  parser: 'Parser',
  pages: 'Pages',
  elements: 'Elements',
  sections: 'Sections',
  tables: 'Tables',
  pictures: 'Images found',
  classifiedPictures: 'Images classified',
  parserReportedSeconds: 'Docling reported time',
  outcome: 'Result',
  model: 'Vision model',
  attemptedCalls: 'Visual operations',
  visualOperations: 'Visual operations',
  providerRequests: 'Fresh Gemini requests',
  cacheHits: 'Cache hits',
  describedFigures: 'Figures described',
  transcribedPages: 'Pages transcribed',
  detectedTextlessPages: 'Scanned pages found',
  selectedTextlessPages: 'Scanned pages selected',
  deferredTextlessPages: 'Scanned pages deferred',
  failedCalls: 'Failed visual operations',
  textCharacters: 'Text characters',
  chunks: 'Chunks embedded',
  chunkSize: 'Chunk size',
  overlapSize: 'Chunk overlap',
  backend: 'Search backend',
  vectors: 'Vectors stored',
  reason: 'Note',
}

export const STAGE_STATUS_VARIANTS: Record<
  ProcessingJourneyStageStatus,
  'green' | 'red' | 'yellow' | 'blue' | 'gray'
> = {
  complete: 'green',
  failed: 'red',
  partial: 'yellow',
  running: 'blue',
  skipped: 'gray',
}

export const STAGE_STATUS_LABELS: Record<ProcessingJourneyStageStatus, string> =
  {
    complete: 'Complete',
    failed: 'Failed',
    partial: 'Partial',
    running: 'Running',
    skipped: 'Skipped',
  }
