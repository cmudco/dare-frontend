import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, FileText, Loader2, X } from 'lucide-react'

import {
  getEntityAPI,
  mergeEntityAPI,
  separateAliasAPI,
} from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { EntityAlias, EntityDetail } from '@/redux/types/knowledgeGraph'
import { toast } from '@/utils/toast'

import { entityKind, relationText } from './entityKinds'

const ALIAS_REASON: Record<EntityAlias['source'], string> = {
  self: 'Main name',
  rule: 'Matched by name',
  decisions: 'Confirmed by a model check',
  manual: 'Changed by you',
}

const MERGE_MATCHES = 6

const fileLabel = (name: string) =>
  name.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ')

const EntityPanel = ({
  graphId,
  entityId,
  entities,
  onClose,
  onSelect,
  onChanged,
}: {
  graphId: number
  entityId: number
  entities: { id: number; label: string }[]
  onClose: () => void
  onSelect: (id: number) => void
  onChanged: () => void
}) => {
  const [entity, setEntity] = useState<EntityDetail | null>(null)
  const [separating, setSeparating] = useState<string | null>(null)
  const [mergeSearch, setMergeSearch] = useState('')
  const [mergeTarget, setMergeTarget] = useState<{
    id: number
    label: string
  } | null>(null)
  const [merging, setMerging] = useState(false)

  const load = useCallback(() => {
    setEntity(null)
    setMergeSearch('')
    setMergeTarget(null)
    void getEntityAPI(graphId, entityId).then(setEntity)
  }, [graphId, entityId])

  useEffect(load, [load])

  const separate = async (key: string) => {
    setSeparating(key)
    try {
      setEntity(await separateAliasAPI(graphId, entityId, key))
      toast.success('Separated. It will stay apart.')
      onChanged()
    } catch {
      toast.error("Couldn't separate that name. Try again.")
    } finally {
      setSeparating(null)
    }
  }

  const mergeMatches = useMemo(() => {
    const needle = mergeSearch.trim().toLowerCase()
    if (!needle) return []
    return entities
      .filter(
        (other) =>
          other.id !== entityId && other.label.toLowerCase().includes(needle)
      )
      .sort(
        (a, b) =>
          Number(b.label.toLowerCase().startsWith(needle)) -
          Number(a.label.toLowerCase().startsWith(needle))
      )
      .slice(0, MERGE_MATCHES)
  }, [mergeSearch, entities, entityId])

  const merge = async () => {
    if (!mergeTarget) return
    setMerging(true)
    try {
      setEntity(await mergeEntityAPI(graphId, entityId, mergeTarget.id))
      setMergeSearch('')
      setMergeTarget(null)
      toast.success('Merged. Use Separate to undo a spelling.')
      onChanged()
    } catch {
      toast.error("Couldn't merge those names. Try again.")
    } finally {
      setMerging(false)
    }
  }

  if (!entity) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const { icon: Icon, label: kindLabel } = entityKind(entity.kind)

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex items-start gap-3 border-b border-border p-4'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted'>
          <Icon className='h-4.5 w-4.5' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='truncate font-semibold'>{entity.label}</h2>
          <p className='text-xs text-muted-foreground'>{kindLabel}</p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Close'
          className='h-7 w-7'
          onClick={onClose}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto p-4'>
        {entity.kind === 'person' && entity.files > 1 && (
          <p className='rounded-md border border-border bg-muted/50 p-3 text-xs text-foreground'>
            This name appears in {entity.files} documents. A shared name doesn't
            prove one person, so check the passages before treating it as a link
            between them.
          </p>
        )}

        <section>
          <h3 className='text-xs font-medium text-muted-foreground'>
            Also written as
          </h3>
          <div className='mt-2 space-y-1'>
            {entity.aliases.map((alias) => (
              <div
                key={alias.key}
                className='flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm'>{alias.text}</p>
                  <p className='text-[11px] text-muted-foreground'>
                    {ALIAS_REASON[alias.source]}
                    {alias.probability != null
                      ? ` · ${Math.round(alias.probability * 100)}%`
                      : ''}
                  </p>
                </div>
                {entity.aliases.length > 1 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 shrink-0 px-2 text-xs'
                    disabled={separating !== null}
                    onClick={() => void separate(alias.key)}
                  >
                    Separate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className='text-xs font-medium text-muted-foreground'>
            Same as another name?
          </h3>
          {mergeTarget ? (
            <div className='mt-2 rounded-md border border-border p-2.5'>
              <p className='text-sm'>
                Merge <span className='font-medium'>{mergeTarget.label}</span>{' '}
                into <span className='font-medium'>{entity.label}</span>? Its
                spellings and relationships move here.
              </p>
              <div className='mt-2 flex gap-2'>
                <Button
                  size='sm'
                  className='h-7 px-3 text-xs'
                  disabled={merging}
                  onClick={() => void merge()}
                >
                  {merging && <Loader2 className='h-3 w-3 animate-spin' />}
                  Merge
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 px-3 text-xs'
                  disabled={merging}
                  onClick={() => setMergeTarget(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Input
                className='mt-2 h-8 text-sm'
                placeholder='Find the other name'
                value={mergeSearch}
                onChange={(event) => setMergeSearch(event.target.value)}
              />
              {mergeMatches.length > 0 && (
                <div className='mt-1 overflow-hidden rounded-md border border-border'>
                  {mergeMatches.map((other) => (
                    <button
                      key={other.id}
                      type='button'
                      className='block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-accent'
                      onClick={() => setMergeTarget(other)}
                    >
                      {other.label}
                    </button>
                  ))}
                </div>
              )}
              {mergeSearch.trim() && mergeMatches.length === 0 && (
                <p className='mt-1 text-xs text-muted-foreground'>
                  No other name matches.
                </p>
              )}
            </>
          )}
        </section>

        {entity.relations.length > 0 && (
          <section>
            <h3 className='text-xs font-medium text-muted-foreground'>
              Stated relationships
            </h3>
            <div className='mt-2 space-y-2'>
              {entity.relations.map((relation) => (
                <div
                  key={relation.id}
                  className='rounded-md border border-border p-2.5'
                >
                  <div className='flex flex-wrap items-center gap-1.5 text-sm'>
                    <button
                      type='button'
                      className='font-medium hover:underline'
                      onClick={() => onSelect(relation.subjectId)}
                    >
                      {relation.subject}
                    </button>
                    <span className='flex items-center gap-1 text-xs text-muted-foreground italic'>
                      {relationText(relation.label)}
                      <ArrowRight className='h-3 w-3' />
                    </span>
                    <button
                      type='button'
                      className='font-medium hover:underline'
                      onClick={() => onSelect(relation.objectId)}
                    >
                      {relation.object}
                    </button>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    “{relation.evidence}”
                  </p>
                  <p className='mt-1 truncate text-[11px] text-muted-foreground'>
                    {fileLabel(relation.fileName)}
                    {relation.page != null ? `, p. ${relation.page}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className='text-xs font-medium text-muted-foreground'>
            Appears in
          </h3>
          <div className='mt-2 space-y-2.5'>
            {entity.mentions.map((mention) => (
              <div key={`${mention.fileId}-${mention.chunkIndex}`}>
                <p className='flex items-center gap-1.5 truncate text-xs font-medium'>
                  <FileText className='h-3 w-3 shrink-0 text-muted-foreground' />
                  {fileLabel(mention.fileName)}
                  {mention.page != null ? `, p. ${mention.page}` : ''}
                </p>
                <p className='mt-0.5 line-clamp-3 text-xs text-muted-foreground'>
                  {mention.preview}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default EntityPanel
