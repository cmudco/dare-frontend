import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import Header from './Header'
import SystemBanner from './SystemBanner'

const UserView: React.FC = () => {
  return (
    <>
      <Header />
      <SystemBanner />
      <div className='flex'>
        <SideBar />
        <div className='min-h-[90vh] w-full'>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default UserView
