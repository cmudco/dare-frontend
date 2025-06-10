import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getWallet, getTransactions } from '@/redux/asyncThunks/billing'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Wallet as WalletIcon, FileSpreadsheet } from 'lucide-react'
import { useExportToCSV } from '@/utils/billingExportUtils'

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

      {loading ? (
        <Card className='overflow-hidden'>
          <CardHeader className='pb-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-8 w-28' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-full' />
          </CardContent>
        </Card>
      ) : (
        <Card className='overflow-hidden'>
          <div className='h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500' />
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-medium'>
                Wallet Balance
              </CardTitle>
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
      )}

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
          {loading ? (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>LLM</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow key='no-transactions'>
                    <TableCell colSpan={5} className='text-center'>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.displayAmount}</TableCell>
                      <TableCell>{transaction.message}</TableCell>
                      <TableCell>{transaction.llm?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className='flex flex-col'>
                          <div className='flex items-center space-x-1'>
                            <span className='font-medium text-green-600'>
                              {transaction.inputTokens ?? 'N/A'}
                            </span>
                            <span className='text-xs text-gray-500'>input</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <span className='font-medium text-blue-600'>
                              {transaction.outputTokens ?? 'N/A'}
                            </span>
                            <span className='text-xs text-gray-500'>
                              output
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
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
