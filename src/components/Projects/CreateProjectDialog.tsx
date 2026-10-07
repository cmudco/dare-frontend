import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ProjectIconKey } from '@/utils/constants/project'
import type { ProjectDraft } from '@/redux/types/project'
import ProjectNameField from './ProjectNameField'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (draft: ProjectDraft) => Promise<void>
}

// Radix unmounts the content while closed, so each open starts blank.
const CreateProjectForm = ({
  onCreate,
  onClose,
}: {
  onCreate: Props['onCreate']
  onClose: () => void
}) => {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ProjectIconKey.FOLDER)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give the project a name.')
      return
    }
    setSaving(true)
    try {
      await onCreate({ name: name.trim(), icon })
      onClose()
    } catch (rejection) {
      setError(
        typeof rejection === 'string' && rejection
          ? rejection
          : 'Could not create the project.'
      )
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      <DialogHeader>
        <DialogTitle>Create project</DialogTitle>
        <DialogDescription>
          Keep chats, sources and instructions for one piece of work together.
        </DialogDescription>
      </DialogHeader>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='new-project-name'>Project name</Label>
        <ProjectNameField
          id='new-project-name'
          autoFocus
          name={name}
          icon={icon}
          invalid={error !== null}
          describedBy={error ? 'new-project-error' : undefined}
          onNameChange={(value) => {
            setName(value)
            setError(null)
          }}
          onIconChange={setIcon}
        />
        {error && (
          <p
            id='new-project-error'
            role='alert'
            className='text-sm text-destructive'
          >
            {error}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={saving || !name.trim()}>
          {saving && <Loader2 className='h-4 w-4 animate-spin' />}
          Create project
        </Button>
      </DialogFooter>
    </form>
  )
}

const CreateProjectDialog = ({ open, onOpenChange, onCreate }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='max-w-md rounded-2xl'>
      <CreateProjectForm
        onCreate={onCreate}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
)

export default CreateProjectDialog
