import { useState } from 'react'
import { Loader2, Search, Workflow as WorkflowIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/redux/hooks'
import { toggleId } from '@/utils/selection'
import SelectableList from './SelectableList'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  pinnedIds: number[]
  onSave: (workflowIds: number[]) => Promise<void>
}

const PinWorkflowsForm = ({
  pinnedIds,
  onSave,
  onClose,
}: Pick<Props, 'pinnedIds' | 'onSave'> & { onClose: () => void }) => {
  const workflows = useAppSelector((state) => state.workflow.workflows)
  const [selected, setSelected] = useState<number[]>(pinnedIds)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needle = query.trim().toLowerCase()
  const rows = workflows
    .filter((workflow) => workflow.title.toLowerCase().includes(needle))
    .map((workflow) => ({
      id: workflow.id,
      label: workflow.title || 'Untitled workflow',
      meta: workflow.description,
    }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(selected)
      onClose()
    } catch {
      setError('Could not save pinned workflows. Try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pin workflows</DialogTitle>
        <DialogDescription>
          Pinned workflows appear on the project page so you can open and run
          them from here.
        </DialogDescription>
      </DialogHeader>

      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search workflows'
          aria-label='Search workflows'
          className='pl-9'
        />
      </div>

      <div className='h-72 overflow-y-auto pr-1'>
        <SelectableList
          idPrefix='pin-workflow'
          rows={rows}
          selected={selected}
          onToggle={(id) => setSelected((current) => toggleId(current, id))}
          icon={<WorkflowIcon className='h-4 w-4' />}
          emptyLabel={query ? 'No workflows match.' : 'Build a workflow first.'}
        />
      </div>

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant='outline' onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className='h-4 w-4 animate-spin' />}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}

const PinWorkflowsDialog = ({
  open,
  onOpenChange,
  pinnedIds,
  onSave,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='flex max-h-[90vh] max-w-lg flex-col'>
      <PinWorkflowsForm
        pinnedIds={pinnedIds}
        onSave={onSave}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
)

export default PinWorkflowsDialog
