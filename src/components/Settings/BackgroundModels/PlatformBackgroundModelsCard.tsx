import { useCallback, useEffect, useState } from 'react'

import {
  getPlatformBackgroundModelsAPI,
  updatePlatformBackgroundModelsAPI,
} from '@/api/backgroundModels'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PlatformBackgroundModels,
  PlatformBackgroundModelsUpdate,
} from '@/redux/types/backgroundModels'
import { toast } from '@/utils/toast'
import CatalogModelSelect from './CatalogModelSelect'

interface PlatformBackgroundModelsCardProps {
  onChanged: () => void
}

/** Admin-only: the same settings row as the Django admin's Platform settings. */
const PlatformBackgroundModelsCard = ({
  onChanged,
}: PlatformBackgroundModelsCardProps) => {
  const [platform, setPlatform] = useState<PlatformBackgroundModels | null>(
    null
  )
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(() => {
    getPlatformBackgroundModelsAPI()
      .then(setPlatform)
      .catch((error: Error) => setLoadError(error.message))
  }, [])

  useEffect(load, [load])

  const save = async (update: PlatformBackgroundModelsUpdate) => {
    setSaving(true)
    try {
      setPlatform(await updatePlatformBackgroundModelsAPI(update))
      onChanged()
      toast.success('Platform background models updated.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not save the change.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return <p className='text-sm text-destructive'>{loadError}</p>
  }
  if (!platform) {
    return <Skeleton className='h-96 w-full' />
  }

  return (
    <Card className='border-border bg-card p-6'>
      <div className='flex items-center gap-2'>
        <h3 className='text-lg font-semibold text-card-foreground'>
          Platform defaults
        </h3>
        <Badge variant='secondary'>Admin</Badge>
      </div>
      <p className='mt-1 text-sm text-muted-foreground'>
        Applies to everyone who has not picked their own background model. Users
        of a LiteLLM key with its own background model keep that model.
      </p>

      <div className='mt-5 space-y-2'>
        <Label htmlFor='platform-default-model'>Default for every task</Label>
        <CatalogModelSelect
          id='platform-default-model'
          models={platform.candidates}
          value={platform.default}
          defaultLabel='Server default (BACKGROUND_MODEL)'
          onChange={(model) => save({ default: model })}
          disabled={saving}
        />
      </div>

      <div className='mt-6 space-y-4'>
        <p className='text-sm font-medium'>Per-task overrides (optional)</p>
        {platform.tasks.map((task) => (
          <div key={task.task} className='space-y-1.5'>
            <Label htmlFor={`platform-${task.task}`}>{task.label}</Label>
            <CatalogModelSelect
              id={`platform-${task.task}`}
              models={platform.candidates}
              value={task.override}
              defaultLabel='Use the default'
              onChange={(model) =>
                save({ overrides: [{ task: task.task, model }] })
              }
              disabled={saving}
            />
            <p className='text-xs text-muted-foreground'>
              {task.inUse
                ? `In use: ${task.inUse.name} (${task.sourceLabel})`
                : 'No usable model: set a default or BACKGROUND_MODEL.'}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default PlatformBackgroundModelsCard
