// LEGACY SELECT MODE DIALOG - NO LONGER NEEDED
// Since legacy mode is commented out, users only have "New" mode available
/*
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  onSelectNew: () => void
  onSelectLegacy: () => void
}

export default function SelectModeDialog({
  open,
  onOpenChange,
  title = 'Select mode',
  onSelectNew,
  onSelectLegacy,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='dark:bg-dark-chat-history w-[420px] rounded-lg bg-white p-6'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='mt-4 flex flex-col items-center gap-3'>
          <Button
            variant='default'
            className='w-full justify-center'
            onClick={onSelectNew}
          >
            New
          </Button>
          <Button
            variant='secondary'
            className='w-full justify-center'
            onClick={onSelectLegacy}
          >
            Legacy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
*/

// Placeholder component to prevent import errors
import React from 'react'

const SelectModeDialog: React.FC = () => {
  return null
}

export default SelectModeDialog
