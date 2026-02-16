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
import { GitFork, Check, Info } from 'lucide-react'

interface ForkConfirmDialogProps {
  isOpen: boolean
  title: string
  entityType: 'conversation' | 'workflow'
  copiedItems: string[]
  infoNote?: string
  onConfirm: () => void
  onCancel: () => void
}

const ForkConfirmDialog: React.FC<ForkConfirmDialogProps> = ({
  isOpen,
  title,
  entityType,
  copiedItems,
  infoNote,
  onConfirm,
  onCancel,
}) => {
  const entityLabel =
    entityType === 'conversation' ? 'Conversation' : 'Workflow'

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <GitFork className='h-5 w-5 text-primary' />
            Fork {entityLabel}?
          </DialogTitle>
          <DialogDescription>
            This will create a copy of{' '}
            <span className='font-semibold text-foreground'>
              &ldquo;{title}&rdquo;
            </span>{' '}
            in your account.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3 py-4'>
          <p className='text-sm font-medium text-foreground'>
            What will be copied:
          </p>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            {copiedItems.map((item) => (
              <li key={item} className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-green-600' />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {infoNote && (
            <div className='mt-3 flex items-start gap-2 rounded-md bg-muted p-2.5 text-sm text-muted-foreground'>
              <Info className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{infoNote}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <GitFork className='mr-2 h-4 w-4' />
            Fork {entityLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ForkConfirmDialog
