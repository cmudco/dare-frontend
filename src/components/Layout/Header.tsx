import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BellIcon, CreditCardIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../../redux/store'
import { userLogout } from '../../redux/asyncThunks/user'
import { getWallet } from '../../redux/asyncThunks/billing'

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
  const wallet = useSelector((state: RootState) => state.billing.wallet)

  useEffect(() => {
    dispatch(getWallet())
  }, [dispatch])

  const handleLogout = async () => {
    try {
      await dispatch(userLogout()).unwrap()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className='dark:border-r-0dark:bg-dark-bg left-0 right-0 top-0 flex h-[80px] w-full items-center justify-between border border-pink-50 bg-white p-1 px-2 dark:border-l-0 dark:border-r-0 dark:border-t-0 dark:border-b-slate-800'>
      <div className='mx-2 flex items-center gap-2'>
        <img src='/icons/Logo.png' alt='Logo' className='h-auto w-10' />
        <img src='/icons/TextLogo.svg' alt='Logo' className='h-auto w-16' />
      </div>

      <div className='mr-3 flex items-center gap-4'>
        {wallet && (
          <div className='flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm'>
            <CreditCardIcon className='h-4 w-4 text-pink-500' />
            <span>{wallet.displayBalance}</span>
          </div>
        )}

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
            className='w-[200px] border border-gray-100 bg-popover p-1 dark:border-gray-700'
          >
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className='cursor-pointer py-3 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10'
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/billing')}
              className='cursor-pointer py-3 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10'
            >
              Cost Tracking
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className='cursor-pointer py-3 text-red-500 hover:bg-gray-100 dark:hover:bg-white/10'
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
