import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '@/redux/store'
import {
  getAvailableModels,
  getAllModels,
} from '@/redux/asyncThunks/conversation'
import { LLMModel } from '@/redux/types/conversation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ReasoningStatus,
  ReasoningStatusColors,
  ModelTier,
  ModelTierLabels,
  ModelTierDescriptions,
  ModelTierColors,
  ModelTierOrder,
} from '@/utils/constants/model'
import {
  CheckCircle,
  Crown,
  FileText,
  ExternalLink,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSlugFromModelName, hasModelCardData } from '@/utils/modelCard'

const tierIcons = {
  [ModelTier.Premium]: Crown,
  [ModelTier.Advanced]: Sparkles,
  [ModelTier.Flash]: Zap,
}

const Help = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { allModels, loading, error } = useSelector(
    (state: RootState) => state.conversation
  )
  const [activeTier, setActiveTier] = useState<ModelTier | null>(null)

  useEffect(() => {
    dispatch(getAvailableModels())
    dispatch(getAllModels())
  }, [dispatch])

  const formatCurrency = (
    value: string | number | null | undefined
  ): string => {
    if (value === undefined || value === null) return '-'
    const numValue =
      typeof value === 'string' ? parseFloat(value) : Number(value)
    return isNaN(numValue) ? '-' : `$${numValue.toFixed(2)}`
  }

  const tierGroups = useMemo(() => {
    return ModelTierOrder.map((tier) => ({
      tier,
      models: allModels.filter((model) => model.tier === tier),
    })).filter((group) => group.models.length > 0)
  }, [allModels])

  const displayedGroups = useMemo(() => {
    if (!activeTier) return tierGroups
    return tierGroups.filter((g) => g.tier === activeTier)
  }, [tierGroups, activeTier])

  if (loading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='animate-pulse text-center'>
          <p className='text-lg font-medium text-muted-foreground'>
            Loading models...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700'>
        <p>Error loading models: {error}</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Help</h1>
        <p className='text-muted-foreground'>
          Find answers to your questions and learn how to use the platform.
        </p>
      </div>
      <ScrollArea className='h-full'>
        <Card data-tour='help-docs' className='overflow-hidden shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center text-xl'>
              <FileText className='mr-2 h-5 w-5' />
              User Documentation
            </CardTitle>
            <CardDescription>
              Essential guides and information on using the DARE LLM Gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md'>
                <a href='/docs/' className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-medium text-foreground'>
                      DARE Documentation
                    </h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Product guides, frontend documentation, backend
                      architecture, deployment notes, and API references.
                    </p>
                  </div>
                  <FileText className='h-5 w-5 flex-shrink-0 text-blue-500' />
                </a>
              </div>
              <div className='rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md'>
                <a
                  href='https://docs.google.com/document/d/12t1EinvBwM4MsSSjvlWpNvav1dWW32zo1A9FhY8BfLM/edit?tab=t.0#heading=h.h5z6kf1kmw3f'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-start justify-between'
                >
                  <div>
                    <h3 className='font-medium text-foreground'>
                      Legacy DARE LLM Gateway User Guide
                    </h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Previous Google Docs guide retained while the new docs
                      portal becomes the primary documentation home.
                    </p>
                  </div>
                  <ExternalLink className='h-5 w-5 flex-shrink-0 text-blue-500' />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules Section */}
        <Card
          data-tour='help-learning'
          className='mt-6 overflow-hidden shadow-md'
        >
          <CardHeader>
            <CardTitle className='flex items-center text-xl'>
              <FileText className='mr-2 h-5 w-5' />
              Learning Modules
            </CardTitle>
            <CardDescription>
              Access curated learning modules and resources to deepen your
              understanding of the DARE platform and related concepts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md'>
                <a
                  href='https://drive.google.com/drive/folders/137SL9lhrd1e842Q7-z0V_CwADQxznnBV'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-start justify-between'
                >
                  <div>
                    <h3 className='font-medium text-foreground'>
                      DARE Learning Modules
                    </h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Explore sample exercises, system prompting, multi-agent
                      workflows, and more.
                    </p>
                  </div>
                  <ExternalLink className='h-5 w-5 flex-shrink-0 text-blue-500' />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available AI Models */}
        <div className='mt-4'>
          <h2 className='mb-4 text-2xl font-semibold tracking-tight'>
            Available AI Models
          </h2>
        </div>

        {allModels.length === 0 ? (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center'>
            <p className='text-gray-500'>
              No AI models available at the moment.
            </p>
          </div>
        ) : (
          <>
            {/* Tier filter pills */}
            <div
              data-tour='help-model-filters'
              className='flex flex-wrap items-center gap-2'
            >
              <button
                onClick={() => setActiveTier(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTier === null
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                All Tiers
                <span className='ml-1.5 text-xs opacity-70'>
                  {allModels.length}
                </span>
              </button>
              {ModelTierOrder.map((tier) => {
                const count = allModels.filter((m) => m.tier === tier).length
                if (count === 0) return null
                const colors = ModelTierColors[tier]
                const TierIcon = tierIcons[tier]
                const isActive = activeTier === tier

                return (
                  <button
                    key={tier}
                    onClick={() => setActiveTier(isActive ? null : tier)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      isActive
                        ? `${colors.bg} ${colors.text} ring-1 ${colors.ring} shadow-sm`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    <TierIcon className='h-3.5 w-3.5' />
                    {ModelTierLabels[tier]}
                    <span className='text-xs opacity-70'>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Tier sections */}
            <div className='mt-4 space-y-6'>
              {displayedGroups.map((group) => {
                const colors = ModelTierColors[group.tier]
                const TierIcon = tierIcons[group.tier]

                return (
                  <Card
                    key={group.tier}
                    className={`overflow-hidden border shadow-md ${colors.border}`}
                  >
                    {/* Tier header with gradient accent */}
                    <div
                      className={`bg-gradient-to-r ${colors.gradient} border-b ${colors.border} px-6 py-4`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}
                          >
                            <TierIcon className={`h-4 w-4 ${colors.icon}`} />
                          </div>
                          <div>
                            <h3
                              className={`text-base font-semibold ${colors.text}`}
                            >
                              {ModelTierLabels[group.tier]}
                            </h3>
                            <p className='text-xs text-muted-foreground'>
                              {ModelTierDescriptions[group.tier]}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className={`${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {group.models.length}{' '}
                          {group.models.length === 1 ? 'model' : 'models'}
                        </Badge>
                      </div>
                    </div>

                    {/* Model table */}
                    <CardContent className='p-0'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='font-semibold'>
                              Name
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Identifier
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Description
                            </TableHead>
                            <TableHead className='text-left font-semibold'>
                              <div className='flex flex-col items-start'>
                                <span>Input</span>
                                <span className='text-xs font-normal text-muted-foreground'>
                                  $/1M tokens
                                </span>
                              </div>
                            </TableHead>
                            <TableHead className='text-left font-semibold'>
                              <div className='flex flex-col items-start'>
                                <span>Output</span>
                                <span className='text-xs font-normal text-muted-foreground'>
                                  $/1M tokens
                                </span>
                              </div>
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Reasoning
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.models.map((model: LLMModel) => {
                            const reasoningStatus = model.isReasoning
                              ? ReasoningStatus.Yes
                              : ReasoningStatus.No
                            const statusColors =
                              ReasoningStatusColors[reasoningStatus]

                            return (
                              <TableRow
                                key={model.id}
                                className='transition-colors hover:bg-accent/30'
                              >
                                <TableCell className='font-medium'>
                                  <div className='flex items-center gap-2'>
                                    <span
                                      className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`}
                                    />
                                    {hasModelCardData(model.name) ? (
                                      <Link
                                        to={`/models/${getSlugFromModelName(model.name)}`}
                                        className='text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
                                      >
                                        {model.name}
                                      </Link>
                                    ) : (
                                      model.name
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className='font-mono text-xs text-muted-foreground'>
                                  {model.identifier || 'N/A'}
                                </TableCell>
                                <TableCell className='max-w-xs text-sm text-muted-foreground'>
                                  {model.description ||
                                    'No description available.'}
                                </TableCell>
                                <TableCell className='text-left font-mono text-sm'>
                                  {formatCurrency(
                                    model.inputTokenRatePerMillion
                                  )}
                                </TableCell>
                                <TableCell className='text-left font-mono text-sm'>
                                  {formatCurrency(
                                    model.outputTokenRatePerMillion
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant='outline'
                                    className={`flex w-fit items-center gap-1 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                                  >
                                    {model.isReasoning ? (
                                      <CheckCircle
                                        className={`h-3 w-3 ${statusColors.icon}`}
                                      />
                                    ) : (
                                      <XCircle
                                        className={`h-3 w-3 ${statusColors.icon}`}
                                      />
                                    )}
                                    {reasoningStatus}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        <div className='rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30'>
          <h2 className='mb-2 font-semibold text-blue-800 dark:text-blue-300'>
            About Model Token Rates
          </h2>
          <p className='text-sm text-blue-700 dark:text-blue-400'>
            Token rates are listed per million tokens. The actual cost of a
            request is calculated based on the number of tokens processed. Input
            tokens refer to the text you send to the model, while output tokens
            are those generated in response.
          </p>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Help
