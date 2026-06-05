import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ResearchProject } from '@/redux/types/research'

interface Props {
  /** The project pending deletion; the dialog is open while this is set. */
  project: ResearchProject | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const DeleteProjectDialog = ({ project, onOpenChange, onConfirm }: Props) => {
  return (
    <Dialog open={project !== null} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>
            “{project?.title}” and its source records will be removed from your
            project list. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteProjectDialog
