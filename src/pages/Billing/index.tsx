import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  exportTransactions,
  getTransactions,
} from '@/redux/asyncThunks/billing'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { TransactionFilters, TransactionTabs } from './components'
import { WalletSection } from './components/WalletSection'
import { PlatformFilter, TransactionTab } from '@/utils/constants/billing'
import { TransactionHistoryFilters } from '@/redux/types/billing'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'
import { toast } from '@/utils/toast'

const BillingScreen = () => {
  const dispatch = useAppDispatch()
  const {
    transactions,
    transactionCount,
    transactionSummary,
    transactionModels,
    nextPage,
    previousPage,
    loading,
    transactionsExporting,
  } = useAppSelector((state) => state.billing)
  const [params, setParams] = useSearchParams()

  const filters = useMemo<TransactionHistoryFilters>(
    () => ({
      platform:
        Object.values(PlatformFilter).find(
          (p) => p === params.get('platform')
        ) ?? PlatformFilter.ALL,
      tab:
        Object.values(TransactionTab).find((t) => t === params.get('tab')) ??
        TransactionTab.ALL,
      model: params.get('model'),
      from: params.get('from'),
      to: params.get('to'),
    }),
    [params]
  )
  const page = Number(params.get('page')) || 1

  useEffect(() => {
    const request = dispatch(getTransactions({ page, filters }))
    return () => request.abort()
  }, [dispatch, page, filters])

  const updateParams = (changes: Record<string, string | null>) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) =>
        value ? next.set(key, value) : next.delete(key)
      )
      return next
    })
  // A filter change resets to the first page.
  const handleFilterChange = (
    key: keyof TransactionHistoryFilters,
    value: string | null
  ) => updateParams({ [key]: value, page: null })

  const handleExport = () =>
    dispatch(exportTransactions(filters))
      .unwrap()
      .catch(() => toast.error('Could not export transactions. Try again.'))

  return (
    <TooltipProvider>
      <div className='container mx-auto space-y-6 p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-col space-y-1'
        >
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-teal-50 p-2 dark:bg-teal-900/20'>
              <CreditCard className='h-6 w-6 text-teal-600 dark:text-teal-400' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Cost Tracking
              </h1>
              <p className='text-sm text-muted-foreground'>
                View your wallet balance and transaction history.
              </p>
            </div>
          </div>
        </motion.div>

        <div data-tour='billing-overview'>
          <WalletSection />
        </div>

        <Card className='overflow-hidden'>
          <CardHeader className='space-y-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleExport}
                    variant='outline'
                    size='sm'
                    className='h-8 gap-1'
                    disabled={
                      transactionCount === 0 || loading || transactionsExporting
                    }
                  >
                    <FileSpreadsheet size={16} />
                    <span>
                      {transactionsExporting ? 'Exporting…' : 'Export CSV'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.billing2.exportCSV.title}
                    </p>
                    <p className='text-sm'>
                      {TOOLTIP_CONTENT.billing2.exportCSV.description}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      💡 {TOOLTIP_CONTENT.billing2.exportCSV.tip}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <TransactionFilters
              filters={filters}
              models={transactionModels}
              onFilterChange={handleFilterChange}
            />
          </CardHeader>
          <CardContent>
            <TransactionTabs
              transactions={transactions}
              summary={transactionSummary}
              loading={loading}
              activeTab={filters.tab}
              onTabChange={(tab) => handleFilterChange('tab', tab)}
              showPlatformColumn={filters.platform === PlatformFilter.ALL}
            />
          </CardContent>
          {transactionCount > 0 && (
            <div className='flex justify-between p-4'>
              <Button
                variant='outline'
                disabled={!previousPage}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                disabled={!nextPage}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}

export default BillingScreen
