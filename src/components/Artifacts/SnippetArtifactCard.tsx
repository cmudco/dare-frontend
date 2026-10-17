import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppWindow, Code2, FileCode2, Image, Loader2 } from 'lucide-react'
import type { MarkdownFence } from '@/components/Markdown/Markdown'
import type { AppDispatch } from '@/redux/store'
import { openSnippetArtifact } from '@/redux/asyncThunks/artifact'
import type { FencePreviewKind } from '@/utils/artifactEditing'
import { toast } from '@/utils/toast'
import { Button } from '../ui/button'

interface SnippetArtifactCardProps {
  conversationId: string
  messageId: string
  fence: MarkdownFence
  kind: FencePreviewKind
  incomplete: boolean
  onShowCode: () => void
}

const KIND_LABELS: Record<FencePreviewKind, string> = {
  react: 'React component',
  html: 'HTML page',
  svg: 'SVG image',
}

const KIND_ICONS: Record<FencePreviewKind, React.ElementType> = {
  react: FileCode2,
  html: AppWindow,
  svg: Image,
}

const COMPONENT_NAME = /export\s+default\s+function\s+([A-Za-z_]\w*)/
const PAGE_TITLE = /<title>\s*([^<]{1,80}?)\s*<\/title>/i

// Display name before the artifact exists; the server names the saved one.
const cardTitle = (kind: FencePreviewKind, code: string) => {
  const named =
    kind === 'react'
      ? COMPONENT_NAME.exec(code)
      : kind === 'html'
        ? PAGE_TITLE.exec(code)
        : null
  return named?.[1] ?? KIND_LABELS[kind]
}

/** A previewable chat fence shown as an artifact; opens the sidecar preview. */
const SnippetArtifactCard: React.FC<SnippetArtifactCardProps> = ({
  conversationId,
  messageId,
  fence,
  kind,
  incomplete,
  onShowCode,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [opening, setOpening] = useState(false)
  const Icon = KIND_ICONS[kind]
  const lineCount = fence.code.split('\n').length

  const handleOpen = async () => {
    setOpening(true)
    const result = await dispatch(
      openSnippetArtifact({
        conversationId,
        request: { messageId, language: fence.language, content: fence.code },
        tab: 'preview',
      })
    )
    setOpening(false)
    if (openSnippetArtifact.rejected.match(result)) {
      toast.error(result.payload ?? 'Could not open the preview')
    }
  }

  return (
    <div className='not-prose my-3 flex max-w-xl items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs'>
      <button
        type='button'
        onClick={handleOpen}
        disabled={incomplete || opening}
        className='flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default'
      >
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
          {incomplete || opening ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <Icon className='h-5 w-5' />
          )}
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block truncate text-sm font-medium text-foreground'>
            {incomplete
              ? `Writing ${KIND_LABELS[kind].toLowerCase()}…`
              : cardTitle(kind, fence.code)}
          </span>
          <span className='block text-xs text-muted-foreground'>
            {KIND_LABELS[kind]} · {lineCount} lines
            {!incomplete && ' · Click to preview and edit'}
          </span>
        </span>
      </button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='h-8 w-8 shrink-0 p-0 text-muted-foreground'
        onClick={onShowCode}
        title='Show code'
        aria-label='Show code'
      >
        <Code2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default SnippetArtifactCard
