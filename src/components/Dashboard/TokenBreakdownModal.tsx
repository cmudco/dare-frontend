import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getBillingModelStats } from '@/redux/asyncThunks/billing'
import { BillingModelStats } from '@/redux/types/billing'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Inbox, Send } from 'lucide-react'

interface TokenBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokenType: 'input' | 'output' | 'total'
}

const TokenBreakdownModal = ({
  open,
  onOpenChange,
  tokenType,
}: TokenBreakdownModalProps) => {
  const dispatch = useAppDispatch()
  const { modelStats, modelStatsLoading } = useAppSelector(
    (state) => state.billing
  )

  useEffect(() => {
    if (open) {
      dispatch(getBillingModelStats())
    }
  }, [dispatch, open])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getTokenValue = (
    modelStat:
      | BillingModelStats
      | { inputTokens: number; outputTokens: number; totalTokens: number }
  ) => {
    switch (tokenType) {
      case 'input':
        return modelStat.inputTokens
      case 'output':
        return modelStat.outputTokens
      case 'total':
        return modelStat.totalTokens
      default:
        return modelStat.totalTokens
    }
  }

  const getTotalTokens = () => {
    if (Array.isArray(modelStats) && modelStats.length > 0) {
      switch (tokenType) {
        case 'input':
          return modelStats.reduce((sum, model) => sum + model.inputTokens, 0)
        case 'output':
          return modelStats.reduce((sum, model) => sum + model.outputTokens, 0)
        case 'total':
          return modelStats.reduce((sum, model) => sum + model.totalTokens, 0)
        default:
          return modelStats.reduce((sum, model) => sum + model.totalTokens, 0)
      }
    }

    return 0
  }

  const getModelsUsedCount = () => {
    if (Array.isArray(modelStats) && modelStats.length > 0) {
      return modelStats.length
    }
    return 0
  }

  const getTitle = () => {
    switch (tokenType) {
      case 'input':
        return 'Input Tokens by Model'
      case 'output':
        return 'Output Tokens by Model'
      case 'total':
        return 'Total Tokens by Model'
      default:
        return 'Tokens by Model'
    }
  }

  const getIcon = () => {
    switch (tokenType) {
      case 'input':
        return <Inbox className='h-5 w-5 text-green-500' />
      case 'output':
        return <Send className='h-5 w-5 text-orange-500' />
      case 'total':
        return <Activity className='h-5 w-5 text-purple-500' />
      default:
        return <Activity className='h-5 w-5 text-purple-500' />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>
                    {formatNumber(getTotalTokens())}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total {tokenType === 'total' ? '' : tokenType} Tokens
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {getModelsUsedCount()}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Models Used
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {Array.isArray(modelStats)
                      ? modelStats.reduce(
                          (sum, model) => sum + model.transactionCount,
                          0
                        )
                      : 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Interactions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Breakdown by Model</CardTitle>
            </CardHeader>
            <CardContent>
              {modelStatsLoading ? (
                <div className='space-y-4'>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              ) : !Array.isArray(modelStats) || modelStats.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  No model usage data available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className='text-right'>
                        {tokenType === 'total'
                          ? 'Tokens'
                          : `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} Tokens`}
                      </TableHead>
                      <TableHead className='text-right'>Percentage</TableHead>
                      <TableHead className='text-right'>Cost</TableHead>
                      <TableHead className='text-right'>Interactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...modelStats]
                      .sort((a, b) => getTokenValue(b) - getTokenValue(a))
                      .map((modelStat) => {
                        const tokens = getTokenValue(modelStat)
                        const totalSystemTokens = getTotalTokens()
                        const percentage =
                          totalSystemTokens > 0
                            ? (tokens / totalSystemTokens) * 100
                            : 0

                        return (
                          <TableRow key={modelStat.llmId}>
                            <TableCell className='font-medium'>
                              {modelStat.llmName}
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatNumber(tokens)}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                <div className='h-2 max-w-[100px] flex-1 rounded-full bg-gray-200'>
                                  <div
                                    className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500'
                                    style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className='w-12 text-sm'>
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='text-right'>
                              {modelStat.totalCost}
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatNumber(modelStat.transactionCount)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TokenBreakdownModal
