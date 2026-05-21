import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OwnedGroupMember } from '@/redux/types/billing'
import { POLICY_SOURCE_BADGE_VARIANT } from '@/utils/constants/groupWallet'

interface MemberBalancesTableProps {
  members: OwnedGroupMember[]
  onAllocate: (member: OwnedGroupMember) => void
  onEditOverride: (member: OwnedGroupMember) => void
  onClearOverride: (member: OwnedGroupMember) => void
}

const displayName = (m: OwnedGroupMember) => {
  const name = `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()
  return name || m.email
}

const formatAmount = (amount: string) => {
  const n = Number(amount)
  if (!Number.isFinite(n)) return amount
  return `$${n.toFixed(2)}`
}

const MemberBalancesTable = ({
  members,
  onAllocate,
  onEditOverride,
  onClearOverride,
}: MemberBalancesTableProps) => {
  if (members.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No members have registered with this group yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Effective refill</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const policy = member.effectivePolicy
          const amountVariant = POLICY_SOURCE_BADGE_VARIANT[policy.amountSource]
          const periodVariant = POLICY_SOURCE_BADGE_VARIANT[policy.periodSource]
          const hasOverride = member.override !== null
          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className='flex flex-col'>
                  <span className='font-medium'>{displayName(member)}</span>
                  <span className='text-xs text-muted-foreground'>
                    {member.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className='font-medium'>
                {member.displayBalance}
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant={amountVariant} className='font-medium'>
                    {formatAmount(policy.amount)} · {policy.amountSource}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>every</span>
                  <Badge variant={periodVariant} className='font-medium'>
                    {policy.periodDays}d · {policy.periodSource}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <div className='inline-flex flex-wrap justify-end gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onAllocate(member)}
                  >
                    Allocate
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onEditOverride(member)}
                  >
                    {hasOverride ? 'Edit override' : 'Set override'}
                  </Button>
                  {hasOverride && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onClearOverride(member)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default MemberBalancesTable
