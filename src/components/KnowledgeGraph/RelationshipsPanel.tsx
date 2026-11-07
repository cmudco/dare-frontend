import { useCallback, useEffect, useState } from 'react'
import { ListPlus, Loader2, Plus } from 'lucide-react'

import {
  addLabelAPI,
  approveBuildAPI,
  deleteLabelAPI,
  discoverLabelsAPI,
  getGraphEstimateAPI,
} from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type {
  GraphEstimate,
  KnowledgeGraphSummary,
  KnowledgeGraphView,
  RelationLabel,
} from '@/redux/types/knowledgeGraph'
import { toast } from '@/utils/toast'

import { relationText } from './entityKinds'
import RelationLabelRow from './RelationLabelRow'

const MAX_LABELS = 12

const money = (value: number) =>
  value < 0.01 ? 'under $0.01' : `$${value.toFixed(2)}`

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
  const [newMeaning, setNewMeaning] = useState('')
  const [newTwoWay, setNewTwoWay] = useState(false)
  const [goal, setGoal] = useState(graph.goal)
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

  const addType = async (
    name: string,
    description: string,
    twoWay: boolean
  ) => {
    try {
      await addLabelAPI(graph.id, name, description, twoWay)
      onChanged()
      return true
    } catch {
      toast.error("Couldn't add that type. It may already exist.")
      return false
    }
  }

  const add = async () => {
    const name = newLabel.trim()
    if (name && (await addType(name, newMeaning.trim(), newTwoWay))) {
      setNewLabel('')
      setNewMeaning('')
      setNewTwoWay(false)
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
  const preparing = graph.status === 'preparing'
  const build = estimate?.build
  const newTypes = estimate?.newTypes
  const unreadCount = view.labels.filter((label) => !label.read).length
  const shownBuild = newTypes ?? build

  return (
    <div className='mx-auto max-w-3xl space-y-6 px-6 py-8'>
      <div>
        <h2 className='text-lg font-semibold'>Stated relationships</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Optional. Names, their other spellings and graph search already work
          for free. This step labels how people and things connect, such as who
          married or testified for whom, and keeps the sentence that says so.
          Labeled links show as named lines on the graph and in each name's
          panel. You see the cost before anything runs.
        </p>
      </div>

      {graph.status === 'failed' && (
        <div className='rounded-lg border border-destructive/40 p-4 text-sm'>
          <p className='font-medium'>The last run didn't finish</p>
          <p className='mt-0.5 text-muted-foreground'>{graph.error}</p>
        </div>
      )}

      {graph.status === 'ready' && graph.error && (
        <p className='rounded-lg border border-border p-3 text-sm text-muted-foreground'>
          {graph.error} Run again to retry them.
        </p>
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
            disabled={preparing || discovering || building || starting}
            onClick={() => void run(() => discoverLabelsAPI(graph.id, goal))}
          >
            {discovering ? (
              <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
            ) : (
              <ListPlus className='mr-1.5 h-3.5 w-3.5' />
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

        <Input
          className='mt-3'
          maxLength={300}
          aria-label='What do you want to learn from these files?'
          placeholder='What do you want to learn from these files? Optional'
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />

        <div className='mt-3'>
          {view.labels.map((label) => (
            <RelationLabelRow
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
            className='max-w-56'
            placeholder='Add a type, like appointed'
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            disabled={labelCount >= MAX_LABELS}
          />
          <Input
            maxLength={200}
            aria-label='What the type means'
            placeholder='What it means, optional'
            value={newMeaning}
            onChange={(event) => setNewMeaning(event.target.value)}
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
        <label className='mt-2 flex w-fit items-center gap-2 text-xs text-muted-foreground'>
          <Checkbox
            checked={newTwoWay}
            onCheckedChange={(checked) => setNewTwoWay(checked === true)}
            disabled={labelCount >= MAX_LABELS}
          />
          Works both ways, like married to
        </label>

        {graph.proposedTypes.length > 0 && (
          <div className='mt-5 border-t border-border pt-4'>
            <h4 className='text-sm font-medium'>
              Also found in your documents
            </h4>
            <p className='text-xs text-muted-foreground'>
              The last read saw these but had no type for them. Add one, then
              pay only to read the new types.
            </p>
            <div className='mt-2'>
              {graph.proposedTypes.map((proposed) => (
                <div
                  key={proposed.name}
                  className='flex items-start gap-3 border-b border-border py-2 last:border-0'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>
                      {relationText(proposed.name)}
                      <span className='ml-2 text-xs font-normal text-muted-foreground tabular-nums'>
                        in {proposed.count} sampled{' '}
                        {proposed.count === 1 ? 'sentence' : 'sentences'}
                      </span>
                    </p>
                    <p className='line-clamp-2 text-xs text-muted-foreground'>
                      “{proposed.example}”
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={labelCount >= MAX_LABELS}
                    onClick={() =>
                      void addType(
                        proposed.name,
                        proposed.description,
                        proposed.twoWay ?? false
                      )
                    }
                  >
                    <Plus className='mr-1 h-3.5 w-3.5' />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  {graph.chunksDone} of {graph.chunksTotal} chunks
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
                {newTypes
                  ? `Read ${unreadCount} new ${unreadCount === 1 ? 'type' : 'types'}`
                  : graph.status === 'ready'
                    ? 'Run again with these types'
                    : 'Approve the cost'}
              </h3>
              <p className='mt-0.5 text-sm text-muted-foreground'>
                {newTypes
                  ? 'Reads your chunks for the new types only. Existing relationships stay as they are.'
                  : 'Each chunk is read twice: once to label a pair, once to check that the chunk really says it. Your files stay searchable while this runs.'}
              </p>
              {shownBuild ? (
                <div className='mt-4 grid grid-cols-3 gap-2'>
                  {[
                    ['Chunks to read', shownBuild.chunks.toLocaleString()],
                    ['Pairs to check', shownBuild.pairs.toLocaleString()],
                    ['Estimated cost', money(shownBuild.cost)],
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
                <div className='flex shrink-0 flex-wrap justify-end gap-2'>
                  {newTypes && build && (
                    <Button
                      variant='outline'
                      disabled={preparing || starting}
                      onClick={() => void run(() => approveBuildAPI(graph.id))}
                    >
                      Rerun all · {money(build.cost)}
                    </Button>
                  )}
                  <Button
                    disabled={preparing || starting || !build}
                    onClick={() =>
                      void run(() => approveBuildAPI(graph.id, !!newTypes))
                    }
                  >
                    {newTypes
                      ? 'Approve new types'
                      : graph.status === 'ready'
                        ? 'Approve and rerun'
                        : 'Approve and start'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

export default RelationshipsPanel
