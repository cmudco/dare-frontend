import { SourceCluster } from '@/types/modelCard'

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

// Sentiment score color helper
export const getSentimentColor = (score: number): string => {
  if (score >= 8) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

export const getConfidenceBadgeVariant = (
  confidence: string
): 'default' | 'secondary' | 'outline' => {
  switch (confidence) {
    case 'high':
      return 'default'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}
