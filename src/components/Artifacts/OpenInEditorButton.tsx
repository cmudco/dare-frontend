import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Loader2, SquarePen } from 'lucide-react'
import type { MarkdownFence } from '@/components/Markdown/Markdown'
import type { AppDispatch } from '@/redux/store'
import { openSnippetArtifact } from '@/redux/asyncThunks/artifact'
import { toast } from '@/utils/toast'
import { Button } from '../ui/button'

interface OpenInEditorButtonProps {
  conversationId: string
  messageId: string
  fence: MarkdownFence
}

const OpenInEditorButton: React.FC<OpenInEditorButtonProps> = ({
  conversationId,
  messageId,
  fence,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [opening, setOpening] = useState(false)

  const handleOpen = async () => {
    setOpening(true)
    const result = await dispatch(
      openSnippetArtifact({
        conversationId,
        request: {
          messageId,
          language: fence.language,
          content: fence.code,
        },
        tab: 'split',
      })
    )
    setOpening(false)
    if (openSnippetArtifact.rejected.match(result)) {
      toast.error(result.payload ?? 'Could not open the editor')
    }
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className='h-6 w-6 p-0 text-muted-foreground'
      onClick={handleOpen}
      disabled={opening}
      title='Open in editor'
      aria-label='Open in editor'
    >
      {opening ? (
        <Loader2 className='h-3.5 w-3.5 animate-spin' />
      ) : (
        <SquarePen className='h-3.5 w-3.5' />
      )}
    </Button>
  )
}

export { OpenInEditorButton }
export default OpenInEditorButton
