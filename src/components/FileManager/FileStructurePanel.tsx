import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Heading,
  Image as ImageIcon,
  ScanLine,
  Table as TableIcon,
  Type,
} from 'lucide-react'

import { getFileStructureAPI } from '@/api/files'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ElementImage from './ElementImage'
import {
  DocumentElement,
  DocumentElementKind,
  FileStructure,
} from '@/redux/types/files'
import {
  ELEMENT_LABEL_TEXT,
  FURNITURE_LABELS,
  HEADING_LABELS,
} from '@/utils/constants/documentStructure'

interface FileStructurePanelProps {
  fileId: number | null
  /** Open the document viewer at a given page. Omitted when there is none. */
  onOpenPage?: (pageNo: number) => void
}

const KIND_ICON: Record<DocumentElementKind, typeof Type> = {
  text: Type,
  table: TableIcon,
  picture: ImageIcon,
}

/**
 * The parsed document model for one file.
 *
 * Shows what the parser actually found — headings, paragraphs, tables and
 * where each picture sits — rather than the flat text we embed. Running heads
 * and footers are hidden by default: they repeat on every page and carry no
 * content, which is exactly why they are dropped before chunking too.
 */
const FileStructurePanel = ({
  fileId,
  onOpenPage,
}: FileStructurePanelProps) => {
  const [structure, setStructure] = useState<FileStructure | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number | null>(null)
  const [showFurniture, setShowFurniture] = useState(false)

  const fetchStructure = useCallback(
    async (pageNo: number | null) => {
      if (!fileId) return
      setLoading(true)
      setError(null)
      try {
        setStructure(await getFileStructureAPI(fileId, pageNo))
      } catch {
        setError('Could not load the document structure. Try again.')
      } finally {
        setLoading(false)
      }
    },
    [fileId]
  )

  useEffect(() => {
    setPage(null)
    setStructure(null)
    fetchStructure(null)
  }, [fetchStructure])

  const pages = useMemo(() => {
    const total = structure?.pageCount ?? 0
    return Array.from({ length: total }, (_, index) => index + 1)
  }, [structure?.pageCount])

  const elements = useMemo(() => {
    const all = structure?.elements ?? []
    return showFurniture
      ? all
      : all.filter((element) => !FURNITURE_LABELS.includes(element.label))
  }, [structure?.elements, showFurniture])

  const hiddenFurnitureCount =
    (structure?.elements.length ?? 0) - (elements.length ?? 0)

  const selectPage = (pageNo: number | null) => {
    setPage(pageNo)
    fetchStructure(pageNo)
  }

  if (loading && !structure) {
    return (
      <div className='space-y-3 p-1'>
        <div className='grid grid-cols-4 gap-2'>
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className='h-16 w-full' />
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center space-y-3 py-12'>
        <AlertCircle className='h-10 w-10 text-red-500' />
        <p className='text-sm text-muted-foreground'>{error}</p>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fetchStructure(page)}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!structure) return null

  const { counts, outline, needsOcr, parser } = structure

  if (!parser) {
    return (
      <div className='flex flex-col items-center justify-center space-y-2 py-12 text-center'>
        <p className='text-sm font-medium'>This file has not been parsed yet</p>
        <p className='max-w-md text-sm text-muted-foreground'>
          It was uploaded before document parsing existed. Re-upload it, or ask
          an admin to run the backfill, to see its structure here.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4 p-1'>
      {needsOcr && (
        <div className='flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-100 p-3 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'>
          <ScanLine className='mt-0.5 h-4 w-4 shrink-0' />
          <div className='space-y-0.5'>
            <p className='text-sm font-medium'>Scanned document</p>
            <p className='text-xs opacity-80'>
              {structure.pagesWithoutText} of {structure.pageCount} pages are
              images with no readable text, so nothing was embedded. This file
              cannot answer questions yet.
            </p>
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        <StatCard label='Pages' value={counts.pages} />
        <StatCard label='Sections' value={counts.sections} />
        <StatCard label='Tables' value={counts.tables} />
        <StatCard label='Images' value={counts.pictures} />
      </div>

      {outline.length > 0 && (
        <section className='space-y-1.5'>
          <p className='text-xs font-medium text-muted-foreground'>Outline</p>
          <div className='flex flex-wrap gap-1.5'>
            {outline.slice(0, 24).map((entry) => (
              <button
                key={entry.order}
                type='button'
                onClick={() => entry.pageNo && selectPage(entry.pageNo)}
                className='rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                {entry.text}
                {entry.pageNo != null && (
                  <span className='ml-1.5 opacity-60'>p{entry.pageNo}</span>
                )}
              </button>
            ))}
            {outline.length > 24 && (
              <span className='self-center text-xs text-muted-foreground'>
                +{outline.length - 24} more
              </span>
            )}
          </div>
        </section>
      )}

      {pages.length > 1 && (
        <section className='space-y-2'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='mr-1 text-xs font-medium text-muted-foreground'>
              Page
            </span>
            <PageButton
              label='All'
              active={page === null}
              onClick={() => selectPage(null)}
            />
            {pages.map((pageNo) => (
              <PageButton
                key={pageNo}
                label={String(pageNo)}
                active={page === pageNo}
                onClick={() => selectPage(pageNo)}
              />
            ))}
          </div>

          {page !== null && onOpenPage && (
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              onClick={() => onOpenPage(page)}
            >
              <BookOpen className='mr-1.5 h-3.5 w-3.5' />
              Open page {page} in the document
            </Button>
          )}
        </section>
      )}

      <section className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <p className='text-xs font-medium text-muted-foreground'>
            Reading order &middot; {elements.length}{' '}
            {elements.length === 1 ? 'element' : 'elements'}
          </p>
          {(hiddenFurnitureCount > 0 || showFurniture) && (
            <button
              type='button'
              onClick={() => setShowFurniture((shown) => !shown)}
              className='text-xs text-muted-foreground underline-offset-2 hover:underline'
            >
              {showFurniture
                ? 'Hide headers and footers'
                : `Show ${hiddenFurnitureCount} headers and footers`}
            </button>
          )}
        </div>

        {elements.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            {needsOcr
              ? 'Nothing was recovered from this page.'
              : 'No elements on this page.'}
          </p>
        ) : (
          <div className='divide-y divide-border rounded-md border border-border'>
            {elements.map((element) => (
              <ElementRow
                key={element.order}
                element={element}
                fileId={fileId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className='rounded-md bg-muted p-3'>
    <p className='text-xs text-muted-foreground'>{label}</p>
    <p className='text-2xl font-medium tabular-nums'>{value}</p>
  </div>
)

const PageButton = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    type='button'
    onClick={onClick}
    aria-current={active}
    className={`min-w-8 rounded-sm border px-2 py-1 text-xs tabular-nums transition-colors ${
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
    }`}
  >
    {label}
  </button>
)

const ElementRow = ({
  element,
  fileId,
}: {
  element: DocumentElement
  fileId: number | null
}) => {
  const Icon = KIND_ICON[element.kind] ?? Type
  const isHeading = HEADING_LABELS.includes(element.label)

  return (
    <div className='flex gap-3 p-3'>
      <span className='w-10 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums'>
        #{element.order}
      </span>
      <div className='min-w-0 flex-1 space-y-1'>
        <div className='flex items-center gap-1.5'>
          {isHeading ? (
            <Heading className='h-3.5 w-3.5 text-muted-foreground' />
          ) : (
            <Icon className='h-3.5 w-3.5 text-muted-foreground' />
          )}
          <span className='text-xs font-medium text-muted-foreground'>
            {ELEMENT_LABEL_TEXT[element.label] ?? element.label}
          </span>
          {element.pageNo != null && (
            <Badge variant='gray' className='px-1.5 py-0 text-[10px]'>
              p{element.pageNo}
            </Badge>
          )}
        </div>

        {element.kind === 'table' && element.tableMarkdown ? (
          <pre className='max-h-48 overflow-auto rounded-sm bg-muted p-2 text-[11px] leading-relaxed whitespace-pre'>
            {element.tableMarkdown}
          </pre>
        ) : element.kind === 'picture' ? (
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground italic'>
              {element.caption || 'No caption in the document'}
            </p>
            {fileId != null && element.bbox && (
              <ElementImage
                fileId={fileId}
                order={element.order}
                alt={element.caption || `Image on page ${element.pageNo}`}
              />
            )}
          </div>
        ) : (
          <p
            className={`text-sm break-words ${
              isHeading ? 'font-medium' : 'text-muted-foreground'
            }`}
          >
            {element.text}
          </p>
        )}

        {element.section && !isHeading && (
          <p className='truncate text-xs text-muted-foreground/70'>
            &sect; {element.section}
          </p>
        )}
      </div>
    </div>
  )
}

export default FileStructurePanel
