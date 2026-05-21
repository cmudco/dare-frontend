import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet as WalletIcon, AlertTriangle } from 'lucide-react'
import { GroupWallet } from '@/redux/types/billing'

interface BudgetCardProps {
  groupWallet: GroupWallet | null
  accessCode: string
}

const BudgetCard = ({ groupWallet, accessCode }: BudgetCardProps) => {
  const isZero = groupWallet !== null && Number(groupWallet.budgetBalance) <= 0

  return (
    <Card className='overflow-hidden'>
      <div className='h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500' />
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-medium'>Group Budget</CardTitle>
          <WalletIcon className='h-5 w-5 text-teal-500' />
        </div>
        <CardDescription>
          Remaining budget for group{' '}
          <span className='font-medium'>{accessCode}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-3xl font-bold'>
          {groupWallet?.displayBudget ?? '$0.00'}
        </div>
        {isZero && (
          <Alert
            variant='default'
            className='border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
          >
            <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
            <AlertDescription>
              Budget is exhausted. Scheduled refills for this group are paused
              until a platform admin tops it up.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default BudgetCard
