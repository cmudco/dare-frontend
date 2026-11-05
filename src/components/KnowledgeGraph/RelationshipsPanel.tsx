import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Sparkles, X } from 'lucide-react'

import {
  addLabelAPI,
  approveBuildAPI,
  deleteLabelAPI,
  discoverLabelsAPI,
  getGraphEstimateAPI,
} from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type {
  GraphEstimate,
  KnowledgeGraphSummary,
  KnowledgeGraphView,
  RelationLabel,
} from '@/redux/types/knowledgeGraph'
import { toast } from '@/utils/toast'

import { relationText } from './entityKinds'

const MAX_LABELS = 12

const money = (value: number) =>
  value < 0.01 ? 'under $0.01' : `$${value.toFixed(2)}`

const LabelRow = ({
  label,
  onDelete,
}: {
  label: RelationLabel
  onDelete: () => void
}) => (
  <div className='flex items-center gap-3 border-b border-border py-2 last:border-0'>
    <div className='min-w-0 flex-1'>
      <p className='truncate text-sm font-medium'>{relationText(label.name)}</p>
      {label.description && (
        <p className='truncate text-xs text-muted-foreground'>
          {label.description}
        </p>
      )}
    </div>
    <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
      {label.relationCount} found
    </span>
    <span className='shrink-0 text-xs text-muted-foreground'>
      {label.source === 'user' ? 'Added by you' : 'Suggested'}
    </span>
    <Button
      variant='ghost'
      size='icon'
      className='h-7 w-7 shrink-0'
      aria-label={`Remove ${label.name}`}
      onClick={onDelete}
    >
      <X className='h-3.5 w-3.5' />
    </Button>
  </div>
)

const RelationshipsPanel = ({
  graph,
  view,
  onChanged,
}: {
  graph: KnowledgeGraphSummary
  view: KnowledgeGraphView
  onChanged: () => void
}) => {
  const [estimate, setEstimate] = useState<GraphEstimate | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [starting, setStarting] = useState(false)

  const labelCount = view.labels.length
  const loadEstimate = useCallback(() => {
    void getGraphEstimateAPI(graph.id).then(setEstimate)
  }, [graph.id])

  useEffect(() => {
    loadEstimate()
  }, [loadEstimate, labelCount, graph.status])

  const run = async (action: () => Promise<unknown>) => {
    setStarting(true)
    try {
      await action()
      onChanged()
    } catch {
      toast.error("That didn't start. Try again.")
    } finally {
      setStarting(false)
    }
  }

  const add = async () => {
    const name = newLabel.trim()
    if (!name) return
    try {
      await addLabelAPI(graph.id, name, '')
      setNewLabel('')
      onChanged()
    } catch {
      toast.error("Couldn't add that type. It may already exist.")
    }
  }

  const remove = async (label: RelationLabel) => {
    await deleteLabelAPI(graph.id, label.id)
    onChanged()
  }

  const percent = graph.chunksTotal
    ? Math.round((graph.chunksDone / graph.chunksTotal) * 100)
    : 0
  const building = graph.status === 'building'
  const discovering = graph.status === 'discovering'
  const build = estimate?.build

  return (
    <div className='mx-auto max-w-3xl space-y-6 px-6 py-8'>
      <div>
        <h2 className='text-lg font-semibold'>Stated relationships</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Optional. Entities, aliases and graph search already work for free.
          This step reads your passages to label how things connect, such as who
          appointed whom, and costs a small amount.
        </p>
      </div>

      {graph.status === 'failed' && (
        <div className='rounded-lg border border-destructive/40 p-4 text-sm'>
          <p className='font-medium'>The last run didn't finish</p>
          <p className='mt-0.5 text-muted-foreground'>{graph.error}</p>
        </div>
      )}

      <section className='rounded-lg border border-border bg-card p-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h3 className='font-medium'>Relationship types</h3>
            <p className='text-xs text-muted-foreground'>
              {labelCount} of {MAX_LABELS}. The model suggests them from your
              documents, and you can change the list.
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            disabled={discovering || building || starting}
            onClick={() => void run(() => discoverLabelsAPI(graph.id))}
          >
            {discovering ? (
              <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
            ) : (
              <Sparkles className='mr-1.5 h-3.5 w-3.5' />
            )}
            {discovering
              ? 'Reading a sample'
              : `Suggest types${
                  estimate?.discoveryCost != null
                    ? ` · ${money(estimate.discoveryCost)}`
                    : ''
                }`}
          </Button>
        </div>

        <div className='mt-3'>
          {view.labels.map((label) => (
            <LabelRow
              key={label.id}
              label={label}
              onDelete={() => void remove(label)}
            />
          ))}
          {labelCount === 0 && !discovering && (
            <p className='rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground'>
              No types yet. Ask for suggestions or add your own.
            </p>
          )}
        </div>

        <form
          className='mt-3 flex gap-2'
          onSubmit={(event) => {
            event.preventDefault()
            void add()
          }}
        >
          <Input
            placeholder='Add a type, like appointed'
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            disabled={labelCount >= MAX_LABELS}
          />
          <Button
            type='submit'
            variant='outline'
            disabled={!newLabel.trim() || labelCount >= MAX_LABELS}
          >
            <Plus className='mr-1 h-4 w-4' />
            Add
          </Button>
        </form>
      </section>

      {labelCount > 0 && !discovering && (
        <section className='rounded-lg border border-border bg-card p-5'>
          {building ? (
            <>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2 font-medium'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Reading relationships
                </span>
                <span className='text-muted-foreground tabular-nums'>
                  {graph.chunksDone} of {graph.chunksTotal} passages
                </span>
              </div>
              <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-primary transition-all duration-300'
                  style={{ width: `${percent}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <h3 className='font-medium'>
                {graph.status === 'ready'
                  ? 'Run again with these types'
                  : 'Approve the cost'}
              </h3>
              <p className='mt-0.5 text-sm text-muted-foreground'>
                Each passage is read twice: once to label a pair, once to check
                that the passage really says it. Your files stay searchable
                while this runs.
              </p>
              {build ? (
                <div className='mt-4 grid grid-cols-3 gap-2'>
                  {[
                    ['Passages to read', build.chunks.toLocaleString()],
                    ['Pairs to check', build.pairs.toLocaleString()],
                    ['Estimated cost', money(build.cost)],
                  ].map(([label, value]) => (
                    <div key={label} className='rounded-md bg-muted/50 p-3'>
                      <p className='text-xs text-muted-foreground'>{label}</p>
                      <p className='mt-0.5 text-lg font-semibold tabular-nums'>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                estimate?.unavailableReason && (
                  <p className='mt-3 text-sm text-muted-foreground'>
                    {estimate.unavailableReason}
                  </p>
                )
              )}
              <div className='mt-4 flex items-center justify-between gap-3'>
                <p className='text-xs text-muted-foreground'>
                  {graph.tokensUsed > 0
                    ? `Last run read ${graph.tokensUsed.toLocaleString()} tokens.`
                    : 'Charged to your wallet.'}
                </p>
                <Button
                  disabled={starting || !build}
                  onClick={() => void run(() => approveBuildAPI(graph.id))}
                >
                  {graph.status === 'ready'
                    ? 'Approve and rerun'
                    : 'Approve and start'}
                </Button>
              </div>
            </>
          )}
        </section>
      )}

      {view.relations.length > 0 && (
        <section>
          <h3 className='font-medium'>Found so far</h3>
          <div className='mt-2 divide-y divide-border rounded-lg border border-border bg-card'>
            {view.relations.slice(0, 40).map((edge, index) => {
              const name = (id: number) =>
                view.nodes.find((node) => node.id === id)?.label ?? ''
              return (
                <div key={index} className='px-4 py-2.5'>
                  <p className='text-sm'>
                    <span className='font-medium'>{name(edge.source)}</span>{' '}
                    <span className='text-muted-foreground italic'>
                      {relationText(edge.label)}
                    </span>{' '}
                    <span className='font-medium'>{name(edge.target)}</span>
                  </p>
                  <p className='mt-0.5 line-clamp-2 text-xs text-muted-foreground'>
                    “{edge.evidence}”
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default RelationshipsPanel
