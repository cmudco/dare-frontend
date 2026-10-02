import { Check, Folder, Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { decideAssistantProposal } from '@/redux/asyncThunks/assistant'
import type { FileOrganizationProposal } from '@/schemas/assistantSocket'
import { ProposalDecision, ProposalStatus } from '@/utils/constants/assistant'
import { ProposalGroupRow } from './ProposalGroupRow'

function outcomeLine(outcome: FileOrganizationProposal['outcome']): string {
  const parts = [
    outcome.foldersCreated && `${outcome.foldersCreated} folders created`,
    outcome.filesFiled && `${outcome.filesFiled} files filed`,
    outcome.tagsCreated && `${outcome.tagsCreated} tags created`,
    outcome.filesTagged && `${outcome.filesTagged} files tagged`,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Everything was already in place.'
}

export function ProposalCard({
  proposal,
}: {
  proposal: FileOrganizationProposal
}) {
  const dispatch = useAppDispatch()
  const deciding = useAppSelector(
    (state) => state.assistant.decidingProposalId === proposal.id
  )
  const decide = (decision: ProposalDecision) =>
    dispatch(decideAssistantProposal({ proposalId: proposal.id, decision }))
  const { folders, tags } = proposal.plan

  return (
    <div className='mt-2 rounded-xl border border-border bg-card p-3'>
      <p className='text-xs font-medium text-foreground'>{proposal.summary}</p>
      <ul className='mt-2 max-h-56 space-y-2 overflow-y-auto pr-1'>
        {folders.map((group) => (
          <ProposalGroupRow
            key={`folder-${group.name}`}
            icon={<Folder className='h-3.5 w-3.5 text-muted-foreground' />}
            name={group.name}
            isNew={group.isNew}
            files={group.files}
          />
        ))}
        {tags.map((group) => (
          <ProposalGroupRow
            key={`tag-${group.label}`}
            icon={<Tag className='h-3.5 w-3.5 text-muted-foreground' />}
            name={group.label}
            isNew={group.isNew}
            files={group.files}
          />
        ))}
      </ul>

      {proposal.status === ProposalStatus.PENDING && (
        <div className='mt-3 flex items-center justify-end gap-2'>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-7 text-xs'
            disabled={deciding}
            onClick={() => decide(ProposalDecision.DISCARD)}
          >
            Discard
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-7 text-xs'
            disabled={deciding}
            onClick={() => decide(ProposalDecision.APPLY)}
          >
            {deciding && <Loader2 className='mr-1 h-3 w-3 animate-spin' />}
            Apply
          </Button>
        </div>
      )}
      {proposal.status === ProposalStatus.APPLIED && (
        <div className='mt-3 space-y-1 text-[11px] text-muted-foreground'>
          <p className='flex items-center gap-1'>
            <Check className='h-3 w-3' />
            Applied: {outcomeLine(proposal.outcome)}
          </p>
          {proposal.outcome.skipped?.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      )}
      {proposal.status === ProposalStatus.DISCARDED && (
        <p className='mt-3 text-[11px] text-muted-foreground'>Discarded</p>
      )}
    </div>
  )
}
