import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Eye, Copy, User, Calendar, Hash } from 'lucide-react'
import { PublishedPrompt } from '@/redux/types/prompt'
import { formatDate } from '@/utils/constants/prompts'

interface PromptDetailsModalProps {
  isOpen: boolean
  prompt: PublishedPrompt | null
  onClose: () => void
  onClone?: () => void
}

const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({
  isOpen,
  prompt,
  onClose,
  onClone,
}) => {
  if (!prompt) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Eye className='h-5 w-5 text-blue-600' />
            {prompt.title || 'Untitled Prompt'}
          </DialogTitle>
          <DialogDescription>
            Published prompt details from the library
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Metadata Section */}
          <div className='grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4'>
            <div className='flex items-start gap-2'>
              <User className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  Author
                </p>
                <p className='text-sm font-semibold text-foreground'>
                  {prompt.authorEmail}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Calendar className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  Published
                </p>
                <p className='text-sm font-semibold text-foreground'>
                  {formatDate(prompt.publishedAt)}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Hash className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  Version
                </p>
                <p className='text-sm font-semibold text-foreground'>
                  v{prompt.version}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {prompt.description && (
            <div className='space-y-2'>
              <p className='text-sm font-medium text-foreground'>Description</p>
              <div className='rounded-lg border border-border bg-muted/20 p-3'>
                <p className='whitespace-pre-wrap text-sm text-muted-foreground'>
                  {prompt.description}
                </p>
              </div>
            </div>
          )}

          {/* Content Preview Section */}
          <div className='space-y-2'>
            <p className='text-sm font-medium text-foreground'>
              Prompt Content
            </p>
            <div className='max-h-80 overflow-y-auto rounded-lg border border-border bg-muted/20 p-4'>
              <div
                className='prose prose-sm max-w-none dark:prose-invert'
                dangerouslySetInnerHTML={{ __html: prompt.content }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          {onClone && (
            <Button
              onClick={() => {
                onClone()
                onClose()
              }}
              className='bg-green-600 hover:bg-green-700'
            >
              <Copy className='mr-2 h-4 w-4' />
              Clone to My Prompts
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PromptDetailsModal
