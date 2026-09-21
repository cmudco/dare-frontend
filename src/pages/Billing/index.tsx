import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, FileSpreadsheet } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getTransactions } from '@/redux/asyncThunks/billing'
import {
  selectFilteredTransactions,
  selectTransactionModels,
} from '@/redux/selectors/transactionHistory'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { downloadTransactions } from '@/utils/billingExportUtils'
import {
  PlatformFilter,
  PLATFORM_LABELS,
  TransactionTab,
} from '@/utils/constants/billing'
import { TransactionTabs } from './components'
import { WalletSection } from './components/WalletSection'

const PAGE_SIZE = 25
const BillingScreen = () => {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const { loading, error } = useAppSelector((state) => state.billing)
  const filters = useMemo(
    () => ({
      platform:
        Object.values(PlatformFilter).find(
          (p) => p === params.get('platform')
        ) ?? PlatformFilter.ALL,
      tab:
        Object.values(TransactionTab).find((t) => t === params.get('tab')) ??
        TransactionTab.ALL,
      model: params.get('model') ?? '',
      startDate: params.get('from') ?? '',
      endDate: params.get('to') ?? '',
    }),
    [params]
  )
  const { transactions, summary } = useAppSelector((state) =>
    selectFilteredTransactions(state, filters)
  )
  const models = useAppSelector(selectTransactionModels)
  const pageCount = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  const page = Math.min(
    pageCount,
    Math.max(1, Math.floor(Number(params.get('page')) || 1))
  )
  const invalidDates = Boolean(
    filters.startDate && filters.endDate && filters.startDate > filters.endDate
  )
  const unavailable = loading || Boolean(error) || invalidDates
  const updateFilter = (key: string, value: string) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }
  const changePage = (value: number) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(value))
      return next
    })

  useEffect(() => {
    const request = dispatch(getTransactions({}))
    return () => request.abort()
  }, [dispatch])

  const selectClass =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  return (
    <div className='container mx-auto space-y-6 p-4 sm:p-6'>
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-muted p-2'>
          <CreditCard className='h-6 w-6 text-primary' />
        </div>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Cost Tracking</h1>
          <p className='text-sm text-muted-foreground'>
            View your wallet balance and transaction history.
          </p>
        </div>
      </div>
      <div data-tour='billing-overview'>
        <WalletSection />
      </div>
      <Card className='overflow-hidden'>
        <CardHeader className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Explore and export your complete transaction history.
              </CardDescription>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={unavailable || transactions.length === 0}
                onClick={() => downloadTransactions(transactions, 'xml')}
              >
                <FileSpreadsheet className='mr-2 h-4 w-4' />
                Export Excel (.xml)
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={unavailable || transactions.length === 0}
                onClick={() => downloadTransactions(transactions, 'csv')}
              >
                Export CSV
              </Button>
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <label className='space-y-1 text-sm'>
              Platform
              <select
                className={selectClass}
                value={filters.platform}
                onChange={(e) => updateFilter('platform', e.target.value)}
              >
                {Object.values(PlatformFilter).map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className='space-y-1 text-sm'>
              Model
              <select
                className={selectClass}
                value={filters.model}
                onChange={(e) => updateFilter('model', e.target.value)}
              >
                <option value=''>All models</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
            <label className='space-y-1 text-sm'>
              From date
              <Input
                type='date'
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(e) => updateFilter('from', e.target.value)}
              />
            </label>
            <label className='space-y-1 text-sm'>
              Through date
              <Input
                type='date'
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(e) => updateFilter('to', e.target.value)}
              />
            </label>
          </div>
          <div className='flex flex-wrap items-center justify-between gap-2 text-sm'>
            <p className='text-muted-foreground' role='status'>
              {loading
                ? 'Loading complete transaction history…'
                : error
                  ? 'Transaction history could not be loaded.'
                  : `${transactions.length} matching transactions. Exports include every matching row across all pages.`}
            </p>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                setParams((current) => {
                  const next = new URLSearchParams(current)
                  ;['platform', 'tab', 'model', 'from', 'to', 'page'].forEach(
                    (key) => next.delete(key)
                  )
                  return next
                })
              }
            >
              Clear filters
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            Excel preserves six decimal places for costs. CSV contains the same
            values, but your spreadsheet app controls how they are displayed.
            Dates use your local time.
          </p>
          {invalidDates && (
            <p role='alert' className='text-sm text-destructive'>
              The end date must be on or after the start date.
            </p>
          )}
          {error && !loading && (
            <div
              role='alert'
              className='flex items-center gap-3 text-sm text-destructive'
            >
              Unable to load the complete history. Please try again.
              <Button
                variant='outline'
                size='sm'
                onClick={() => dispatch(getTransactions({}))}
              >
                Retry
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          <div className='min-w-[600px]'>
            <TransactionTabs
              transactions={
                unavailable
                  ? []
                  : transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
              }
              summary={summary}
              loading={loading}
              activeTab={filters.tab}
              onTabChange={(tab) => updateFilter('tab', tab)}
              showPlatformColumn={filters.platform === PlatformFilter.ALL}
            />
          </div>
        </CardContent>
        {!unavailable && transactions.length > 0 && (
          <div className='flex items-center justify-between gap-2 p-4'>
            <Button
              variant='outline'
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
            >
              Previous
            </Button>
            <span className='text-sm text-muted-foreground'>
              Page {page} of {pageCount}
            </span>
            <Button
              variant='outline'
              disabled={page >= pageCount}
              onClick={() => changePage(page + 1)}
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
