import { useState } from 'react'
import { ArrowUp, CornerDownRight, FileText, Loader2 } from 'lucide-react'

import { askGraphAPI } from '@/api/knowledgeGraph'
import GraphPath from '@/components/Conversation/GraphPath'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type {
  RetrievalTrace,
  RetrievalTraceEntry,
} from '@/redux/types/conversation'
import { toast } from '@/utils/toast'

const entityPath = (entry?: RetrievalTraceEntry): number[] =>
  (entry?.path ?? [])
    .filter((step) => step.kind === 'entity' && step.entityId != null)
    .map((step) => step.entityId as number)

const fileLabel = (name: string) =>
  name.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ')

const AskPanel = ({
  graphId,
  onPath,
}: {
  graphId: number
  onPath: (ids: number[]) => void
}) => {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [trace, setTrace] = useState<RetrievalTrace | null>(null)

  const ask = async () => {
    const text = question.trim()
    if (!text || loading) return
    setLoading(true)
    onPath([])
    try {
      const response = await askGraphAPI(graphId, text)
      setTrace(response.trace)
      const walked = (response.trace.finalEvidence ?? []).flatMap(entityPath)
      onPath([...new Set(walked)])
    } catch {
      toast.error("Couldn't trace that question. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const evidence = trace?.finalEvidence ?? []
  const direct = evidence.filter((entry) => !entry.path?.length)
  const linked = evidence.filter((entry) => !!entry.path?.length)

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='border-b border-border p-4'>
        <h2 className='text-sm font-medium'>Trace a question</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          See which passages a question reaches and the path it takes.
        </p>
        <div className='relative mt-3'>
          <Textarea
            rows={3}
            className='resize-none pr-11 text-sm'
            placeholder='Ask how things connect, like who worked with whom'
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void ask()
              }
            }}
          />
          <Button
            size='icon'
            aria-label='Trace question'
            className='absolute right-2 bottom-2 h-7 w-7'
            disabled={!question.trim() || loading}
            onClick={() => void ask()}
          >
            {loading ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <ArrowUp className='h-3.5 w-3.5' />
            )}
          </Button>
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        {!trace && !loading && (
          <p className='text-sm text-muted-foreground'>
            Or select any entity on the graph to see its other names, where it
            appears, and what it connects to.
          </p>
        )}
        {trace && (
          <div className='space-y-5'>
            <div className='flex flex-wrap items-center gap-1.5 text-xs'>
              <span className='text-muted-foreground'>
                Query analyzer chose
              </span>
              <span className='rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary'>
                {trace.queryAnalysis?.route === 'graph'
                  ? 'graph route'
                  : 'direct route'}
              </span>
              {trace.expand?.walk?.queryEntities.map((item) => (
                <span
                  key={item.name}
                  className='rounded bg-muted px-1.5 py-0.5 font-medium'
                >
                  {item.entity}
                </span>
              ))}
            </div>

            {linked.length > 0 && (
              <section>
                <h3 className='flex items-center gap-1.5 text-xs font-medium'>
                  <CornerDownRight className='h-3.5 w-3.5' />
                  Reached through the graph
                </h3>
                <div className='mt-2 space-y-3'>
                  {linked.map((entry) => (
                    <div
                      key={`${entry.sourceRef}-${entry.chunkIndex}`}
                      className='text-sm'
                    >
                      <GraphPath path={entry.path ?? []} />
                      <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
                        {entry.preview}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {direct.length > 0 && (
              <section>
                <h3 className='flex items-center gap-1.5 text-xs font-medium'>
                  <FileText className='h-3.5 w-3.5' />
                  Found by search
                </h3>
                <div className='mt-2 space-y-2'>
                  {direct.map((entry) => (
                    <div key={`${entry.sourceRef}-${entry.chunkIndex}`}>
                      <p className='truncate text-xs font-medium'>
                        {fileLabel(entry.sourceRef)}
                        {entry.pageNo != null ? `, p. ${entry.pageNo}` : ''}
                      </p>
                      <p className='line-clamp-2 text-xs text-muted-foreground'>
                        {entry.preview}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AskPanel
