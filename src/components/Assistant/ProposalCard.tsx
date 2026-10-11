import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { runProposalCommand } from '@/redux/asyncThunks/assistant'
import type { AssistantProposal } from '@/schemas/assistantSocket'
import {
  ProposalActionStatus,
  ProposalCommand,
  ProposalStatus,
} from '@/utils/constants/assistant'
import { ProposalActionRow } from './ProposalActionRow'

export function ProposalCard({ proposal }: { proposal: AssistantProposal }) {
  const dispatch = useAppDispatch()
  const busy = useAppSelector((state) =>
    state.assistant.busyProposal?.proposalId === proposal.id
      ? state.assistant.busyProposal
      : null
  )
  const run = (command: ProposalCommand, actionId?: string) =>
    dispatch(runProposalCommand({ proposalId: proposal.id, command, actionId }))
  const discarded = proposal.status === ProposalStatus.DISCARDED
  const anyApplied = proposal.actions.some(
    (action) => action.status === ProposalActionStatus.APPLIED
  )
  const allApplied = proposal.status === ProposalStatus.APPLIED

  const footerButton = (
    command: ProposalCommand,
    label: string,
    variant: 'default' | 'ghost' | 'outline' = 'default'
  ) => (
    <Button
      type='button'
      size='sm'
      variant={variant}
      className='h-7 text-xs'
      disabled={busy !== null}
      onClick={() => run(command)}
    >
      {busy?.actionId === null && busy.command === command && (
        <Loader2 className='mr-1 h-3 w-3 animate-spin' />
      )}
      {label}
    </Button>
  )

  return (
    <div className='mt-2 rounded-xl border border-border bg-card p-3'>
      <p className='text-xs font-medium text-foreground'>{proposal.summary}</p>
      <ul
        className={`mt-2 max-h-72 space-y-2.5 overflow-y-auto pr-1 ${discarded ? 'opacity-60' : ''}`}
      >
        {proposal.actions.map((action) => (
          <ProposalActionRow
            key={action.id}
            action={action}
            canToggle={!discarded}
            disabled={busy !== null}
            busy={busy?.actionId === action.id}
            onToggle={() =>
              run(
                action.status === ProposalActionStatus.APPLIED
                  ? ProposalCommand.UNDO
                  : ProposalCommand.APPLY,
                action.id
              )
            }
          />
        ))}
      </ul>

      <div className='mt-3 flex items-center justify-end gap-2'>
        {discarded && (
          <>
            <span className='mr-auto text-[11px] text-muted-foreground'>
              Discarded
            </span>
            {footerButton(ProposalCommand.RESTORE, 'Restore', 'outline')}
          </>
        )}
        {!discarded && allApplied && (
          <span className='mr-auto flex items-center gap-1 text-[11px] text-muted-foreground'>
            <Check className='h-3 w-3' />
            All changes applied
          </span>
        )}
        {!discarded &&
          !anyApplied &&
          footerButton(ProposalCommand.DISCARD, 'Discard', 'ghost')}
        {!discarded &&
          anyApplied &&
          footerButton(
            ProposalCommand.UNDO,
            'Undo all',
            allApplied ? 'default' : 'ghost'
          )}
        {!discarded &&
          !allApplied &&
          footerButton(
            ProposalCommand.APPLY,
            anyApplied ? 'Apply the rest' : 'Apply all'
          )}
      </div>
    </div>
  )
}
