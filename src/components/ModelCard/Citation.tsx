import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SourceCluster } from '@/types/modelCard'

interface CitationProps {
  refs: number[]
  clusterMap: Map<number, SourceCluster>
}

export const Citation = ({ refs, clusterMap }: CitationProps) => {
  if (!refs || refs.length === 0) return null
  return (
    <TooltipProvider>
      <span className='ml-1 inline-flex flex-wrap gap-0.5'>
        {refs.slice(0, 3).map((ref) => {
          const cluster = clusterMap.get(ref)
          return (
            <Tooltip key={ref}>
              <TooltipTrigger asChild>
                <a
                  href={cluster?.canonicalUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='cursor-pointer text-xs text-muted-foreground hover:text-blue-600 hover:underline'
                  onClick={(e) => e.stopPropagation()}
                >
                  [{ref}]
                </a>
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-sm'>
                {cluster ? (
                  <div className='text-xs'>
                    <p className='line-clamp-2 font-medium'>
                      {cluster.canonicalTitle}
                    </p>
                    <p className='mt-1 text-muted-foreground'>
                      {cluster.sources.length} source
                      {cluster.sources.length !== 1 && 's'}
                    </p>
                  </div>
                ) : (
                  <p className='text-xs'>Source not found</p>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}
        {refs.length > 3 && (
          <span className='ml-0.5 text-xs text-muted-foreground'>
            +{refs.length - 3}
          </span>
        )}
      </span>
    </TooltipProvider>
  )
}
