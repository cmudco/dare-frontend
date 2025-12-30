// Model Card data utilities
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

// Slug generation utility
export const toModelSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Get slug from model name (for linking from Help page)
export const getSlugFromModelName = (name: string): string | null => {
  return toModelSlug(name)
}

// Check if we have card data for a model
// TODO: Implement proper check - requires name variant matching
// See: name variant/robustness TODO item (BW)
// In the meantime, all models link; 404 handles missing pages gracefully enough
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const hasModelCardData = (_name: string): boolean => {
  return true
}

// Build cluster lookup map
export const buildClusterMap = (
  clusters: SourceCluster[]
): Map<number, SourceCluster> => {
  const map = new Map<number, SourceCluster>()
  clusters.forEach((cluster) => {
    map.set(cluster.clusterIndex, cluster)
  })
  return map
}
