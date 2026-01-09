import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowLeft,
  MessageSquareQuote,
  GitCompare,
} from 'lucide-react'

import { getModelCardBySlug, getModelCardsAPI } from '@/api/modelCard'
import {
  ModelCardData,
  ModelCardListItem,
  SourceCluster,
} from '@/types/modelCard'
import {
  buildClusterMap,
  getSentimentColor,
  getConfidenceBadgeVariant,
} from '@/utils/modelCard'
import { Citation } from '@/components/ModelCard/Citation'
import { ReferenceList } from '@/components/ModelCard/ReferenceList'

const ModelCards = () => {
  const { slug } = useParams<{ slug: string }>()
  const [modelCard, setModelCard] = useState<ModelCardData | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelCardListItem[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Scroll to top on load/mount
  useEffect(() => {
    window.scrollTo(0, 0)

    if (!slug) return

    setLoading(true)
    getModelCardBySlug(slug)
      .then((data) => {
        setModelCard(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message || 'Model not found')
        setModelCard(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    // Fetch available models for 404 fallback
    getModelCardsAPI()
      .then((response) => setAvailableModels(response.results))
      .catch(() => {}) // Silent fail
  }, [])

  if (loading) {
    return <div className='p-8'>Loading...</div>
  }

  if (error || !modelCard) {
    return (
      <div className='container mx-auto p-6'>
        <Link
          to='/help'
          className='mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Help
        </Link>
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
          <h2 className='mb-2 text-xl font-semibold'>Model Card Not Found</h2>
          <p className='text-muted-foreground'>
            No model card data available for "{slug}"
          </p>
          <p className='mt-4 text-sm text-muted-foreground'>
            Model cards are available for:{' '}
            {availableModels.map((m, i) => (
              <span key={m.slug}>
                <Link
                  to={`/models/${m.slug}`}
                  className='text-blue-600 hover:underline'
                >
                  {m.name}
                </Link>
                {i < availableModels.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      </div>
    )
  }

  const {
    overallSentiment,
    strengths,
    weaknesses,
    taskSpecificInsights,
    keyThemes,
    comparativeMentions,
    metadata,
    analysisDate,
  } = modelCard.publicFeedback

  // Build cluster lookup map for citations
  const clusterMap = buildClusterMap(modelCard.sourceClusters || [])

  const getDateRange = (clusters: SourceCluster[]): string => {
    const dates: Date[] = []
    clusters.forEach((c) => {
      c.sources.forEach((s) => {
        if (s.pageDate) {
          // page_date is like "August 9, 2025" or "2024" or empty
          const parsed = new Date(s.pageDate)
          if (!isNaN(parsed.getTime())) {
            dates.push(parsed)
          }
        }
      })
    })

    if (dates.length === 0) return metadata.dateRange // fallback to LLM's guess

    dates.sort((a, b) => a.getTime() - b.getTime())
    const earliest = dates[0]
    const latest = dates[dates.length - 1]

    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${fmt(earliest)} – ${fmt(latest)}`
  }

  const dateRange = getDateRange(modelCard.sourceClusters || [])

  // Collect all cited reference numbers for the references list
  const citedRefs = new Set<number>()
  overallSentiment.refs?.forEach((r) => citedRefs.add(r))
  strengths.forEach((s) => s.refs?.forEach((r) => citedRefs.add(r)))
  weaknesses.forEach((w) => w.refs?.forEach((r) => citedRefs.add(r)))
  keyThemes.forEach((t) => {
    t.refs?.forEach((r) => citedRefs.add(r))
    t.exampleQuotes?.forEach(
      (q) => typeof q !== 'string' && citedRefs.add(q.ref)
    )
  })
  Object.values(taskSpecificInsights).forEach((i) => {
    if (typeof i !== 'string') i.refs?.forEach((r) => citedRefs.add(r))
  })
  comparativeMentions.forEach((c) => c.refs?.forEach((r) => citedRefs.add(r)))

  return (
    <div className='container mx-auto p-6'>
      <ScrollArea className='h-full'>
        <div className='mx-auto max-w-4xl space-y-6'>
          {/* Back link */}
          <Link
            to='/help'
            className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            Back to Help
          </Link>

          {/* Header */}
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                {modelCard.name}
              </h1>
              <p className='mt-1 text-muted-foreground'>
                {metadata.sourcesAnalyzed} sources analyzed · {dateRange}
              </p>
            </div>
            <div className='flex flex-col items-end gap-2'>
              <div
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${getSentimentColor(overallSentiment.score)}`}
              >
                <span className='text-3xl font-bold'>
                  {overallSentiment.score}
                </span>
                <span className='text-xl'>/10</span>
              </div>
              <Badge
                variant={getConfidenceBadgeVariant(overallSentiment.confidence)}
              >
                {overallSentiment.confidence} confidence
              </Badge>
            </div>
          </div>

          {/* Sentiment reasoning */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg'>
                Public Sentiment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                {overallSentiment.reasoning}
              </p>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3'>
                  {strengths.slice(0, 5).map((strength, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2 text-sm text-muted-foreground'
                    >
                      <span className='mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500' />
                      <span className='flex-1'>
                        {strength.claim}
                        <Citation
                          refs={strength.refs}
                          clusterMap={clusterMap}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <AlertTriangle className='h-5 w-5 text-amber-600' />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3'>
                  {weaknesses.slice(0, 5).map((weakness, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2 text-sm text-muted-foreground'
                    >
                      <span className='mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500' />
                      <span className='flex-1'>
                        {weakness.claim}
                        <Citation
                          refs={weakness.refs}
                          clusterMap={clusterMap}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Themes */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <MessageSquareQuote className='h-5 w-5' />
                Key Themes from Community
              </CardTitle>
              <CardDescription>
                Common topics and sentiments from public discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {keyThemes.slice(0, 5).map((theme, i) => (
                  <div
                    key={i}
                    className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'
                  >
                    <div className='mb-2 flex items-center justify-between'>
                      <h4 className='font-medium'>{theme.theme}</h4>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={
                            theme.sentiment === 'positive'
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : theme.sentiment === 'negative'
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : 'border-yellow-300 bg-yellow-50 text-yellow-700'
                          }
                        >
                          {theme.sentiment}
                        </Badge>
                        <Badge variant='secondary'>{theme.frequency}</Badge>
                      </div>
                    </div>
                    {theme.exampleQuotes.length > 0 && (
                      <blockquote className='border-l-2 border-gray-300 pl-3 text-sm italic text-muted-foreground'>
                        "{theme.exampleQuotes[0].quote}"
                        <Citation
                          refs={[theme.exampleQuotes[0].ref]}
                          clusterMap={clusterMap}
                        />
                      </blockquote>
                    )}
                    {theme.taskRelevance.length > 0 && (
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {theme.taskRelevance.map((task, j) => (
                          <Badge key={j} variant='outline' className='text-xs'>
                            {task}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task-specific insights */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Info className='h-5 w-5' />
                Task-Specific Insights
              </CardTitle>
              <CardDescription>
                How users rate this model for different academic tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className='space-y-4'>
                {Object.entries(taskSpecificInsights).map(([task, insight]) => (
                  <div
                    key={task}
                    className='border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800'
                  >
                    <dt className='mb-1 font-medium capitalize'>
                      {task.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className='text-sm text-muted-foreground'>
                      {insight.summary}
                      <Citation refs={insight.refs} clusterMap={clusterMap} />
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Comparative Mentions */}
          {comparativeMentions.length > 0 && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <GitCompare className='h-5 w-5' />
                  Compared to Other Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {comparativeMentions.map((comparison, i) => (
                    <div
                      key={i}
                      className='flex items-start justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800'
                    >
                      <div>
                        <span className='font-medium'>
                          vs {comparison.comparedTo}
                        </span>
                        <p className='text-sm text-muted-foreground'>
                          {comparison.context}
                          <Citation
                            refs={comparison.refs}
                            clusterMap={clusterMap}
                          />
                        </p>
                      </div>
                      <Badge
                        variant='outline'
                        className={
                          comparison.comparisonResult === 'better'
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : comparison.comparisonResult === 'worse'
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : 'border-yellow-300 bg-yellow-50 text-yellow-700'
                        }
                      >
                        {comparison.comparisonResult}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* References */}
          <ReferenceList
            clusters={modelCard.sourceClusters || []}
            citedRefs={citedRefs}
          />

          {/* Sources footer */}
          <div className='rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30'>
            <h3 className='mb-2 font-medium text-blue-800 dark:text-blue-300'>
              About This Data
            </h3>
            <p className='text-sm text-blue-700 dark:text-blue-400'>
              This model card aggregates public feedback from{' '}
              {metadata.primarySources.join(', ')}. Analysis performed on{' '}
              {new Date(analysisDate).toLocaleDateString()}.
            </p>
            {metadata.confidenceNotes && (
              <p className='mt-2 text-xs text-blue-600 dark:text-blue-500'>
                Note: {metadata.confidenceNotes}
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default ModelCards
