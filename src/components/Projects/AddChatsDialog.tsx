import { useMemo, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
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
import {
  filterConversations,
  getConversationTitle,
} from '@/utils/conversationUtils'
import { formatRelativeDate } from '@/utils/dateUtils'
import { toggleId } from '@/utils/selection'
import SelectableList from './SelectableList'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  onAdd: (conversationIds: string[]) => Promise<void>
}

const AddChatsForm = ({
  projectName,
  onAdd,
  onClose,
}: Pick<Props, 'projectName' | 'onAdd'> & { onClose: () => void }) => {
  const conversations = useAppSelector(
    (state) => state.conversation.conversations
  )
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unfiled = useMemo(
    () =>
      filterConversations(
        conversations.filter(
          (conversation) =>
            conversation.project === null && conversation.isOwner !== false
        ),
        query
      ),
    [conversations, query]
  )

  const handleAdd = async () => {
    setSaving(true)
    setError(null)
    try {
      await onAdd(selected)
      onClose()
    } catch (rejection) {
      setError(
        typeof rejection === 'string' && rejection
          ? rejection
          : 'Some chats could not be moved. Try again.'
      )
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add chats to {projectName}</DialogTitle>
        <DialogDescription>
          Chats that are not in any project yet. They keep their own settings;
          project defaults apply to chats you start here.
        </DialogDescription>
      </DialogHeader>

      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search chats'
          aria-label='Search chats'
          className='pl-9'
        />
      </div>

      <div className='h-72 overflow-y-auto pr-1'>
        <SelectableList
          idPrefix='add-chat'
          rows={unfiled.map((conversation) => ({
            id: conversation.conversationId,
            label: getConversationTitle(conversation),
            meta: formatRelativeDate(conversation.createdAt),
          }))}
          selected={selected}
          onToggle={(id) => setSelected((current) => toggleId(current, id))}
          emptyLabel={
            query ? 'No chats match.' : 'Every chat is already in a project.'
          }
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
        <Button onClick={handleAdd} disabled={saving || selected.length === 0}>
          {saving && <Loader2 className='h-4 w-4 animate-spin' />}
          {selected.length > 1 ? `Add ${selected.length} chats` : 'Add chat'}
        </Button>
      </DialogFooter>
    </>
  )
}

const AddChatsDialog = ({ open, onOpenChange, projectName, onAdd }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='flex max-h-[90vh] max-w-lg flex-col'>
      <AddChatsForm
        projectName={projectName}
        onAdd={onAdd}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
)

export default AddChatsDialog
