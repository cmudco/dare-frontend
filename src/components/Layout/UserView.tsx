import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import Header from './Header'
import SystemBanner from './SystemBanner'
import ToastContainer from '@/components/ui/ToastContainer'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchOwnedGroups } from '@/redux/asyncThunks/billing'

const UserView: React.FC = () => {
  const dispatch = useAppDispatch()
  const ownedGroupsLoaded = useAppSelector(
    (state) => state.billing.ownedGroupsLoaded
  )

  useEffect(() => {
    if (!ownedGroupsLoaded) {
      dispatch(fetchOwnedGroups())
    }
  }, [dispatch, ownedGroupsLoaded])

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
    </div>
  )
}

export default UserView
