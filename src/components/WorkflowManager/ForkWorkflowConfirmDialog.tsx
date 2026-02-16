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
import { GitFork, Check } from 'lucide-react'

interface ForkWorkflowConfirmDialogProps {
  isOpen: boolean
  workflowTitle: string
  onConfirm: () => void
  onCancel: () => void
}

const ForkWorkflowConfirmDialog: React.FC<ForkWorkflowConfirmDialogProps> = ({
  isOpen,
  workflowTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <GitFork className='h-5 w-5 text-primary' />
            Fork Workflow?
          </DialogTitle>
          <DialogDescription>
            This will create a copy of{' '}
            <span className='font-semibold text-foreground'>
              "{workflowTitle}"
            </span>{' '}
            in your account.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3 py-4'>
          <p className='text-sm font-medium text-foreground'>
            What will be copied:
          </p>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-4 w-4 shrink-0 text-green-600' />
              <span>Workflow structure and settings</span>
            </li>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-4 w-4 shrink-0 text-green-600' />
              <span>All step configurations</span>
            </li>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-4 w-4 shrink-0 text-green-600' />
              <span>All prompts (as new copies with "FORK OF" prefix)</span>
            </li>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-4 w-4 shrink-0 text-green-600' />
              <span>
                File selections (you'll have access to the original owner's
                files)
              </span>
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <GitFork className='mr-2 h-4 w-4' />
            Fork Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ForkWorkflowConfirmDialog
