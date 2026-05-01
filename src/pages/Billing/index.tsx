import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getWallets, getTransactions } from '@/redux/asyncThunks/billing'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileSpreadsheet, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { useExportToCSV } from '@/utils/billingExportUtils'
import { TransactionTabs } from './components'
import { WalletSection } from './components/WalletSection'
import {
  PlatformFilter,
  PLATFORM_LABELS,
  TransactionTab,
  tabToBillingModeParam,
} from '@/utils/constants/billing'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

const BillingScreen = () => {
  const dispatch = useAppDispatch()
  const {
    transactions,
    transactionCount,
    transactionSummary,
    nextPage,
    previousPage,
    loading,
  } = useAppSelector((state) => state.billing)

  const [activeTab, setActiveTab] = useState<TransactionTab>(TransactionTab.ALL)
  const [platform, setPlatform] = useState<PlatformFilter>(PlatformFilter.ALL)

  const fetchTransactions = useCallback(
    (page: number, tab: TransactionTab, plat: PlatformFilter) => {
      dispatch(
        getTransactions({
          page,
          platform: plat,
          billingMode: tabToBillingModeParam(tab),
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    dispatch(getWallets())
  }, [dispatch])

  // Reset to page 1 whenever the platform or tab filter changes.
  useEffect(() => {
    fetchTransactions(1, activeTab, platform)
  }, [fetchTransactions, activeTab, platform])

  const handlePageChange = (page: number) => {
    fetchTransactions(page, activeTab, platform)
  }

  const getPageNumber = (url: string | null): number | null => {
    if (!url) return null
    const params = new URLSearchParams(url.split('?')[1])
    return parseInt(params.get('page') || '1', 10)
  }
  const exportToCSV = useExportToCSV()

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
          <CardHeader>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Select
                  value={platform}
                  onValueChange={(v) => setPlatform(v as PlatformFilter)}
                >
                  <SelectTrigger className='h-8 w-[180px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PlatformFilter).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PLATFORM_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
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
            </div>
          </CardHeader>
          <CardContent>
            <TransactionTabs
              transactions={transactions}
              summary={transactionSummary}
              loading={loading}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showPlatformColumn={platform === PlatformFilter.ALL}
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
    </TooltipProvider>
  )
}

export default BillingScreen
