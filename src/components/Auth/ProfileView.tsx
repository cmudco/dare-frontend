import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ChangePasswordForm } from './ChangePasswordForm'
import AvatarSettings from '@/components/Settings/AvatarSettings'
import { motion } from 'framer-motion'
import { User, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'

const ProfileView: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user)

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
            <User className='h-6 w-6 text-indigo-600 dark:text-indigo-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
            <p className='text-sm text-muted-foreground'>
              View and manage your account settings.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className='border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50'>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2.5'>
              <div className='rounded-md bg-emerald-50 p-1.5 dark:bg-emerald-900/20'>
                <User className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50'>
                  Name
                </p>
                <p className='text-sm font-semibold text-slate-800 dark:text-slate-100'>
                  {user?.name || 'Not set'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2.5'>
              <div className='rounded-md bg-blue-50 p-1.5 dark:bg-blue-900/20'>
                <Mail className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50'>
                  Email
                </p>
                <p className='text-sm font-semibold text-slate-800 dark:text-slate-100'>
                  {user?.email || 'Not set'}
                </p>
              </div>
            </div>
            {user?.role && (
              <div className='flex items-center gap-2.5'>
                <div className='rounded-md bg-violet-50 p-1.5 dark:bg-violet-900/20'>
                  <User className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50'>
                    Role
                  </p>
                  <p className='text-sm font-semibold text-slate-800 dark:text-slate-100'>
                    {user.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <AvatarSettings />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChangePasswordForm />
      </motion.div>
    </div>
  )
}

export default ProfileView
