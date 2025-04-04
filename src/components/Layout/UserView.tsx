import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import Header from './Header'

const UserView: React.FC = () => {
  return (
    <>
      <Header />
      <div className='flex  '>
        <SideBar />
        <div className='w-full  min-h-[90vh]'>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default UserView
