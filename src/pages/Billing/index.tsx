import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getWallet, getTransactions } from '@/redux/asyncThunks/billing'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { useExportToCSV } from '@/utils/billingExportUtils'
import { WalletBalanceCard, TransactionTabs } from './components'
import { TransactionTab } from '@/utils/constants/billing'

const BillingScreen = () => {
  const dispatch = useAppDispatch()
  const {
    wallet,
    transactions,
    transactionCount,
    nextPage,
    previousPage,
    loading,
  } = useAppSelector((state) => state.billing)

  const [activeTab, setActiveTab] = useState<TransactionTab>(TransactionTab.ALL)

  useEffect(() => {
    dispatch(getWallet())
    dispatch(getTransactions(1))
  }, [dispatch])

  const handlePageChange = (page: number) => {
    dispatch(getTransactions(page))
  }

  const getPageNumber = (url: string | null): number | null => {
    if (!url) return null
    const params = new URLSearchParams(url.split('?')[1])
    return parseInt(params.get('page') || '1', 10)
  }
  const exportToCSV = useExportToCSV()

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Cost Tracking</h1>
        <p className='text-muted-foreground'>
          View your wallet balance and transaction history.
        </p>
      </div>

      <WalletBalanceCard wallet={wallet} loading={loading} />

      <Card className='overflow-hidden'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </div>
            <Button
              onClick={exportToCSV}
              variant='outline'
              size='sm'
              className='h-8 gap-1'
              disabled={transactions.length === 0 || loading}
            >
              <FileSpreadsheet size={16} />
              <span>Export Transaction History</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionTabs
            transactions={transactions}
            loading={loading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </CardContent>
        {transactionCount > 0 && (
          <div className='flex justify-between p-4'>
            <Button
              variant='outline'
              disabled={!previousPage}
              onClick={() => {
                const page = getPageNumber(previousPage)
                if (page) handlePageChange(page)
              }}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              disabled={!nextPage}
              onClick={() => {
                const page = getPageNumber(nextPage)
                if (page) handlePageChange(page)
              }}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default BillingScreen
