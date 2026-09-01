import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet as WalletIcon, Key, Network, DatabaseZap } from 'lucide-react'
import { Transaction } from '@/redux/types/billing'
import { BillingMode, PlatformFilter } from '@/utils/constants/billing'

interface TransactionTableProps {
  transactions: Transaction[]
  loading: boolean
  showAmount?: boolean
  showReferenceAmount?: boolean
  showBillingMode?: boolean
  showPlatform?: boolean
}

export const TransactionTable = ({
  transactions,
  loading,
  showAmount = true,
  showReferenceAmount = false,
  showBillingMode = false,
  showPlatform = false,
}: TransactionTableProps) => {
  if (loading) {
    return (
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  // base columns: message, llm, tokens, date
  const columnCount =
    (showAmount ? 1 : 0) +
    (showReferenceAmount ? 1 : 0) +
    (showBillingMode ? 1 : 0) +
    (showPlatform ? 1 : 0) +
    4

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showAmount && <TableHead>Amount</TableHead>}
          {showReferenceAmount && <TableHead>Est. Cost</TableHead>}
          <TableHead className='w-[32%]'>Message</TableHead>
          <TableHead>LLM</TableHead>
          <TableHead className='min-w-[140px]'>Tokens</TableHead>
          {showBillingMode && <TableHead>Billing Mode</TableHead>}
          {showPlatform && <TableHead>Platform</TableHead>}
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columnCount} className='text-center'>
              No transactions found.
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              {showAmount && (
                <TableCell>
                  <div className='flex flex-col'>
                    <span>{transaction.displayAmount}</span>
                    {transaction.displayReferenceAmount && (
                      <span className='text-xs text-muted-foreground'>
                        {transaction.displayReferenceAmount} at DARE rates
                      </span>
                    )}
                  </div>
                </TableCell>
              )}
              {showReferenceAmount && (
                <TableCell>
                  {transaction.displayReferenceAmount ? (
                    <div className='flex flex-col'>
                      <span>{transaction.displayReferenceAmount}</span>
                      <span className='text-xs text-muted-foreground'>
                        at DARE rates, not charged
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>N/A</span>
                  )}
                </TableCell>
              )}
              <TableCell className='max-w-[420px]'>
                <span className='line-clamp-2 text-sm' title={transaction.message}>
                  {transaction.message}
                </span>
              </TableCell>
              <TableCell>{transaction.llmName || 'N/A'}</TableCell>
              <TableCell>
                <div className='flex flex-col'>
                  <div className='text-center'>
                    <span className='text-xs text-muted-foreground'>
                      input{' '}
                    </span>
                    <span className='text-sm font-medium text-foreground'>
                      {transaction.inputTokens}
                    </span>
                  </div>
                  <div className='text-center'>
                    <span className='text-xs text-muted-foreground'>
                      output{' '}
                    </span>
                    <span className='text-sm font-medium text-foreground'>
                      {transaction.outputTokens}
                    </span>
                  </div>
                  {(transaction.cachedInputTokens ?? 0) > 0 && (
                    <div
                      className='flex items-center justify-center gap-1 text-amber-600'
                      title='Input tokens served from the provider prompt cache'
                    >
                      <DatabaseZap size={12} />
                      <span className='text-xs'>
                        {transaction.cachedInputTokens?.toLocaleString()} cached
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              {showBillingMode && (
                <TableCell>
                  <div className='flex items-center gap-1'>
                    {transaction.billingMode === BillingMode.WALLET && (
                      <>
                        <WalletIcon size={14} className='text-teal-500' />
                        <span className='text-xs'>Wallet</span>
                      </>
                    )}
                    {transaction.billingMode === BillingMode.OWN_API && (
                      <>
                        <Key size={14} className='text-purple-500' />
                        <span className='text-xs'>Own API</span>
                      </>
                    )}
                    {transaction.billingMode === BillingMode.LITELLM && (
                      <>
                        <Network size={14} className='text-indigo-500' />
                        <span className='text-xs'>LiteLLM</span>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
              {showPlatform && (
                <TableCell>
                  <div className='flex items-center gap-1'>
                    {transaction.platform === PlatformFilter.SOCRATIC_BOTS ? (
                      <>
                        <span className='text-xs'>Socratic Bots</span>
                      </>
                    ) : (
                      <>
                        <span className='text-xs'>DARE</span>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
              <TableCell>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
