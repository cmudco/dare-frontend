export interface ModelCardListItem {
  id: number
  name: string
  slug: string
  provider_name: string
  llm: number | null
  has_public_feedback: boolean
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Source {
  id: number
  title: string
  url: string
  sourceType: string
  pageDate: string
  snippet: string
}

export interface SourceCluster {
  id: number
  clusterIndex: number
  canonicalTitle: string
  canonicalUrl: string
  identifier: string
  sources: Source[]
}

export interface ModelCardData {
  id: number
  name: string
  slug: string
  providerName: string
  nameVariants: string[]
  sourceClusters: SourceCluster[]
  publicFeedback: {
    overallSentiment: {
      score: number
      label: string
      confidence: string
      reasoning: string
      refs: number[]
    }
    keyThemes: Array<{
      theme: string
      sentiment: string
      frequency: string
      exampleQuotes: Array<{ quote: string; ref: number }>
      taskRelevance: string[]
      refs: number[]
    }>
    strengths: Array<{ claim: string; refs: number[] }>
    weaknesses: Array<{ claim: string; refs: number[] }>
    taskSpecificInsights: Record<string, { summary: string; refs: number[] }>
    comparativeMentions: Array<{
      comparedTo: string
      comparisonResult: string
      context: string
      refs: number[]
    }>
    metadata: {
      sourcesAnalyzed: number
      clustersCited: number
      dateRange: string
      primarySources: string[]
      confidenceNotes: string
    }
    analysisDate: string
    analysisMethod: string
  }
}
