import {
  Check,
  Folder,
  FolderKanban,
  FolderPlus,
  Loader2,
  Tag,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isDeleteAction, proposalActionTitle } from '@/constants/assistant'
import type { ProposalAction } from '@/schemas/assistantSocket'
import {
  ProposalActionStatus,
  ProposalActionType,
} from '@/utils/constants/assistant'

const ICONS: Record<ProposalActionType, LucideIcon> = {
  [ProposalActionType.ADD_TO_FOLDER]: Folder,
  [ProposalActionType.REMOVE_FROM_FOLDER]: Folder,
  [ProposalActionType.ADD_TAG]: Tag,
  [ProposalActionType.REMOVE_TAG]: Tag,
  [ProposalActionType.DELETE_FILES]: Trash2,
  [ProposalActionType.CREATE_PROJECT]: FolderPlus,
  [ProposalActionType.ADD_TO_PROJECT]: FolderKanban,
  [ProposalActionType.REMOVE_FROM_PROJECT]: FolderKanban,
  [ProposalActionType.DELETE_PROJECT]: Trash2,
  [ProposalActionType.DELETE_CONVERSATIONS]: Trash2,
}

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

interface ProposalActionRowProps {
  action: ProposalAction
  /** False once the proposal is discarded: rows are shown but not actionable. */
  canToggle: boolean
  disabled: boolean
  busy: boolean
  onToggle: () => void
}

/** One proposed change, with its own Apply / Undo. */
export function ProposalActionRow({
  action,
  canToggle,
  disabled,
  busy,
  onToggle,
}: ProposalActionRowProps) {
  const applied = action.status === ProposalActionStatus.APPLIED
  const destructive = isDeleteAction(action.type)
  const Icon = applied ? Check : ICONS[action.type]
  const items = [
    ...action.files.map((file) => file.name),
    ...action.conversations.map((chat) => chat.title || 'Untitled chat'),
  ]
  const counts = [
    action.files.length > 0 && plural(action.files.length, 'file'),
    action.conversations.length > 0 &&
      plural(action.conversations.length, 'chat'),
  ].filter(Boolean)

  return (
    <li className='space-y-1'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            applied
              ? 'text-primary'
              : destructive
                ? 'text-destructive'
                : 'text-muted-foreground'
          )}
        />
        <span className={cn('truncate', applied && 'text-muted-foreground')}>
          {proposalActionTitle(action.type, action.name)}
        </span>
        {action.isNew && !applied && (
          <Badge variant='secondary' className='px-1.5 py-0 text-[10px]'>
            new
          </Badge>
        )}
        {counts.length > 0 && (
          <span className='ml-auto shrink-0 text-muted-foreground'>
            {counts.join(' · ')}
          </span>
        )}
        {canToggle && (
          <Button
            type='button'
            size='sm'
            variant={applied ? 'ghost' : 'outline'}
            className={cn(
              'h-6 shrink-0 px-2 text-[11px]',
              !counts.length && 'ml-auto'
            )}
            disabled={disabled}
            onClick={onToggle}
            aria-label={`${applied ? 'Undo' : 'Apply'}: ${proposalActionTitle(action.type, action.name)}`}
          >
            {busy && <Loader2 className='mr-1 h-3 w-3 animate-spin' />}
            {applied ? 'Undo' : 'Apply'}
          </Button>
        )}
      </div>
      {items.length > 0 && (
        <p className='line-clamp-2 pl-5 text-[11px] text-muted-foreground'>
          {items.join(', ')}
        </p>
      )}
      {action.description && (
        <p className='pl-5 text-[11px] text-muted-foreground'>
          {action.description}
        </p>
      )}
      {destructive && !applied && canToggle && (
        <p className='pl-5 text-[11px] text-muted-foreground'>
          You can undo this after applying it.
        </p>
      )}
      {action.notes.map((note) => (
        <p key={note} className='pl-5 text-[11px] text-muted-foreground'>
          {note}
        </p>
      ))}
    </li>
  )
}
