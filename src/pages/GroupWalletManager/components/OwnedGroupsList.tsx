import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OwnedGroupResponse } from '@/redux/types/billing'
import { Users, Wallet as WalletIcon } from 'lucide-react'

interface OwnedGroupsListProps {
  groups: OwnedGroupResponse[]
  selectedGroupId: number | null
  onSelect: (groupId: number) => void
}

const OwnedGroupsList = ({
  groups,
  selectedGroupId,
  onSelect,
}: OwnedGroupsListProps) => {
  return (
    <div className='flex flex-col gap-3'>
      {groups.map((group) => {
        const isSelected = selectedGroupId === group.id
        const wallet = group.groupWallet
        return (
          <button
            key={group.id}
            type='button'
            onClick={() => onSelect(group.id)}
            className='text-left'
          >
            <Card
              className={`overflow-hidden p-4 transition-all hover:border-primary ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate font-semibold'>
                      {group.accessCode}
                    </span>
                    {!group.isActive && (
                      <Badge variant='red' className='shrink-0'>
                        Inactive
                      </Badge>
                    )}
                    {wallet && !wallet.isActive && (
                      <Badge variant='yellow' className='shrink-0'>
                        Paused
                      </Badge>
                    )}
                  </div>
                  {group.notes && (
                    <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
                      {group.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className='mt-3 flex items-center justify-between text-sm'>
                <span className='inline-flex items-center gap-1 text-muted-foreground'>
                  <Users className='h-4 w-4' />
                  {group.members.length} members
                </span>
                <span className='inline-flex items-center gap-1 font-medium'>
                  <WalletIcon className='h-4 w-4 text-teal-500' />
                  {wallet?.displayBudget ?? '—'}
                </span>
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}

export default OwnedGroupsList
