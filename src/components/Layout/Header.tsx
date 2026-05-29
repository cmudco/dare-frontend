import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../../redux/store'
import { userLogout } from '../../redux/asyncThunks/user'
import { Sun, Moon } from 'lucide-react'
import { toggleDarkMode } from '../../redux/themeSlice'
import NotificationPopover from './NotificationPopover'
import { Avatar } from './Avatar'
import { WalletPopover } from '@/components/wallet/WalletPopover'
import { Logo } from '@/components/Logo'

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

  // Wallet state is fetched once by <WalletPopover /> on mount.

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
      <div className='mx-2 flex items-center'>
        <Logo size='md' showTagline />
      </div>

      <div className='mr-3 flex items-center gap-4'>
        <WalletPopover />

        <NotificationPopover />

        <Button
          variant='ghost'
          size='icon'
          onClick={() => dispatch(toggleDarkMode())}
        >
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='flex items-center gap-x-2 p-0'>
              <Avatar user={user} size='md' />
              <div className='flex flex-col items-start normal-case'>
                <span className='text-sm font-medium text-foreground'>
                  {user?.name || 'John Doe'}
                </span>
                <span className='text-xs text-muted-foreground'>
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
