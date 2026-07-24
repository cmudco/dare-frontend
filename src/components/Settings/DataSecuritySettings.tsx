import { ShieldAlert } from 'lucide-react'

import DeleteAccountDialog from '@/components/Settings/DeleteAccountDialog'
import { Card } from '@/components/ui/card'

const DataSecuritySettings = () => {
  return (
    <Card className='border-red-200 bg-card p-6 dark:border-red-900/50'>
      <div className='space-y-6'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-red-50 p-2 dark:bg-red-900/20'>
            <ShieldAlert className='h-5 w-5 text-red-600 dark:text-red-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-card-foreground'>
              Data Security
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Your data belongs to you. Take it with you, or erase it — and your
              account — permanently.
            </p>
          </div>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            Permanently delete your account and everything attached to it.
            Consider exporting your data first.
          </p>
          <DeleteAccountDialog />
        </div>
      </div>
    </Card>
  )
}

export default DataSecuritySettings
