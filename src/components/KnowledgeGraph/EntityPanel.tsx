import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, FileText, Loader2, X } from 'lucide-react'

import { getEntityAPI, separateAliasAPI } from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import type { EntityAlias, EntityDetail } from '@/redux/types/knowledgeGraph'
import { toast } from '@/utils/toast'

import { entityKind, relationText } from './entityKinds'

const ALIAS_REASON: Record<EntityAlias['source'], string> = {
  self: 'Main name',
  rule: 'Matched by name',
  decisions: 'Confirmed by a model check',
  manual: 'Changed by you',
}

const fileLabel = (name: string) =>
  name.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ')

const EntityPanel = ({
  graphId,
  entityId,
  onClose,
  onSelect,
  onChanged,
}: {
  graphId: number
  entityId: number
  onClose: () => void
  onSelect: (id: number) => void
  onChanged: () => void
}) => {
  const [entity, setEntity] = useState<EntityDetail | null>(null)
  const [separating, setSeparating] = useState<string | null>(null)

  const load = useCallback(() => {
    setEntity(null)
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
