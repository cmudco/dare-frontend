import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import Header from './Header'
import SystemBanner from './SystemBanner'
import ToastContainer from '@/components/ui/ToastContainer'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchOwnedGroups } from '@/redux/asyncThunks/billing'
import { fetchUnseenReleaseNotes } from '@/redux/asyncThunks/releaseNotes'
import { selectUnseenReleaseNotesStatus } from '@/redux/releaseNotesSlice'
import { WhatsNewDialog } from '@/components/ReleaseNotes/WhatsNewDialog'

const UserView: React.FC = () => {
  const dispatch = useAppDispatch()
  const ownedGroupsLoaded = useAppSelector(
    (state) => state.billing.ownedGroupsLoaded
  )
  const unseenReleaseNotesStatus = useAppSelector(
    selectUnseenReleaseNotesStatus
  )

  useEffect(() => {
    if (!ownedGroupsLoaded) {
      dispatch(fetchOwnedGroups())
    }
  }, [dispatch, ownedGroupsLoaded])

  useEffect(() => {
    if (unseenReleaseNotesStatus === 'idle') {
      dispatch(fetchUnseenReleaseNotes())
    }
  }, [dispatch, unseenReleaseNotesStatus])

  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <SystemBanner />
      <div className='flex min-h-0 flex-1 overflow-hidden'>
        <SideBar />
        <main className='min-h-0 min-w-0 flex-1 overflow-auto'>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <WhatsNewDialog />
    </div>
  )
}

export default UserView
