import { Mail, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAppSelector } from '@/redux/hooks'

/** The signed-in account's name, email and role. */
const AccountDetails = () => {
  const user = useAppSelector((state) => state.user.user)
  return (
    <Card className='border-border bg-card p-5 shadow-xs'>
      <div className='flex flex-wrap gap-6'>
        <div className='flex items-center gap-2.5'>
          <div className='rounded-md bg-emerald-50 p-1.5 dark:bg-emerald-900/20'>
            <User className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div>
            <p className='text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase'>
              Name
            </p>
            <p className='text-sm font-semibold text-foreground'>
              {user?.name || 'Not set'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2.5'>
          <div className='rounded-md bg-blue-50 p-1.5 dark:bg-blue-900/20'>
            <Mail className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <p className='text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase'>
              Email
            </p>
            <p className='text-sm font-semibold text-foreground'>
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
              <p className='text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase'>
                Role
              </p>
              <p className='text-sm font-semibold text-foreground'>
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AccountDetails
