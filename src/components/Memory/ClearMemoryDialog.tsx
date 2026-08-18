/**
 * ClearMemoryDialog
 *
 * Confirmation gate for wiping the entire memory store — the one action on
 * this page that cannot be undone.
 */
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface Props {
  memoryCount: number
  clearing: boolean
  onConfirm: () => Promise<void>
}

const ClearMemoryDialog = ({ memoryCount, clearing, onConfirm }: Props) => {
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='text-destructive hover:bg-destructive/10 hover:text-destructive'
        >
          <Trash2 className='h-4 w-4' />
          Forget everything
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forget everything?</DialogTitle>
          <DialogDescription>
            This permanently deletes all {memoryCount}{' '}
            {memoryCount === 1 ? 'memory' : 'memories'} across every layer.
            There is no undo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={clearing}
          >
            {clearing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Clearing…
              </>
            ) : (
              'Forget everything'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ClearMemoryDialog
