import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet as WalletIcon } from 'lucide-react'
import { Wallet } from '@/redux/types/billing'

interface WalletBalanceCardProps {
  wallet: Wallet | null
  loading: boolean
}

export const WalletBalanceCard = ({
  wallet,
  loading,
}: WalletBalanceCardProps) => {
  if (loading) {
    return (
      <Card className='overflow-hidden'>
        <CardHeader className='pb-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-28' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-4 w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='overflow-hidden'>
      <div className='h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500' />
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-medium'>Wallet Balance</CardTitle>
          <WalletIcon className='h-5 w-5 text-teal-500' />
        </div>
        <CardDescription>Current wallet balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-bold'>
          {wallet?.displayBalance || '$0.00'}
        </div>
      </CardContent>
    </Card>
  )
}
