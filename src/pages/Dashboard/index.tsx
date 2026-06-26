import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getWallets } from '@/redux/asyncThunks/billing'
import { getUserStats } from '@/redux/asyncThunks/user'
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
  Info,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TokenBreakdownModal from '@/components/Dashboard/TokenBreakdownModal'
import EnergyDashboard from '@/components/Dashboard/EnergyDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { stats, loading: userLoading } = useAppSelector((state) => state.user)
  const { wallets, walletsLoading: billingLoading } = useAppSelector(
    (state) => state.billing
  )
  const dareWallet = wallets.find((w) => w.type === 'DARE')
  const dareBalance =
    dareWallet?.status.kind === 'BALANCE'
      ? `$${parseFloat(dareWallet.status.balance).toFixed(2)}`
      : '$0.00'
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTokenType, setSelectedTokenType] = useState<
    'input' | 'output' | 'total'
  >('total')

  useEffect(() => {
    dispatch(getUserStats())
    dispatch(getWallets())
  }, [dispatch])

  const formatNumber = (num: number | string) => {
    return typeof num === 'string' ? num : num.toLocaleString()
  }

  const handleTokenCardClick = (tokenType: 'input' | 'output' | 'total') => {
    setSelectedTokenType(tokenType)
    setModalOpen(true)
  }
  const statCards = [
    {
      title: 'AI Messages',
      value: stats?.aiMessageCount || 0,
      icon: <MessageCircle className='h-5 w-5 text-indigo-600' />,
      description: 'Total AI-generated messages',
      iconBg:
        'bg-indigo-600/10 border-indigo-600/20 group-hover:bg-indigo-600/20',
      tooltip: TOOLTIP_CONTENT.dashboard.aiMessages,
    },
    {
      title: 'Conversations',
      value: stats?.conversationCount || 0,
      icon: <Users className='h-5 w-5 text-emerald-600' />,
      description: 'Total conversations started',
      iconBg:
        'bg-emerald-600/10 border-emerald-600/20 group-hover:bg-emerald-600/20',
    },
    {
      title: 'Files',
      value: stats?.fileCount || 0,
      icon: <FileText className='h-5 w-5 text-blue-600' />,
      description: 'Total files uploaded',
      iconBg: 'bg-blue-600/10 border-blue-600/20 group-hover:bg-blue-600/20',
    },
    {
      title: 'Messages',
      value: stats?.messageCount || 0,
      icon: <Activity className='h-5 w-5 text-rose-600' />,
      description: 'Total messages exchanged',
      iconBg: 'bg-rose-600/10 border-rose-600/20 group-hover:bg-rose-600/20',
    },
    {
      title: 'Prompts',
      value: stats?.promptCount || 0,
      icon: <BarChart3 className='h-5 w-5 text-amber-600' />,
      description: 'Total prompts created',
      iconBg: 'bg-amber-600/10 border-amber-600/20 group-hover:bg-amber-600/20',
    },
    {
      title: 'Tagged Files',
      value: stats?.taggedFilesCount || 0,
      icon: <Tag className='h-5 w-5 text-violet-600' />,
      description: 'Files with tags',
      iconBg:
        'bg-violet-600/10 border-violet-600/20 group-hover:bg-violet-600/20',
    },
    {
      title: 'Input Tokens',
      value: stats?.totalInputTokens || 0,
      icon: <Inbox className='h-5 w-5 text-green-600' />,
      description: 'Total input tokens used',
      iconBg: 'bg-green-600/10 border-green-600/20 group-hover:bg-green-600/20',
      onClick: () => handleTokenCardClick('input'),
      tooltip: TOOLTIP_CONTENT.dashboard.inputTokens,
    },
    {
      title: 'Output Tokens',
      value: stats?.totalOutputTokens || 0,
      icon: <Send className='h-5 w-5 text-orange-600' />,
      description: 'Total output tokens generated',
      iconBg:
        'bg-orange-600/10 border-orange-600/20 group-hover:bg-orange-600/20',
      onClick: () => handleTokenCardClick('output'),
      tooltip: TOOLTIP_CONTENT.dashboard.outputTokens,
    },
    {
      title: 'Total Tokens',
      value: stats?.totalTokens || 0,
      icon: <Activity className='h-5 w-5 text-purple-600' />,
      description: 'Combined input and output tokens',
      iconBg:
        'bg-purple-600/10 border-purple-600/20 group-hover:bg-purple-600/20',
      onClick: () => handleTokenCardClick('total'),
      tooltip: TOOLTIP_CONTENT.dashboard.totalTokens,
    },
    {
      title: 'Wallet Balance',
      value: dareBalance,
      icon: <WalletIcon className='h-5 w-5 text-teal-600' />,
      description: 'Current wallet balance',
      iconBg: 'bg-teal-600/10 border-teal-600/20 group-hover:bg-teal-600/20',
      onClick: () => navigate('/billing/'),
      tooltip: TOOLTIP_CONTENT.dashboard.walletBalance,
    },
  ]

  return (
    <TooltipProvider>
      <div className='container mx-auto space-y-6 p-6'>
        <Tabs defaultValue='overview'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col space-y-1'>
              <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
              <p className='text-muted-foreground'>
                Overview of your activity and usage statistics.
              </p>
            </div>
            <TabsList data-tour='dashboard-tabs'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='energy'>Environmental Impact</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='mt-6 space-y-6'>
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
              <div
                data-tour='dashboard-stats'
                className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              >
                {statCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className='group relative'
                  >
                    <Card
                      className={`relative h-full overflow-hidden border-border/50 bg-card shadow-xs transition-all duration-300 hover:border-border hover:shadow-lg ${card.onClick ? 'cursor-pointer' : ''}`}
                      onClick={card.onClick}
                    >
                      <CardHeader className='relative z-10 pb-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`rounded-lg border p-2 transition-colors ${card.iconBg}`}
                            >
                              {card.icon}
                            </div>
                            <CardTitle className='text-sm font-bold tracking-tight text-foreground'>
                              {card.title}
                            </CardTitle>
                          </div>
                          {card.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className='rounded-full p-1.5 transition-colors hover:bg-accent'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground/60' />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <div className='space-y-2'>
                                  <p className='text-sm font-bold'>
                                    {card.tooltip.title}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {card.tooltip.description}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className='relative z-10'>
                        <div className='flex flex-col space-y-1.5'>
                          <div className='text-4xl font-black tracking-tighter text-foreground transition-transform duration-300 group-hover:translate-x-1'>
                            {formatNumber(card.value)}
                          </div>
                          <p className='text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase transition-colors group-hover:text-muted-foreground/70'>
                            {card.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card
                data-tour='dashboard-activity'
                className='group relative overflow-hidden border-none bg-card/50 shadow-lg backdrop-blur-md'
              >
                <div className='pointer-events-none absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.05]'>
                  <TrendingUp className='h-32 w-32' />
                </div>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-xl font-bold text-foreground'>
                    <div className='rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'>
                      <Clock className='h-5 w-5' />
                    </div>
                    Activity Summary
                  </CardTitle>
                  <CardDescription className='text-sm font-medium'>
                    Insights into your overall platform engagement and usage
                    efficiency.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                    <div className='flex flex-col space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-semibold text-muted-foreground'>
                          AI Intervention Ratio
                        </span>
                        <span className='rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
                          Optimized
                        </span>
                      </div>
                      <div className='flex items-end gap-2'>
                        <span className='text-3xl font-bold tracking-tight'>
                          {stats?.messageCount
                            ? (
                                (stats.aiMessageCount / stats.messageCount) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                        <span className='pb-1 text-sm font-medium text-muted-foreground'>
                          of messages are AI-generated
                        </span>
                      </div>
                      <div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${stats?.messageCount ? (stats.aiMessageCount / stats.messageCount) * 100 : 0}%`,
                          }}
                          transition={{ duration: 1, delay: 1 }}
                          className='h-full rounded-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                        />
                      </div>
                    </div>
                    <div className='flex flex-col space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-semibold text-muted-foreground'>
                          Context Density
                        </span>
                        <span className='rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                          Balanced
                        </span>
                      </div>
                      <div className='flex items-end gap-2'>
                        <span className='text-3xl font-bold tracking-tight'>
                          {stats?.conversationCount
                            ? (
                                stats.fileCount / stats.conversationCount
                              ).toFixed(1)
                            : 0}
                        </span>
                        <span className='pb-1 text-sm font-medium text-muted-foreground'>
                          average files per conversation
                        </span>
                      </div>
                      <div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${stats?.conversationCount ? Math.min((stats.fileCount / stats.conversationCount / 5) * 100, 100) : 0}%`,
                          }}
                          transition={{ duration: 1, delay: 1.2 }}
                          className='h-full rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value='energy' className='mt-6'>
            <EnergyDashboard />
          </TabsContent>
        </Tabs>

        <TokenBreakdownModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          tokenType={selectedTokenType}
        />
      </div>
    </TooltipProvider>
  )
}

export default Dashboard
