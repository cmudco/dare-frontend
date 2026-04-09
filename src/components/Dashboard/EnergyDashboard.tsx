import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getEnergyStats } from '@/redux/asyncThunks/billing'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink } from 'lucide-react'
import { ECOLOGITS_METHODOLOGY_URL } from '@/utils/energyFormatUtils'
import EnergyOverviewCards from '@/pages/Billing/components/EnergyOverviewCards'
import RelatableStatsGrid from '@/pages/Billing/components/RelatableStatsGrid'
import ModelBreakdownChart from '@/pages/Billing/components/ModelBreakdownChart'

const PERIODS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
] as const

const EnergyDashboard = () => {
  const dispatch = useAppDispatch()
  const { energyStats, energyStatsLoading, energyStatsPeriod } = useAppSelector(
    (state) => state.billing
  )

  useEffect(() => {
    if (!energyStats) {
      dispatch(getEnergyStats('all'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePeriodChange = (period: string) => {
    dispatch(getEnergyStats(period))
  }

  const hasData = energyStats && energyStats.overallStats.messageCount > 0

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Track the environmental footprint of your AI usage.{' '}
          <a
            href={ECOLOGITS_METHODOLOGY_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-0.5 text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground'
          >
            Methodology
            <ExternalLink className='h-3 w-3' />
          </a>
        </p>
        <Tabs value={energyStatsPeriod} onValueChange={handlePeriodChange}>
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className='text-xs'>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <EnergyOverviewCards stats={energyStats?.overallStats ?? null} />

      {!energyStatsLoading && !hasData ? (
        <div className='py-8 text-center text-sm text-muted-foreground'>
          No energy data available for this period. Start chatting to track your
          environmental impact.
        </div>
      ) : (
        <>
          <div>
            <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
              That's equivalent to...
            </h3>
            <RelatableStatsGrid stats={energyStats?.relatableStats ?? null} />
          </div>

          <ModelBreakdownChart
            models={energyStats?.modelsBreakdown ?? []}
            loading={energyStatsLoading}
          />
        </>
      )}
    </div>
  )
}

export default EnergyDashboard
