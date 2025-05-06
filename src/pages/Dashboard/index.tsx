import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getWallet } from '@/redux/aynscThunks/billing'
import { getUserStats } from '@/redux/aynscThunks/user'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  Activity,
  BarChart3,
  Clock,
  FileText,
  MessageCircle,
  Tag,
  Users,
  Inbox,
  Send,
  Wallet as WalletIcon,
} from 'lucide-react'
import { useEffect } from 'react'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, loading: userLoading } = useAppSelector((state) => state.user)
  const { wallet, loading: billingLoading } = useAppSelector(
    (state) => state.billing
  )

  useEffect(() => {
    dispatch(getUserStats())
    dispatch(getWallet())
  }, [dispatch])

  const formatNumber = (num: number | string) => {
    return typeof num === 'string' ? num : num.toLocaleString()
  }

  const statCards = [
    {
      title: 'AI Messages',
      value: stats?.aiMessageCount || 0,
      icon: <MessageCircle className='h-5 w-5 text-indigo-500' />,
      description: 'Total AI-generated messages',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Conversations',
      value: stats?.conversationCount || 0,
      icon: <Users className='h-5 w-5 text-emerald-500' />,
      description: 'Total conversations started',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Files',
      value: stats?.fileCount || 0,
      icon: <FileText className='h-5 w-5 text-blue-500' />,
      description: 'Total files uploaded',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Messages',
      value: stats?.messageCount || 0,
      icon: <Activity className='h-5 w-5 text-rose-500' />,
      description: 'Total messages exchanged',
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Prompts',
      value: stats?.promptCount || 0,
      icon: <BarChart3 className='h-5 w-5 text-amber-500' />,
      description: 'Total prompts created',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      title: 'Tagged Files',
      value: stats?.taggedFilesCount || 0,
      icon: <Tag className='h-5 w-5 text-violet-500' />,
      description: 'Files with tags',
      color: 'from-violet-500 to-purple-500',
    },
    {
      title: 'Input Tokens',
      value: stats?.totalInputTokens || 0,
      icon: <Inbox className='h-5 w-5 text-green-500' />,
      description: 'Total input tokens used',
      color: 'from-green-500 to-teal-400',
    },
    {
      title: 'Output Tokens',
      value: stats?.totalOutputTokens || 0,
      icon: <Send className='h-5 w-5 text-orange-500' />,
      description: 'Total output tokens generated',
      color: 'from-orange-500 to-red-400',
    },
    {
      title: 'Total Tokens',
      value: stats?.totalTokens || 0,
      icon: <Activity className='h-5 w-5 text-purple-500' />,
      description: 'Combined input and output tokens',
      color: 'from-purple-500 to-fuchsia-400',
    },
    {
      title: 'Wallet Balance',
      value: wallet?.displayBalance || '$0.00',
      icon: <WalletIcon className='h-5 w-5 text-teal-500' />,
      description: 'Current wallet balance',
      color: 'from-teal-500 to-cyan-500',
      link: '/billing/transactions',
    },
  ]

  return (
    <div className='over container mx-auto space-y-6 p-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of your activity and usage statistics.
        </p>
      </div>

      {userLoading || billingLoading ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(9)].map((_, i) => (
            <Card key={i} className='overflow-hidden'>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-28' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-4 w-full' />
              </CardContent>
              <CardFooter>
                <Skeleton className='h-4 w-20' />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {statCards.map((card, index) => (
            <Card
              key={index}
              className='overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md'
            >
              <div className={`h-1 w-full bg-gradient-to-r ${card.color}`} />
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg font-medium'>
                    {card.title}
                  </CardTitle>
                  {card.icon}
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {formatNumber(card.value)}
                </div>
              </CardContent>
              <CardFooter className='text-xs text-muted-foreground'>
                Last updated: {new Date().toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Card className='border-none bg-white bg-gradient-to-br dark:from-slate-900 dark:to-slate-800'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Activity Summary
          </CardTitle>
          <CardDescription>Your overall platform engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex flex-col space-y-1'>
              <span className='text-sm font-medium text-muted-foreground'>
                Message Ratio
              </span>
              <div className='flex items-end gap-2'>
                <span className='text-2xl font-bold'>
                  {stats?.messageCount
                    ? (
                        (stats.aiMessageCount / stats.messageCount) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
                <span className='text-sm text-muted-foreground'>
                  AI messages
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500'
                  style={{
                    width: `${stats?.messageCount ? (stats.aiMessageCount / stats.messageCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className='flex flex-col space-y-1'>
              <span className='text-sm font-medium text-muted-foreground'>
                Files per Conversation
              </span>
              <div className='flex items-end gap-2'>
                <span className='text-2xl font-bold'>
                  {stats?.conversationCount
                    ? (stats.fileCount / stats.conversationCount).toFixed(1)
                    : 0}
                </span>
                <span className='text-sm text-muted-foreground'>average</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500'
                  style={{
                    width: `${stats?.conversationCount ? Math.min((stats.fileCount / stats.conversationCount / 5) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
