import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import Header from './Header'
import SystemBanner from './SystemBanner'
import ToastContainer from '@/components/ui/ToastContainer'

const UserView: React.FC = () => {
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
