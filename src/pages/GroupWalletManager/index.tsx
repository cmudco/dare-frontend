import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  clearUserOverride,
  fetchOwnedGroups,
  refreshGroupMembers,
} from '@/redux/asyncThunks/billing'
import { OwnedGroupMember } from '@/redux/types/billing'
import { toast } from '@/utils/toast'
import {
  AllocateModal,
  BudgetCard,
  GroupPolicyCard,
  MemberBalancesTable,
  OwnedGroupsList,
  UserOverrideModal,
} from './components'

const GroupWalletManager = () => {
  const dispatch = useAppDispatch()
  const { ownedGroups, ownedGroupsLoading, ownedGroupsLoaded } = useAppSelector(
    (state) => state.billing
  )

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [allocateMember, setAllocateMember] = useState<OwnedGroupMember | null>(
    null
  )
  const [overrideMember, setOverrideMember] = useState<OwnedGroupMember | null>(
    null
  )

  useEffect(() => {
    dispatch(fetchOwnedGroups())
  }, [dispatch])

  useEffect(() => {
    if (selectedGroupId === null && ownedGroups.length > 0) {
      setSelectedGroupId(ownedGroups[0].id)
    }
    if (
      selectedGroupId !== null &&
      !ownedGroups.some((g) => g.id === selectedGroupId)
    ) {
      setSelectedGroupId(ownedGroups[0]?.id ?? null)
    }
  }, [ownedGroups, selectedGroupId])

  const selectedGroup = useMemo(
    () => ownedGroups.find((g) => g.id === selectedGroupId) ?? null,
    [ownedGroups, selectedGroupId]
  )

  if (ownedGroupsLoading && !ownedGroupsLoaded) {
    return (
      <div className='container mx-auto space-y-6 p-6'>
        <Skeleton className='h-10 w-64' />
        <div className='grid gap-4 lg:grid-cols-[320px_1fr]'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    )
  }

  if (ownedGroupsLoaded && ownedGroups.length === 0) {
    return <Navigate to='/billing/' replace />
  }

  const handleClearOverride = async (member: OwnedGroupMember) => {
    if (!selectedGroup?.groupWallet) return
    const groupWalletId = selectedGroup.groupWallet.id
    try {
      await dispatch(
        clearUserOverride({ groupWalletId, userId: member.id })
      ).unwrap()
      // Re-fetch so effectivePolicy badge reflects the group/system fallthrough
      dispatch(refreshGroupMembers(groupWalletId))
      toast.success('Override cleared.')
    } catch {
      toast.error('Could not clear override.')
    }
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col space-y-1'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/20'>
            <Users className='h-6 w-6 text-indigo-600 dark:text-indigo-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Group Wallet</h1>
            <p className='text-sm text-muted-foreground'>
              Manage the budget, refill policy, and per-member overrides for the
              groups you own.
            </p>
          </div>
        </div>
      </motion.div>

      <div className='grid gap-4 lg:grid-cols-[320px_1fr]'>
        <OwnedGroupsList
          groups={ownedGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
        />

        <div className='space-y-4'>
          {selectedGroup ? (
            <>
              <BudgetCard
                groupWallet={selectedGroup.groupWallet}
                accessCode={selectedGroup.accessCode}
              />

              {selectedGroup.groupWallet ? (
                <GroupPolicyCard groupWallet={selectedGroup.groupWallet} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Refill policy</CardTitle>
                    <CardDescription>
                      This group has no wallet yet. Ask a platform admin to
                      initialise one.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    Balances and effective refill policies for everyone in{' '}
                    <span className='font-medium'>
                      {selectedGroup.accessCode}
                    </span>
                    .
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MemberBalancesTable
                    members={selectedGroup.members}
                    onAllocate={setAllocateMember}
                    onEditOverride={setOverrideMember}
                    onClearOverride={handleClearOverride}
                  />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>

      {selectedGroup?.groupWallet && (
        <>
          <AllocateModal
            open={allocateMember !== null}
            onOpenChange={(open) => !open && setAllocateMember(null)}
            member={allocateMember}
            groupWalletId={selectedGroup.groupWallet.id}
            budgetBalance={selectedGroup.groupWallet.budgetBalance}
          />
          <UserOverrideModal
            open={overrideMember !== null}
            onOpenChange={(open) => !open && setOverrideMember(null)}
            member={overrideMember}
            groupWalletId={selectedGroup.groupWallet.id}
          />
        </>
      )}
    </div>
  )
}

export default GroupWalletManager
