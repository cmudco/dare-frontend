import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SourceCluster } from '@/types/modelCard'

interface ReferenceListProps {
  clusters: SourceCluster[]
  citedRefs: Set<number>
}

export const ReferenceList = ({ clusters, citedRefs }: ReferenceListProps) => {
  // Only show clusters that were actually cited
  const citedClusters = clusters
    .filter((c) => citedRefs.has(c.clusterIndex))
    .sort((a, b) => a.clusterIndex - b.clusterIndex)

  if (citedClusters.length === 0) return null

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg'>References</CardTitle>
        <CardDescription>Sources cited in this analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className='space-y-1 text-sm'>
          {citedClusters.map((cluster) => (
            <li
              key={cluster.clusterIndex}
              id={`ref-${cluster.clusterIndex}`}
              className='flex gap-2'
            >
              <span className='shrink-0 text-muted-foreground'>
                [{cluster.clusterIndex}]
              </span>
              <div className='min-w-0'>
                <a
                  href={cluster.canonicalUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='wrap-break-word text-blue-600 hover:text-blue-800 hover:underline'
                >
                  {cluster.canonicalTitle}
                </a>
                {cluster.sources.length > 1 && (
                  <span className='ml-2 text-muted-foreground'>
                    (+{cluster.sources.length - 1} related)
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
