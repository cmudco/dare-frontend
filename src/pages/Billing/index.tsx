import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getWallet, getTransactions } from '@/redux/aynscThunks/billing'
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
import { Wallet as WalletIcon } from 'lucide-react'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { Message } from '@/redux/types/conversation'

const getMessageById = async (messageId: string): Promise<Message | null> => {
  try {
    return await baseRequest<Message>({
      url: `api/messages/${messageId}/`,
      method: METHOD.GET,
    })
  } catch (error) {
    console.error(`Error fetching message ${messageId}:`, error)
    return null
  }
}

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
  const [messageCache, setMessageCache] = useState<Record<string, string>>({})
  const [loadingMessages, setLoadingMessages] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    dispatch(getWallet())
    dispatch(getTransactions(1))
  }, [dispatch])

  useEffect(() => {
    const fetchMessages = async () => {
      if (transactions.length === 0) return

      const messageIds: string[] = []
      const newLoadingStates: Record<string, boolean> = {}

      transactions.forEach((transaction) => {
        const messageIdMatch = transaction.message.match(/for message (\d+):/)
        const messageId = messageIdMatch ? messageIdMatch[1] : null

        if (messageId && !messageCache[messageId]) {
          messageIds.push(messageId)
          newLoadingStates[messageId] = true
        }
      })

      if (messageIds.length === 0) return

      setLoadingMessages((prev) => ({ ...prev, ...newLoadingStates }))

      const messagesPromises = messageIds.map((id) => getMessageById(id))
      const messages = await Promise.all(messagesPromises)

      const newCache: Record<string, string> = {}
      messages.forEach((message, index) => {
        if (message) {
          newCache[messageIds[index]] = message.message
        }
      })

      setMessageCache((prev) => ({ ...prev, ...newCache }))

      const clearedLoadingStates: Record<string, boolean> = {}
      messageIds.forEach((id) => {
        clearedLoadingStates[id] = false
      })
      setLoadingMessages((prev) => ({ ...prev, ...clearedLoadingStates }))
    }

    fetchMessages()
  }, [transactions])

  const handlePageChange = (page: number) => {
    dispatch(getTransactions(page))
  }

  const getPageNumber = (url: string | null): number | null => {
    if (!url) return null
    const params = new URLSearchParams(url.split('?')[1])
    return parseInt(params.get('page') || '1', 10)
  }

  const parseTransactionMessage = (message: string) => {
    const messageIdMatch = message.match(/for message (\d+):/)
    const messageId = messageIdMatch ? messageIdMatch[1] : null

    const tokensMatch = message.match(/(\d+) input tokens, (\d+) output tokens/)
    const inputTokens = tokensMatch ? tokensMatch[1] : '0'
    const outputTokens = tokensMatch ? tokensMatch[2] : '0'

    return {
      messageId,
      inputTokens,
      outputTokens,
    }
  }

  const getMessagePreview = (
    messageId: string | null,
    transactionMessage: string
  ) => {
    if (!messageId) return truncateText(transactionMessage, 100)

    if (loadingMessages[messageId]) {
      return 'Loading message content...'
    }

    return messageCache[messageId]
      ? truncateText(messageCache[messageId], 100)
      : truncateText(transactionMessage, 100)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Billing</h1>
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
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
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
                  <TableHead>Message ID</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center'>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
                    const { messageId, inputTokens, outputTokens } =
                      parseTransactionMessage(transaction.message)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.displayAmount}</TableCell>
                        <TableCell>
                          {messageId
                            ? `#${messageId}`
                            : truncateText(transaction.message, 100)}
                        </TableCell>
                        <TableCell>
                          {getMessagePreview(messageId, transaction.message)}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <div className='flex items-center space-x-1'>
                              <span className='font-medium text-green-600'>
                                {inputTokens}
                              </span>
                              <span className='text-xs text-gray-500'>
                                input
                              </span>
                            </div>
                            <div className='flex items-center space-x-1'>
                              <span className='font-medium text-blue-600'>
                                {outputTokens}
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
                    )
                  })
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
