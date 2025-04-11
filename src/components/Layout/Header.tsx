import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BellIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../../redux/store'
import { userLogout } from '../../redux/aynscThunks/user'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user.user)

  const handleLogout = async () => {
    try {
      await dispatch(userLogout()).unwrap()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className='left-0 right-0 top-0 flex h-[80px] w-full items-center justify-between border border-pink-50 bg-white p-1 px-2'>
      <div className='mx-2 flex items-center gap-2'>
        <img src='/icons/Logo.png' alt='Logo' className='h-auto w-10' />
        <img src='/icons/TextLogo.svg' alt='Logo' className='h-auto w-16' />
      </div>

      <div className='mr-3 flex items-center gap-4'>
        <BellIcon className='h-6 w-6 text-gray-600' />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='flex items-center gap-x-2 p-0'>
              <img
                src={`/avatar-image.svg`}
                alt='User'
                className='h-8 w-8 rounded-full'
              />
              <div className='flex flex-col items-start normal-case'>
                <span className='text-sm font-medium text-gray-900'>
                  {user?.name || 'John Doe'}
                </span>
                <span className='text-xs text-gray-500'>
                  {user?.email || 'Loading...'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='end'
            className='w-[200px] border border-gray-100 p-1'
          >
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className='cursor-pointer py-3 hover:bg-gray-100'
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className='cursor-pointer py-3 text-red-500 hover:bg-gray-100'
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
