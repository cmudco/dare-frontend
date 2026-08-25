import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getLiteLLMStats } from '@/redux/asyncThunks/billing'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { LiteLLMOverallStats } from '@/redux/types/billing'
import { motion } from 'framer-motion'
import { AlertCircle, Brain, Coins, Network, Radio, Type } from 'lucide-react'

const formatNumber = (value: number) => value.toLocaleString()

const cards = [
  {
    key: 'calls',
    label: 'Calls',
    icon: Radio,
    iconClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-200/50',
    getValue: (s: LiteLLMOverallStats) => formatNumber(s.totalCalls),
  },
  {
    key: 'tokens',
    label: 'Total Tokens',
    icon: Type,
    iconClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200/50',
    getValue: (s: LiteLLMOverallStats) => formatNumber(s.totalTokens),
  },
  {
    key: 'spend',
    label: 'Estimated Cost',
    icon: Coins,
    iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200/50',
    getValue: (s: LiteLLMOverallStats) => s.totalReferenceCostDisplay,
  },
  {
    key: 'models',
    label: 'Models Used',
    icon: Brain,
    iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200/50',
    getValue: (s: LiteLLMOverallStats) => formatNumber(s.modelCount),
  },
] as const

const SOURCE_LABEL: Record<string, string> = {
  USER: 'Your key',
  ADMIN_USER: 'Admin-issued',
  ADMIN_GROUP: 'Group',
}

const LiteLLMDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { litellmStats, litellmStatsLoading } = useAppSelector(
    (state) => state.billing
  )

  useEffect(() => {
    if (!litellmStats) {
      dispatch(getLiteLLMStats())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const overall = litellmStats?.overallStats ?? null
  const models = litellmStats?.modelsBreakdown ?? []
  const keys = litellmStats?.keysBreakdown ?? []
  const hasData = (overall?.totalCalls ?? 0) > 0

  return (
    <div className='space-y-6'>
      <p className='text-sm text-muted-foreground'>
        Usage routed through your LiteLLM proxy keys. These calls are billed to
        your proxy account, so nothing here is charged to your DARE wallet —
        costs shown are estimates at DARE's published rates, for reference only.
      </p>

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {cards.map(
          (
            { key, label, icon: Icon, iconClass, borderColor, getValue },
            index
          ) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden border-border/60 bg-card shadow-xs transition-all duration-300 hover:shadow-lg ${borderColor}`}
              >
                <CardContent className='p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <span className={`rounded-md p-1.5 ${iconClass}`}>
                      <Icon className='h-4 w-4' />
                    </span>
                    <span className='text-xs font-bold tracking-widest text-muted-foreground/60 uppercase'>
                      {label}
                    </span>
                  </div>
                  {litellmStatsLoading && !overall ? (
                    <Skeleton className='h-8 w-24' />
                  ) : (
                    <div className='text-2xl font-black tracking-tight text-foreground'>
                      {overall ? getValue(overall) : '—'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        )}
      </div>

      {(overall?.unpricedCalls ?? 0) > 0 && (
        <div className='flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground'>
          <AlertCircle className='mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600' />
          <span>
            {formatNumber(overall?.unpricedCalls ?? 0)} of these calls used a
            model the price registry does not carry, so they are counted in
            tokens but not in the estimated cost.
          </span>
        </div>
      )}

      {!litellmStatsLoading && !hasData ? (
        <div className='space-y-3 py-8 text-center'>
          <Network className='mx-auto h-8 w-8 text-muted-foreground/40' />
          <p className='text-sm text-muted-foreground'>
            No proxy usage yet. Pick a LiteLLM key as your active wallet and
            start a conversation to see it here.
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/billing/')}
          >
            Manage keys
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
              By model
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className='text-right'>Input</TableHead>
                  <TableHead className='text-right'>Output</TableHead>
                  <TableHead className='text-right'>Calls</TableHead>
                  <TableHead className='text-right'>Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.modelName}>
                    <TableCell className='font-mono text-xs'>
                      {model.modelName}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatNumber(model.inputTokens)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatNumber(model.outputTokens)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatNumber(model.callCount)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {model.unpricedCalls === model.callCount
                        ? '—'
                        : model.referenceCostDisplay}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {keys.length > 0 && (
            <div>
              <h3 className='mb-1 text-sm font-medium text-muted-foreground'>
                By key
              </h3>
              <p className='mb-3 text-xs text-muted-foreground/70'>
                Counted across every platform this key was used on, for all time
                — unlike the figures above, which follow the dashboard's current
                platform.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead className='text-right'>Calls</TableHead>
                    <TableHead className='text-right'>Est. Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.keyId}>
                      <TableCell>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='font-medium'>{key.label}</span>
                          <Badge variant='outline' className='text-[10px]'>
                            {key.groupName ??
                              SOURCE_LABEL[key.source] ??
                              key.source}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatNumber(key.callCount)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {key.referenceCostDisplay}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LiteLLMDashboard
