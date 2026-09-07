import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlignLeft,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Image as ImageIcon,
  ScanLine,
  Table as TableIcon,
} from 'lucide-react'

import { getFileMapAPI, getFileMapChunkAPI } from '@/api/files'
import { Button } from '@/components/ui/button'
import {
  DocumentMap,
  DocumentMapChunk,
  DocumentMapChunkDetail,
  DocumentMapReference,
  DocumentMapSection,
} from '@/redux/types/files'
import { cn } from '@/lib/utils'

interface FileMapPanelProps {
  fileId: number | null
  onOpenPage?: (pageNo: number) => void
}

type Selection =
  | { kind: 'section'; order: number }
  | { kind: 'chunk'; chunkIndex: number }
  | null

const CHUNK_ICON = {
  text: AlignLeft,
  table: TableIcon,
  figure: ImageIcon,
  page_transcription: ScanLine,
  flat: AlignLeft,
} as const

const KIND_LABEL = {
  text: 'Paragraphs',
  table: 'Table',
  figure: 'Figure',
  page_transcription: 'Transcribed page',
  flat: 'Text',
} as const

/** Human labels for entity kinds, which arrive as lowercase snake_case. */
const ENTITY_KIND_LABEL: Record<string, string> = {
  accident_no: 'Accident number',
  certificate: 'Certificate',
  person: 'Person',
  organization: 'Organization',
  location: 'Location',
  law: 'Law',
  identifier: 'Identifier',
  url: 'URL',
  doi: 'DOI',
  date: 'Date',
  registration: 'Registration',
}

/** Falls back to a spaced, capitalised rendering of an unrecognised kind. */
const entityKindLabel = (kind: string): string => {
  if (ENTITY_KIND_LABEL[kind]) return ENTITY_KIND_LABEL[kind]
  const spaced = kind.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const pageLabel = (start: number | null, end: number | null): string => {
  if (start == null) return ''
  if (end == null || end === start) return `p. ${start}`
  return `pp. ${start}–${end}`
}

const referenceLabel = (reference: DocumentMapReference): string => {
  const names: Record<DocumentMapReference['kind'], string> = {
    section: '',
    chapter: 'Ch. ',
    appendix: 'App. ',
    figure: 'Fig. ',
    table: 'Table ',
    page: 'p. ',
  }
  return `${names[reference.kind]}${reference.key}`
}

/**
 * The Map tab: how the document hangs together. Sections nest by heading
 * level, chunks hang under the heading they were cut from, and reference
 * chips jump to the target a pointer resolved to.
 */
const FileMapPanel = ({ fileId, onOpenPage }: FileMapPanelProps) => {
  const [map, setMap] = useState<DocumentMap | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [selection, setSelection] = useState<Selection>(null)
  const [chunkDetail, setChunkDetail] = useState<DocumentMapChunkDetail | null>(
    null
  )
  const [chunkDetailLoading, setChunkDetailLoading] = useState(false)
  const [chunkDetailError, setChunkDetailError] = useState(false)
  const [chunkDetailAttempt, setChunkDetailAttempt] = useState(0)

  const fetchMap = useCallback(async () => {
    if (!fileId) return
    setLoading(true)
    setError(null)
    try {
      setMap(await getFileMapAPI(fileId))
    } catch {
      setError('Could not load the document map. Try again.')
    } finally {
      setLoading(false)
    }
  }, [fileId])

  useEffect(() => {
    setMap(null)
    setSelection(null)
    setCollapsed(new Set())
    setChunkDetail(null)
    fetchMap()
  }, [fetchMap])

  const selectedChunkIndex =
    selection?.kind === 'chunk' ? selection.chunkIndex : null

  useEffect(() => {
    if (!fileId || selectedChunkIndex == null) {
      setChunkDetail(null)
      setChunkDetailLoading(false)
      setChunkDetailError(false)
      return
    }

    let current = true
    setChunkDetail(null)
    setChunkDetailLoading(true)
    setChunkDetailError(false)
    getFileMapChunkAPI(fileId, selectedChunkIndex)
      .then((result) => {
        if (current) setChunkDetail(result)
      })
      .catch(() => {
        if (current) setChunkDetailError(true)
      })
      .finally(() => {
        if (current) setChunkDetailLoading(false)
      })

    return () => {
      current = false
    }
  }, [chunkDetailAttempt, fileId, selectedChunkIndex])

  const chunksBySection = useMemo(() => {
    const grouped = new Map<number | null, DocumentMapChunk[]>()
    for (const chunk of map?.chunks ?? []) {
      const key = chunk.sectionOrder
      grouped.set(key, [...(grouped.get(key) ?? []), chunk])
    }
    return grouped
  }, [map?.chunks])

  const outgoing = useMemo(() => {
    const grouped = new Map<number, DocumentMapReference[]>()
    for (const reference of map?.references ?? []) {
      grouped.set(reference.sourceChunkIndex, [
        ...(grouped.get(reference.sourceChunkIndex) ?? []),
        reference,
      ])
    }
    return grouped
  }, [map?.references])

  const incoming = useMemo(() => {
    const grouped = new Map<number, DocumentMapReference[]>()
    for (const reference of map?.references ?? []) {
      if (reference.targetChunkIndex == null) continue
      grouped.set(reference.targetChunkIndex, [
        ...(grouped.get(reference.targetChunkIndex) ?? []),
        reference,
      ])
    }
    return grouped
  }, [map?.references])

  const sectionByOrder = useMemo(() => {
    const index = new Map<number, DocumentMapSection>()
    const walk = (nodes: DocumentMapSection[]) =>
      nodes.forEach((node) => {
        index.set(node.order, node)
        walk(node.children)
      })
    walk(map?.sections ?? [])
    return index
  }, [map?.sections])

  const chunkByIndex = useMemo(
    () =>
      new Map((map?.chunks ?? []).map((chunk) => [chunk.chunkIndex, chunk])),
    [map?.chunks]
  )

  const jumpTo = (reference: DocumentMapReference) => {
    if (reference.targetChunkIndex != null) {
      setSelection({ kind: 'chunk', chunkIndex: reference.targetChunkIndex })
    } else if (reference.targetOrder != null) {
      setSelection({ kind: 'section', order: reference.targetOrder })
    }
  }

  const toggle = (order: number) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(order)) next.delete(order)
      else next.add(order)
      return next
    })

  if (!fileId) return null
  if (loading && !map) {
    return (
      <p className='p-4 text-sm text-muted-foreground'>
        Loading the document map…
      </p>
    )
  }
  if (error) {
    return (
      <div className='flex items-center gap-3 p-4 text-sm'>
        <AlertCircle className='h-4 w-4 text-destructive' />
        <span>{error}</span>
        <Button size='sm' variant='outline' onClick={fetchMap}>
          Retry
        </Button>
      </div>
    )
  }
  if (!map) return null

  const renderChunk = (chunk: DocumentMapChunk, depth: number) => {
    const Icon = CHUNK_ICON[chunk.elementKind] ?? AlignLeft
    const selected =
      selection?.kind === 'chunk' && selection.chunkIndex === chunk.chunkIndex
    const refs = outgoing.get(chunk.chunkIndex) ?? []
    const inbound = incoming.get(chunk.chunkIndex) ?? []
    return (
      <div
        key={`c-${chunk.chunkIndex}`}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-muted',
          selected && 'bg-primary/10 text-primary'
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <button
          type='button'
          onClick={() =>
            setSelection({ kind: 'chunk', chunkIndex: chunk.chunkIndex })
          }
          className='flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden'
        >
          <Icon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
          <span className='min-w-0 flex-1 truncate'>{chunk.preview}</span>
          <span className='shrink-0 text-muted-foreground'>
            {pageLabel(chunk.pageStart, chunk.pageEnd)} · #
            {chunk.chunkIndex + 1}
          </span>
        </button>
        {inbound.length > 0 && (
          <span className='shrink-0 rounded-full bg-primary/10 px-1.5 text-[11px] text-primary'>
            ← {inbound.length}
            <span className='sr-only'>
              {inbound.length === 1
                ? 'incoming reference'
                : 'incoming references'}
            </span>
          </span>
        )}
        {refs.map((reference) =>
          reference.resolved ? (
            <button
              key={reference.id}
              type='button'
              aria-label={`Go to ${referenceLabel(reference)}`}
              onClick={() => jumpTo(reference)}
              className='shrink-0 rounded-full bg-primary/10 px-1.5 text-[11px] text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden'
            >
              → {referenceLabel(reference)}
            </button>
          ) : (
            <span
              key={reference.id}
              title={`${referenceLabel(reference)}: target not found in this file`}
              className='shrink-0 rounded-full bg-yellow-100 px-1.5 text-[11px] text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
            >
              → {referenceLabel(reference)} ?
              <span className='sr-only'>unresolved</span>
            </span>
          )
        )}
      </div>
    )
  }

  const renderSection = (section: DocumentMapSection, depth: number) => {
    const isCollapsed = collapsed.has(section.order)
    const selected =
      selection?.kind === 'section' && selection.order === section.order
    const Chevron = isCollapsed ? ChevronRight : ChevronDown
    return (
      <div key={`s-${section.order}`}>
        <div
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted',
            selected && 'bg-primary/10 text-primary'
          )}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          <button
            type='button'
            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${section.text}`}
            aria-expanded={!isCollapsed}
            onClick={() => toggle(section.order)}
            className='shrink-0 rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden'
          >
            <Chevron className='h-4 w-4 text-muted-foreground' />
          </button>
          <button
            type='button'
            onClick={() =>
              setSelection({ kind: 'section', order: section.order })
            }
            className='flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden'
          >
            <span className='min-w-0 flex-1 truncate font-medium'>
              {section.text}
            </span>
            <span className='shrink-0 text-xs text-muted-foreground'>
              {section.pageNo != null && `p. ${section.pageNo} · `}
              {section.chunkCount}{' '}
              {section.chunkCount === 1 ? 'chunk' : 'chunks'}
            </span>
          </button>
        </div>
        {!isCollapsed && (
          <div>
            {(chunksBySection.get(section.order) ?? []).map((chunk) =>
              renderChunk(chunk, depth + 1)
            )}
            {section.children.map((child) => renderSection(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const unsectioned = map.chunks.filter(
    (chunk) =>
      chunk.sectionOrder == null || !sectionByOrder.has(chunk.sectionOrder)
  )

  const detail = (() => {
    if (selection?.kind === 'chunk') {
      const chunk = chunkByIndex.get(selection.chunkIndex)
      if (!chunk) return null
      const refs = outgoing.get(chunk.chunkIndex) ?? []
      const inbound = incoming.get(chunk.chunkIndex) ?? []
      const pageStart = chunk.pageStart
      const entities = chunk.entities ?? []
      return (
        <>
          <p className='text-xs text-muted-foreground'>
            {KIND_LABEL[chunk.elementKind] ?? 'Text'} · chunk{' '}
            {chunk.chunkIndex + 1} of {map.chunks.length} ·{' '}
            {chunk.charCount.toLocaleString()} characters ·{' '}
            {chunk.wordCount.toLocaleString()} words
          </p>
          <p className='mt-1 text-sm font-medium'>
            {[pageLabel(chunk.pageStart, chunk.pageEnd), chunk.section]
              .filter(Boolean)
              .join(' · ') || map.name}
          </p>
          <div className='mt-2 max-h-72 overflow-y-auto rounded-md border bg-muted/20 p-3'>
            <p className='text-sm whitespace-pre-wrap text-muted-foreground'>
              {chunkDetail?.chunkIndex === chunk.chunkIndex
                ? chunkDetail.text
                : `${chunk.preview}${chunk.previewTruncated ? '…' : ''}`}
            </p>
            {chunkDetailLoading && (
              <p className='mt-2 text-xs text-muted-foreground'>
                Loading the complete chunk…
              </p>
            )}
            {chunkDetailError && (
              <div className='mt-2 flex items-center gap-2 text-xs text-destructive'>
                <span>Could not load the complete chunk.</span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    setChunkDetailAttempt((attempt) => attempt + 1)
                  }
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
          <div className='mt-3 space-y-1 border-t pt-2 text-xs'>
            {refs.map((reference) => (
              <button
                key={reference.id}
                type='button'
                onClick={() => jumpTo(reference)}
                className='flex w-full items-center gap-2 text-left hover:underline'
              >
                <CornerDownRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                <span>
                  "{reference.rawText}" →{' '}
                  {reference.resolved
                    ? reference.targetOrder != null &&
                      sectionByOrder.get(reference.targetOrder)
                      ? sectionByOrder.get(reference.targetOrder)?.text
                      : reference.targetChunkIndex != null
                        ? `chunk ${reference.targetChunkIndex + 1}`
                        : 'its target'
                    : 'target not found in this file'}
                </span>
              </button>
            ))}
            {inbound.map((reference) => (
              <button
                key={`in-${reference.id}`}
                type='button'
                onClick={() =>
                  setSelection({
                    kind: 'chunk',
                    chunkIndex: reference.sourceChunkIndex,
                  })
                }
                className='flex w-full items-center gap-2 text-left hover:underline'
              >
                <CornerDownRight className='h-3.5 w-3.5 shrink-0 rotate-180 text-muted-foreground' />
                <span>
                  referenced from chunk {reference.sourceChunkIndex + 1} ("
                  {reference.rawText}")
                </span>
              </button>
            ))}
          </div>
          {entities.length > 0 && (
            <div className='mt-3 border-t pt-2'>
              <p className='text-xs font-medium text-muted-foreground'>
                Names & identifiers
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Extracted signals in this chunk. Shared signals can connect
                related passages across your selected files during search.
              </p>
              <div className='mt-1 flex flex-wrap gap-1.5'>
                {entities.map((entity) => {
                  const kindLabel = entityKindLabel(entity.kind)
                  return (
                    <span
                      key={`${entity.kind}-${entity.key}`}
                      title={`${kindLabel} · ${entity.mentions} ${entity.mentions === 1 ? 'mention' : 'mentions'}`}
                      className={cn(
                        'max-w-full rounded-full px-2 py-0.5 text-[11px] break-words',
                        entity.otherDocuments > 0
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {entity.text}
                      <span className='sr-only'>{`, ${kindLabel}, ${entity.mentions} ${entity.mentions === 1 ? 'mention' : 'mentions'}`}</span>
                      {entity.otherDocuments > 0 && (
                        <span className='ml-1 opacity-80'>
                          · also in {entity.otherDocuments}{' '}
                          {entity.otherDocuments === 1
                            ? 'document'
                            : 'documents'}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
          {onOpenPage && pageStart != null && (
            <Button
              size='sm'
              variant='outline'
              className='mt-3'
              onClick={() => onOpenPage(pageStart)}
            >
              Open page {pageStart}
            </Button>
          )}
        </>
      )
    }
    if (selection?.kind === 'section') {
      const section = sectionByOrder.get(selection.order)
      if (!section) return null
      const inbound = map.references.filter(
        (reference) => reference.targetOrder === section.order
      )
      const pageNo = section.pageNo
      return (
        <>
          <p className='text-xs text-muted-foreground'>
            Section · level {section.level}
            {section.pageNo != null && ` · p. ${section.pageNo}`}
          </p>
          <p className='mt-1 text-sm font-medium'>{section.text}</p>
          <p className='mt-2 text-sm text-muted-foreground'>
            {section.children.length} subsection
            {section.children.length === 1 ? '' : 's'} · {section.chunkCount}{' '}
            chunk{section.chunkCount === 1 ? '' : 's'} directly under it
            {inbound.length > 0 &&
              ` · referenced ${inbound.length} time${inbound.length === 1 ? '' : 's'}`}
          </p>
          {onOpenPage && pageNo != null && (
            <Button
              size='sm'
              variant='outline'
              className='mt-3'
              onClick={() => onOpenPage(pageNo)}
            >
              Open page {pageNo}
            </Button>
          )}
        </>
      )
    }
    return (
      <p className='text-sm text-muted-foreground'>
        Select a section or chunk to see where it sits and what points at it.
      </p>
    )
  })()

  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-1 border-b pb-2 text-xs text-muted-foreground'>
        <span>{map.counts.sections} sections</span>
        <span>{map.counts.chunks} chunks</span>
        <span>
          {map.counts.references} references, {map.counts.resolved} resolved
        </span>
        <span>
          {map.counts.entities ?? 0} names & identifiers,{' '}
          {map.counts.linkedEntities ?? 0} shared across files
        </span>
      </div>
      {!map.structured && (
        <div className='mt-2 flex items-center gap-2 rounded-md border border-dashed p-2 text-xs text-muted-foreground'>
          <AlertCircle className='h-3.5 w-3.5 shrink-0' />
          This file was processed before the map existed. Reprocess it to see
          chunks and references.
        </div>
      )}
      <div className='mt-2 grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
        <div className='min-h-0 overflow-y-auto pr-1'>
          {map.sections.map((section) => renderSection(section, 0))}
          {unsectioned.length > 0 && (
            <div className='mt-2'>
              <p className='px-2 text-xs font-medium text-muted-foreground'>
                Outside any section
              </p>
              {unsectioned.map((chunk) => renderChunk(chunk, 1))}
            </div>
          )}
          {map.sections.length === 0 && unsectioned.length === 0 && (
            <p className='p-2 text-sm text-muted-foreground'>
              No structure was recorded for this file.
            </p>
          )}
        </div>
        <div className='min-h-0 overflow-y-auto rounded-md border p-3'>
          {detail}
        </div>
      </div>
    </div>
  )
}

export default FileMapPanel
